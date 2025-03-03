const Service = require("../models/service");

exports.createService = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const newService = new Service({ name, description, price });
    await newService.save();
    res
      .status(201)
      .json({ message: "Serviço criado com sucesso", service: newService });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao criar serviço", error: error.message });
  }
};
