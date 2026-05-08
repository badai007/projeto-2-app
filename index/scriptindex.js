document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let tasks = [];
    let currentFilter = 'all';
    const USER_ID = 1;
    const API_URL = 'http://localhost:3000/api/tasks';

    // FUNÇÕES DE COMUNICAÇÃO (FETCH)
    async function fetchTasks() {
        try {
            const response = await fetch(`${API_URL}/${USER_ID}`);
            const data = await response.json();
            tasks = data.map(t => ({
                id: t.id,
                text: t.title,
                completed: t.status_id === 1,
                time: t.task_time
            }));
            renderTasks();
        } catch (error) {
            console.error('Erro ao buscar:', error);
        }
    }

    window.toggleTask = async (id) => {
        const task = tasks.find(t => t.id === String(id));
        if (!task) return;
        const newStatus = task.completed ? 0 : 1;
        
        try {
            await fetch(`${API_URL}/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status_id: newStatus })
            });
            task.completed = !task.completed;
            renderTasks();
        } catch (error) { console.error(error); }
    };

    window.removeTask = async (id) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            tasks = tasks.filter(t => t.id !== String(id));
            renderTasks();
        } catch (error) { console.error(error); }
    };

    const handleAdd = async () => {
        const text = taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            title: text,
            user_id: USER_ID,
            status_id: 0,
            task_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });
            tasks.push({ id: newTask.id, text: newTask.title, completed: false, time: newTask.task_time });
            taskInput.value = '';
            renderTasks();
        } catch (error) { console.error(error); }
    };

    // RENDERIZAÇÃO
    function renderTasks() {
        taskList.innerHTML = '';
        const filtered = tasks.filter(t => {
            if (currentFilter === 'pending') return !t.completed;
            if (currentFilter === 'completed') return t.completed;
            return true;
        });

        filtered.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `
                <div class="task-info" onclick="toggleTask('${task.id}')">
                    <div class="check" style="border: 2px solid purple; border-radius: 50%; width: 20px; height: 20px;">
                        ${task.completed ? '✓' : ''}
                    </div>
                    <span>${task.text}</span>
                </div>
                <button onclick="removeTask('${task.id}')">🗑️</button>
            `;
            taskList.appendChild(li);
        });
        updateProgress();
    }

    function updateProgress() {
        const completed = tasks.filter(t => t.completed).length;
        const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
        if (progressBarFill) progressBarFill.style.width = `${percent}%`;
        if (progressPercentage) progressPercentage.textContent = `${percent}%`;
    }

    // EVENTOS
    addBtn?.addEventListener('click', handleAdd);
    taskInput?.addEventListener('keypress', (e) => e.key === 'Enter' && handleAdd());
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    fetchTasks();
});