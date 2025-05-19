const Loan = require('../models/Loan');

// Get all loans for the authenticated user
exports.getUserLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user.id });
    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new loan
exports.createLoan = async (req, res) => {
  const { amount, installments, interestRate } = req.body;
  try {
    if (!amount || !installments || !interestRate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const loan = new Loan({
      userId: req.user.id,
      amount,
      installments,
      interestRate,
    });
    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(400).json({ error: 'Invalid loan data' });
  }
};