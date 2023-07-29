const printMonthInfo = require('./printMonthInfo');

const TOTAL_MONTH_BALANCE = require('./constants').TOTAL_MONTH_BALANCE;
const returnNumberOfRemainingWorkDays = require('./utils').returnNumberOfRemainingWorkDays;
let NUMBER_OF_DAYS_OFF = process.argv[2] ? process.argv[2] : 0;

const remainingWorkDays = returnNumberOfRemainingWorkDays() - NUMBER_OF_DAYS_OFF;

const returnRemainingBalance = async () => {
  const response = await fetch('https://aspira.septim.cz/webcareapi/customer/account/balance', {
    headers: {
      Authorization: 'Basic dG9tYXMubm92b3RueUBsaXZlc3BvcnQuZXU6dG5vdm90bnk=',
      'X-ASW-TOKEN': '23d3a667-736f-4d6b-97f5-2f00882f5963',
    },
  });
  const data = await response.json();
  const currentBalance = await data.balance;

  // currentBallance is a negative number
  const result = (TOTAL_MONTH_BALANCE + currentBalance).toFixed(0);

  return Number(result);
};

const printRemainingBalanceTable = async () => {
  const remainingBalance = await returnRemainingBalance();
  const table = {};
  table['zůstatek'] = remainingBalance;
  table['zbývá dní'] = remainingWorkDays;
  table['======================'] = '============';
  table['na den'] = Math.round(remainingBalance / remainingWorkDays);

  printMonthInfo();
  console.table(table);
};

printRemainingBalanceTable();
