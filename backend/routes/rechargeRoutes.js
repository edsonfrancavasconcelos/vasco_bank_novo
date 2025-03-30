// routes/rechargeRoutes.js - Revisão: 2024-05-26 11:45:00

// Possíveis melhorias:

// 1. Validação de entrada:
//    - Validar o número de telefone usando uma expressão regular.
//    - Validar o valor da recarga (amount) para garantir que seja um número positivo.

// 2. Tratamento de erros detalhado:
//    - Fornecer mensagens de erro mais específicas para ajudar no debug.
//    - Distinguir entre erros de banco de dados e erros de lógica de recarga.

// 3. Lógica de transação:
//    - Considerar adicionar uma transação para a recarga, para garantir a consistência dos dados.
//    - Se a recarga falhar, a transação deve ser revertida.

// 4. Padronização de nomes de rotas:
//    - Manter a padronização dos nomes das rotas, usando nomes descritivos e consistentes.

// 5. Comentários:
//    - Adicionar comentários mais detalhados para explicar a lógica da rota.

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/auth");

// Rota para realizar recarga de celular para um usuário autenticado.
router.post("/", authMiddleware, async (req, res) => {
    const { phoneNumber, amount } = req.body;
    const userId = req.user._id;

    // Validação de entrada
    if (!phoneNumber || !amount || amount <= 0) {
        return res.status(400).json({ error: "Número de telefone e valor da recarga são obrigatórios." });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        if (user.balance < amount) {
            return res.status(400).json({ error: "Saldo insuficiente." });
        }

        // Início da transação (opcional, mas recomendado)
        // ... (Implementar lógica de transação se necessário)

        user.balance -= amount;
        await user.save();

        const transaction = new Transaction({
            accountId: user._id,
            type: "Recarga de Celular",
            amount: -amount,
            details: `Recarga para ${phoneNumber}`,
        });
        await transaction.save();

        // Fim da transação (opcional, mas recomendado)
        // ... (Implementar lógica de transação se necessário)

        res.status(200).json({ message: "Recarga realizada com sucesso!" });
    } catch (error) {
        console.error("Erro ao realizar recarga:", error);
        res.status(500).json({ error: "Erro ao realizar recarga." });
    }
});

module.exports = router;