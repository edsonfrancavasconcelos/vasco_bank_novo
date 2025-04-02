// backend/routes/cardRoutes.js
const router = require("express").Router();
const { createCard, activateCard, unlockCard } = require("../controllers/cardController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createCard);
router.post("/activate", authMiddleware, activateCard);
router.post("/unlock", authMiddleware, unlockCard);

module.exports = router;