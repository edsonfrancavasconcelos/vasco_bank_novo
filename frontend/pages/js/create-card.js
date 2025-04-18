document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("createCardForm");
    const message = document.getElementById("message");

    // Função que verifica se o token existe e redireciona caso não
    function checkTokenAndRedirect(messageEl) {
        const token = localStorage.getItem("token");
        if (!token) {
            messageEl.textContent = "Você precisa estar logado. Redirecionando...";
            messageEl.className = "text-danger";
            setTimeout(() => (window.location.href = "/login.html"), 2000);
            return true;
        }
        return false;
    }

    if (!form || !message) {
        console.error("Elementos do formulário ou mensagem não encontrados.");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Checa se o token está presente antes de prosseguir
        if (checkTokenAndRedirect(message)) return;

        const token = localStorage.getItem("token");  // Garante que pegamos o token no momento da requisição

        // Coleta os dados do formulário
        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const cpf = document.getElementById("cpf").value.trim();
        const rg = document.getElementById("rg").value.trim();
        const address = document.getElementById("address").value.trim();
        const cardPassword = document.getElementById("cardPassword").value.trim();

        const payload = { fullName, email, cpf, rg, address, cardPassword };

        try {
            // Envia a requisição para o backend
            const response = await fetch("http://localhost:3000/api/cards/create", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,  // Envia o token no cabeçalho
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Erro ao criar cartão");

            // Exibe a mensagem de sucesso e redireciona
            message.textContent = "Cartão criado com sucesso! Redirecionando...";
            message.className = "text-success";
            setTimeout(() => (window.location.href = "/dashboard.html"), 2000);
        } catch (error) {
            // Exibe a mensagem de erro caso ocorra algo
            console.error("Erro ao criar cartão:", error);
            message.textContent = `Erro ao criar cartão: ${error.message}`;
            message.className = "text-danger";
        }
    });
});
