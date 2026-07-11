// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReporteContrato {
    struct Reporte {
        uint id;
        string estadoCuenta;
        uint prestamosPendientes;
        uint prestamosPagados;
        string totalFinanciero;
    }

    mapping(uint => Reporte) private reportes;

    function createReporte(
        uint _id,
        string memory _estadoCuenta,
        uint _prestamosPendientes,
        uint _prestamosPagados,
        string memory _totalFinanciero
    ) public {
        require(reportes[_id].id == 0, "Reporte ya existe en blockchain");
        reportes[_id] = Reporte(
            _id,
            _estadoCuenta,
            _prestamosPendientes,
            _prestamosPagados,
            _totalFinanciero
        );
    }

    function getReporte(uint _id) public view returns (Reporte memory) {
        require(reportes[_id].id != 0, "Reporte no existe");
        return reportes[_id];
    }
}
