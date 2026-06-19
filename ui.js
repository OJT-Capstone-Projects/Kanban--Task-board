/*
 * ============================================================
 *  TASKFLOW — ui.js
 *  Clean, simple, CPR-level JS only
 *  Features: CRUD, Drag & Drop, Search, localStorage, Dark Mode
 * ============================================================
 */

/* ── STATE ── */
var tasks         = [];
var editingTaskId = null;
var draggingTaskId= null;
var searchQuery   = "";

/* ── UTILITIES ── */
function generateId() {
  return "t" + Date.now() + Math.floor(Math.random() * 9999);
}

function formatDate(str) {
  if (!str) return "";
  var p = str.split("-");
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[parseInt(p[1], 10) - 1] + " " + parseInt(p[2], 10);
}

function getInitials(name) {
  if (!name || !name.trim()) return "?";
  var parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.trim().substring(0, 2).toUpperCase();
}

/* ── DARK / LIGHT MODE ── */
function setupThemeToggle() {
  var btn  = document.getElementById("theme-toggle");
  var icon = document.getElementById("theme-icon");
  var html = document.documentElement;

  /* Load saved preference */
  var saved = localStorage.getItem("taskflow-theme") || "light";
  html.setAttribute("data-theme", saved);
  icon.className = saved === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";

  btn.onclick = function () {
    var current = html.getAttribute("data-theme");
    var next    = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    icon.className = next === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    localStorage.setItem("taskflow-theme", next);
  };
}

/* ── TOAST ── */
var toastTimer = null;

function showToast(msg, type) {
  var el = document.getElementById("toast");
  el.className = "toast";
  el.innerHTML = "";

  var i = document.createElement("i");
  if (type === "success") { i.className = "fa-solid fa-circle-check";       el.classList.add("toast-success"); }
  else if (type === "error") { i.className = "fa-solid fa-circle-exclamation"; el.classList.add("toast-error"); }
  else { i.className = "fa-solid fa-circle-info"; el.classList.add("toast-info"); }

  var t = document.createElement("span");
  t.innerText = msg;
  el.appendChild(i);
  el.appendChild(t);
  el.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove("show"); }, 3000);
}

/* ── STORAGE ── */
function saveToLocalStorage(arr) {
  localStorage.setItem("kanbanTasks_v3", JSON.stringify(arr));
}

function loadFromLocalStorage() {
  var v3 = localStorage.getItem("kanbanTasks_v3");
  if (v3) return JSON.parse(v3);
  /* migrate v2 */
  var v2 = localStorage.getItem("kanbanTasks_v2");
  if (v2) {
    var d = JSON.parse(v2);
    for (var i = 0; i < d.length; i++) {
      d[i].priority = d[i].priority || "medium";
      d[i].due      = d[i].due      || "";
      d[i].assignee = d[i].assignee || "";
    }
    return d;
  }
  return [];
}

/* ── EMPTY STATES ── */
function showEmptyState(col) {
  var el = document.getElementById("empty-" + col);
  if (el) el.classList.remove("hidden");
}

function hideEmptyState(col) {
  var el = document.getElementById("empty-" + col);
  if (el) el.classList.add("hidden");
}

/* ── COUNTS ── */
function updateCounts() {
  var c = { todo: 0, inprogress: 0, done: 0 };
  for (var i = 0; i < tasks.length; i++) {
    if (c[tasks[i].column] !== undefined) c[tasks[i].column]++;
  }
  var total = c.todo + c.inprogress + c.done;

  /* column badges */
  var cols = ["todo","inprogress","done"];
  for (var j = 0; j < cols.length; j++) {
    var b = document.getElementById("count-" + cols[j]);
    if (b) b.innerText = c[cols[j]];
  }

  /* header mini stats */
  var tc = document.getElementById("total-count");
  var hd = document.getElementById("hstat-done");
  var ha = document.getElementById("hstat-active");
  if (tc) tc.innerText = total;
  if (hd) hd.innerText = c.done;
  if (ha) ha.innerText = c.todo + c.inprogress;

  /* stat cards */
  var s = document.getElementById("stat-total");      if (s) s.innerText = total;
  var a = document.getElementById("stat-todo");       if (a) a.innerText = c.todo;
  var b2= document.getElementById("stat-inprogress"); if (b2) b2.innerText = c.inprogress;
  var e = document.getElementById("stat-done");       if (e) e.innerText = c.done;
}

