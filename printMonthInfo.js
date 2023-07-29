const { MONTH_NAMES } = require("./constants");

const printMonthInfo = () => {
    const now = new Date();
    const date = `${MONTH_NAMES[now.getMonth()]}, ${now.getFullYear()}`;
    console.log('\n')
    console.log(date)
    // console.log(totalWorkDays)
    // console.log(totalHolidayDays)
    // console.log(totalHomeOfficeDays)
}

module.exports = printMonthInfo;