const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
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

      saveBtn.addEventListener("click", () => {
        const newText = input.value.trim();

        if (newText === "") {
          return;
        }

        tasks[index].text = newText;
        tasks[index].editing = false;
        saveTasks();
        renderTasks();
      });

      cancelBtn.addEventListener("click", () => {
        tasks[index].editing = false;
        saveTasks();
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

      completeBtn.addEventListener("click", () => {
        toggleTask(index);
      });

      editBtn.addEventListener("click", () => {
        editTask(index);
      });

      deleteBtn.addEventListener("click", () => {
        deleteTask(index);
      });
    }

    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    return;
  }

  tasks.push({
    text: text,
    completed: false,
    editing: false
  });

  taskInput.value = "";
  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function editTask(index) {
  tasks[index].editing = true;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

renderTasks();