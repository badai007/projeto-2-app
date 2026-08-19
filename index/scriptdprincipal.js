
let tarefas = JSON.parse(localStorage.getItem('minhas_tarefas')) || [];
let filtroAtual = 'todos';


let inputTarefa, btnAdicionar, listaTarefasElement, progressoTexto, progressBarFill;


async function carregarSidebar() {
    try {
      
        const response = await fetch('sidebar.html');
        if (!response.ok) throw new Error('Não foi possível carregar a sidebar.');
        
        const htmlContent = await response.text();
        document.getElementById('sidebar-container').innerHTML = htmlContent;

        
        configurarEventosSidebar();
    } catch (erro) {
        console.error('Erro ao carregar componente da sidebar:', erro);
    }
}


function configurarEventosSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    const navTarefas = document.getElementById('navTarefas');
    const navProjetos = document.getElementById('navProjetos');
    const abaTarefas = document.getElementById('abaTarefas');
    const abaProjetos = document.getElementById('abaProjetos');

    
    if (menuToggleBtn && sidebar) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.add('active-sidebar'); 
            if (sidebarOverlay) sidebarOverlay.classList.add('active');
            menuToggleBtn.style.opacity = '0';
            menuToggleBtn.style.pointerEvents = 'none'; 
        });
    }

   
    function restaurarBotaoMenu() {
        if (menuToggleBtn) {
            menuToggleBtn.style.opacity = '1';
            menuToggleBtn.style.pointerEvents = 'auto';
        }
    }

  
    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('active-sidebar');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            restaurarBotaoMenu();
        });
    }

   
    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active-sidebar'); 
            sidebarOverlay.classList.remove('active');
            restaurarBotaoMenu();
        });
    }

   
    if (navTarefas && navProjetos && abaTarefas && abaProjetos) {
        
        
        navTarefas.addEventListener('click', (e) => {
            e.preventDefault();
            abaTarefas.style.display = 'block';
            abaProjetos.style.display = 'none';
            navTarefas.classList.add('active');
            navProjetos.classList.remove('active');
            
            if (sidebar) sidebar.classList.remove('active-sidebar');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            restaurarBotaoMenu();
        });

     
        navProjetos.addEventListener('click', (e) => {
            e.preventDefault();
            abaTarefas.style.display = 'none';
            abaProjetos.style.display = 'block';
            navProjetos.classList.add('active');
            navTarefas.classList.remove('active');
            
            if (sidebar) sidebar.classList.remove('active-sidebar');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            restaurarBotaoMenu();
        });
    }
}


function adicionarTarefa() {
    const texto = inputTarefa.value.trim();
    
    if (texto === "") {
        alert("Digite algo para realizar!");
        return;
    }

    const novaTarefa = {
        id: Date.now(),
        texto: texto,
        concluida: false,
        data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    tarefas.push(novaTarefa);
    atualizarTudo();
    inputTarefa.value = "";
}

function alternarTarefa(id) {
    tarefas = tarefas.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t);
    atualizarTudo();
}

function excluirTarefa(id) {
    tarefas = tarefas.filter(t => t.id !== id);
    atualizarTudo();
}


function editarTarefa(id) {
    tarefas = tarefas.map(t => t.id === id ? { ...t, editando: true } : t);
    renderizar();
}


function salvarTarefa(id, novoTexto) {
    const textoLimpo = novoTexto.trim();
    if (textoLimpo === "") {
        alert("NÃO DEIXE O TEXTO SOZINHO!");
        return;
    }
    tarefas = tarefas.map(t => t.id === id ? { ...t, texto: textoLimpo, editando: false } : t);
    atualizarTudo();
}


function renderizar() {
    if (!listaTarefasElement) return;
    listaTarefasElement.innerHTML = "";

    
    const tarefasFiltradas = tarefas.filter(t => {
        if (filtroAtual === 'pending') return !t.concluida;
        if (filtroAtual === 'completed') return t.concluida;
        return true;
    });

   
    const emptyMessage = document.getElementById('emptyMessage');
    if (emptyMessage) {
        emptyMessage.style.display = tarefasFiltradas.length === 0 ? 'block' : 'none';
    }

    
    tarefasFiltradas.forEach(t => {
        const item = document.createElement('li');
        item.className = `tarefa-item ${t.concluida ? 'done' : ''}`;
        
        if (t.editando) {
            
            item.innerHTML = `
                <div class="tarefa-content" style="flex: 1;">
                    <input type="text" class="edit-task-input" id="inputEdit-${t.id}" value="${t.texto}" style="width: 100%; margin: 0;">
                </div>
                <div class="tarefa-actions" style="display: flex; gap: 8px;">
                    <button class="save-btn" onclick="salvarTarefa(${t.id}, document.getElementById('inputEdit-${t.id}').value)">Salvar</button>
                    <button class="remove-btn" onclick="excluirTarefa(${t.id})">Excluir</button>
                </div>
            `;
            
            
            setTimeout(() => {
                const inputEdit = document.getElementById(`inputEdit-${t.id}`);
                if (inputEdit) {
                    inputEdit.focus();
                    inputEdit.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') salvarTarefa(t.id, inputEdit.value);
                    });
                }
            }, 0);

        } else {
            
            item.innerHTML = `
                <div class="tarefa-content">
                    <button class="btn-check ${t.concluida ? 'checked' : ''}" onclick="alternarTarefa(${t.id})">
                        ${t.concluida ? '✓' : ''}
                    </button>
                    <div class="tarefa-texto">
                        <p>${t.texto}</p>
                        <small>${t.data}</small>
                    </div>
                </div>
                <div class="tarefa-actions" style="display: flex; gap: 8px;">
                    <button class="edit-btn" onclick="editarTarefa(${t.id})">Editar</button>
                    <button class="remove-btn" onclick="excluirTarefa(${t.id})">Excluir</button>
                </div>
            `;
        }
        
        listaTarefasElement.appendChild(item);
    });

    atualizarProgresso();
}


function atualizarProgresso() {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const porcentagem = total === 0 ? 0 : Math.round((concluidas / total) * 100);
    
    if (progressoTexto) progressoTexto.innerText = `${porcentagem}%`;
    if (progressBarFill) progressBarFill.style.width = `${porcentagem}%`;
}


function atualizarTudo() {
    localStorage.setItem('minhas_tarefas', JSON.stringify(tarefas));
    renderizar();
}


document.addEventListener('DOMContentLoaded', () => {
    inputTarefa = document.getElementById('taskInput');
    btnAdicionar = document.getElementById('addBtn');
    listaTarefasElement = document.getElementById('taskList');
    progressoTexto = document.getElementById('progressPercentage');
    progressBarFill = document.getElementById('progressBarFill');

    
    carregarSidebar();
    
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', adicionarTarefa);
    }
    
    if (inputTarefa) {
        inputTarefa.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') adicionarTarefa();
        });
    }

    const botoesFiltro = document.querySelectorAll('.filter-btn');
    botoesFiltro.forEach(btn => {
        btn.addEventListener('click', (e) => {
            botoesFiltro.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filtroAtual = e.target.getAttribute('data-filter');
            renderizar();
        });
    });

    renderizar();
});
