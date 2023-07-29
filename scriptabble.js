// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: coffee;
/* --------------------------------------------------------------
Script: Aspira.js
Author: Michal Klement
Version: 1.0.0

Description:
Aspira Cafe balance

Changelog:
1.0.0: Initial version
-------------------------------------------------------------- */
// Set this parameter to true if your working mode is full-time, or false otherwise.
const isFulltime = true;
// When do you usually finish your lunch? eg. 1140
const timeWhenLunchIsOver = 1135;
// Set your report cookie from https://report.livesport.eu/absences/
const reportCookie =
  '_hjSessionUser_2003820=eyJpZCI6ImJjNjk4OGY5LTBhMGQtNTUwYS1iYmY0LTI1NThjZTVjM2E0OSIsImNyZWF0ZWQiOjE2ODQzMTQ5MTg1NjYsImV4aXN0aW5nIjp0cnVlfQ==; OptanonAlertBoxClosed=2023-05-23T12:34:36.074Z; eupubconsent-v2=CPsNvrAPsNvrAAcABBENDECsAP_AAAAAAChQJGtf_X__b2_j-_5_f_t0eY1P9_7_v-0zjhfdl-8N2f_X_L8X52M7vF36pq4KuR4ku3LBIQVlHOHcDUmw6okVryPsbk2cr7NKJ7PEmnMbO2dYGH9_n13T-ZKY7___f__z_v-v________7-3f3__p___-2_e_V_99zfn9_____9vP___9v-_9_3gAAAAAAAAAAAAD4AAABwkAIAGgC8xUAEBeYyACAvMdAEABoAGYAZQC8yEAIAMwAyiUAMAMwAygF5lIAgANAAzADKAXmAAA.f_gAAAAAAAAA; _ga=GA1.1.1531466603.1684845271; OptanonConsent=isGpcEnabled=0&datestamp=Tue+May+23+2023+14%3A34%3A36+GMT%2B0200+(Central+European+Summer+Time)&version=202210.1.0&isIABGlobal=false&hosts=&consentId=25ee32de-59ff-490a-95f2-7989298a2065&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0004%3A1%2CSTACK42%3A1; _fbp=fb.1.1684845276160.1973073325; _gcl_au=1.1.978096959.1684845276; _ga_SGLS8CHCVG=GS1.1.1684845271.1.1.1684845283.53.0.0; PHPSESSID=64320d52d65bcdfacca033bf3d98b893; _oauth2_proxy_kc_sso_livesport_eu=X29hdXRoMl9wcm94eV9rY19zc29fbGl2ZXNwb3J0X2V1LTU3Y2YxMTY5ZWJjYmQ1NTY5MDM3MWEyNTgzMzhmZDJkLkI4WDlESG5fMERZQWNrcnRiQy1xcXc=|1690358333|n0W7RASvTtgA-1qAbwzivB12Gf6oN1QCOl3EDap-a58=';
// Set your login credentials from https://aspira.septim.cz/login
const user = 'tomas.novotny@livesport.eu';
const password = 'tnovotny';
// Set which options from "celý den", "dopoledne", "odpoledne" should be counted as absences
const regexForAbsences = /<td>(celý den|dopoledne|odpoledne)<\/td>/g;
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
  Cookie: reportCookie,
};

const absencesResponse = await absencesRequest.loadString();
const reportCookieExpired = absencesResponse.includes('Livesport login');
let numberOfAbsences;

if (reportCookieExpired) {
  numberOfAbsences = 0;
} else {
  const absencesMatch = absencesResponse.match(regexForAbsences);
  numberOfAbsences = absencesMatch ? absencesMatch.length : 0;
}

const remainingWorkDays = returnNumberOfRemainingWorkDays() - numberOfAbsences;

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
  let balancePerDayTxt = w.addText(Number(rounded / remainingWorkDays).toFixed(0) + ' per day');
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
