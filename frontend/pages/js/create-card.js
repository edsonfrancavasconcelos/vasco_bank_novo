// frontend/js/create-card.js
const token = localStorage.getItem("token");

function checkTokenAndRedirect(messageEl) {
    if (!token) {
        messageEl.textContent = "Você precisa estar logado. Redirecionando...";
        messageEl.className = "text-danger";
        setTimeout(() => (window.location.href = "/login.html"), 2000);
        return true;
    }
    return false;
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("createCardForm");
    const message = document.getElementById("message");

    if (!form || !message) {
        console.error("Elementos do formulário ou mensagem não encontrados.");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (checkTokenAndRedirect(message)) return;

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const cpf = document.getElementById("cpf").value.trim();
        const rg = document.getElementById("rg").value.trim();
        const address = document.getElementById("address").value.trim();
        const cardPassword = document.getElementById("cardPassword").value.trim();

        const payload = { fullName, email, cpf, rg, address, cardPassword };
        console.log("Enviando dados:", payload);
        console.log("Token usado:", token); // Log do token

        try {
            console.log("Iniciando fetch para /api/cards/create"); // Antes do fetch
            const response = await fetch("http://localhost:3000/api/cards/create", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log("Resposta do backend:", response.status, data);

            if (!response.ok) throw new Error(data.error || "Erro ao criar cartão");

            message.textContent = "Cartão criado com sucesso! Redirecionando...";
            message.className = "text-success";
            setTimeout(() => (window.location.href = "/dashboard.html"), 2000);
        } catch (error) {
            console.error("Erro ao criar cartão:", error);
            message.textContent = `Erro ao criar cartão: ${error.message}`;
            message.className = "text-danger";
        }
    });
});