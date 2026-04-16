const submitButton = document.getElementById("submitButton");
const AUTH_ENDPOINT = "http://localhost:8080/auth/login";

// Pega o usuário do Storage
function getUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

// Salva sem a senha por segurança
function saveUser(user) {
    const safeUser = { 
        name: user.name, 
        email: user.email, 
        token: user.token 
    };
    localStorage.setItem("user", JSON.stringify(safeUser));
}

function redirectIfNeeded() {
    if (getUser()) {
        window.location.href = "../index/index.html";
    }
}

function setFormMessage(message, type) {
    const formMessage = document.getElementById("formMessage"); // Garante a captura do elemento
    if (!formMessage) return;
    
    formMessage.textContent = message;
    formMessage.className = `form-message ${type || ""}`;
}

function setLoadingState(isLoading) {
    if (!submitButton) return;
    submitButton.disabled = isLoading;
    submitButton.innerHTML = isLoading ? '<span class="loader"></span> Enviando...' : "Enviar";
}

// Monta o objeto de usuário baseado no que o SQL/Backend retorna
function buildUserFromResponse(data, identifier) {
    const userData = data?.user;
    return {
        name: userData?.name || (identifier.includes("@") ? identifier.split("@")[0] : identifier),
        email: userData?.email || (identifier.includes("@") ? identifier : ""),
        token: data?.token || null
    };
}

async function authenticateUser(identifier, password) {
    const response = await fetch(AUTH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }) // Envia o campo que o SQL vai buscar
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || "Erro na autenticação com o servidor.");
    }

    return data;
}

function handleProfileForm() {
    const profileForm = document.getElementById("profileForm");
    const userIdentifierInput = document.getElementById("userIdentifier");
    const passwordInput = document.getElementById("password");

    if (!profileForm) return;

    profileForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const identifier = userIdentifierInput.value.trim();
        const password = passwordInput.value.trim();

        if (!identifier || !password) {
            setFormMessage("Por favor, preencha todos os campos.", "error");
            return;
        }

        setLoadingState(true);

        try {
            const data = await authenticateUser(identifier, password);
            const user = buildUserFromResponse(data, identifier);

            saveUser(user);
            setFormMessage("Sucesso! Redirecionando...", "success");

            setTimeout(() => {
                window.location.href = data?.redirectUrl || "../index/index.html";
            }, 1000);

        } catch (error) {
            setFormMessage(error.message, "error");
        } finally {
            setLoadingState(false);
        }
    });
}

// Inicialização
redirectIfNeeded();
handleProfileForm();