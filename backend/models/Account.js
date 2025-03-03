const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // Adicionando bcrypt para criptografar a senha

const AccountSchema = new mongoose.Schema({
  numeroConta: { type: String, required: true, unique: true },
  saldo: { type: Number, default: 0 },
  cpf: { type: String, required: true, unique: true }, // Adicione o campo CPF, único e obrigatório
  password: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Referência ao usuário
});

module.exports = mongoose.model("Account", AccountSchema);

// Definir o esquema da conta
const accountSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  cpf: { type: String, unique: true, sparse: true }, // CPF único e opcional
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  accountNumber: {
    type: Number,
    unique: true,
    default: function () {
      return Math.floor(Math.random() * 1000000000); // Gera um número de conta aleatório
    },
  },
});

// Hook para criptografar a senha antes de salvar no banco de dados
accountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Só criptografa se a senha for modificada

  try {
    const salt = await bcrypt.genSalt(10); // Gera o salt
    this.password = await bcrypt.hash(this.password, salt); // Criptografa a senha
    next();
  } catch (error) {
    next(error); // Passa o erro se houver
  }
});

// Método para comparar a senha criptografada durante o login
accountSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password); // Compara a senha informada com a criptografada
};

// Exportar o modelo de conta
module.exports = mongoose.model("Accounts", accountSchema);
