// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.9.6/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";

contract PrestamoNFT is ERC721, Ownable {

    uint256 private _tokenIdCounter;

    error NFTYaExiste(uint prestamoId);
    error DireccionInvalida();
    error TokenNoExiste(uint256 tokenId);

    struct PrestamoMetadata {

        uint prestamoId;
        uint clienteId;
        uint monto;
        uint plazo;
        uint interes;
        string estado;

        bytes32 hash;

        uint256 timestamp;

    }

    mapping(uint256 => PrestamoMetadata) public prestamoMetadata;

    mapping(uint => uint256) public prestamoToTokenId;

    event NFTMinted(
        uint256 indexed tokenId,
        uint indexed prestamoId,
        address indexed propietario
    );

    constructor()
    ERC721("PrestamoNFT", "PNFT")
    {
        _tokenIdCounter = 1;
    }

    function mintPrestamoNFT(

        uint prestamoId,
        uint clienteId,
        uint monto,
        uint plazo,
        uint interes,
        string memory estado,
        bytes32 hash,
        address to

    )

        public

        returns(uint256)

    {

        if(prestamoToTokenId[prestamoId] != 0)
            revert NFTYaExiste(prestamoId);

        if(to == address(0))
            revert DireccionInvalida();

        uint256 tokenId = _tokenIdCounter++;

        _safeMint(to, tokenId);

        prestamoMetadata[tokenId] = PrestamoMetadata({

            prestamoId: prestamoId,
            clienteId: clienteId,
            monto: monto,
            plazo: plazo,
            interes: interes,
            estado: estado,
            hash: hash,
            timestamp: block.timestamp

        });

        prestamoToTokenId[prestamoId] = tokenId;

        emit NFTMinted(
            tokenId,
            prestamoId,
            to
        );

        return tokenId;

    }

    function getMetadata(
        uint256 tokenId
    )

        public
        view

        returns(
            PrestamoMetadata memory
        )

    {

        if(_ownerOf(tokenId) == address(0))
            revert TokenNoExiste(tokenId);

        return prestamoMetadata[tokenId];

    }

    function getTokenId(
        uint prestamoId
    )

        public
        view

        returns(uint256)

    {

        return prestamoToTokenId[prestamoId];

    }

}