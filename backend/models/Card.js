// backend/models/Card.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const cardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    rg: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    cardPassword: { type: String, required: true },
    number: { type: String, required: true, unique: true }, // Usa "number", não "cardNumber"
    type: { type: String, enum: ["virtual", "physical"], default: "physical" },
    status: { type: String, enum: ["pending", "active", "blocked"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
});

cardSchema.pre("save", async function (next) {
    if (this.isModified("cardPassword")) {
        this.cardPassword = await bcrypt.hash(this.cardPassword, 10);
    }
    next();
});

module.exports = mongoose.model("Card", cardSchema);