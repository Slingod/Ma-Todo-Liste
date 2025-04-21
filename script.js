const STORAGE_KEY = "myTasks";
const TRASH_KEY = "deletedTasks";
const MODE_KEY = "nightMode";

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let trash = JSON.parse(localStorage.getItem(TRASH_KEY)) || [];
let currentFilter = "all";

const isNightMode = localStorage.getItem(MODE_KEY) === "true";
if (isNightMode) {
  document.body.classList.add("night");
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function saveTrash() {
  localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
}

function toggleMode() {
  document.body.classList.toggle("night");
  const isNowNight = document.body.classList.contains("night");
  localStorage.setItem(MODE_KEY, isNowNight ? "true" : "false");
  displayTasks();
  displayTrash();
}

function displayTasks() {
  const ul = document.getElementById('taskList');
  ul.innerHTML = "";

  let filteredTasks = tasks;
  if (currentFilter === "completed") filteredTasks = tasks.filter(t => t.completed);
  else if (currentFilter === "pending") filteredTasks = tasks.filter(t => !t.completed);

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.setAttribute("draggable", "true");
    li.classList.toggle("completed", task.completed);
    if (document.body.classList.contains("night")) li.classList.add("night");

    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index);
    });

    const nameSpan = document.createElement('span');
    nameSpan.textContent = task.name;
    li.appendChild(nameSpan);

    const spanDate = document.createElement('span');
    spanDate.className = 'date';
    spanDate.textContent = ` (Added on ${new Date(task.date).toLocaleDateString()})`;
    li.appendChild(spanDate);

    li.onclick = () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      displayTasks();
    };

    const btnEdit = document.createElement('button');
    btnEdit.textContent = "✏️";
    btnEdit.onclick = (e) => {
      e.stopPropagation();
      const newName = prompt("Edit task:", task.name);
      if (newName !== null && newName.trim() !== "") {
        tasks[index].name = newName.trim();
        saveTasks();
        displayTasks();
      }
    };

    const btnDelete = document.createElement('button');
    btnDelete.textContent = "❌";
    btnDelete.onclick = (e) => {
      e.stopPropagation();
      li.classList.add("explode");

      setTimeout(() => {
        addToTrash(tasks[index]);
        tasks.splice(index, 1);
        saveTasks();
        displayTasks();
        displayTrash();
      }, 600);
    };

    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    ul.appendChild(li);
  });
}

function addTask() {
  const input = document.getElementById('taskInput');
  const name = input.value.trim();
  if (name === "") return;

  tasks.push({ name: name, completed: false, date: new Date().toISOString() });
  input.value = "";
  saveTasks();
  displayTasks();
}

function addToTrash(task) {
  trash.unshift(task);
  if (trash.length > 5) trash.pop();
  saveTrash();
}

function displayTrash() {
  const ul = document.getElementById('trashList');
  ul.innerHTML = "";

  trash.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.name;
    if (document.body.classList.contains("night")) li.classList.add("night");

    const btnRestore = document.createElement('button');
    btnRestore.textContent = "🔁 Restore";
    btnRestore.onclick = () => {
      tasks.push(task);
      trash.splice(index, 1);
      saveTasks();
      saveTrash();
      displayTasks();
      displayTrash();
    };

    const btnDeleteForever = document.createElement('button');
    btnDeleteForever.textContent = "❌ Delete Forever";
    btnDeleteForever.onclick = () => {
      if (confirm("Are you sure you want to permanently delete this task?")) {
        const skull = document.createElement("span");
        skull.textContent = "💀";
        skull.classList.add("tete-de-mort");
        li.appendChild(skull);

        setTimeout(() => {
          trash.splice(index, 1);
          saveTrash();
          displayTrash();
        }, 1000);
      }
    };

    li.appendChild(btnRestore);
    li.appendChild(btnDeleteForever);
    ul.appendChild(li);
  });
}

function deleteAllTasks() {
  if (confirm("Are you sure you want to delete all tasks?")) {
    tasks.forEach(t => addToTrash(t));
    tasks = [];
    saveTasks();
    displayTasks();
    displayTrash();
  }
}

function changeFilter(newFilter) {
  currentFilter = newFilter;
  displayTasks();
}

// Enable drag & drop ordering
document.addEventListener("DOMContentLoaded", () => {
  displayTasks();
  displayTrash();

  const list = document.getElementById("taskList");

  list.addEventListener("dragover", (e) => e.preventDefault());

  list.addEventListener("drop", (e) => {
    const draggedIndex = e.dataTransfer.getData("text/plain");
    const target = e.target.closest("li");
    const allLis = Array.from(list.children);
    const targetIndex = allLis.indexOf(target);

    if (target && draggedIndex !== "" && draggedIndex != targetIndex) {
      const [draggedItem] = tasks.splice(draggedIndex, 1);
      tasks.splice(targetIndex, 0, draggedItem);
      saveTasks();
      displayTasks();
    }
  });
});