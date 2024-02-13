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
// jsonBlob URL where you update your '_oauth2_proxy_kc_sso_livesport_eu' cookie from https://report.livesport.eu/absences/
const reportDataUrl = 'https://jsonblob.com/api/jsonBlob/1186343823378079744';
// Set your login credentials from https://aspira.septim.cz/login
const user = 'tomas.novotny@livesport.eu';
const password = 'tnovotny';

const HOLIDAY_DATES = {
  2024: [
    '1.1.',
    '29.3.',
    '1.4.',
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
  ],
  2025: [
    '1.1.',
    '18.4.',
    '21.4.',
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
  ],
};

const currentYear = new Date().getFullYear();
const currentYearHolidays = HOLIDAY_DATES[currentYear];

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

// REPORT DATA REQUEST -------------------------------------
const reportReq = new Request(reportDataUrl);
const reportRes = await reportReq.loadJSON();
const { absences } = reportRes;

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

  const { remainingWorkDays, remainingAbsences } = returnRemainingWorkDaysAndAbsences(absences);
  const balanceForDay =
    remainingWorkDays > 0 ? Number(rounded / remainingWorkDays).toFixed(0) : rounded;
  let balancePerDayTxt = w.addText(balanceForDay + ' per day');
  w.addSpacer(1);
  let remainingDaysTxt = w.addText(`${remainingWorkDays} days left (${remainingAbsences} abs.)`);

  w.addSpacer(6);

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

// COUNT REMAINING WORK DAYS -------------------------------------
function returnWeekDates() {
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
}

function returnWorkDays() {
  const weekDatesInCurrentMonth = returnWeekDates();
  const workDates = weekDatesInCurrentMonth.filter((day) => !currentYearHolidays.includes(day));
  const days = [];
  workDates.forEach((date) => {
    const day = date.split('.')[0];
    days.push(Number(day));
  });

  return days;
}

function returnFirstCountedDay() {
  const now = new Date();
  const date = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
  const time = Number(`${hours}${minutes}`);

  return time < timeWhenLunchIsOver ? date : date + 1;
}

function returnRemainingWorkDaysAndAbsences(absences) {
  const workDays = returnWorkDays();
  const currentMonth = new Date().getMonth() + 1;
  const firstCountedDay = returnFirstCountedDay();

  let remainingAbsences = [];

  if (absences) {
    remainingAbsences = absences
      .filter(
        (absence) => absence.date.month === currentMonth && absence.date.day >= firstCountedDay
      )
      .map((absence) => absence.date.day);
  }

  const remainingWorkDays = workDays.filter(
    (day) => day >= firstCountedDay && !remainingAbsences.includes(day)
  );

  return {
    remainingWorkDays: remainingWorkDays.length,
    remainingAbsences: remainingAbsences.length,
  };
}
