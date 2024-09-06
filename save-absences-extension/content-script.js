document.addEventListener('DOMContentLoaded', function () {
  const changeInAbsencesSavedInfo = document.querySelector('.flash.oki');

  if (changeInAbsencesSavedInfo) {
    chrome.runtime.sendMessage({ action: 'absences_edited' });
  }
});
