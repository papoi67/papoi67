// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PrestamoContrato {

    struct Prestamo {
        uint id;
        uint clienteId;
        uint monto;
        uint plazo;
        uint interes;
        string estado;
    }

    mapping(uint => Prestamo) private prestamos;

    // Crear préstamo
    function createPrestamo(
        uint _id,
        uint _clienteId,
        uint _monto,
        uint _plazo,
        uint _interes,
        string memory _estado
    ) public {

        require(
            prestamos[_id].id == 0,
            "Prestamo ya existe"
        );

        prestamos[_id] = Prestamo(
            _id,
            _clienteId,
            _monto,
            _plazo,
            _interes,
            _estado
        );
    }

    // Obtener préstamo
    function getPrestamo(uint _id)
        public
        view
        returns (
            uint,
            uint,
            uint,
            uint,
            uint,
            string memory
        )
    {
        require(
            prestamos[_id].id != 0,
            "Prestamo no existe"
        );

        Prestamo memory p = prestamos[_id];

        return (
            p.id,
            p.clienteId,
            p.monto,
            p.plazo,
            p.interes,
            p.estado
        );
    }

    // Actualizar estado
    function actualizarEstado(
        uint _id,
        string memory _estado
    ) public {

        require(
            prestamos[_id].id != 0,
            "Prestamo no existe"
        );

        prestamos[_id].estado = _estado;
    }

}