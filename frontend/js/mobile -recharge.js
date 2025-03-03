// mobile-recharge.js

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('recharge-form');
  const resultMessage = document.getElementById('result-message');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const phoneNumber = document.getElementById('phone-number').value;
    const amount = document.getElementById('amount').value;

    // Validação simples
    if (phoneNumber && amount > 0) {
      resultMessage.textContent = `Recarga de R$${amount} realizada com sucesso para o número ${phoneNumber}.`;
      resultMessage.style.color = 'green';
      form.reset();
    } else {
      resultMessage.textContent = 'Por favor, preencha todos os campos corretamente.';
      resultMessage.style.color = 'red';
    }
  });
});
