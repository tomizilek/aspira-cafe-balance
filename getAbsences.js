const absencesDurationConfig = {
  'celý den': true,
  dopoledne: true,
  odpoledne: false,
};

const getAbsences = async () => {
  const response = await fetch('https://report.livesport.eu/absences/', {
    headers: {
      Cookie:
        '_hjSessionUser_2003820=eyJpZCI6ImJjNjk4OGY5LTBhMGQtNTUwYS1iYmY0LTI1NThjZTVjM2E0OSIsImNyZWF0ZWQiOjE2ODQzMTQ5MTg1NjYsImV4aXN0aW5nIjp0cnVlfQ==; OptanonAlertBoxClosed=2023-05-23T12:34:36.074Z; eupubconsent-v2=CPsNvrAPsNvrAAcABBENDECsAP_AAAAAAChQJGtf_X__b2_j-_5_f_t0eY1P9_7_v-0zjhfdl-8N2f_X_L8X52M7vF36pq4KuR4ku3LBIQVlHOHcDUmw6okVryPsbk2cr7NKJ7PEmnMbO2dYGH9_n13T-ZKY7___f__z_v-v________7-3f3__p___-2_e_V_99zfn9_____9vP___9v-_9_3gAAAAAAAAAAAAD4AAABwkAIAGgC8xUAEBeYyACAvMdAEABoAGYAZQC8yEAIAMwAyiUAMAMwAygF5lIAgANAAzADKAXmAAA.f_gAAAAAAAAA; _ga=GA1.1.1531466603.1684845271; OptanonConsent=isGpcEnabled=0&datestamp=Tue+May+23+2023+14%3A34%3A36+GMT%2B0200+(Central+European+Summer+Time)&version=202210.1.0&isIABGlobal=false&hosts=&consentId=25ee32de-59ff-490a-95f2-7989298a2065&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0004%3A1%2CSTACK42%3A1; _fbp=fb.1.1684845276160.1973073325; _gcl_au=1.1.978096959.1684845276; _ga_SGLS8CHCVG=GS1.1.1684845271.1.1.1684845283.53.0.0; nette-browser=ysf3xskvsv; _ga_QC62MH0F1B=GS1.1.1690468056.1.1.1690468925.0.0.0; PHPSESSID=4f18be5aaa81ea71295539ef8f231fe3; _oauth2_proxy_kc_sso_livesport_eu=X29hdXRoMl9wcm94eV9rY19zc29fbGl2ZXNwb3J0X2V1LTViNjQ5OTdmMmMyMDRhODRhNGY5M2Y1MTI2ZDEwMzgxLllSUVROcS1WeUZSU1VXY0RTeFdYVHc=|1690626236|VnKP-dxvoOSPXnrFMTu9ZrOrFg_rXbV9NkgSYx_ZwHA=',
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
      absencesDurationConfig[absence.duration]
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
