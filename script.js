/* =========================
   ELEMENTOS
   ========================= */

const profileForm = document.getElementById("profileForm");
const userNameInput = document.getElementById("userName");

const greetingTitle = document.getElementById("greetingTitle");
const currentDate = document.getElementById("currentDate");

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");
const emptyMessage = document.getElementById("emptyMessage");

const changeUserBtn = document.getElementById("changeUserBtn");

const menuToggleBtn = document.getElementById("menuToggleBtn");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

/* =========================
   ESTADO
   ========================= */

let tasks = getTasks();

/* =========================
   UTILITÁRIOS DE PÁGINA
   ========================= */

function isProfilePage() {
  return window.location.pathname.includes("profile.html");
}

function isIndexPage() {
  return window.location.pathname.includes("index.html") || window.location.pathname.endsWith("/");
}

/* =========================
   DADOS TEMPORÁRIOS
   ========================= */

function getUser() {
  return JSON.parse(localStorage.getItem("user")) || null;
}

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function removeUser() {
  localStorage.removeItem("user");
}

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasksToSave) {
  localStorage.setItem("tasks", JSON.stringify(tasksToSave));
}

/* =========================
   PERFIL E REDIRECIONAMENTO
   ========================= */

function redirectIfNeeded() {
  const user = getUser();

  if (!user && isIndexPage()) {
    window.location.href = "profile.html";
    return;
  }
}

function handleProfileForm() {
  if (!profileForm) {
    return;
  }

  profileForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = userNameInput.value.trim();

    if (name === "") {
      return;
    }

    saveUser({ name: name });
    window.location.href = "index.html";
  });
}

function handleChangeUser() {
  if (!changeUserBtn) {
    return;
  }

  changeUserBtn.addEventListener("click", function () {
    removeUser();
    window.location.href = "profile.html";
  });
}

/* =========================
   SIDEBAR
   ========================= */

function openSidebar() {
  if (!sidebar || !sidebarOverlay) {
    return;
  }

  sidebar.classList.add("active");
  sidebarOverlay.classList.add("active");
}

function closeSidebar() {
  if (!sidebar || !sidebarOverlay) {
    return;
  }

  sidebar.classList.remove("active");
  sidebarOverlay.classList.remove("active");
}

function setupSidebarEvents() {
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener("click", openSidebar);
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener("click", closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }
}

/* =========================
   DASHBOARD
   ========================= */

function updateGreeting(name) {
  if (!greetingTitle) {
    return;
  }

  const hour = new Date().getHours();
  let period = "Olá";

  if (hour >= 5 && hour < 12) {
    period = "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    period = "Boa tarde";
  } else {
    period = "Boa noite";
  }

  greetingTitle.textContent = `${period}, ${name}`;
}

function updateDate() {
  if (!currentDate) {
    return;
  }

  const today = new Date();

  const formattedDate = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  currentDate.textContent = formattedDate;
}

function updateCounter() {
  if (!taskCounter) {
    return;
  }

  taskCounter.textContent = `Total: ${tasks.length}`;
}

/* =========================
   RENDERIZAÇÃO
   ========================= */

function renderTasks() {
  if (!taskList) {
    return;
  }

  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyMessage.classList.add("show");
  } else {
    emptyMessage.classList.remove("show");
  }

  tasks.forEach((task) => {
    const originalIndex = tasks.findIndex(item => item.id === task.id);

    const li = document.createElement("li");
    li.classList.add("task-item");

    if (task.completed) {
      li.classList.add("completed");
    }

    if (task.editing) {
      li.innerHTML = `
        <input type="text" class="edit-input" value="${task.text}">
        <div class="task-actions">
          <button class="save-btn">Salvar</button>
          <button class="cancel-btn">Cancelar</button>
        </div>
      `;

      const input = li.querySelector(".edit-input");
      const saveBtn = li.querySelector(".save-btn");
      const cancelBtn = li.querySelector(".cancel-btn");

      saveBtn.addEventListener("click", function () {
        const newText = input.value.trim();

        if (newText === "") {
          return;
        }

        tasks[originalIndex].text = newText;
        tasks[originalIndex].editing = false;
        saveTasks(tasks);
        renderTasks();
      });

      cancelBtn.addEventListener("click", function () {
        tasks[originalIndex].editing = false;
        saveTasks(tasks);
        renderTasks();
      });
    } else {
      li.innerHTML = `
        <span class="task-text">${task.text}</span>
        <div class="task-actions">
          <button class="complete-btn">Concluir</button>
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Excluir</button>
        </div>
      `;

      const completeBtn = li.querySelector(".complete-btn");
      const editBtn = li.querySelector(".edit-btn");
      const deleteBtn = li.querySelector(".delete-btn");

      completeBtn.addEventListener("click", function () {
        toggleTask(originalIndex);
      });

      editBtn.addEventListener("click", function () {
        editTask(originalIndex);
      });

      deleteBtn.addEventListener("click", function () {
        deleteTask(originalIndex);
      });
    }

    taskList.appendChild(li);
  });

  updateCounter();
}

/* =========================
   AÇÕES NAS TAREFAS
   ========================= */

function addTask() {
  if (!taskInput) {
    return;
  }

  const text = taskInput.value.trim();

  if (text === "") {
    return;
  }

  tasks.push({
    id: Date.now(),
    text: text,
    completed: false,
    editing: false
  });

  taskInput.value = "";
  saveTasks(tasks);
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks(tasks);
  renderTasks();
}

function editTask(index) {
  tasks[index].editing = true;
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

/* =========================
   EVENTOS
   ========================= */

function setupTaskEvents() {
  if (addBtn) {
    addBtn.addEventListener("click", addTask);
  }

  if (taskInput) {
    taskInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        addTask();
      }
    });
  }
}

/* =========================
   INICIALIZAÇÃO
   ========================= */

redirectIfNeeded();
handleProfileForm();
handleChangeUser();
setupSidebarEvents();

const user = getUser();

if (user) {
  updateGreeting(user.name);
}

updateDate();
setupTaskEvents();
renderTasks();