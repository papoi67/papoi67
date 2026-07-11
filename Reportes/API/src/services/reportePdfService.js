
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import {IPFS_URL, IPFS_GATEWAY} from '../config/ipfs-config.js';
import {create} from 'ipfs-http-client';
import ReporteRepository from '../repositories/reporteRepository.js';

class ReportePdfService {

    generarReportePDF(reporte) {
        return new Promise((resolve, reject) => {
            try {
            const hashHex = reporte.tx_hash_block || 'Pendiente de generar';
            const reporteId = reporte.id || reporte.num_reporte;

            //CREAR DIRECTORIO SI NO EXISTE
            const pdfDir = path.join(process.cwd(), '../pdfs');
            if (!fs.existsSync(pdfDir)) {
                fs.mkdirSync(pdfDir, { recursive: true});
            }

            //RUTA DEL ARCHIVO PDF
            const filePath = path.join(pdfDir, `reporte_${reporteId}.pdf`);
            const stream = fs.createWriteStream(filePath);

            //CREAR EL DOCUMENTO PDF
            const doc = new PDFDocument({size: "A4", margin: 50});
            doc.pipe(stream);

            //AGREGAR CONTENIDO AL PDF
            doc.fontSize(20).text('REPORTE DE PRÉSTAMOS', { align: 'center' });
            doc.moveDown(1);
            doc.fontSize(12).text(`ID del Reporte: ${reporte.id}`);
            doc.text(`Estado de Cuenta: ${reporte.estado_cuenta}`);
            doc.text(`Préstamos Pendientes: ${reporte.prestamos_pendientes}`);
            doc.text(`Préstamos Pagados: ${reporte.prestamos_pagados}`);
            doc.text(`Total Financiero: S/ ${reporte.total_financiero}`);
            doc.text(`Estado: ${reporte.estado}`);
            doc.text(`Fecha de Registro: ${reporte.fecha}`);
            doc.moveDown(1);
            doc.fontSize(12).text(`Hash de Transacción: ${hashHex}`);

            stream.on('finish', async() => {
                console.log(`ReportePdfService: PDF generado en ${filePath}`);

                //SUBIR A IPFS
                try {
                    const ipfs = create({url: IPFS_URL});
                    const file = fs.readFileSync(filePath);
                    const result = await ipfs.add(file);
                    const ipfsHash = result.cid.toString();
                    const ipfsUrl = `${IPFS_GATEWAY}/${ipfsHash}`;

                    console.log(`ReportePdfService: PDF subido a IPFS con hash ${ipfsHash}`);
                    console.log(`ReportePdfService: URL de IPFS: ${ipfsUrl}`);

                    //GUARDAR HASH DE IPFS EN LA BASE DE DATOS
                    if (reporte.id){
                        await ReporteRepository.updateIpfsHash(reporte.id, {ipfs_hash: ipfsHash});
                        console.log(`ReportePdfService: Hash de IPFS guardado en la base de datos para factura con ID ${reporte.id}`);
                    }

                    resolve ({ ipfsHash, ipfsUrl});
                }catch(error) {
                    console.error('ReportePdfService: Error al subir PDF a IPFS:', error);
                    resolve({ ipfsHash: null, ipfsUrl: null});
                }
                stream.on('error', reject);
            });

            }catch (error) {
                console.error('ReportePdfService: Error al generar el PDF:', error);
                reject(error);
            }
        });
    }
}

export default new ReportePdfService();