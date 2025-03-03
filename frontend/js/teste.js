const request = require("supertest");
const app = require("../server"); // Ajuste para o caminho correto do seu servidor

describe("Testes da API de Contas", () => {
  it("Deve criar uma conta com sucesso", async () => {
    const res = await request(app).post("/account").send({
      nome: "Edson França",
      email: "edson@example.com",
      saldo: 1000,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Conta criada com sucesso");
    expect(res.body).toHaveProperty("numeroConta");
  });

  it("Deve retornar erro ao tentar criar conta sem nome", async () => {
    const res = await request(app).post("/account").send({
      email: "edson@example.com",
      saldo: 1000,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "O nome é obrigatório");
  });
});
