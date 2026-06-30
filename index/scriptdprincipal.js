// 1. ESTADO DA APLICAÇÃO (A única fonte da verdade)
let tarefas = JSON.parse(localStorage.getItem('minhas_tarefas')) || [];
let filtroAtual = 'todos';


let inputTarefa, btnAdicionar, listaTarefasElement, progressoTexto, progressBarFill;

// 2. FUNÇÃO PARA CARREGAR A SIDEBAR COMPONENTIZADA
async function carregarSidebar() {
    try {
        // Busca o esqueleto estrutural isolado no arquivo HTML da sidebar
        const response = await fetch('sidebar.html');
        if (!response.ok) throw new Error('Não foi possível carregar a sidebar.');
        
        const htmlContent = await response.text();
        document.getElementById('sidebar-container').innerHTML = htmlContent;

        // Ativa os cliques e eventos de abrir/fechar a barra lateral após a injeção do HTML
        configurarEventosSidebar();
    } catch (erro) {
        console.error('Erro ao carregar componente da sidebar:', erro);
    }
}

// 3. EVENTOS DE ABERTURA, FECHAMENTO E NAVEGAÇÃO DA BARRA LATERAL
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
            sidebar.classList.add('active-sidebar'); // Mostra a barra lateral baseado no novo CSS
            if (sidebarOverlay) sidebarOverlay.classList.add('active');
            menuToggleBtn.style.opacity = '0'; // Faz o botão sumir suavemente
            menuToggleBtn.style.pointerEvents = 'none'; // Desativa os cliques enquanto invisível
        });
    }

    // Função interna para reexibir o botão hambúrguer quando o menu fechar
    function restaurarBotaoMenu() {
        if (menuToggleBtn) {
            menuToggleBtn.style.opacity = '1';
            menuToggleBtn.style.pointerEvents = 'auto';
        }
    }

  
    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('active-sidebar'); // Remove a classe e esconde a barra
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            restaurarBotaoMenu();
        });
    }

    // CLICAR FORA DA SIDEBAR (No fundo escurecido)
    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active-sidebar'); // Remove a classe e esconde a barra
            sidebarOverlay.classList.remove('active');
            restaurarBotaoMenu();
        });
    }

   
    if (navTarefas && navProjetos && abaTarefas && abaProjetos) {
        
        // Minhas Tarefas
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

        //  Projetos Longos
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

// 4. FUNÇÕES DE LÓGICA (Manipulação dos Dados)
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

// Ativa o modo de edição no objeto da tarefa
function editarTarefa(id) {
    tarefas = tarefas.map(t => t.id === id ? { ...t, editando: true } : t);
    renderizar();
}

// Salva as alterações feitas no input e remove o modo de edição
function salvarTarefa(id, novoTexto) {
    const textoLimpo = novoTexto.trim();
    if (textoLimpo === "") {
        alert("NÃO DEIXE O TEXTO SOZINHO!");
        return;
    }
    tarefas = tarefas.map(t => t.id === id ? { ...t, texto: textoLimpo, editando: false } : t);
    atualizarTudo();
}

// 5. FUNÇÃO DE RENDERIZAÇÃO COMPLETA
function renderizar() {
    if (!listaTarefasElement) return;
    listaTarefasElement.innerHTML = "";

    // Criar a regra de filtragem dos dados
    const tarefasFiltradas = tarefas.filter(t => {
        if (filtroAtual === 'pending') return !t.concluida;
        if (filtroAtual === 'completed') return t.concluida;
        return true;
    });

    // Controlar o aviso de lista vazia
    const emptyMessage = document.getElementById('emptyMessage');
    if (emptyMessage) {
        emptyMessage.style.display = tarefasFiltradas.length === 0 ? 'block' : 'none';
    }

    // Criar os elementos visuais na tela
    tarefasFiltradas.forEach(t => {
        const item = document.createElement('li');
        item.className = `tarefa-item ${t.concluida ? 'done' : ''}`;
        
        if (t.editando) {
            // Layout dinâmico para quando estiver EDITANDO
            item.innerHTML = `
                <div class="tarefa-content" style="flex: 1;">
                    <input type="text" class="edit-task-input" id="inputEdit-${t.id}" value="${t.texto}" style="width: 100%; margin: 0;">
                </div>
                <div class="tarefa-actions" style="display: flex; gap: 8px;">
                    <button class="save-btn" onclick="salvarTarefa(${t.id}, document.getElementById('inputEdit-${t.id}').value)">Salvar</button>
                    <button class="remove-btn" onclick="excluirTarefa(${t.id})">Excluir</button>
                </div>
            `;
            
            // Foca o input automaticamente e adiciona o atalho do Enter para salvar
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
            // Layout normal de EXIBIÇÃO
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

// Atualiza as métricas da barra visual
function atualizarProgresso() {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const porcentagem = total === 0 ? 0 : Math.round((concluidas / total) * 100);
    
    if (progressoTexto) progressoTexto.innerText = `${porcentagem}%`;
    if (progressBarFill) progressBarFill.style.width = `${porcentagem}%`;
}

// Sincroniza com LocalStorage e redesenha a UI
function atualizarTudo() {
    localStorage.setItem('minhas_tarefas', JSON.stringify(tarefas));
    renderizar();
}

// 6. INICIALIZAÇÃO DO ECOSSISTEMA DO APP
document.addEventListener('DOMContentLoaded', () => {
    inputTarefa = document.getElementById('taskInput');
    btnAdicionar = document.getElementById('addBtn');
    listaTarefasElement = document.getElementById('taskList');
    progressoTexto = document.getElementById('progressPercentage');
    progressBarFill = document.getElementById('progressBarFill');

    // Inicializa o carregamento da sidebar assíncrona
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