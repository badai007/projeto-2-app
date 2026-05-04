document.addEventListener('DOMContentLoaded', () => {
   
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const emptyMessage = document.getElementById('emptyMessage');
    const currentDateEl = document.getElementById('currentDate');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const filterButtons = document.querySelectorAll('.filter-btn');

  
    let tasks = [];
    let currentFilter = 'all';
    const USER_ID = 1; // Usuário fixo para testes


    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    if (currentDateEl) {
        currentDateEl.textContent = new Date().toLocaleDateString('pt-BR', options);
    }

  
    const toggleSidebar = () => {
        sidebar.classList.toggle('hidden-sidebar');
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    };

    menuToggleBtn?.addEventListener('click', toggleSidebar);
    closeSidebarBtn?.addEventListener('click', toggleSidebar);
    sidebarOverlay?.addEventListener('click', toggleSidebar);

  
    window.toggleTask = async (id) => {
        const task = tasks.find(t => t.id === String(id));
        if (!task) return;

        const newStatus = task.completed ? 0 : 1;
        task.completed = !task.completed;

        try {
            await fetch(`http://localhost:3000/api/tasks/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status_id: newStatus })
            });
            saveAndRender();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    window.removeTask = async (id) => {
        try {
            await fetch(`http://localhost:3000/api/tasks/${id}`, {
                method: 'DELETE'
            });
            tasks = tasks.filter(t => t.id !== String(id));
            saveAndRender();
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
        }
    };


    async function saveAndRender() {
        renderTasks();
        updateProgress();
    }

    function updateProgress() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
        if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
    }

   
    async function fetchTasks() {
        try {
            const response = await fetch(`http://localhost:3000/api/tasks/${USER_ID}`);
            const data = await response.json();
            
            tasks = data.map(t => ({
                id: t.id,
                text: t.title,
                completed: t.status_id === 1,
                time: t.task_time
            }));
            saveAndRender();
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'pending') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            const timeSafe = task.time || "";

            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; flex: 1; cursor: pointer;" onclick="toggleTask('${task.id}')">
                    <div class="check-indicator" 
                         style="background: ${task.completed ? 'var(--purple-primary)' : 'transparent'}; 
                                border: 2px solid ${task.completed ? 'var(--purple-primary)' : 'var(--border-glass)'}; 
                                border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; transition: 0.3s;">
                        ${task.completed ? '<span style="color: white; font-size: 14px;">✓</span>' : ''}
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <span style="text-decoration: ${task.completed ? 'line-through' : 'none'}; 
                                     opacity: ${task.completed ? '0.5' : '1'}; 
                                     color: ${task.completed ? 'var(--text-dim)' : 'white'};">
                            ${task.text}
                        </span>
                        ${timeSafe ? `<small style="color: var(--text-dim); font-size: 0.75rem;">${timeSafe}</small>` : ''}
                    </div>
                </div>
                <button class="remove-btn" onclick="event.stopPropagation(); removeTask('${task.id}')" 
                        style="background: rgba(239, 68, 68, 0.1); border: none; padding: 8px; border-radius: 8px; cursor: pointer;">
                    🗑️
                </button>
            `;
            taskList.appendChild(li);
        });

        if (emptyMessage) {
            emptyMessage.style.display = filteredTasks.length === 0 ? 'block' : 'none';
        }
    }


    const handleAdd = async () => {
        const text = taskInput.value.trim();
        if (text) {
            const newTask = {
                id: Date.now().toString(),
                title: text,
                description: 'Tarefa adicionada via interface',
                user_id: USER_ID,
                status_id: 0,
                task_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };

            try {
                await fetch('http://localhost:3000/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTask)
                });
                
                tasks.push({
                    id: newTask.id,
                    text: newTask.title,
                    completed: false,
                    time: newTask.task_time
                });

                taskInput.value = '';
                saveAndRender();
            } catch (error) {
                console.error('Erro ao adicionar tarefa no banco:', error);
            }
        }
    };

    addBtn?.addEventListener('click', async () => {
        await handleAdd();
    });

    taskInput?.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            await handleAdd();
        }
    });

  
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

   
    
    fetchTasks();
});