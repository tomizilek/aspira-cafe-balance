class WorkDayCalculator {
    constructor() {
      this.HOLIDAY_DATES_2023 = []; // Replace with your actual holiday dates
    }
  
    returnNumberOfRemainingWorkDays() {
      const workDays = this._returnWorkDays();
      const firstCountedDay = this._returnFirstCountedDay();
      const remainingWorkDays = workDays.filter((day) => day >= firstCountedDay);
  
      return remainingWorkDays.length;
    }
  
    _returnWeekDates() {
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
  
    _returnWorkDates() {
      const weekDatesInCurrentMonth = this._returnWeekDates();
      return weekDatesInCurrentMonth.filter(
        (day) => !this.HOLIDAY_DATES_2023.includes(day)
      );
    }
  
    _returnDaysFromDates(dates) {
      const days = [];
      dates.forEach((date) => {
        const day = date.split(".")[0];
        days.push(day);
      });
      return days;
    }
  
    _returnWorkDays() {
      const workDates = this._returnWorkDates();
      const workDays = this._returnDaysFromDates(workDates);
      return workDays;
    }
  
    _returnFirstCountedDay() {
      const now = new Date();
      const date = now.getDate();
      const hours = now.getHours();
      const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
      const time = Number(`${hours}${minutes}`);
  
      return time < 1140 ? date : date + 1;
    }
  }
  
  // Example usage:
  const calculator = new WorkDayCalculator();
  const remainingWorkDays = calculator.returnNumberOfRemainingWorkDays();
  console.log(`Remaining work days: ${remainingWorkDays}`);
  