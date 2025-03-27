const BASE_URL = "http://localhost:3000/api"; // URL do backend

// Função para criar uma nova conta
async function createAccount(accountData) {
  try {
    const response = await fetch(`${BASE_URL}/createAccount`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar a conta");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erro na requisição createAccount:", error.message);
    throw error;
  }
}

// Função para obter todas as contas
async function getAllAccounts() {
  try {
    const response = await fetch(`${BASE_URL}/accounts`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Erro ao obter as contas");
    }

    const accounts = await response.json();
    return accounts;
  } catch (error) {
    console.error("Erro na requisição getAllAccounts:", error.message);
    throw error;
  }
}

// Outras funções para diferentes requisições ao backend podem ser adicionadas aqui
