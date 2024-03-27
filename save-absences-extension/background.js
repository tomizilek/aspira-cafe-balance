chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: '❌',
  });
});

const reportUrl = 'https://report.livesport.eu';
// your personal json blob url where you update and then access your report absences (must be the same url as in scriptabble.js)
const absencesDataUrl = 'https://jsonblob.com/api/jsonBlob/1186343823378079744';

// When the user clicks on the extension action
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(reportUrl)) {
    chrome.cookies.get(
      {
        url: tab.url,
        name: '_oauth2_proxy_kc_sso_livesport_eu',
      },
      async (cookie) => {
        if (cookie) {
          const absences = await getAbsences(cookie.value);

          fetch(absencesDataUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              absences: absences,
              lastUpdated: new Date().toISOString().split('T')[0],
            }),
          }).then(async (absencesDataResponse) => {
            if (!absencesDataResponse.ok) {
              throw new Error('Network response was not ok');
            }

            await chrome.action.setBadgeText({
              tabId: tab.id,
              text: '✅',
            });
          });
        } else {
          console.error('Cookie not found.');
        }
      }
    );
  }
});

// ABSENCES REQUEST -------------------------------------
async function getAbsences(cookie) {
  const url = `${reportUrl}/absences`;
  const fetchOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {
      Cookie: `_oauth2_proxy_kc_sso_livesport_eu=${cookie}`,
    },
  };

  const absences = await fetch(url, fetchOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then((absencesHtml) => {
      const absences = parseAbsencesHtml(absencesHtml);

      return absences;
    })
    .catch((error) => {
      console.error('Fetch error:', error);
    });

  console.log('absences: ', absences);
  return absences;
}

// ABSENCES HTML PARSING ---------------------------------

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
