# Aspira Café Scriptable Widget

This is a Scriptable widget for iOS that displays your current month balance and daily budget in Aspira Café. The daily budget is calculated based on the remaining work days in the current month (that is excluding holidays).

The repository also includes a Chrome extension that allows you to extract the home offices and vacations from the internal Report tool and the widget can use this data to calculate the daily budget more accurately. The extension is not required to use the widget.

## Widget

1. Install the Scriptable app from the App Store.
2. Open the app and create a new script.
3. Copy the contents of the `scriptable.js` file from this repository to the script.
4. Customize the variables at the top of the script:
   - `username` - your Aspira Café username
   - `password` - your Aspira Café password
   - `isFullTime` - `true` if your Aspira budget is 5500 CZK, `false` if it is 2200 CZK
   - `timeWhenLunchIsOver` - the time when you usually finish your lunch (e.g. `1130` - used for calculating your daily budget)
5. Save the script and add a new Scriptable widget to your device.

## Chrome Extension

1. Create a new JSON Blob at https://jsonblob.com/new and save it. Copy the ID of the provided URL and change this url accordingly `https://jsonblob.com/api/jsonBlob/{ID}`.
2. Download the `save-absences-extension` folder from this repository and save it locally.
3. Change the `absencesBlobUrl` variable in the `scriptable.js` file to the URL from the first step.
4. Change the `absencesBlobUrl` variable in the `background.js` file (located inside the `save-absences-extension` folder) to the URL from the first step.
5. Open the Chrome Extensions page (`chrome://extensions/`) and enable Developer mode.
6. Click on the "Load unpacked" button and select the `save-absences-extension` folder that you downloaded in the second step.
7. When you add/remove vacations and home offices in the Report tool (https://report.livesport.eu/absences), the extension script runs automatically. You can also click on it in the Chrome toolbar to run it manually (again, you need to be at https://report.livesport.eu/absences). When run correctly (you should see a checkmark attached to the extension icon), the extension will save your home offices and vacations from the Report table "Upcoming absences" to the JSON Blob and your widget will use the data in the daily budget calculation.
