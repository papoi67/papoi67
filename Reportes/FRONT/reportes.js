const Web3 = window.Web3;
let cuentaBlockchain = null;
let CONTRATO_ABI = null;
let CONTRATO_DIRECCION = null;
let NFT_ABI = null;
let NFT_DIRECCION = null;

window.addEventListener('load', async () => {
  await conectarMetaMask();
  await cargarConfiguracionContrato();
  await cargarConfiguracionNFT();
  buscarReportes();
});

async function buscarReportes() {
  try {
    Swal.fire({ title: 'Cargando reportes', didOpen: () => Swal.showLoading() });
    const response = await axios.get('http://localhost:3000/api/reportes');
    Swal.close();

    const tbody = document.getElementById('reportesBody');
    tbody.innerHTML = '';

    response.data.forEach(reporte => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${reporte.id}</td>
        <td>${reporte.estado_cuenta}</td>
        <td>${reporte.prestamos_pendientes}</td>
        <td>${reporte.prestamos_pagados}</td>
        <td>${reporte.total_financiero}</td>
        <td>${reporte.estado}</td>
        <td>
          <button class="btn btn-sm btn-outline-info" onclick="editarReporte('${reporte.id}')">EDITAR</button>
          <button class="btn btn-sm btn-outline-danger" onclick="enviarBlockchain('${reporte.id}')">ENVIAR A BLOCKCHAIN</button>
          <button class="btn btn-sm btn-outline-secondary" onclick="validarBlockchain('${reporte.id}')">VALIDAR</button>
          <button class="btn btn-sm btn-outline-primary" onclick="mintNFT('${reporte.id}')">MINT NFT</button>
          <button class="btn btn-sm btn-outline-success" onclick="verificarNFT('${reporte.id}')">VERIFICAR NFT</button>
          <button class="btn btn-sm btn-outline-warning" onclick="generarPDF('${reporte.id}')">GENERAR PDF</button>
        </td>`;
      tbody.appendChild(row);
    });
  } catch (error) {
    Swal.close();
    Swal.fire('Error', 'No se pudieron cargar los reportes: ' + error.message, 'error');
  }
}

function agregarReporte() { window.location.href = 'reportes-form.html'; }
function editarReporte(id) { window.location.href = 'reportes-form.html?id=' + id; }

async function conectarMetaMask() {
  if (!window.ethereum) {
    Swal.fire('Error', 'MetaMask no está instalado.', 'error');
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    cuentaBlockchain = accounts[0];
    document.getElementById('cuentaConectada').textContent = cuentaBlockchain;
    window.ethereum.on('accountsChanged', accounts => {
      cuentaBlockchain = accounts[0];
      document.getElementById('cuentaConectada').textContent = cuentaBlockchain;
    });
  } catch (error) {
    Swal.fire('Error', 'No se pudo conectar MetaMask: ' + error.message, 'error');
  }
}

async function cargarConfiguracionContrato() {
  const response = await axios.get('http://localhost:3000/api/reportes/contract/config');
  CONTRATO_ABI = response.data.abi;
  CONTRATO_DIRECCION = response.data.address;
}

async function cargarConfiguracionNFT() {
  const response = await axios.get('http://localhost:3000/api/reportes/nft/config');
  NFT_ABI = response.data.abi;
  NFT_DIRECCION = response.data.address;
}

async function enviarBlockchain(id) {
  if (!cuentaBlockchain) return Swal.fire('Error', 'Primero conecta MetaMask.', 'error');
  if (!CONTRATO_DIRECCION || CONTRATO_DIRECCION.includes('PEGA_AQUI')) return Swal.fire('Error', 'Falta configurar CONTRATO_DIRECCION en el .env del API.', 'error');

  try {
    Swal.fire({ title: 'Enviando a blockchain', didOpen: () => Swal.showLoading() });
    const response = await axios.get('http://localhost:3000/api/reportes/' + id);
    const reporte = response.data;
    const web3 = new Web3(window.ethereum);
    const contrato = new web3.eth.Contract(CONTRATO_ABI, CONTRATO_DIRECCION);

    const tx = await contrato.methods.createReporte(
      reporte.id,
      reporte.estado_cuenta,
      reporte.prestamos_pendientes,
      reporte.prestamos_pagados,
      reporte.total_financiero.toString()
    ).send({ from: cuentaBlockchain });

    await axios.put('http://localhost:3000/api/reportes/' + id + '/tx-hash', { txHash: tx.transactionHash });
    Swal.close();
    Swal.fire('Éxito', 'Reporte enviado a blockchain. Hash: ' + tx.transactionHash, 'success');
    buscarReportes();
  } catch (error) {
    Swal.close();
    Swal.fire('Error', error.message, 'error');
  }
}

async function validarBlockchain(id) {
  try {
    if (!cuentaBlockchain) {
      return Swal.fire('Error', 'Primero conecta MetaMask.', 'error');
    }

    Swal.fire({ title: 'Validando en blockchain', didOpen: () => Swal.showLoading() });

    const responseReporte = await axios.get('http://localhost:3000/api/reportes/' + id);
    const reporte = responseReporte.data;

    const web3 = new Web3(window.ethereum);
    const tx = await web3.eth.getTransaction(reporte.tx_hash_block);

    if (!tx) {
      Swal.close();
      return Swal.fire('Error', 'No se encontró la transacción en blockchain.', 'error');
    }

    if (tx.from.toLowerCase() !== cuentaBlockchain.toLowerCase()) {
      Swal.close();
      return Swal.fire(
        'Acceso denegado',
        'Este reporte fue enviado a blockchain por otra cuenta.',
        'warning'
      );
    }

    const response = await axios.get('http://localhost:3000/api/reportes/' + id + '/validar');
    const resultado = response.data;
    Swal.close();

    Swal.fire({
      icon: resultado.valid ? 'success' : 'error',
      title: resultado.valid ? 'Reporte válido en blockchain' : 'Reporte NO válido en blockchain',
      html: `
        <strong>Base de Datos:</strong><br>
        ID: ${resultado.datosDB.id}<br>
        Estado cuenta: ${resultado.datosDB.estadoCuenta}<br>
        Pendientes: ${resultado.datosDB.prestamosPendientes}<br>
        Pagados: ${resultado.datosDB.prestamosPagados}<br>
        Total: ${resultado.datosDB.totalFinanciero}<br>
        Hash: ${resultado.datosDB.txHash}<br><br>
        <strong>Blockchain:</strong><br>
        ID: ${resultado.datosBlockchain.id}<br>
        Estado cuenta: ${resultado.datosBlockchain.estadoCuenta}<br>
        Pendientes: ${resultado.datosBlockchain.prestamosPendientes}<br>
        Pagados: ${resultado.datosBlockchain.prestamosPagados}<br>
        Total: ${resultado.datosBlockchain.totalFinanciero}<br>`
    });

  } catch (error) {
    Swal.close();
    Swal.fire('Error', error.response?.data?.error || error.message, 'error');
  }
}

async function mintNFT(id) {
  if (!cuentaBlockchain) return Swal.fire('Error', 'Primero conecta MetaMask.', 'error');
  if (!NFT_DIRECCION || NFT_DIRECCION.includes('PEGA_AQUI')) return Swal.fire('Error', 'Falta configurar NFT_DIRECCION en el .env del API.', 'error');

  try {
    Swal.fire({ title: 'Minteando NFT', didOpen: () => Swal.showLoading() });
    const response = await axios.get('http://localhost:3000/api/reportes/' + id);
    const reporte = response.data;
    const web3 = new Web3(window.ethereum);
    const contratoNFT = new web3.eth.Contract(NFT_ABI, NFT_DIRECCION);

    const hash = web3.utils.soliditySha3(
      { t: 'uint', v: reporte.id },
      { t: 'string', v: reporte.estado_cuenta },
      { t: 'uint', v: reporte.prestamos_pendientes },
      { t: 'uint', v: reporte.prestamos_pagados },
      { t: 'string', v: reporte.total_financiero.toString() }
    );

    const tx = await contratoNFT.methods.mintReporteNFT(
      reporte.id,
      reporte.estado_cuenta,
      reporte.prestamos_pendientes,
      reporte.prestamos_pagados,
      reporte.total_financiero.toString(),
      hash,
      cuentaBlockchain
    ).send({ from: cuentaBlockchain });

    Swal.close();
    Swal.fire('Éxito', 'NFT minteado. Hash: ' + tx.transactionHash, 'success');
  } catch (error) {
    Swal.close();
    Swal.fire('Error', error.message, 'error');
  }
}

async function verificarNFT(id) {
  if (!cuentaBlockchain) return Swal.fire('Error', 'Primero conecta MetaMask.', 'error');

  try {
    Swal.fire({ title: 'Verificando NFT', didOpen: () => Swal.showLoading() });
    const response = await axios.get(`http://localhost:3000/api/reportes/nft/verify-complete/${id}/${cuentaBlockchain}`);
    const result = response.data;
    Swal.close();

    if (!result.hasNFT) return Swal.fire('Información', 'No se encontró un NFT para este reporte.', 'info');

    Swal.fire({
      icon: result.ownership.isOwner ? 'success' : 'warning',
      title: result.ownership.isOwner ? 'NFT encontrado y te pertenece' : 'NFT encontrado, pero no te pertenece',
      html: `
        <strong>Token ID:</strong> ${result.tokenId}<br>
        <strong>Reporte ID:</strong> ${result.metadata.reporteId}<br>
        <strong>Estado cuenta:</strong> ${result.metadata.estadoCuenta}<br>
        <strong>Pendientes:</strong> ${result.metadata.prestamosPendientes}<br>
        <strong>Pagados:</strong> ${result.metadata.prestamosPagados}<br>
        <strong>Total:</strong> ${result.metadata.totalFinanciero}<br>
        <strong>Hash:</strong> ${result.metadata.hash}<br>
        <strong>Fecha:</strong> ${new Date(Number(result.metadata.timestamp) * 1000).toLocaleString()}<br><br>
        <strong>Propietario:</strong> ${result.ownership.owner}<br>
        <strong>Tu cuenta:</strong> ${cuentaBlockchain}<br>`
    });
  } catch (error) {
    Swal.close();
    Swal.fire('Error', error.response?.data?.error || error.message, 'error');
  }
}

async function generarPDF(id) {
  try {
      Swal.fire({
        title: 'Generando PDF y SUBIENDO a IPFS', 
        didOpen: ()=> {
          Swal.showLoading() 
        } 
      });

      const response = await axios.get(`http://localhost:3000/api/reportes/${id}/pdf`);
      const result = response.data;
      Swal.close();

    if (result.ipfsHash) {
      Swal.fire({
        icon: 'success',
        title: 'PDF generando y subido a IPFS',
        html: 
        'IPFS Hash: ' + result.ipfsHash + '<br>' +
        'URL: <a href="' + result.ipfsUrl + '" target= "_blank">' + result.ipfsUrl + '</a>'
      });
    } else {
      Swal.fire('Error', 'No se pudo generar el PDF', error);

    }    
  } catch (error) {
      console.error('Error al generar PDF:', error);
      Swal.close();
      Swal.fire('Error', error.message, 'error');
  }
}