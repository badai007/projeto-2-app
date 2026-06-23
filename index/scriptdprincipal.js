// 1. ESTADO DA APLICAÇÃO (A única fonte da verdade)
let tarefas = JSON.parse(localStorage.getItem('minhas_tarefas')) || [];
let filtroAtual = 'todos';

// Variáveis globais dos elementos do DOM (definidas na inicialização)
let inputTarefa, btnAdicionar, listaTarefasElement, progressoTexto, progressBarFill;

// 2. FUNÇÃO PARA CARREGAR A SIDEBAR COMPONENTIZADA
async function carregarSidebar() {
    try {
        // Busca o arquivo diretamente na mesma pasta, conforme sua estrutura atual
        const response = await fetch('sidebar.html');
        if (!response.ok) throw new Error('Não foi possível carregar a sidebar.');
        
        const htmlContent = await response.text();
        document.getElementById('sidebar-container').innerHTML = htmlContent;

        // Ativa os cliques e eventos de abrir/fechar a barra lateral
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

    // BOTÃO DE ABRIR (Injeta a classe active-sidebar e esconde o botão para não sobrepor o texto)
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

    // BOTÃO DE FECHAR (O "X" interno da sidebar)
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

    // NAVEGAÇÃO ENTRE AS ABAS (Alternância de telas)
    if (navTarefas && navProjetos && abaTarefas && abaProjetos) {
        
        // Clique em Minhas Tarefas
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

        // Clique em Projetos Longos
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

// 5. FUNÇÃO DE RENDERIZAÇÃO COMPLETA (Geração do HTML das tarefas na Tela)
function renderizar() {
    if (!listaTarefasElement) return;
    listaTarefasElement.innerHTML = "";

    // Filtra o array baseado no botão ativo de controle (Todos, Pendentes, Concluídos)
    const tarefasFiltradas = tarefas.filter(t => {
        if (filtroAtual === 'pending') return !t.concluida;
        if (filtroAtual === 'completed') return t.concluida;
        return true;
    });

    // Controla a exibição da mensagem de lista vazia
    const emptyMessage = document.getElementById('emptyMessage');
    if (emptyMessage) {
        emptyMessage.style.display = tarefasFiltradas.length === 0 ? 'block' : 'none';
    }

    // Monta cada elemento li estruturado com o botão de check redondo
    tarefasFiltradas.forEach(t => {
        const item = document.createElement('li');
        item.className = `tarefa-item ${t.concluida ? 'done' : ''}`;
        
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
            <button class="remove-btn" onclick="excluirTarefa(${t.id})">Excluir</button>
        `;
        listaTarefasElement.appendChild(item);
    });

    atualizarProgresso();
}

// Atualiza as métricas e a animação da barra visual de progresso
function atualizarProgresso() {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const porcentagem = total === 0 ? 0 : Math.round((concluidas / total) * 100);
    
    if (progressoTexto) progressoTexto.innerText = `${porcentagem}%`;
    if (progressBarFill) progressBarFill.style.width = `${porcentagem}%`;
}

// Sincroniza as mudanças com o LocalStorage e redesenha a interface
function atualizarTudo() {
    localStorage.setItem('minhas_tarefas', JSON.stringify(tarefas));
    renderizar();
}

//INICIALIZAÇÃO SEGURA DO ECOSSISTEMA DO APP
document.addEventListener('DOMContentLoaded', () => {
    // Mapeia os elementos do DOM após o HTML carregar completamente
    inputTarefa = document.getElementById('taskInput');
    btnAdicionar = document.getElementById('addBtn');
    listaTarefasElement = document.getElementById('taskList');
    progressoTexto = document.getElementById('progressPercentage');
    progressBarFill = document.getElementById('progressBarFill');

    // Injeta o arquivo sidebar.html de forma assíncrona
    carregarSidebar();
    
    // Escuta cliques no botão de adicionar tarefas
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', adicionarTarefa);
    }
    
    // Escuta a tecla Enter no campo de entrada de texto
    if (inputTarefa) {
        inputTarefa.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') adicionarTarefa();
        });
    }

    // Configura os ouvintes de clique para os botões de filtros superiores (Todos, Pendentes, Concluídos)
    const botoesFiltro = document.querySelectorAll('.filter-btn');
    botoesFiltro.forEach(btn => {
        btn.addEventListener('click', (e) => {
            botoesFiltro.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filtroAtual = e.target.getAttribute('data-filter');
            renderizar();
        });
    });

    // Executa a primeira renderização dos dados salvos no LocalStorage
    renderizar();
});