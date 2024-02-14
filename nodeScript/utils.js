const HOLIDAY_DATES_2023 = require('./constants').HOLIDAY_DATES_2023;
const absences = [
  { date: { day: 14, month: 2, year: 2024 }, type: 'home office', duration: 'celý den' },
  { date: { day: 16, month: 2, year: 2024 }, type: 'home office', duration: 'celý den' },
  { date: { day: 23, month: 2, year: 2024 }, type: 'home office', duration: 'celý den' },
  { date: { day: 23, month: 3, year: 2024 }, type: 'home office', duration: 'celý den' },
];

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

  // console.log('🚀 ~ returnWeekDates ~ dates:', dates);
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
    days.push(Number(day));
  });

  // console.log('🚀 ~ returnDaysFromDates ~ days:', days);
  return days;
};

const returnWorkDays = () => {
  const workDates = returnWorkDates();
  const workDays = returnDaysFromDates(workDates);

  return workDays;
};

// if time is before 11:40, return current day, else return next day
const returnFirstCountedDay = () => {
  const now = new Date();
  const date = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
  const time = Number(`${hours}${minutes}`);

  return time < 1140 ? date : date + 1;
};

const returnNumberOfRemainingWorkDays = () => {
  const workDays = returnWorkDays();
  const firstCountedDay = returnFirstCountedDay();
  const remainingWorkDays = workDays.filter((day) => day >= firstCountedDay);

  return remainingWorkDays.length;
};

const returnWorkDaysWithoutAbsences = () => {
  const workDays = returnWorkDays();
  const currentMonth = new Date().getMonth() + 1;

  const currentMonthAbsenceDays = absences
    .filter((absence) => absence.date.month === currentMonth)
    .map((absence) => absence.date.day);

  return workDays.filter((day) => !currentMonthAbsenceDays.includes(day));
};

module.exports = {
  returnNumberOfRemainingWorkDays,
};
