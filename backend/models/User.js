const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cpf: { type: String, required: true, unique: true },
  rg: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  accountNumber: { type: String, unique: true },
  balance: { type: Number, default: 0 },
  pixKey: { type: String, unique: true, sparse: true },
});

// Evita sobrescrita do modelo
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
