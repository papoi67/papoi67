import connection from '../config/database.js';

const ReporteRepository = {
  findAll: async () => {
    const [results] = await connection.promise().query('SELECT * FROM reportes ORDER BY id DESC');
    return results;
  },
  insert: async (data) => {
    const { estadoCuenta, prestamosPendientes, prestamosPagados, totalFinanciero } = data;
    const [result] = await connection.promise().query(
      'INSERT INTO reportes (estado_cuenta, prestamos_pendientes, prestamos_pagados, total_financiero) VALUES (?, ?, ?, ?)',
      [estadoCuenta, prestamosPendientes, prestamosPagados, totalFinanciero]
    );
    return { id: result.insertId, estadoCuenta, prestamosPendientes, prestamosPagados, totalFinanciero };
  },
  findById: async (id) => {
    const [results] = await connection.promise().query('SELECT * FROM reportes WHERE id = ?', [id]);
    return results[0];
  },
  update: async (id, data) => {
    const { estadoCuenta, prestamosPendientes, prestamosPagados, totalFinanciero } = data;
    await connection.promise().query(
      'UPDATE reportes SET estado_cuenta = ?, prestamos_pendientes = ?, prestamos_pagados = ?, total_financiero = ? WHERE id = ?',
      [estadoCuenta, prestamosPendientes, prestamosPagados, totalFinanciero, id]
    );
    return { id, estadoCuenta, prestamosPendientes, prestamosPagados, totalFinanciero };
  },
  delete: async (id) => {
    await connection.promise().query('DELETE FROM reportes WHERE id = ?', [id]);
    return { id, deleted: true };
  },
  updateTxHash: async (id, txHash) => {
    await connection.promise().query(
      'UPDATE reportes SET tx_hash_block = ?, estado = ? WHERE id = ?',
      [txHash, 'ENVIADO', id]
    );
    return { id, txHash, estado: 'ENVIADO' };
  },
  updateIpfsHash: async (id, ipfsHash) => {
    console.log('ReporteRepository - Actualizando reporte ID: ' + id + ' con hash de IPFS: ' + ipfsHash);
    await connection.promise().query(
      'UPDATE reportes SET ipfs_hash = ? WHERE id = ?',
      [ipfsHash, id]
    );
  }
};

export default ReporteRepository;
