// backend/controllers/cardController.js
const Card = require("../models/Card");
const User = require("../models/User");

const createCard = async (req, res) => {
    try {
        console.log("req.body completo:", req.body);
        const { fullName, cpf, rg, address, cardPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId).select("email");
        console.log("Usuário encontrado no banco:", user);

        const email = req.body.email || (user ? user.email : null);
        console.log("Email resolvido:", email);

        if (!email) {
            return res.status(400).json({ error: "Email é obrigatório e não foi encontrado no usuário" });
        }

        const existingCard = await Card.findOne({ cpf });
        if (existingCard) {
            return res.status(400).json({ error: "Já existe um cartão associado a esse CPF" });
        }

        const generateCardNumber = () => {
            const randomNum = Math.floor(100000000000 + Math.random() * 900000000000);
            return "4000" + randomNum.toString();
        };

        const cardNumber = generateCardNumber();
        console.log("Número do cartão gerado:", cardNumber);

        const card = new Card({
            userId,
            fullName,
            email,
            rg,
            cpf,
            address,
            cardPassword,
            number: cardNumber,
        });

        console.log("Cartão antes de salvar:", card);
        await card.save();

        res.status(201).json({
            message: "Cartão criado com sucesso",
            card: { number: card.number, type: card.type, status: card.status },
        });
    } catch (error) {
        console.error("Erro detalhado ao criar cartão:", error.stack);
        res.status(500).json({ error: error.message });
    }
};

const activateCard = async (req, res) => {
    try {
        const { _id } = req.body; // Muda de cardId pra _id
        const card = await Card.findById(_id);
        if (!card) return res.status(404).json({ error: "Cartão não encontrado" });
        if (card.status !== "pending") return res.status(400).json({ error: "Cartão já ativado ou bloqueado" });

        card.status = "active";
        await card.save();
        res.status(200).json({ message: "Cartão ativado com sucesso" });
    } catch (error) {
        console.error("Erro ao ativar cartão:", error.stack);
        res.status(500).json({ error: error.message });
    }
};

const unlockCard = async (req, res) => {
    try {
        const { _id } = req.body; // Muda de cardId pra _id
        const card = await Card.findById(_id);
        if (!card) return res.status(404).json({ error: "Cartão não encontrado" });
        if (card.status !== "blocked") return res.status(400).json({ error: "Cartão não está bloqueado" });

        card.status = "active";
        await card.save();
        res.status(200).json({ message: "Cartão desbloqueado com sucesso" });
    } catch (error) {
        console.error("Erro ao desbloquear cartão:", error.stack);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createCard, activateCard, unlockCard };