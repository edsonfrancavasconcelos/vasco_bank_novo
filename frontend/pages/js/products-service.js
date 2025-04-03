document.addEventListener("DOMContentLoaded", function () {
  const productsList = document.getElementById("products-list");

  const products = [
    {
      title: "Conta Corrente",
      description: "Conta digital para seu dia a dia, sem taxas ocultas.",
    },
    {
      title: "Cartão de Crédito",
      description: "Sem anuidade, cashback e benefícios exclusivos.",
    },
    {
      title: "Empréstimos",
      description: "Empréstimos pessoais e consignados com taxas baixas.",
    },
    {
      title: "Investimentos",
      description: "Acesse renda fixa, variável, fundos e criptomoedas.",
    },
    {
      title: "Seguros",
      description: "Proteja sua família com seguros de vida e patrimônio.",
    },
    {
      title: "PIX",
      description: "Transações instantâneas sem custo adicional.",
    },
    {
      title: "Boletos",
      description: "Gere boletos para cobranças e pagamentos facilitados.",
    },
    {
      name: "Recarga de Celular",
      description: "Faça recargas direto pelo app sem taxas extras.",
    },
    {
      title: "Conta Digital",
      description: "Abra sua conta 100% digital sem taxas.",
    },
    {
      title: "Cartão de Crédito",
      description: "Cartão internacional sem anuidade.",
    },
    {
      title: "PIX",
      description: "Transferências instantâneas e gratuitas.",
    },
    {
      title: "TED e DOC",
      description: "Envie dinheiro para qualquer banco.",
    },
    {
      title: "Investimentos",
      description: "Acesse opções de investimentos de alta rentabilidade.",
    },
    {
      title: "Empréstimos",
      description: "Empréstimos com taxas reduzidas e aprovação rápida.",
    },
    {
      title: "Financiamento",
      description:
        "Financiamento de imóveis e veículos com condições especiais.",
    },
    {
      title: "Seguros",
      description: "Proteção para você, sua família e seu patrimônio.",
    },
    { title: "Câmbio", description: "Compra e venda de moedas estrangeiras." },
    {
      title: "Recarga de Celular",
      description: "Adicione créditos ao seu celular diretamente pelo app.",
    },
    {
      title: "Pagamentos de Contas",
      description: "Pague contas e boletos com poucos cliques.",
    },
    {
      title: "Cashback",
      description: "Ganhe dinheiro de volta em suas compras.",
    },
    {
      title: "Cartão Virtual",
      description: "Cartão seguro para compras online.",
    },
    {
      title: "Gestão Financeira",
      description: "Ferramentas para controlar seus gastos.",
    },
  ];

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    productCard.innerHTML = `
          <h3>${product.title}</h3>
          <p>${product.description}</p>
      `;

    productsList.appendChild(productCard);
  });
});
