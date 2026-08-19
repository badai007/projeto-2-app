document.addEventListener('DOMContentLoaded', () => {
    const boxLogin = document.getElementById('box-login');
    const boxCadastro = document.getElementById('box-cadastro');
    
    const btnIrParaCadastro = document.getElementById('btnIrParaCadastro');
    const btnIrParaLogin = document.getElementById('btnIrParaLogin');

   
    if (btnIrParaCadastro) {
        btnIrParaCadastro.addEventListener('click', () => {
            boxLogin.classList.add('escondido');
            boxCadastro.classList.remove('escondido');
        });
    }

    if (btnIrParaLogin) {
        btnIrParaLogin.addEventListener('click', () => {
            boxCadastro.classList.add('escondido');
            boxLogin.classList.remove('escondido');
        });
    }

  
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            console.log("Formulário de login detectado. Coletando dados...");
            const emailInput = document.getElementById('loginEmail').value;
            const senhaInput = document.getElementById('loginSenha').value;

            try {
                console.log("Disparando requisição POST para o Python (Login)...");
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailInput, senha: senhaInput })
                });

                const dados = await response.json();

                if (response.ok) {
                    alert(`Bem-vindo de volta, ${dados.usuario}!`);
                    
                  
                    localStorage.setItem('usuario_logado', dados.usuario);
                    
                    window.location.href = '../index/telaprincipal.html';
                } else {
                    alert(dados.erro);
                }
            } catch (error) {
                console.error("Erro na conexão com o backend:", error);
                alert("Não foi possível conectar ao servidor backend.");
            }
        });
    }

    
    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            console.log("Formulário de cadastro detectado. Coletando dados...");
            const userInput = document.getElementById('cadUsuario').value;
            const emailInput = document.getElementById('cadEmail').value;
            const senhaInput = document.getElementById('cadSenha').value;

            try {
                console.log("Disparando requisição POST para o Python (Cadastro)...");
                const response = await fetch('http://localhost:5000/api/cadastro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: userInput, email: emailInput, senha: senhaInput })
                });

                const dados = await response.json();

                if (response.ok) {
                    
                    alert("Conta criada com sucesso! logando...");
                    
                    
                    localStorage.setItem('usuario_logado', userInput);
                    
                    
                    window.location.href = '../index/telaprincipal.html';
                } else {
                    alert(dados.erro);
                }
            } catch (error) {
                console.error("Erro na conexão com o backend:", error);
                alert("Não foi possível conectar ao servidor backend.");
            }
        });
    }
});
