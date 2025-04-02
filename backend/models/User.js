// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const pixKeySchema = new mongoose.Schema({
    keyType: { type: String, required: true }, // "CPF", "EMAIL", "PHONE", "RANDOM"
    key: { type: String, required: true }, // Removi unique: true aqui, o índice composto vai cuidar disso
});

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cpf: { type: String, required: true, unique: true },
    rg: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    pixKeys: [pixKeySchema], // Array de chaves Pix
    createdAt: { type: Date, default: Date.now },
});

// Índice único global pra pixKeys.key
userSchema.index({ "pixKeys.key": 1 }, { unique: true });

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        console.log("Hashing password para:", this.email);
        this.password = await bcrypt.hash(this.password, 10);
        console.log("Senha hasheada:", this.password);
    }
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);