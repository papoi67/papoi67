import ReporteService from '../services/reporteService.js';
import ReporteNFTService from '../services/reporteNFTService.js';
import { CONTRATO_ABI, CONTRATO_DIRECCION, NFT_ABI, NFT_DIRECCION } from '../config/blockchain-config.js';
import reportePdfService from '../services/reportePdfService.js';

const ReporteController = {
  getAll: async (req, res) => res.json(await ReporteService.getAll()),
  create: async (req, res) => res.json(await ReporteService.create(req.body)),
  getById: async (req, res) => res.json(await ReporteService.getById(req.params.id)),
  update: async (req, res) => res.json(await ReporteService.update(req.params.id, req.body)),
  delete: async (req, res) => res.json(await ReporteService.delete(req.params.id)),
  updateTxHash: async (req, res) => res.json(await ReporteService.updateTxHash(req.params.id, req.body.txHash)),
  getContractConfig: async (req, res) => res.json({ abi: CONTRATO_ABI, address: CONTRATO_DIRECCION }),
  getNFTConfig: async (req, res) => res.json({ abi: NFT_ABI, address: NFT_DIRECCION }),
  validarBlockchain: async (req, res) => {
    try {
      res.json(await ReporteService.validarBlockchain(req.params.id));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  verifyNFTComplete: async (req, res) => {
    try {
      res.json(await ReporteNFTService.verifyNFTComplete(req.params.reporteId, req.params.address));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  generarPDF: async (req, res) => {
    console.log(`ReporteController - Generando PDF para reporte con ID: ${req.params.id}`)
    try {
        const result = await ReporteService.generarPDF(req.params.id);
        res.json(result);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({error: error.message});
    }
  }
};

export default ReporteController;
