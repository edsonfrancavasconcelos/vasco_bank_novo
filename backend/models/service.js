const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Função para acessar um serviço de dados de conta
async function getAccount(accountId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/account/${accountId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Dados da conta:", data);
    } else {
      console.error("Erro ao acessar o serviço:", data.message);
    }
  } catch (error) {
    console.error("Erro de conexão:", error);
  }
}

// Chamada da função para testar o acesso ao serviço
getAccount("1234567890");

module.exports = mongoose.model("Service", serviceSchema);
