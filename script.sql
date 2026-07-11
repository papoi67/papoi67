CREATE TABLE IF NOT EXISTS prestamos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    plazo INT NOT NULL,
    interes DECIMAL(5,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE', -- 'Estados: PENDIENTE, PAGADO'
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    tx_hash_block VARCHAR(255) -- Hash de la transacción en la blockchain
    ipfs_hash     VARCHAR(255)  -- Hash del archivo en IPFS
);