/* ── BUILD CARD ELEMENT ── */
function buildCardElement(task) {
  var card = document.createElement("div");
  card.className = "task-card";
  card.id = task.id;
  card.setAttribute("draggable", "true");
  card.setAttribute("data-id", task.id);

  /* top row */
  var topRow = document.createElement("div");
  topRow.className = "card-top-row";

  var badge = document.createElement("span");
  badge.className = "priority-badge priority-" + (task.priority || "medium");
  var labels = { high: "High", medium: "Medium", low: "Low" };
  badge.innerText = labels[task.priority] || "Medium";
  topRow.appendChild(badge);

  /* title */
  var title = document.createElement("p");
  title.className = "card-title";
  title.innerText = task.title;

  /* description */
  var desc = document.createElement("p");
  if (task.description && task.description.trim()) {
    desc.className = "card-desc";
    desc.innerText = task.description;
  } else {
    desc.className = "card-desc card-desc-empty";
  }

  /* meta */
  var meta = document.createElement("div");
  meta.className = "card-meta";

  if (task.due) {
    var due = document.createElement("span");
    due.className = "card-due";
    due.innerHTML = '<i class="fa-regular fa-calendar"></i>' + formatDate(task.due);
    meta.appendChild(due);
  }

  if (task.assignee && task.assignee.trim()) {
    var aWrap = document.createElement("span");
    aWrap.className = "card-assignee";
    var aAvatar = document.createElement("div");
    aAvatar.className = "assignee-avatar";
    aAvatar.innerText = getInitials(task.assignee);
    var aName = document.createElement("span");
    aName.innerText = task.assignee;
    aWrap.appendChild(aAvatar);
    aWrap.appendChild(aName);
    meta.appendChild(aWrap);
  }

  /* actions */
  var actions = document.createElement("div");
  actions.className = "card-actions";

  var editBtn = document.createElement("button");
  editBtn.className = "btn-edit";
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit';
  editBtn.onclick = function () { editTask(task.id); };

  var delBtn = document.createElement("button");
  delBtn.className = "btn-delete";
  delBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
  delBtn.onclick = function () { deleteTask(task.id); };

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  /* drag events */
  card.ondragstart = function (e) {
    draggingTaskId = task.id;
    setTimeout(function () { card.classList.add("dragging"); }, 0);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
  };

  card.ondragend = function () {
    card.classList.remove("dragging");
    draggingTaskId = null;
    removePlaceholders();
    document.querySelectorAll(".column").forEach(function (c) { c.classList.remove("drag-over"); });
  };

  card.appendChild(topRow);
  card.appendChild(title);
  card.appendChild(desc);
  if (meta.childNodes.length) card.appendChild(meta);
  card.appendChild(actions);

  return card;
}

/* ── PLACEHOLDERS ── */
function removePlaceholders() {
  var els = document.querySelectorAll(".drag-placeholder");
  for (var i = 0; i < els.length; i++) els[i].parentNode.removeChild(els[i]);
}

/* ── SEARCH FILTER ── */
function getFilteredTasks() {
  if (!searchQuery.trim()) return tasks;
  var q = searchQuery.toLowerCase();
  var out = [];
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    if (t.title.toLowerCase().indexOf(q) !== -1 ||
        (t.description && t.description.toLowerCase().indexOf(q) !== -1) ||
        (t.assignee && t.assignee.toLowerCase().indexOf(q) !== -1)) {
      out.push(t);
    }
  }
  return out;
}

/* ── RENDER BOARD ── */
function renderBoard(arr) {
  var cols = ["todo", "inprogress", "done"];

  for (var c = 0; c < cols.length; c++) {
    var list = document.getElementById("list-" + cols[c]);
    if (list) list.innerHTML = "";
  }

  for (var i = 0; i < arr.length; i++) {
    var list2 = document.getElementById("list-" + arr[i].column);
    if (list2) list2.appendChild(buildCardElement(arr[i]));
  }

  for (var c2 = 0; c2 < cols.length; c2++) {
    var col = cols[c2];
    var has = false;
    for (var j = 0; j < arr.length; j++) { if (arr[j].column === col) { has = true; break; } }
    if (has) hideEmptyState(col);
    else showEmptyState(col);
  }

  updateCounts();
}

