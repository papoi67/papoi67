import express from "express";

import PrestamoController
from "../controllers/prestamoController.js";

const router = express.Router();

router.get("/",PrestamoController.getAll);
router.post("/",PrestamoController.create);
router.get("/contract/config",PrestamoController.getContractConfig);
router.get("/nft/config",PrestamoController.getNFTConfig);
router.get("/nft/verify-complete/:prestamoId/:address",PrestamoController.verifyNFTComplete);
router.get("/:id/validar",PrestamoController.validarBlockchain);
router.get("/:id",PrestamoController.getById);
router.put("/:id",PrestamoController.update);
router.delete("/:id",PrestamoController.delete);
router.put("/:id/tx-hash",PrestamoController.updateTxHash);
router.get('/:id/pdf', PrestamoController.generarPDF);

export default router;