document.addEventListener('DOMContentLoaded', () => {
    // 1. Elementos do DOM
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

    // 2. Estado Global (Carregando do LocalStorage)
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // 3. Configuração da Data Atual
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    if (currentDateEl) {
        currentDateEl.textContent = new Date().toLocaleDateString('pt-BR', options);
    }

    // 4. Funções de Sidebar (Controle de Visualização)
    const toggleSidebar = () => {
        sidebar.classList.toggle('hidden-sidebar');
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    };

    menuToggleBtn?.addEventListener('click', toggleSidebar);
    closeSidebarBtn?.addEventListener('click', toggleSidebar);
    sidebarOverlay?.addEventListener('click', toggleSidebar);

    // 5. Funções de Lógica
    window.toggleTask = (id) => {
        tasks = tasks.map(t => t.id === String(id) ? { ...t, completed: !t.completed } : t);
        saveAndRender();
    };

    window.removeTask = (id) => {
        tasks = tasks.filter(t => t.id !== String(id));
        saveAndRender();
    };

    // 6. Gerenciamento de Dados e Progresso
    function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
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

    // 7. Renderização da Lista
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

    // 8. Evento de Adicionar Tarefa
    const handleAdd = () => {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({
                id: Date.now().toString(),
                text: text,
                completed: false,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            });
            taskInput.value = '';
            saveAndRender();
        }
    };

    addBtn?.addEventListener('click', handleAdd);
    taskInput?.addEventListener('keypress', (e) => e.key === 'Enter' && handleAdd());

    // 9. Filtros
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Início imediato
    saveAndRender();
});

 