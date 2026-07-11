CREATE DATABASE IF NOT EXISTS pruebasbd;
USE pruebasbd;

CREATE TABLE IF NOT EXISTS reportes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    estado_cuenta VARCHAR(100) NOT NULL,
    prestamos_pendientes INT NOT NULL,
    prestamos_pagados INT NOT NULL,
    total_financiero DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    tx_hash_block VARCHAR(255),
    ipfs_hash VARCHAR(255)
);
