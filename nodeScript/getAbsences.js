const absencesDurationConfig = {
  'celý den': true,
  dopoledne: true,
  odpoledne: false,
};

const getAbsences = async () => {
  const response = await fetch('https://report.livesport.eu/absences/', {
    headers: {
      Cookie:
        '_oauth2_proxy_kc_sso_livesport_eu=X29hdXRoMl9wcm94eV9rY19zc29fbGl2ZXNwb3J0X2V1LTUwZDY4YmY3MmExMjFiZGI1MDNkYjY0NGNmNTk1MGZjLlZOQ1dmb214Mm9RWjhJMWJUSXZTbVE=|1692003239|k2bff8Ey3tIdpObMmVO1Y9YMwBi0TlNza0BiNFMc_5s=',
    },
  });

  const html = await response.text();

  if (html.includes('<title>Sign in to Livesport login</title>')) {
    return 'You are not logged in';
  }

  const absencesData = parseAbsencesHtml(html);

  return filterAbsencesFromThisMonth(absencesData);
};

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

getAbsences().then((absences) => {
  console.log(absences);
});
