import connection from '../config/prestamo-database.js';

const PrestamoRepository = {

    findAll: async () => {

        const [results] =
        await connection.promise().query(
            'SELECT * FROM prestamos'
        );

        return results;
    },

    insert: async (data) => {

        const {
            cliente_id,
            monto,
            plazo,
            interes,
            estado
        } = data;

        const [result] =
        await connection.promise().query(
            `INSERT INTO prestamos
            (cliente_id,monto,plazo,interes,estado)
            VALUES (?,?,?,?,?)`,
            [
                cliente_id,
                monto,
                plazo,
                interes,
                estado
            ]
        );

        return {
            id: result.insertId,
            ...data
        };
    },

    findById: async (id) => {

        const [results] =
        await connection.promise().query(
            'SELECT * FROM prestamos WHERE id=?',
            [id]
        );

        return results[0];
    },

    update: async (id,data) => {

        const {
            cliente_id,
            monto,
            plazo,
            interes,
            estado
        } = data;

        await connection.promise().query(
            `UPDATE prestamos
            SET cliente_id=?,
                monto=?,
                plazo=?,
                interes=?,
                estado=?
            WHERE id=?`,
            [
                cliente_id,
                monto,
                plazo,
                interes,
                estado,
                id
            ]
        );

        return { id, ...data };
    },

    delete: async (id) => {

        await connection.promise().query(
            'DELETE FROM prestamos WHERE id=?',
            [id]
        );

    },

    updateTxHash: async (id, txHash) => {

        await connection.promise().query(
            `
            UPDATE prestamos
            SET tx_hash_block = ?
            WHERE id = ?
            `,
            [txHash, id]
        );

    },

    updateIpfsHash: async (id, ipfsHash) => {
        console.log('prestamoRepository - Actualizando préstamo ID: ' + id + ' con IPFS hash: ' + ipfsHash);
        await connection.promise().query(
            'UPDATE prestamos SET ipfs_hash = ? WHERE id = ?',
            [ipfsHash, id]
        );
    }

};

export default PrestamoRepository;