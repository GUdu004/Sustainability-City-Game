"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const advisorController_1 = require("../controllers/advisorController");
const router = (0, express_1.Router)();
// GET /api/advisor - Get advisor message based on current game state
router.get('/', advisorController_1.getAdvisor);
exports.default = router;
