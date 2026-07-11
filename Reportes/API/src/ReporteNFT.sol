// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.9.6/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";

contract ReporteNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    error NFTYaExiste(uint reporteId);
    error DireccionInvalida();
    error CampoRequerido(string campo);
    error TokenNoExiste(uint256 tokenId);

    struct ReporteMetadata {
        uint reporteId;
        string estadoCuenta;
        uint prestamosPendientes;
        uint prestamosPagados;
        string totalFinanciero;
        bytes32 hash;
        uint256 timestamp;
    }

    mapping(uint256 => ReporteMetadata) public reporteMetadata;
    mapping(uint256 => uint256) public reporteToTokenId;

    event NFTMinted(uint256 indexed tokenId, uint reporteId, address indexed to);

    constructor() ERC721("ReportePrestamosNFT", "RPNFT") {
        _tokenIdCounter = 1;
    }

    function mintReporteNFT(
        uint reporteId,
        string memory estadoCuenta,
        uint prestamosPendientes,
        uint prestamosPagados,
        string memory totalFinanciero,
        bytes32 hash,
        address to
    ) public returns (uint256) {
        if (reporteToTokenId[reporteId] != 0) revert NFTYaExiste(reporteId);
        if (to == address(0)) revert DireccionInvalida();
        if (bytes(estadoCuenta).length == 0) revert CampoRequerido("estadoCuenta");
        if (bytes(totalFinanciero).length == 0) revert CampoRequerido("totalFinanciero");

        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);

        reporteMetadata[tokenId] = ReporteMetadata({
            reporteId: reporteId,
            estadoCuenta: estadoCuenta,
            prestamosPendientes: prestamosPendientes,
            prestamosPagados: prestamosPagados,
            totalFinanciero: totalFinanciero,
            hash: hash,
            timestamp: block.timestamp
        });

        reporteToTokenId[reporteId] = tokenId;
        emit NFTMinted(tokenId, reporteId, to);
        return tokenId;
    }

    function getMetadata(uint256 tokenId) public view returns (ReporteMetadata memory) {
        if (_ownerOf(tokenId) == address(0)) revert TokenNoExiste(tokenId);
        return reporteMetadata[tokenId];
    }

    function getTokenId(uint reporteId) public view returns (uint256) {
        return reporteToTokenId[reporteId];
    }
}
