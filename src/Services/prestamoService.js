import PrestamoRepository from '../repositories/prestamoRepository.js';
import Web3 from 'web3';
import {CONTRATO_ABI, CONTRATO_DIRECCION, GANACHE_URL} from '../config/prestamo-blockchain-config.js';
import PrestamoPdfService from '../services/prestamoPdfService.js'


const web3 = new Web3(GANACHE_URL);
const contrato = new web3.eth.Contract(CONTRATO_ABI, CONTRATO_DIRECCION);

const PrestamoService = {

    getAll: async () => {

        console.log(
            'PrestamoService: Obteniendo todos los préstamos'
        );

        return await PrestamoRepository.findAll();

    },

    create: async (data) => {

        console.log(
            'PrestamoService: Creando préstamo: '
            + JSON.stringify(data)
        );

        return await PrestamoRepository.insert(data);

    },

    getById: async (id) => {

        console.log(
            'PrestamoService: Obteniendo préstamo ID: '
            + id
        );

        return await PrestamoRepository.findById(id);

    },

    update: async (id, data) => {

        console.log(
            'PrestamoService: Actualizando préstamo ID: '
            + id
        );

        return await PrestamoRepository.update(
            id,
            data
        );

    },

    delete: async (id) => {

        console.log(
            'PrestamoService: Eliminando préstamo ID: '
            + id
        );

        return await PrestamoRepository.delete(id);

    },

    updateTxHash: async (id, txHash) => {

        return await PrestamoRepository.updateTxHash(
            id,
            txHash
        );

    },

    validarBlockchain: async (id) => {

    const prestamoDB = await PrestamoRepository.findById(id);

    const prestamoBlockchain = await contrato.methods.getPrestamo(id).call();

    const idCoincide = prestamoDB.id.toString() === prestamoBlockchain[0].toString();

    const cliente_idCoincide = prestamoDB.cliente_id.toString() === prestamoBlockchain[1].toString();

    const montoCoincide = parseFloat(prestamoDB.monto) === Number(prestamoBlockchain[2]);

    const plazoCoincide = prestamoDB.plazo.toString() === prestamoBlockchain[3].toString();

    const interesCoincide = parseFloat(prestamoDB.interes) === Number(prestamoBlockchain[4]);

    const estadoCoincide = prestamoDB.estado === prestamoBlockchain[5];

    const tieneHash = prestamoDB.tx_hash_block !== null;

    return {

        valid:

            idCoincide &&
            cliente_idCoincide &&
            montoCoincide &&
            plazoCoincide &&
            interesCoincide &&
            estadoCoincide &&
            tieneHash,

        idCoincide,
        cliente_idCoincide,
        montoCoincide,
        plazoCoincide,
        interesCoincide,
        estadoCoincide,
        tieneHash,

        datosDB:
        prestamoDB,

        datosBlockchain: {

            id:
            prestamoBlockchain[0].toString(),

            cliente_id:
            prestamoBlockchain[1].toString(),

            monto:
            Number(prestamoBlockchain[2]),

            plazo:
            prestamoBlockchain[3].toString(),

            interes:
            Number(prestamoBlockchain[4]),

            estado:
            prestamoBlockchain[5].toString(),

        }

    };

},

    generarPDF: async (id) => {

        console.log(
            'PrestamoService: Generando PDF del préstamo ID: ' + id
        );

        const prestamo = await PrestamoRepository.findById(id);

        if (!prestamo) {
            throw new Error('Préstamo no encontrado');
        }

        return await PrestamoPdfService.generarPrestamoPDF(prestamo);

    }

};

export default PrestamoService;