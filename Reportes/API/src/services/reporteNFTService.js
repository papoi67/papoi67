import Web3 from 'web3';
import { NFT_ABI, NFT_DIRECCION, GANACHE_URL } from '../config/blockchain-config.js';

const web3 = new Web3(GANACHE_URL);
const contratoNFT = new web3.eth.Contract(NFT_ABI, NFT_DIRECCION);

const ReporteNFTService = {
  verifyNFTComplete: async (reporteId, address) => {
    const tokenId = await contratoNFT.methods.getTokenId(reporteId).call();
    if (tokenId === '0' || tokenId === 0n) {
      return { hasNFT: false, tokenId: 0, metadata: null, ownership: null };
    }

    const metadata = await contratoNFT.methods.getMetadata(tokenId).call();
    const owner = await contratoNFT.methods.ownerOf(tokenId).call();
    const isOwner = owner.toLowerCase() === address.toLowerCase();

    return {
      hasNFT: true,
      tokenId: tokenId.toString(),
      metadata: {
        reporteId: metadata.reporteId.toString(),
        estadoCuenta: metadata.estadoCuenta,
        prestamosPendientes: metadata.prestamosPendientes.toString(),
        prestamosPagados: metadata.prestamosPagados.toString(),
        totalFinanciero: metadata.totalFinanciero,
        hash: metadata.hash,
        timestamp: metadata.timestamp.toString()
      },
      ownership: { owner, isOwner }
    };
  }
};

export default ReporteNFTService;