/* ── CREATE TASK ── */
function createTask(data) {
  if (!data.title || !data.title.trim()) {
    showToast("Please enter a task title.", "error");
    return false;
  }
  tasks.push({
    id:          generateId(),
    title:       data.title.trim(),
    description: (data.description || "").trim(),
    column:      "todo",
    priority:    data.priority || "medium",
    due:         data.due || "",
    assignee:    (data.assignee || "").trim()
  });
  saveToLocalStorage(tasks);
  renderBoard(getFilteredTasks());
  showToast("Task created!", "success");
  return true;
}

/* ── EDIT TASK ── */
function editTask(id) {
  var task = null;
  for (var i = 0; i < tasks.length; i++) { if (tasks[i].id === id) { task = tasks[i]; break; } }
  if (!task) return;

  editingTaskId = id;
  document.getElementById("edit-title-input").value    = task.title;
  document.getElementById("edit-desc-input").value     = task.description;
  document.getElementById("edit-priority-input").value = task.priority || "medium";
  document.getElementById("edit-due-input").value      = task.due || "";
  document.getElementById("edit-assignee-input").value = task.assignee || "";

  document.getElementById("edit-modal").classList.add("active");
  document.getElementById("edit-title-input").focus();
}

function saveEdit() {
  if (!editingTaskId) return;
  var newTitle = document.getElementById("edit-title-input").value;
  if (!newTitle || !newTitle.trim()) { showToast("Title cannot be empty.", "error"); return; }

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === editingTaskId) {
      tasks[i].title       = newTitle.trim();
      tasks[i].description = document.getElementById("edit-desc-input").value.trim();
      tasks[i].priority    = document.getElementById("edit-priority-input").value;
      tasks[i].due         = document.getElementById("edit-due-input").value;
      tasks[i].assignee    = document.getElementById("edit-assignee-input").value.trim();
      break;
    }
  }
  saveToLocalStorage(tasks);
  renderBoard(getFilteredTasks());
  closeModal();
  showToast("Task updated.", "info");
}

function closeModal() {
  document.getElementById("edit-modal").classList.remove("active");
  editingTaskId = null;
  document.getElementById("edit-title-input").value    = "";
  document.getElementById("edit-desc-input").value     = "";
  document.getElementById("edit-priority-input").value = "medium";
  document.getElementById("edit-due-input").value      = "";
  document.getElementById("edit-assignee-input").value = "";
}

/* ── DELETE TASK ── */
function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  tasks = tasks.filter(function (t) { return t.id !== id; });
  saveToLocalStorage(tasks);
  renderBoard(getFilteredTasks());
  showToast("Task deleted.", "error");
}

/* ── DRAG AND DROP ── */
function getDragAfterElement(container, y) {
  var cards = container.querySelectorAll(".task-card:not(.dragging):not(.drag-placeholder)");
  var closest = null, closestDist = Infinity;
  for (var i = 0; i < cards.length; i++) {
    var rect = cards[i].getBoundingClientRect();
    var d = y - rect.top - rect.height / 2;
    if (d < 0 && Math.abs(d) < closestDist) { closestDist = Math.abs(d); closest = cards[i]; }
  }
  return closest;
}

function getInsertIndex(col, afterEl) {
  if (!afterEl) {
    var last = -1;
    for (var i = 0; i < tasks.length; i++) { if (tasks[i].column === col) last = i; }
    return last === -1 ? tasks.length : last + 1;
  }
  var aid = afterEl.getAttribute("data-id");
  for (var j = 0; j < tasks.length; j++) { if (tasks[j].id === aid) return j; }
  return tasks.length;
}

