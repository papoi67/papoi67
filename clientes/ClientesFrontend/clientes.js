const Web3 = window.Web3;
let cuentaBlockchain = null; // Variable global

let CONTRATO_ABI = null;
let CONTRATO_DIRECCION = null;

let NFT_ABI = null;
let NFT_DIRECCION = null;

window.addEventListener('load', async () => {
    await conectarMetaMask();
    buscarClientes();
    await cargarConfiguracionContrato();
    await cargarConfiguracionNFT();
});

async function buscarClientes() {
    try {
        Swal.fire({
            title: 'Cargando clientes',
            didOpen: () => Swal.showLoading()
        });

        const response = await axios.get('http://localhost:3000/api/clientes');
        Swal.close();

        const clientes = response.data;
        const tbody = document.getElementById('clientesBody');

        tbody.innerHTML = '';

        clientes.forEach(cliente => {
            const row = document.createElement('tr');

            row.innerHTML = `
            
                <td>${cliente.id}</td>
                <td>${cliente.dni}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.correo}</td>

                <td>
                    <span class="badge ${cliente.activo ? 'bg-success' : 'bg-danger'}">
                        ${cliente.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </td>

                <td>${cliente.estado}</td>
                <td>${new Date(cliente.fecha_registro).toLocaleDateString()}</td>

                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="editarCliente('${cliente.id}')">
                        EDITAR
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="enviarBlockchain('${cliente.id}')">
                        ENVIAR A BLOCKCHAIN
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="validarBlockchain('${cliente.id}')">
                        VALIDAR
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="mintNFT('${cliente.id}')">
                        MINT NFT
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="verificarNFT('${cliente.id}')">
                        VERIFICAR NFT
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="generarPDF('${cliente.id}')">
                        GENERAR PDF
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error al cargar clientes:', error);
        Swal.fire('Error', 'No se pudieron cargar los clientes.', 'error');
    }
}

function AgregarCliente() {
    window.location.href = "clientes-form";
}

function editarCliente(id) {
    window.location.href = "clientes-form?id=" + id;
}

async function conectarMetaMask() {
console.log('Intentando conectar MetaMask...');
if (!window.ethereum) {
alert('MetaMask no está instalado. Por favor, instálalo para usar esta aplicación.');
return;
}
try {
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
cuentaBlockchain = accounts[0];
document.getElementById('cuentaConectada').textContent = cuentaBlockchain;
window.ethereum.on('accountsChanged', (accounts) => {
        cuentaBlockchain = accounts[0];
        document.getElementById('cuentaConectada').textContent = cuentaBlockchain;
    });
} catch (error) {
    console.error('Error al conectar MetaMask:', error);
}
}

async function enviarBlockchain(id) {
    if (!cuentaBlockchain) {
        Swal.fire('Error', 'Primero debes conectar Metamask', 'error');
        return;
    }
    try {
        Swal.fire({ title: 'Enviando a blockchain', didOpen: () => { Swal.showLoading() } });

        // Obtener cliente desde la API
        const response = await axios.get('http://localhost:3000/api/clientes/' + id);
        const cliente = response.data;

        // Configuracion de web3 con Metamask
        const web3 = new Web3(window.ethereum);

        // Crear instancia del contrato
        const contrato = new web3.eth.Contract(CONTRATO_ABI, CONTRATO_DIRECCION);

        // Enviar transaccion al contrato
        const tx = await contrato.methods.createCliente(cliente.id, cliente.nombre, cliente.dni)
            .send({ from: cuentaBlockchain });

        console.log('Transacción enviada:', tx.transactionHash);

        // Guardar el hash de la transacción en el backend
        await axios.put('http://localhost:3000/api/clientes/' + id + '/tx-hash',
            { txHash: tx.transactionHash }
        );

        Swal.close();
        Swal.fire('Éxito', 'Cliente enviado a blockchain con hash: ' + tx.transactionHash, 'success');
        buscarClientes();

    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

async function cargarConfiguracionContrato() {
    try {
        const response = await axios.get('http://localhost:3000/api/clientes/contract/config');
        CONTRATO_ABI = response.data.abi;
        CONTRATO_DIRECCION = response.data.address;
        console.log('Configuración del contrato cargada:', CONTRATO_DIRECCION);
    } catch (error) {
        console.error('Error al cargar la configuración del contrato:', error);
        Swal.fire('Error', 'No se pudo cargar la configuración del contrato.', 'error');
    }
}


async function validarBlockchain(id) {
try {
    Swal.fire({ title: 'Validando en blockchain',
        didOpen: () => { Swal.showLoading() }});

// LLamar al endpoint para validar el cliente en blockchain
const response = await axios.get('http://localhost:3000/api/clientes/' + id + '/validar');

const resultado = response.data;
Swal.close();

if (resultado.valid) {
        Swal.fire({
            icon : 'success',
            title: 'Cliente válido en blockchain',
            html: `
                <strong>Datos Blockchain:</strong><br>
                ID: ${resultado.datosBlockchain.id}<br>
                Nombre: ${resultado.datosBlockchain.nombre}<br>
                DNI: ${resultado.datosBlockchain.dni}<br>

                <strong>Datos de Base de Datos:</strong><br>
                ID: ${resultado.datosDB.id}<br>
                Nombre: ${resultado.datosDB.nombre}<br>
                DNI: ${resultado.datosDB.dni}<br>
                Hash: ${resultado.datosDB.txHash}<br>
            `
        });
    }  else {
        Swal.fire({
            icon : 'error',
            title: 'Cliente NO válido en blockchain',
            html: `
                <strong>Datos Blockchain:</strong><br>
                ID: ${resultado.datosBlockchain.id}<br>
                Nombre: ${resultado.datosBlockchain.nombre}<br>
                DNI: ${resultado.datosBlockchain.dni}<br>

                <strong>Datos de Base de Datos:</strong><br>
                ID: ${resultado.datosDB.id}<br>
                Nombre: ${resultado.datosDB.nombre}<br>
                DNI: ${resultado.datosDB.dni}<br>
                Hash: ${resultado.datosDB.txHash}<br>
            `
        });
    }

const validacion = response.data;

} catch (error) {
    console.error('Error al validar en blockchain:', error);
    Swal.close();
    Swal.fire('Error', error.mesage, 'error');
}
}


async function cargarConfiguracionNFT() {
    try {
        const response = await axios.get("http://localhost:3000/api/clientes/nft/config");
        NFT_ABI = response.data.abi;
        NFT_DIRECCION = response.data.address;
        console.log("Configuración del NFT cargada:", NFT_DIRECCION);
    } catch (error) {
        console.error("Error al cargar la configuracion del NFT:", error);
        Swal.fire("Error", "No se pudo cargar la configuración del NFT.", 'error');
    }
}


async function mintNFT(id) {
    if (!cuentaBlockchain) {
        Swal.fire('Error', 'Primero debes conectar Metamask', 'error');
        return;
    }

    if (!NFT_ABI || !NFT_DIRECCION) {
        Swal.fire('Error', 'La configuración del contrato NFT no está cargada.', 'error');
        return;
    }

    try {
        Swal.fire({
            title: 'Minteando NFT',
            didOpen: () => { Swal.showLoading() }
        });

        const response = await axios.get('http://localhost:3000/api/clientes/' + id);
        const cliente = response.data;

        // Configuración de Web3 con MetaMask
        const web3 = new Web3(window.ethereum);

        // Crear instancia del contrato NFT
        const contratoNFT = new web3.eth.Contract(NFT_ABI, NFT_DIRECCION);

        // Generar hash del cliente
        const hash = web3.utils.soliditySha3(
            { t: 'uint', v: cliente.id },
            { t: 'string', v: cliente.nombre },
            { t: 'string', v: cliente.dni }
        );

        // Enviar transacción al contrato NFT
        const tx = await contratoNFT.methods.mintClienteNFT(
            cliente.id,
            cliente.nombre,
            cliente.dni,
            hash,
            cuentaBlockchain
        ).send({ from: cuentaBlockchain });

        console.log('NFT minteado con éxito:', tx.transactionHash);

        Swal.close();
        Swal.fire(
            'Éxito',
            'NFT minteado con hash de transacción: ' + tx.transactionHash,
            'success'
        );

    } catch (error) {
        console.error('Error al mintear el NFT:', error);
        Swal.close();
        Swal.fire('Error', error.message, 'error');
    }
}


async function verificarNFT(id) {
    try {
        Swal.fire({ title: 'Verificando NFT', didOpen: () => { Swal.showLoading() } });

        const response = await axios.get(`http://localhost:3000/api/clientes/nft/verify-complete/${id}/${cuentaBlockchain}`);
        const result = response.data;

        Swal.close();

        if (result.hasNFT) {
            Swal.fire({
                icon: result.ownership.isOwner ? 'success' : 'warning',
                title: result.ownership.isOwner ? 'NFT encontrado (Te pertenece)' : 'NFT encontrado (No te pertenece)',
                html: `
                    <strong>Token ID:</strong> ${result.tokenId}<br>
                    <strong>Cliente ID:</strong> ${result.metadata.clienteId}<br>
                    <strong>Nombre:</strong> ${result.metadata.nombre}<br>
                    <strong>DNI:</strong> ${result.metadata.dni}<br>
                    <strong>Hash:</strong> ${result.metadata.hash}<br>
                    <strong>Fecha:</strong> ${new Date(result.metadata.timestamp * 1000).toLocaleString()}<br><br>

                    <strong>Propietario:</strong> ${result.ownership.owner}<br>
                    <strong>Tu Cuenta:</strong> ${cuentaBlockchain}<br>
                    <strong>Te pertenece:</strong> ${result.ownership.isOwner ? 'Sí' : 'No'}<br>
                `
            });
        } else {
            Swal.fire('Información', 'No se encontró un NFT para este cliente.', 'info');
        }

    } catch (error) {
        console.error('Error al verificar el NFT:', error);
        Swal.close();
        Swal.fire('Error', error.message, 'error');
    }
}

async function generarPDF(id) {
    try {
    Swal.fire({ title: 'Generando PDF y SUBIENDO a IPFS', didOpen: () => { Swal.showLoading() } });
        const response = await axios.get(` http://localhost:3000/api/clientes/${id}/pdf`);
        const result = response.data;
        Swal.close();

        if (result.ipfsHash) {
            Swal.fire({
                icon: 'success',
                title: 'PDF generado y subido a IPFS',
                html:
                'IPFS Hash: ' + result.ipfsHash + '<br>' +
                'URL: <a href="' + result.ipfsUrl + '" target="_blank">' + result.ipfsUrl + '</a>'
            });
        } else {
            Swal.fire('Error', 'No se pudo generar el PDF', 'error');
        }
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        Swal.close();
        Swal.fire('Error', error.message, 'error');
    }
}