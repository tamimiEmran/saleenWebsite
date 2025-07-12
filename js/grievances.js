// js/grievances.js
document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('grievanceForm');
  const historyEl = document.getElementById('grievanceHistory');
  const listEl    = document.getElementById('grievanceList');
  if (!form || !historyEl || !listEl) return;

  // Show or hide the history container based on whether there are any grievances
  function updateHistoryVisibility() {
    historyEl.style.display = (grievances.length > 0 ? 'block' : 'none');
  }

  // Render all grievances as cards with a two-step “Resolved” button
  function renderGrievances() {
    listEl.innerHTML = '';
    grievances.forEach((entry, idx) => {
      entry.clickCount = entry.clickCount || 0;

      const card = document.createElement('div');
      card.className = 'grievance-card';
      card.style.cssText = `
        background: #f9f9f9;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 10px;
      `;

      const details = document.createElement('p');
      details.textContent = entry.details;
      card.appendChild(details);

      const info = document.createElement('small');
      info.textContent = `Severity: ${entry.severity} • ${entry.date}`;
      card.appendChild(info);

      const btn = document.createElement('button');
      btn.textContent = entry.clickCount === 0
        ? 'Resolved?'
        : 'Confirm Resolved';
      btn.style.cssText = `
        margin-top: 10px;
        padding: 8px 12px;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      `;
      btn.addEventListener('click', () => {
        entry.clickCount++;
        if (entry.clickCount >= 2) {
          // remove this grievance
          grievances.splice(idx, 1);
        }
        if (typeof autoSaveToNAS === 'function') autoSaveToNAS();
        renderGrievances();
      });
      card.appendChild(btn);

      listEl.appendChild(card);
    });

    updateHistoryVisibility();
  }

  // Handle new grievance submissions
  form.addEventListener('submit', e => {
    e.preventDefault();
    const details  = document.getElementById('grievanceDetails').value.trim();
    const severity = document.getElementById('grievanceSeverity').value;
    if (!details) {
      alert('Please enter grievance details.');
      return;
    }
    grievances.push({
      details,
      severity,
      date: new Date().toLocaleString(),
      clickCount: 0
    });
    form.reset();
    if (typeof autoSaveToNAS === 'function') autoSaveToNAS();
    renderGrievances();
  });

  // Initial draw of the list
  renderGrievances();
});
