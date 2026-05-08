async function fetchTasks() {
    const taskListElement = document.getElementById('task-list'); // Certifique-se que esse ID existe no seu HTML

    try {
        const response = await fetch('http://localhost:3000/api/tasks/1');
        
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        const data = await response.json(); 

        // Limpa a lista antes de preencher
        taskListElement.innerHTML = '';

        // Agora usamos o 'data' com segurança
        data.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <strong>${task.title}</strong>
                <p>${task.description || ''}</p>
                <span>Status: ${task.status}</span>
            `;
            taskListElement.appendChild(li);
        });

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        taskListElement.innerHTML = '<li>Erro ao carregar tarefas.</li>';
    }
}

// Inicia a busca assim que o script carrega
document.addEventListener('DOMContentLoaded', fetchTasks);