import express from 'express';
import ReporteController from '../controllers/reporteController.js';

const router = express.Router();

router.get('/', ReporteController.getAll);
router.post('/', ReporteController.create);
router.get('/contract/config', ReporteController.getContractConfig);
router.get('/nft/config', ReporteController.getNFTConfig);
router.get('/nft/verify-complete/:reporteId/:address', ReporteController.verifyNFTComplete);
router.get('/:id', ReporteController.getById);
router.put('/:id', ReporteController.update);
router.delete('/:id', ReporteController.delete);
router.put('/:id/tx-hash', ReporteController.updateTxHash);
router.get('/:id/validar', ReporteController.validarBlockchain);
router.get('/:id/pdf', ReporteController.generarPDF);

export default router;
