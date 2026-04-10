// ─── STATE ───────────────────────────────────────────────────────────────────
// Structure:
// teams: [{ id, name }]
// tasks: [{ id, teamId, name }]
// entries: [{ id, taskId, teamId, date (YYYY-MM-DD), hours, minutes, notes }]

let state = { teams: [], tasks: [], entries: [] };
let activeTeamId = null;
let editingTaskId = null;
let loggingTaskId = null;

// ─── STORAGE ─────────────────────────────────────────────────────────────────
function saveState() {
  chrome.storage.local.set({ trackerState: JSON.parse(JSON.stringify(state)) });
}

function loadState(cb) {
  chrome.storage.local.get('trackerState', (res) => {
    if (res.trackerState) state = res.trackerState;
    cb();
  });
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(h, m) {
  h = parseInt(h) || 0;
  m = parseInt(m) || 0;
  if (h === 0 && m === 0) return '—';
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function totalForTask(taskId) {
  const entries = state.entries.filter(e => e.taskId === taskId);
  let totalMin = 0;
  entries.forEach(e => { totalMin += (parseInt(e.hours)||0)*60 + (parseInt(e.minutes)||0); });
  return { h: Math.floor(totalMin/60), m: totalMin%60 };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, mo, d] = dateStr.split('-');
  return `${d}/${mo}/${y.slice(2)}`;
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  renderTabs();
  renderContent();
}

function renderTabs() {
  const tabs = document.getElementById('teamTabs');
  tabs.innerHTML = '';
  state.teams.forEach(team => {
    const btn = document.createElement('button');
    btn.className = 'team-tab' + (team.id === activeTeamId ? ' active' : '');
    btn.innerHTML = `
      <span>${escHtml(team.name)}</span>
      <button class="team-tab-del" data-tid="${team.id}" title="Delete team">✕</button>
    `;
    btn.querySelector('span').addEventListener('click', () => {
      activeTeamId = team.id;
      render();
    });
    btn.querySelector('.team-tab-del').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Delete team "${team.name}" and all its tasks?`)) {
        state.teams = state.teams.filter(t => t.id !== team.id);
        state.tasks = state.tasks.filter(t => t.teamId !== team.id);
        state.entries = state.entries.filter(e => e.teamId !== team.id);
        if (activeTeamId === team.id) {
          activeTeamId = state.teams.length ? state.teams[0].id : null;
        }
        saveState();
        render();
      }
    });
    tabs.appendChild(btn);
  });
}

function renderContent() {
  const empty = document.getElementById('emptyState');
  const panel = document.getElementById('tasksPanel');

  if (!state.teams.length || !activeTeamId) {
    empty.style.display = '';
    panel.style.display = 'none';
    return;
  }

  const team = state.teams.find(t => t.id === activeTeamId);
  if (!team) return;

  empty.style.display = 'none';
  panel.style.display = '';

  document.getElementById('currentTeamName').textContent = team.name;

  const tasks = state.tasks.filter(t => t.teamId === activeTeamId);
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  if (!tasks.length) {
    list.innerHTML = '<div class="no-entries">No tasks yet. Click "+ Add Task" to start.</div>';
    return;
  }

  tasks.forEach(task => {
    const t = totalForTask(task.id);
    const entries = state.entries
      .filter(e => e.taskId === task.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;

    const entriesHtml = entries.length
      ? entries.map(e => `
          <div class="entry-row">
            <span class="entry-date">${formatDate(e.date)}</span>
            <span class="entry-note">${escHtml(e.notes || '')}</span>
            <span class="entry-time">${formatTime(e.hours, e.minutes)}</span>
            <button class="entry-del" data-eid="${e.id}" title="Remove entry">✕</button>
          </div>
        `).join('')
      : '<div class="no-entries">No time entries yet.</div>';

    card.innerHTML = `
      <div class="task-card-header">
        <div class="task-card-left">
          <svg class="task-chevron" viewBox="0 0 12 12" fill="none">
            <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="task-name">${escHtml(task.name)}</span>
          <span class="task-total">${formatTime(t.h, t.m)}</span>
        </div>
        <div class="task-card-actions">
          <button class="task-action-btn log-btn" data-tid="${task.id}" title="Add time entry">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.2"/>
              <path d="M6 3.5V6.2l1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="task-action-btn edit-btn" data-tid="${task.id}" title="Edit task">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5l2 2L3.5 10.5l-2.5.5.5-2.5L8.5 1.5z" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="task-action-btn del" data-tid="${task.id}" title="Delete task">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 3h8M4.5 3V2h3v1M5 5.5v3M7 5.5v3M3 3l.5 7h5L9 3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="task-entries">${entriesHtml}</div>
    `;

    // Toggle expand
    card.querySelector('.task-card-header').addEventListener('click', (e) => {
      if (e.target.closest('.task-card-actions')) return;
      card.classList.toggle('open');
    });

    // Log time
    card.querySelector('.log-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openLogModal(task.id, task.name);
    });

    // Edit task
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditTaskModal(task);
    });

    // Delete task
    card.querySelector('.del').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Delete task "${task.name}"?`)) {
        state.tasks = state.tasks.filter(t => t.id !== task.id);
        state.entries = state.entries.filter(en => en.taskId !== task.id);
        saveState();
        render();
      }
    });

    // Delete entry
    card.querySelectorAll('.entry-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const eid = btn.dataset.eid;
        state.entries = state.entries.filter(en => en.id !== eid);
        saveState();
        render();
        // Re-open card
        const updatedCard = document.querySelector(`[data-task-id="${task.id}"]`);
        if (updatedCard) updatedCard.classList.add('open');
      });
    });

    list.appendChild(card);
  });
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Data-close buttons
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

