const app = document.querySelector(".app");
const input = app.querySelector("#task-input");
const taskList = app.querySelector("[data-task-list]");
const emptyState = app.querySelector("[data-empty-state]");
const filterButtons = Array.from(app.querySelectorAll("[data-filter]"));
const countNodes = {
  total: app.querySelector('[data-count="total"]'),
  active: app.querySelector('[data-count="active"]'),
  completed: app.querySelector('[data-count="completed"]'),
};

const state = {
  tasks: [],
  filter: "all",
};

function createTask(title) {
  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
  };
}

function getVisibleTasks() {
  if (state.filter === "active") {
    return state.tasks.filter((task) => !task.completed);
  }

  if (state.filter === "completed") {
    return state.tasks.filter((task) => task.completed);
  }

  return state.tasks;
}

function buildTaskItem(task) {
  const item = document.createElement("li");
  item.className = "task-item";
  item.dataset.taskId = task.id;

  if (task.completed) {
    item.classList.add("is-completed");
  }

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;
  title.title = task.title;

  const toggleButton = document.createElement("button");
  toggleButton.className = "toggle-button";
  toggleButton.type = "submit";
  toggleButton.dataset.action = "toggle";
  toggleButton.textContent = task.completed ? "Undo" : "Done";
  toggleButton.setAttribute("aria-pressed", String(task.completed));
  toggleButton.setAttribute("aria-label", `Toggle ${task.title}`);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "submit";
  deleteButton.dataset.action = "delete";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

  item.append(title, toggleButton, deleteButton);
  return item;
}

function replaceTaskList(tasks) {
  const fragment = document.createDocumentFragment();

  tasks.forEach((task) => {
    fragment.append(buildTaskItem(task));
  });

  taskList.replaceChildren(fragment);
}

function renderCounts() {
  const completed = state.tasks.filter((task) => task.completed).length;
  const active = state.tasks.length - completed;

  countNodes.total.textContent = state.tasks.length;
  countNodes.active.textContent = active;
  countNodes.completed.textContent = completed;
}

function renderFilters() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === state.filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function render() {
  const visibleTasks = getVisibleTasks();

  replaceTaskList(visibleTasks);
  renderCounts();
  renderFilters();

  const emptyText = state.tasks.length === 0
    ? "No tasks yet."
    : `No ${state.filter} tasks.`;

  emptyState.textContent = emptyText;
  emptyState.classList.toggle("is-visible", visibleTasks.length === 0);
}

function addTask() {
  const title = input.value.trim();

  if (!title) {
    input.focus();
    return;
  }

  state.tasks.unshift(createTask(title));
  input.value = "";
  input.focus();
  render();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  render();
}

function toggleTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);

  if (!task) {
    return;
  }

  task.completed = !task.completed;
  render();
}

function setFilter(filter) {
  state.filter = filter;
  render();
}

app.addEventListener("submit", (event) => {
  event.preventDefault();

  const actionButton = event.submitter || app.querySelector("[data-action='add']");

  if (!actionButton || !app.contains(actionButton)) {
    return;
  }

  if (actionButton.dataset.action === "add") {
    event.preventDefault();
    addTask();
    return;
  }

  if (actionButton.dataset.action === "filter") {
    setFilter(actionButton.dataset.filter);
    return;
  }

  if (!taskList.contains(actionButton)) {
    return;
  }

  const item = actionButton.closest("[data-task-id]");

  if (!item) {
    return;
  }

  if (actionButton.dataset.action === "toggle") {
    toggleTask(item.dataset.taskId);
    return;
  }

  if (actionButton.dataset.action === "delete") {
    deleteTask(item.dataset.taskId);
  }
});

render();
