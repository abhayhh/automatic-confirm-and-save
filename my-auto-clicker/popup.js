document.addEventListener('DOMContentLoaded', () => {
  const stepsTextarea = document.getElementById('stepsTextarea');
  const saveButton = document.getElementById('saveButton');
  const enabledCheckbox = document.getElementById('enabledCheckbox');

  chrome.storage.sync.get(['steps', 'enabled'], (data) => {
    if (data.steps && Array.isArray(data.steps)) {
      stepsTextarea.value = data.steps.join('\n');
    }
    if (data.enabled) {
      enabledCheckbox.checked = true;
    }
  });

  saveButton.addEventListener('click', () => {
    const steps = stepsTextarea.value.split('\n').filter(s => s.trim() !== '');
    chrome.storage.sync.set({ steps: steps, currentStep: 0 }, () => {
      alert('Steps saved! The macro will restart from step 1.');
    });
  });

  enabledCheckbox.addEventListener('change', () => {
    const enabled = enabledCheckbox.checked;
    chrome.storage.sync.set({ enabled: enabled, currentStep: 0 });
  });
});