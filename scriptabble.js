// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: coffee;
/* --------------------------------------------------------------
Script: Aspira.js
Author: Michal Klement & Tomáš Novotný
Version: 2.0.0

Description:
Aspira Cafe balance

Changelog:
2.0.0: Absences from Report and balance per day
-------------------------------------------------------------- */
// Set this parameter to true if your working mode is full-time, or false otherwise.
const isFulltime = true;
// When do you usually finish your lunch? eg. 1140
const timeWhenLunchIsOver = 1130;
// Set your '_oauth2_proxy_kc_sso_livesport_eu' cookie from https://report.livesport.eu/absences/
const reportCookie = '';
// Set your login credentials from https://aspira.septim.cz/login
const user = '';
const password = '';
// Set which options should be counted as absences (true = counted, false = not counted)
const absencesDurationConfig = {
  'celý den': true,
  dopoledne: true,
  odpoledne: true,
};
const HOLIDAY_DATES_2023 = [
  '1.1.',
  '7.4.',
  '10.4.',
  '1.5.',
  '8.5.',
  '5.7.',
  '6.7.',
  '28.9.',
  '28.10.',
  '17.11.',
  '24.12.',
  '25.12.',
  '26.12.',
];
// COUNT REMAINING WORK DAYS -------------------------------------
const returnWeekDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = new Date(year, month, 1);
  const dates = [];

  while (date.getMonth() === month) {
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(`${day}.${month + 1}.`);
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

const returnWorkDates = () => {
  const weekDatesInCurrentMonth = returnWeekDates();
  return weekDatesInCurrentMonth.filter((day) => !HOLIDAY_DATES_2023.includes(day));
};

const returnDaysFromDates = (dates) => {
  const days = [];
  dates.forEach((date) => {
    const day = date.split('.')[0];
    days.push(day);
  });
  return days;
};

const returnWorkDays = () => {
  const workDates = returnWorkDates();
  const workDays = returnDaysFromDates(workDates);

  return workDays;
};

const returnFirstCountedDay = () => {
  const now = new Date();
  const date = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
  const time = Number(`${hours}${minutes}`);

  return time < timeWhenLunchIsOver ? date : date + 1;
};

const returnNumberOfRemainingWorkDays = () => {
  const workDays = returnWorkDays();
  const firstCountedDay = returnFirstCountedDay();
  const remainingWorkDays = workDays.filter((day) => day >= firstCountedDay);

  return remainingWorkDays.length;
};

// BALANCE REQUEST -------------------------------------
const encodedCredentials = btoa(user + ':' + password);
const url = 'https://aspira.septim.cz/webcareapi/customer/account/balance';
const req = new Request(url);
req.headers = {
  Authorization: 'Basic ' + encodedCredentials,
  'X-ASW-TOKEN': '',
};
const res = await req.loadJSON();
const balance = res.balance;

// ABSENCES REQUEST -------------------------------------
const absencesRequest = new Request('https://report.livesport.eu/absences/');
absencesRequest.headers = {
  Cookie: `_oauth2_proxy_kc_sso_livesport_eu=${reportCookie}}`,
};

const absencesResponse = await absencesRequest.loadString();
const reportCookieExpired = absencesResponse.includes('Livesport login');

// ABSENCES HTML PARSING ---------------------------------
function filterAbsencesFromThisMonth(absences) {
  if (absences.length === 0) {
    return [];
  }

  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return absences.filter(
    (absence) =>
      absence.date.month === month &&
      absence.date.year === year &&
      (absencesDurationConfig[absence.duration] || absence.type === 'dovolená')
  );
}

function parseAbsencesHtml(html) {
  const regexForAbsencesTable = /id="snippet-showAbsences-grid"(.*?)id="lb_absences"/s;
  const matchForAbsencesTable = html.match(regexForAbsencesTable);

  if (!matchForAbsencesTable) {
    return [];
  }

  const regexForTD = /<td>(.*?)<\/td>/g;

  const htmlWithAbsencesTable = matchForAbsencesTable[0];

  const tableColumns = htmlWithAbsencesTable.match(regexForTD);
  const columnsPerRow = 4;

  const data = [];
  for (let i = 0; i < tableColumns.length; i += columnsPerRow) {
    const dateString = tableColumns[i + 0].match(/<td>(.*?)<\/td>/)[1];
    const type = tableColumns[i + 1].match(/<td>(.*?)<\/td>/)[1];
    const duration = tableColumns[i + 2].match(/<td>(.*?)<\/td>/)[1];

    const dateParts = dateString.split('.');
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    const date = { day, month, year };

    data.push({ date, type, duration });
  }

  return data;
}
// ABSENCES COUNT -------------------------------------
let numberOfAbsences = 0;
if (!reportCookieExpired) {
  const absences = parseAbsencesHtml(absencesResponse);
  numberOfAbsences = filterAbsencesFromThisMonth(absences).length;
}

// REMAINING WORK DAYS COUNT --------------------------
const remainingWorkDays = returnNumberOfRemainingWorkDays() - numberOfAbsences;

// WIDGET ---------------------------------------------
let widget = createWidget(balance, isFulltime);
if (config.runsInWidget) {
  Script.setWidget(widget);
  Script.complete();
} else {
  widget.presentSmall();
}

function createWidget(balance, isFulltime) {
  const fulltime = 5500;
  const parttime = 2200;
  const limit = isFulltime ? fulltime : parttime;
  let w = new ListWidget();
  w.backgroundColor = new Color('#1A1A1A');

  w.addSpacer(8);

  let staticText = w.addText('Aspira Café');
  staticText.textColor = Color.white();
  staticText.font = Font.boldSystemFont(12);
  staticText.centerAlignText();

  w.addSpacer();

  let amount = limit + balance;
  let rounded = Number(amount).toFixed(0);
  let amountTxt = w.addText(rounded + ' CZK');
  w.addSpacer(2);

  const balanceForDay =
    remainingWorkDays > 0 ? Number(rounded / remainingWorkDays).toFixed(0) : rounded;
  let balancePerDayTxt = w.addText(balanceForDay + ' per day');
  w.addSpacer(1);
  let remainingDaysTxt = w.addText(`${remainingWorkDays} days left (${numberOfAbsences} abs.)`);

  w.addSpacer(6);
  let cookieExpiredTxt = reportCookieExpired ? w.addText('Report 🍪 expired.') : null;

  amountTxt.textColor = Color.orange();
  balancePerDayTxt.textColor = Color.gray();
  remainingDaysTxt.textColor = Color.darkGray();
  amountTxt.font = Font.systemFont(24);
  balancePerDayTxt.font = Font.systemFont(12);
  remainingDaysTxt.font = Font.systemFont(10);
  amountTxt.minimumScaleFactor = 0.3;
  amountTxt.lineLimit = 1;
  amountTxt.centerAlignText();
  balancePerDayTxt.centerAlignText();
  remainingDaysTxt.centerAlignText();

  if (cookieExpiredTxt) {
    cookieExpiredTxt.textColor = Color.red();
    cookieExpiredTxt.font = Font.systemFont(10);
    cookieExpiredTxt.centerAlignText();
  }

  w.addSpacer();

  let stack = w.addStack();
  stack.spacing = 2;
  stack.addSpacer();
  let updatedText = stack.addText('updated');
  updatedText.textColor = Color.gray();
  updatedText.font = Font.mediumSystemFont(10);
  let currentDate = new Date();
  let lastDate = stack.addDate(currentDate);
  stack.addSpacer();
  lastDate.applyTimeStyle();
  lastDate.textColor = Color.gray();
  lastDate.font = Font.mediumSystemFont(10);

  return w;
}
