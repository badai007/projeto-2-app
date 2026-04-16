const REGISTER_ENDPOINT = "http://localhost:8080/auth/register";
const submitButton = document.getElementById("submitRegisterBtn");

function setFormMessage(message, type) {
    const formMessage = document.getElementById("formMessage");
    if (!formMessage) return;
    
    formMessage.textContent = message;
    formMessage.className = `form-message ${type || ""}`;
}

function setLoadingState(isLoading) {
    if (!submitButton) return;
    submitButton.disabled = isLoading;
    submitButton.innerHTML = isLoading ? '<span class="loader"></span> Criando conta...' : "Criar Conta";
}

async function registerUser(name, email, password) {
    const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || "Erro ao criar conta no servidor.");
    }

    return data;
}

function handleRegisterForm() {
    const registerForm = document.getElementById("registerForm");
    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");

    if (!registerForm) return;

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!name || !email || !password) {
            setFormMessage("Por favor, preencha todos os campos.", "error");
            return;
        }

        // Validação básica de senha
        if (password.length < 6) {
            setFormMessage("A senha deve ter pelo menos 6 caracteres.", "error");
            return;
        }

        setLoadingState(true);

        try {
            await registerUser(name, email, password);
            setFormMessage("Conta criada com sucesso! Redirecionando para o login...", "success");

            setTimeout(() => {
                window.location.href = "login.html"; // Ajuste para o nome correto do seu arquivo de login
            }, 2000);

        } catch (error) {
            setFormMessage(error.message, "error");
        } finally {
            setLoadingState(false);
        }
    });
}

handleRegisterForm();