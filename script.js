async function loadHTML(className, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.querySelector(`.${className}`).innerHTML = html;
}

loadHTML("add-modal", "components/add-todo-modal.html");
loadHTML("view-modal", "components/view-todo-modal.html");

const addTodoBtn = document.getElementById("addTodoBtn");

const homeList = document.getElementById("homeList");
const todoList = document.getElementById("todoList");
const progressList = document.getElementById("progressList");
const doneList = document.getElementById("doneList");

let activeTodoId = null;

function getTodos() {
  return JSON.parse(localStorage.getItem("todos")) || [];
}

function saveTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function createTodoItem(todo) {
  const li = document.createElement("li");

  li.className = `
    px-4 py-3 rounded-2xl font-bold shadow-md cursor-pointer
    transition hover:scale-[1.02]
    ${todo.status === "done" ? "bg-green-300" : "bg-yellow-200"}
  `;

  li.textContent = todo.title;
  li.onclick = () => openViewModal(todo.id);

  return li;
}

function renderTodos() {
  const todos = getTodos();

  homeList.innerHTML = "";
  todoList.innerHTML = "";
  progressList.innerHTML = "";
  doneList.innerHTML = "";

  todos.forEach(todo => {
    const item = createTodoItem(todo);

    if (todo.status === "home") homeList.appendChild(item);
    if (todo.status === "todo") todoList.appendChild(item);
    if (todo.status === "inprogress") progressList.appendChild(item);
    if (todo.status === "done") doneList.appendChild(item);
  });
}

function openViewModal(id) {
  const todo = getTodos().find(t => t.id === id);
  if (!todo) return;

  activeTodoId = id;

  document.getElementById("modalTitle").textContent = todo.title;
  document.getElementById("modalDesc").textContent =
    todo.description || "No description";

  document.getElementById("modalTime").textContent =
    todo.durationMs / 3600000 + " hrs";

  document.getElementById("modalStatus").textContent = todo.status;

  document.getElementById("statusSelect").value = todo.status;

  document.getElementById("viewModal").classList.remove("hidden");
}

document.addEventListener("click", e => {

  if (e.target.id === "addTodoBtn") {
    document.getElementById("addModal").classList.remove("hidden");
  }

  if (e.target.id === "cancelAdd") {
    document.getElementById("addModal").classList.add("hidden");
  }

  if (e.target.id === "saveTodo") {
    const title = document.getElementById("titleInput").value.trim();
    const desc = document.getElementById("descInput").value.trim();
    const hours = Number(document.getElementById("timeInput").value);

    if (!title || hours <= 0 || hours > 6) {
      alert("⏰ Time must be between 0 and 6 hours");
      return;
    }

    const todos = getTodos();
    todos.push({
      id: crypto.randomUUID(),
      title,
      description: desc,
      durationMs: hours * 60 * 60 * 1000,
      createdAt: Date.now(),
      status: "todo"
    });

    saveTodos(todos);
    document.getElementById("addModal").classList.add("hidden");

    document.getElementById("titleInput").value = "";
    document.getElementById("descInput").value = "";
    document.getElementById("timeInput").value = "";

    renderTodos();
  }

  if (e.target.id === "closeView") {
    document.getElementById("viewModal").classList.add("hidden");
  }

  if (e.target.id === "deleteBtn") {
    const todos = getTodos().filter(t => t.id !== activeTodoId);
    saveTodos(todos);
    document.getElementById("viewModal").classList.add("hidden");
    renderTodos();
  }
});

document.addEventListener("change", e => {
  if (e.target.id === "statusSelect") {
    const todos = getTodos();
    const todo = todos.find(t => t.id === activeTodoId);

    if (todo) {
      todo.status = e.target.value;
      saveTodos(todos);
      renderTodos();
    }
  }
});

renderTodos();