// ─── TEAM MODAL ───────────────────────────────────────────────────────────────
document.getElementById('addTeamBtn').addEventListener('click', () => {
  document.getElementById('teamNameInput').value = '';
  openModal('teamModal');
  setTimeout(() => document.getElementById('teamNameInput').focus(), 80);
});

document.getElementById('saveTeamBtn').addEventListener('click', () => {
  const name = document.getElementById('teamNameInput').value.trim();
  if (!name) return shake('teamNameInput');
  const id = uid();
  state.teams.push({ id, name });
  activeTeamId = id;
  saveState();
  closeModal('teamModal');
  render();
});

document.getElementById('teamNameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('saveTeamBtn').click();
});

// ─── TASK MODAL ───────────────────────────────────────────────────────────────
document.getElementById('addTaskBtn').addEventListener('click', () => {
  editingTaskId = null;
  document.getElementById('taskModalTitle').textContent = 'New Task';
  document.getElementById('taskNameInput').value = '';
  document.getElementById('taskDateInput').value = today();
  document.getElementById('taskHours').value = '';
  document.getElementById('taskMinutes').value = '';
  document.getElementById('taskNotes').value = '';
  openModal('taskModal');
  setTimeout(() => document.getElementById('taskNameInput').focus(), 80);
});

function openEditTaskModal(task) {
  editingTaskId = task.id;
  document.getElementById('taskModalTitle').textContent = 'Edit Task';
  document.getElementById('taskNameInput').value = task.name;
  document.getElementById('taskDateInput').value = today();
  document.getElementById('taskHours').value = '';
  document.getElementById('taskMinutes').value = '';
  document.getElementById('taskNotes').value = '';
  openModal('taskModal');
  setTimeout(() => document.getElementById('taskNameInput').focus(), 80);
}

document.getElementById('saveTaskBtn').addEventListener('click', () => {
  const name = document.getElementById('taskNameInput').value.trim();
  if (!name) return shake('taskNameInput');

  const hours = parseInt(document.getElementById('taskHours').value) || 0;
  const minutes = parseInt(document.getElementById('taskMinutes').value) || 0;
  const date = document.getElementById('taskDateInput').value || today();
  const notes = document.getElementById('taskNotes').value.trim();

  if (editingTaskId) {
    const task = state.tasks.find(t => t.id === editingTaskId);
    if (task) task.name = name;
    // Add entry if time provided
    if (hours > 0 || minutes > 0) {
      state.entries.push({ id: uid(), taskId: editingTaskId, teamId: activeTeamId, date, hours, minutes, notes });
    }
  } else {
    const taskId = uid();
    state.tasks.push({ id: taskId, teamId: activeTeamId, name });
    if (hours > 0 || minutes > 0) {
      state.entries.push({ id: uid(), taskId, teamId: activeTeamId, date, hours, minutes, notes });
    }
  }

  saveState();
  closeModal('taskModal');
  render();
});