function setupDragAndDrop() {
  var cols = ["todo", "inprogress", "done"];

  for (var c = 0; c < cols.length; c++) {
    (function (col) {
      var colEl  = document.getElementById("col-" + col);
      var listEl = document.getElementById("list-" + col);

      colEl.ondragover = function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        colEl.classList.add("drag-over");
        removePlaceholders();
        var ph = document.createElement("div");
        ph.className = "task-card drag-placeholder";
        var after = getDragAfterElement(listEl, e.clientY);
        if (!after) listEl.appendChild(ph);
        else listEl.insertBefore(ph, after);
      };

      colEl.ondragleave = function (e) {
        if (!colEl.contains(e.relatedTarget)) {
          colEl.classList.remove("drag-over");
          removePlaceholders();
        }
      };

      colEl.ondrop = function (e) {
        e.preventDefault();
        colEl.classList.remove("drag-over");
        var id = e.dataTransfer.getData("text/plain");
        if (!id) { removePlaceholders(); return; }

        var draggedTask = null, draggedIdx = -1;
        for (var i = 0; i < tasks.length; i++) {
          if (tasks[i].id === id) { draggedTask = tasks[i]; draggedIdx = i; break; }
        }
        if (!draggedTask) { removePlaceholders(); return; }

        tasks.splice(draggedIdx, 1);
        var after = getDragAfterElement(listEl, e.clientY);
        var idx   = getInsertIndex(col, after);
        draggedTask.column = col;
        tasks.splice(idx, 0, draggedTask);

        removePlaceholders();
        saveToLocalStorage(tasks);
        renderBoard(getFilteredTasks());
      };
    })(cols[c]);
  }
}

/* ── FORM WIRING ── */
function setupForm() {
  var addBtn   = document.getElementById("add-task-btn");
  var clearBtn = document.getElementById("clear-form-btn");
  var title    = document.getElementById("task-title-input");
  var desc     = document.getElementById("task-desc-input");
  var priority = document.getElementById("task-priority-input");
  var due      = document.getElementById("task-due-input");
  var assignee = document.getElementById("task-assignee-input");

  if (!addBtn || !title) return;

  function doAdd() {
    if (createTask({ title: title.value, description: desc.value,
                     priority: priority.value, due: due.value, assignee: assignee.value })) {
      title.value = ""; desc.value = ""; priority.value = "medium"; due.value = ""; assignee.value = "";
      title.focus();
    }
  }

  addBtn.onclick    = doAdd;
  title.onkeydown   = function (e) { if (e.key === "Enter") doAdd(); };
  clearBtn.onclick  = function () {
    title.value = ""; desc.value = ""; priority.value = "medium"; due.value = ""; assignee.value = "";
    title.focus();
  };
}

function setupHeaderAddBtn() {
  var btn  = document.getElementById("header-add-btn");
  var sec  = document.getElementById("creation-section");
  var inp  = document.getElementById("task-title-input");
  if (!btn) return;
  btn.onclick = function () {
    sec.classList.remove("collapsed");
    inp.focus();
    sec.scrollIntoView({ behavior: "smooth", block: "center" });
  };
}

function setupCreationClose() {
  var btn = document.getElementById("creation-close-btn");
  var sec = document.getElementById("creation-section");
  if (!btn) return;
  btn.onclick = function () { sec.classList.add("collapsed"); };
}

function setupModal() {
  document.getElementById("modal-save-btn").onclick   = saveEdit;
  document.getElementById("modal-cancel-btn").onclick = closeModal;
  document.getElementById("modal-close-x").onclick    = closeModal;

  document.getElementById("edit-modal").onclick = function (e) {
    if (e.target === document.getElementById("edit-modal")) closeModal();
  };

  document.onkeydown = function (e) { if (e.key === "Escape") closeModal(); };
}

function setupSearch() {
  var input = document.getElementById("search-input");
  if (!input) return;
  input.oninput = function () {
    searchQuery = input.value;
    renderBoard(getFilteredTasks());
  };
}

/* ── INIT ── */
function init() {
  tasks = loadFromLocalStorage();
  renderBoard(tasks);
  setupForm();
  setupDragAndDrop();
  setupModal();
  setupSearch();
  setupHeaderAddBtn();
  setupCreationClose();
  setupThemeToggle();
}

init();

/* ── EXPORTS ── */
window.KanbanBoard = {
  renderBoard:          renderBoard,
  createTask:           createTask,
  editTask:             editTask,
  deleteTask:           deleteTask,
  saveToLocalStorage:   saveToLocalStorage,
  loadFromLocalStorage: loadFromLocalStorage,
  showEmptyState:       showEmptyState,
  hideEmptyState:       hideEmptyState
};
