const menuToggleBtn = document.getElementById("menuToggleBtn");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const changeUserBtn = document.getElementById("changeUserBtn");
const projectsGreeting = document.getElementById("projectsGreeting");
const projectForm = document.getElementById("projectForm");
const projectInput = document.getElementById("projectInput");
const projectsList = document.getElementById("projectsList");

function readStorage(key, fallbackValue) {
  try {
    const rawValue = localStorage.getItem(key);

    if (rawValue === null) {
      return fallbackValue;
    }

    return JSON.parse(rawValue);
  } catch (error) {
    return fallbackValue;
  }
}

function getUser() {
  return readStorage("user", null);
}

function getProjects() {
  const storedProjects = readStorage("projects", []);

  if (!Array.isArray(storedProjects)) {
    return [];
  }

  return storedProjects
    .map(function (project) {
      if (typeof project === "string") {
        return project.trim();
      }

      if (project && typeof project === "object") {
        return String(project.name || "").trim();
      }

      return "";
    })
    .filter(function (projectName) {
      return projectName !== "";
    });
}

function saveProjects(projects) {
  localStorage.setItem("projects", JSON.stringify(projects));
}

function removeUser() {
  localStorage.removeItem("user");
}

function redirectIfNeeded() {
  if (!getUser()) {
    window.location.href = "../profile/login.html";
  }
}

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

function setupChangeUser() {
  if (!changeUserBtn) {
    return;
  }

  changeUserBtn.addEventListener("click", function () {
    removeUser();
    window.location.href = "../profile/login.html";
  });
}

function updateGreeting() {
  const user = getUser();

  if (projectsGreeting && user && user.name) {
    projectsGreeting.textContent = `Projetos de ${user.name}`;
  }
}

function createProjectItem(content, isEmpty) {
  const item = document.createElement("article");
  item.className = isEmpty ? "project-item empty-project-item" : "project-item";
  item.innerHTML = `<strong>${content}</strong>`;
  return item;
}

function renderProjects() {
  if (!projectsList) {
    return;
  }

  const projects = getProjects();
  projectsList.innerHTML = "";

  projects.forEach(function (projectName) {
    projectsList.appendChild(createProjectItem(projectName, false));
  });

  projectsList.appendChild(createProjectItem("empty", true));
}

function addProject() {
  if (!projectInput) {
    return;
  }

  const projectName = projectInput.value.trim();

  if (projectName === "") {
    projectInput.focus();
    return;
  }

  const projects = getProjects();
  projects.push(projectName);
  saveProjects(projects);

  projectInput.value = "";
  renderProjects();
  projectInput.focus();
}

function setupProjectForm() {
  if (!projectForm) {
    return;
  }

  projectForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addProject();
  });
}

redirectIfNeeded();
setupSidebarEvents();
setupChangeUser();
updateGreeting();
setupProjectForm();
renderProjects();
