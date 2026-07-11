import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { create } from 'kubo-rpc-client';
import { IPFS_URL, IPFS_GATEWAY } from '../config/prestamo-ipfs-config.js';
import prestamoRepository from '../repositories/prestamoRepository.js';

class prestamoPdfService {

    generarPrestamoPDF(prestamo) {
        return new Promise((resolve, reject) => {
            try {
                // Obtener el hash del prestamo
                const hashHex = prestamo.tx_hash_block || 'Pendiente';
                const prestamoId = prestamo.id || prestamo.cliente_id;

                // Crear directorio si no existe
                const pdfDir = path.join(process.cwd(), 'pdfs');
                if (!fs.existsSync(pdfDir)) {
                    fs.mkdirSync(pdfDir, { recursive: true });
                }

                // Ruta del archivo PDF
                const filePath = path.join(pdfDir, `prestamo_${prestamoId}.pdf`);
                const stream = fs.createWriteStream(filePath);

                // Crear documento PDF
                const doc = new PDFDocument({size: "A4", margin: 50});
                doc.pipe(stream);

                // ======================
                // ENCABEZADO
                // ======================
                doc
                    .rect(0, 0, 595, 80)
                    .fill("#1E3A8A");

                doc
                    .fillColor("white")
                    .fontSize(24)
                    .text("REPORTE DE PRÉSTAMO", 50, 28, {
                        align: "center"
                    });

                doc
                    .fontSize(11)
                    .text("Sistema de Gestión de Préstamos", {
                        align: "center"
                    });

                doc.moveDown(3);

                // ======================
                // INFORMACIÓN GENERAL
                // ======================
                doc
                    .fillColor("#1E3A8A")
                    .fontSize(16)
                    .text("Detalle del préstamo");

                doc.moveDown(0.5);

                doc
                    .strokeColor("#1E3A8A")
                    .lineWidth(1)
                    .moveTo(50, 125)
                    .lineTo(545, 125)
                    .stroke();

                doc.moveDown();

                // ======================
                // DATOS DEL PRÉSTAMO
                // ======================
                doc
                    .fillColor("black")
                    .fontSize(12);

                doc.text(`ID del préstamo:`, {
                    continued: true
                })
                .font("Helvetica-Bold")
                .text(` ${prestamo.id}`)
                .font("Helvetica");

                doc.text(`Nro de cliente:`, {
                    continued: true
                })
                .font("Helvetica-Bold")
                .text(` ${prestamo.cliente_id}`)
                .font("Helvetica");

                doc.text(`Monto:`, {
                    continued: true
                })
                .font("Helvetica-Bold")
                .text(` S/. ${prestamo.monto}`)
                .font("Helvetica");

                doc.text(`Plazo:`, {
                    continued: true
                })
                .font("Helvetica-Bold")
                .text(` ${prestamo.plazo} meses`)
                .font("Helvetica");

                doc.text(`Interés:`, {
                    continued: true
                })
                .font("Helvetica-Bold")
                .text(` ${prestamo.interes}%`)
                .font("Helvetica");

                doc.text(`Estado:`, {
                    continued: true
                })
                .font("Helvetica-Bold")
                .text(` ${prestamo.estado}`)
                .font("Helvetica");

                doc.moveDown(2);

                // ======================
                // BLOCKCHAIN
                // ======================
                doc
                    .fillColor("#047857")
                    .fontSize(16)
                    .text("Información del préstamo");

                doc.moveDown(0.5);

                doc
                    .strokeColor("#10B981")
                    .moveTo(50, doc.y)
                    .lineTo(545, doc.y)
                    .stroke();

                doc.moveDown();

                doc
                    .fillColor("black")
                    .fontSize(10);

                doc.text(
                    `Hash de la transacción:`
                );

                doc
                    .fillColor("#6B7280")
                    .fontSize(8)
                    .text(hashHex);

                doc.moveDown(2);

                // ======================
                // PIE
                // ======================
                doc
                    .fillColor("#6B7280")
                    .fontSize(9)
                    .text(
                        `Documento generado el ${new Date().toLocaleString()}`,
                        {
                            align: "center"
                        }
                    );

                doc
                    .fontSize(8)
                    .text(
                        "Sistema de Gestión de Préstamos",
                        {
                            align: "center"
                        }
                    );

                doc.end();

                stream.on('finish', async () => {
                    console.log(`PDF generado: ${filePath}`);
                    
                    try {
                        // Subir a IPFS
                        const ipfs = create({ url: IPFS_URL });
                        const file = fs.readFileSync(filePath);
                        const result = await ipfs.add(file);
                        const ipfsHash = result.cid.toString();
                        const ipfsUrl = `${IPFS_GATEWAY}/${ipfsHash}`;
                        
                        console.log(`Archivo subido a IPFS: ${ipfsHash}`);
                        console.log(`URL IPFS: ${ipfsUrl}`);
                        
                        // Guardar hash de IPFS en la base de datos
                        if (prestamo.id) {
                            await prestamoRepository.updateIpfsHash(prestamo.id, ipfsHash);
                            console.log(`IPFS hash guardado en BD para factura ID: ${prestamo.id}`);
                        }
                        
                        resolve({ filePath, ipfsHash, ipfsUrl });
                    } catch (ipfsError) {
                        console.error('Error al subir a IPFS:', ipfsError);
                        // Si falla IPFS, aún retornamos el archivo local
                        resolve({ filePath, ipfsHash: null, ipfsUrl: null });
                    }
                });

                stream.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }

}

export default new prestamoPdfService;