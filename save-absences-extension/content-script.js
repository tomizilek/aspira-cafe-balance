document.addEventListener('DOMContentLoaded', function () {
  const button = document.getElementById('frmdefault-save');

  if (button) {
    console.log('Button found');
    button.addEventListener('click', function () {
      console.log('Button clicked');
      chrome.runtime.sendMessage({ action: 'absences_saved' });
    });
  } else {
    console.log('Button not found');
  }
});
