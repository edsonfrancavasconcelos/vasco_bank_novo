const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    cpf: { type: String, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    accountNumber: { type: String, unique: true },
    balance: { type: Number, default: 0 },
    transactions: { type: Array, default: [] },
  },
  { timestamps: true }
);

// Hook para criptografar a senha
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    return next(error);
  }
  next();
});

// Geração de número de conta usando UUID
userSchema.pre("validate", function (next) {
  if (!this.accountNumber) {
    this.accountNumber = uuidv4(); // Gera um UUID v4
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  try {
    return bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("Erro ao comparar senhas:", error);
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);
