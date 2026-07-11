import Web3 from "web3";

import {NFT_ABI, NFT_DIRECCION, GANACHE_URL}
from "../config/prestamo-blockchain-config.js";

const web3 = new Web3(GANACHE_URL);
const contratoNFT = new web3.eth.Contract(NFT_ABI, NFT_DIRECCION);

const PrestamoNFTService = {

    verifyNFTComplete:async ( prestamoId, address) => {
        try{
            const tokenId = await contratoNFT.methods.getTokenId(prestamoId).call();

            if(tokenId=="0"){
                return{
                    hasNFT:false,
                    tokenId:0,
                    metadata:null,
                    ownership:null
                };
            }

            const metadata = await contratoNFT.methods.getMetadata(tokenId).call();
            const owner = await contratoNFT.methods.ownerOf(tokenId).call();
            const isOwner = owner.toLowerCase() === address.toLowerCase();

            return{

                hasNFT:true,
                tokenId:
                tokenId.toString(),
                metadata:{
                    prestamoId:metadata.prestamoId.toString(),
                    clienteId:metadata.clienteId.toString(),
                    monto:metadata.monto.toString(),
                    plazo:metadata.plazo.toString(),
                    interes:metadata.interes.toString(),
                    estado:metadata.estado,
                    hash:metadata.hash,
                    timestamp:metadata.timestamp.toString()
                },
                ownership:{
                    owner,
                    isOwner
                }
            };
        }

        catch(error){

            console.error("Error al verificar NFT: ", error);
            throw new Error("Error al verificar NFT: "+ error.message);
        }
    }
};

export default PrestamoNFTService;