// ─── LOG TIME MODAL ───────────────────────────────────────────────────────────
function openLogModal(taskId, taskName) {
  loggingTaskId = taskId;
  document.getElementById('logTaskName').textContent = taskName;
  document.getElementById('logDateInput').value = today();
  document.getElementById('logHours').value = '';
  document.getElementById('logMinutes').value = '';
  document.getElementById('logNotes').value = '';
  openModal('logModal');
  setTimeout(() => document.getElementById('logHours').focus(), 80);
}

document.getElementById('saveLogBtn').addEventListener('click', () => {
  const hours = parseInt(document.getElementById('logHours').value) || 0;
  const minutes = parseInt(document.getElementById('logMinutes').value) || 0;
  if (hours === 0 && minutes === 0) return shake('logHours');

  const date = document.getElementById('logDateInput').value || today();
  const notes = document.getElementById('logNotes').value.trim();

  state.entries.push({ id: uid(), taskId: loggingTaskId, teamId: activeTeamId, date, hours, minutes, notes });
  saveState();
  closeModal('logModal');

  render();
  setTimeout(() => {
    const card = document.querySelector(`[data-task-id="${loggingTaskId}"]`);
    if (card) card.classList.add('open');
  }, 30);
});

// ─── EXPORT MODAL ────────────────────────────────────────────────────────────
document.getElementById('exportBtn').addEventListener('click', () => {
  // Populate team select
  const sel = document.getElementById('exportTeamSelect');
  sel.innerHTML = '<option value="all">All Teams</option>';
  state.teams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    sel.appendChild(opt);
  });
  // Set default dates: past 7 days to today
  const from = new Date(); from.setDate(from.getDate()-6);
  document.getElementById('exportFrom').value = from.toISOString().slice(0,10);
  document.getElementById('exportTo').value = today();
  document.getElementById('exportPreview').innerHTML = '';
  openModal('exportModal');
});

function getFilteredEntries() {
  const teamId = document.getElementById('exportTeamSelect').value;
  const from = document.getElementById('exportFrom').value;
  const to = document.getElementById('exportTo').value;

  return state.entries.filter(e => {
    if (teamId !== 'all' && e.teamId !== teamId) return false;
    if (from && e.date < from) return false;
    if (to && e.date > to) return false;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));
}

document.getElementById('previewExportBtn').addEventListener('click', () => {
  const entries = getFilteredEntries();
  const preview = document.getElementById('exportPreview');

  if (!entries.length) {
    preview.innerHTML = '<div class="preview-empty">No entries in this date range.</div>';
    return;
  }

  const rows = entries.map(e => {
    const task = state.tasks.find(t => t.id === e.taskId);
    const team = state.teams.find(t => t.id === e.teamId);
    return `<tr>
      <td>${formatDate(e.date)}</td>
      <td>${escHtml(team?.name||'')}</td>
      <td>${escHtml(task?.name||'')}</td>
      <td>${formatTime(e.hours, e.minutes)}</td>
    </tr>`;
  }).join('');

  preview.innerHTML = `
    <table class="preview-table">
      <thead><tr><th>Date</th><th>Team</th><th>Task</th><th>Time</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
});

document.getElementById('downloadCsvBtn').addEventListener('click', () => {
  const entries = getFilteredEntries();
  if (!entries.length) {
    document.getElementById('exportPreview').innerHTML = '<div class="preview-empty">No entries in this date range.</div>';
    return;
  }

  const lines = ['Date,Team,Task,Hours,Minutes,Total Time,Notes'];
  entries.forEach(e => {
    const task = state.tasks.find(t => t.id === e.taskId);
    const team = state.teams.find(t => t.id === e.teamId);
    const total = formatTime(e.hours, e.minutes);
    lines.push([
      e.date,
      csvQuote(team?.name||''),
      csvQuote(task?.name||''),
      e.hours||0,
      e.minutes||0,
      total,
      csvQuote(e.notes||'')
    ].join(','));
  });

  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tracker-report-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

function csvQuote(str) {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function shake(inputId) {
  const el = document.getElementById(inputId);
  el.style.borderColor = 'var(--danger)';
  el.focus();
  setTimeout(() => el.style.borderColor = '', 800);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
loadState(() => {
  if (state.teams.length) activeTeamId = state.teams[0].id;
  render();
});
