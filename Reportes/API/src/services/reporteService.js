import ReporteRepository from '../repositories/reporteRepository.js';
import Web3 from 'web3';
import { CONTRATO_ABI, CONTRATO_DIRECCION, GANACHE_URL } from '../config/blockchain-config.js';
import ReportePdfService from './reportePdfService.js';

const web3 = new Web3(GANACHE_URL);
const contrato = new web3.eth.Contract(CONTRATO_ABI, CONTRATO_DIRECCION);

const normalizarDecimal = (valor) => Number(valor).toFixed(2);

const ReporteService = {
  getAll: async () => await ReporteRepository.findAll(),
  create: async (data) => await ReporteRepository.insert(data),
  getById: async (id) => await ReporteRepository.findById(id),
  update: async (id, data) => await ReporteRepository.update(id, data),
  delete: async (id) => await ReporteRepository.delete(id),
  updateTxHash: async (id, txHash) => await ReporteRepository.updateTxHash(id, txHash),
  validarBlockchain: async (id) => {
    const reporteDB = await ReporteRepository.findById(id);
    if (!reporteDB) throw new Error('Reporte no encontrado en la base de datos');

    const reporteBlockchain = await contrato.methods.getReporte(id).call();

    const idCoincide = reporteDB.id.toString() === reporteBlockchain.id.toString();
    const estadoCuentaCoincide = reporteDB.estado_cuenta === reporteBlockchain.estadoCuenta;
    const pendientesCoinciden = reporteDB.prestamos_pendientes.toString() === reporteBlockchain.prestamosPendientes.toString();
    const pagadosCoinciden = reporteDB.prestamos_pagados.toString() === reporteBlockchain.prestamosPagados.toString();
    const totalCoincide = normalizarDecimal(reporteDB.total_financiero) === normalizarDecimal(reporteBlockchain.totalFinanciero);
    const tieneHash = reporteDB.tx_hash_block !== null && reporteDB.tx_hash_block !== '';

    return {
      valid: idCoincide && estadoCuentaCoincide && pendientesCoinciden && pagadosCoinciden && totalCoincide && tieneHash,
      idCoincide,
      estadoCuentaCoincide,
      pendientesCoinciden,
      pagadosCoinciden,
      totalCoincide,
      tieneHash,
      datosDB: {
        id: reporteDB.id,
        estadoCuenta: reporteDB.estado_cuenta,
        prestamosPendientes: reporteDB.prestamos_pendientes,
        prestamosPagados: reporteDB.prestamos_pagados,
        totalFinanciero: normalizarDecimal(reporteDB.total_financiero),
        txHash: reporteDB.tx_hash_block
      },
      datosBlockchain: {
        id: reporteBlockchain.id.toString(),
        estadoCuenta: reporteBlockchain.estadoCuenta,
        prestamosPendientes: reporteBlockchain.prestamosPendientes.toString(),
        prestamosPagados: reporteBlockchain.prestamosPagados.toString(),
        totalFinanciero: normalizarDecimal(reporteBlockchain.totalFinanciero)
      }
    };
  },

  generarPDF: async (id) => {
    console.log('ReporteService - Generando PDF para reporte con id:' + id);
    try {
      //OBTENER EL REPORTE DE LA BASE DE DATOS
        const pruebasbd = await ReporteRepository.findById(id);
        if (!pruebasbd) {
          throw new Error('Reporte no encontrado');
        }
        //IMPLEMENTACION PARA GENERAR PDF USANDO LIBRERIA PDFKIT
        const reportePdfService = new ReportePdfService();
        const resultado = await reportePdfService.generarReportePDF(pruebasbd);
        return resultado;
        

    } catch (error){
      console.error('Error al generar el PDF:', error);
      throw new Error('Error al generar el PDF: ' + error.message);
    }
  }
};

export default ReporteService;
