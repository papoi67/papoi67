const Web3 = window.Web3;

let cuentaBlockchain = null;

let CONTRATO_ABI = null;
let CONTRATO_DIRECCION = null;

let NFT_ABI = null;
let NFT_DIRECCION = null; 


window.addEventListener(
    'load',
    async () => {
        await conectarMetaMask();
        buscarPrestamos();
        await cargarConfiguracionContrato();
        await cargarConfiguracionNFT();
    }
);

async function buscarPrestamos() {
    try {

        Swal.fire({
            title: 'Cargando préstamos',
            didOpen: () => Swal.showLoading()
        });

        const response = await axios.get('http://localhost:3000/prestamos');
        Swal.close();
        const prestamos = response.data;
        const tbody = document.getElementById('prestamosBody');

        tbody.innerHTML = '';

        prestamos.forEach(prestamo => {

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${prestamo.id}</td>
                <td>${prestamo.cliente_id}</td>
                <td>${prestamo.monto}</td>
                <td>${prestamo.plazo}</td>
                <td>${prestamo.interes}</td>
                <td>${prestamo.estado}</td>

                <td>
                    <button
                        class="btn btn-sm btn-outline-info"
                        onclick="editarPrestamo('${prestamo.id}')"
                    >
                        EDITAR
                    </button>

                    <button
                        class="btn btn-sm btn-outline-danger"
                        onclick="enviarBlockchain('${prestamo.id}')"
                    >
                        ENVIAR A BLOCKCHAIN
                    </button>

                    <button
                        class="btn btn-sm btn-outline-secondary"
                        onclick="validarBlockchain('${prestamo.id}')"
                    >
                        VALIDAR
                    </button>

                    <button class="btn btn-sm btn-outline-primary"
                    onclick="mintNFT('${prestamo.id}')">
                    MINT NFT
                    </button>

                    <button class="btn btn-sm btn-outline-success"
                    onclick="verificarNFT('${prestamo.id}')">
                    VERIFICAR NFT
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error al cargar los prestamos:', error);
        Swal.fire('Error', 'No se pudieron cargar los préstamos', 'error');
    }
}

function agregarPrestamo() {
    window.location.href = "prestamo-form.html";
}

function editarPrestamo(id) {
    window.location.href = "prestamo-form.html?id=" + id;
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
        const response = await axios.get('http://localhost:3000/prestamos/' + id);
        const prestamo = response.data;

        // Configuracion de web3 con Metamask
        const web3 = new Web3(window.ethereum);

        // Crear instancia del contrato
        const contrato = new web3.eth.Contract(CONTRATO_ABI, CONTRATO_DIRECCION);

        // Enviar transaccion al contrato
        const tx = await contrato.methods.createPrestamo(prestamo.id, prestamo.cliente_id, parseInt(prestamo.monto), prestamo.plazo, parseInt(prestamo.interes), prestamo.estado.toString())
                    .send({ from: cuentaBlockchain });

        console.log('Transacción enviada:', tx.transactionHash);

        // Guardar el hash de la transacción en el backend
        await axios.put('http://localhost:3000/prestamos/' + id + '/tx-hash',
            { txHash: tx.transactionHash }
        );

        Swal.close();
        Swal.fire('Éxito', 'Prestamo enviado a blockchain con hash: ' + tx.transactionHash, 'success');

    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

async function cargarConfiguracionContrato() {
    try {
        const response = await axios.get('http://localhost:3000/prestamos/contract/config');
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
        Swal.fire({ 
                    title: 'Validando en blockchain',
                    didOpen: () => { Swal.showLoading() } 
                });
        
        // LLamar al endpoint para validar la factura en blockchain
        const response = await axios.get(
                            'http://localhost:3000/prestamos/' + id + '/validar'
                        );
        
        const resultado = response.data;

        Swal.close();

        if (resultado.valid) {
            Swal.fire({
                icon : 'success',
                title: 'Prestamo válida en blockchain',
                html: `
                    <strong>Datos Blockchain:</strong><br>
                    ID: ${resultado.datosBlockchain.id}<br>
                    Cliente ID: ${resultado.datosBlockchain.cliente_id}<br>
                    Monto: ${resultado.datosBlockchain.monto}<br>
                    Plazo: ${resultado.datosBlockchain.plazo}<br>
                    Interés: ${resultado.datosBlockchain.interes}<br>
                    Estado: ${resultado.datosBlockchain.estado}<br>

                    <strong>Datos de Base de Datos:</strong><br>
                    ID: ${resultado.datosDB.id}<br>
                    Cliente ID: ${resultado.datosDB.cliente_id}<br>
                    Monto: ${resultado.datosDB.monto}<br>
                    Plazo: ${resultado.datosDB.plazo}<br>
                    Interés: ${resultado.datosDB.interes}<br>
                    Estado: ${resultado.datosDB.estado}<br>
                    Hash: ${resultado.datosDB.tx_hash_block}<br>
                `
            });
        }  else {
            Swal.fire({
                icon : 'error',
                title: 'Prestamo NO válida en blockchain',
                html: `
                    <strong>Datos Blockchain:</strong><br>
                    ID: ${resultado.datosBlockchain.id}<br>
                    Cliente ID: ${resultado.datosBlockchain.cliente_id}<br>
                    Monto: ${resultado.datosBlockchain.monto}<br>
                    Plazo: ${resultado.datosBlockchain.plazo}<br>
                    Interés: ${resultado.datosBlockchain.interes}<br>
                    Estado: ${resultado.datosBlockchain.estado}<br>

                    <strong>Datos de Base de Datos:</strong><br>
                    ID: ${resultado.datosDB.id}<br>
                    Cliente ID: ${resultado.datosDB.cliente_id}<br>
                    Monto: ${resultado.datosDB.monto}<br>
                    Plazo: ${resultado.datosDB.plazo}<br>
                    Interés: ${resultado.datosDB.interes}<br>
                    Estado: ${resultado.datosDB.estado}<br>
                    Hash: ${resultado.datosDB.tx_hash_block}<br>
                `
            });
        }                

        const validacion = response.data;

    } catch (error) {
        console.error('Error al validar en blockchain:', error);
        Swal.close();
        Swal.fire('Error', error.message, 'error');
    }
}

async function cargarConfiguracionNFT() {
    try {
        const response = await axios.get('http://localhost:3000/api/prestamos/nft/config');
        NFT_ABI = response.data.abi;
        NFT_DIRECCION = response.data.address;
        console.log('Configuración del NFT cargada:', NFT_DIRECCION);
    } catch (error) {
        console.error('Error al cargar la configuración del NFT:', error);
        Swal.fire('Error', 'No se pudo cargar la configuración del NFT.', 'error');
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
        Swal.fire({ title: 'Minteando NFT', didOpen: () => { Swal.showLoading() } });
        const response = await axios.get('http://localhost:3000/api/prestamos/' + id);
        const prestamo = response.data;

        // Configuracion de web3 con Metamask
        const web3 = new Web3(window.ethereum);

        // Crear instancia del contrato NFT
        const contratoNFT = new web3.eth.Contract(NFT_ABI, NFT_DIRECCION);

        // Generar hash del prestamos (puedes usar cualquier método para generar un hash único)
        const hash = web3.utils.soliditySha3(
            { t: 'uint', v: Number(prestamo.id) },
            { t: 'uint', v: Number(prestamo.cliente_id) },
            { t: 'uint', v: Number(prestamo.monto) },
            { t: 'uint', v: Number(prestamo.plazo) },
            { t: 'uint', v: Number(prestamo.interes) },
            { t: 'string', v: prestamo.estado }
        );

        // Enviar transaccion al contrato NFT
        const tx = await contratoNFT.methods.mintPrestamoNFT(
            prestamo.id,
            Number(prestamo.cliente_id),
            Number(prestamo.monto),
            Number(prestamo.plazo),
            Number(prestamo.interes),
            prestamo.estado.toString(),
            hash,
            cuentaBlockchain // La direccion que recibira el NFT
        ).send({ from: cuentaBlockchain });

        console.log('NFT minteado con exito:', tx.transactionHash);

        Swal.close();
        Swal.fire('Éxito', 'NFT minteado con hash de transacción: ' + tx.transactionHash, 'success');


    } catch (error) {
        console.error('Error al mintear el NFT:', error);
        Swal.close();
        Swal.fire('Error', error.message, 'error');
    }
}

async function verificarNFT(id) {
    try {
        Swal.fire({ title: 'Verificando NFT', didOpen: () => { Swal.showLoading() } });

        const response = await axios.get(`http://localhost:3000/api/prestamos/nft/verify-complete/${id}/${cuentaBlockchain}`);
        const result = response.data;
        Swal.close();

        if (result.hasNFT) {
            Swal.fire({
                icon: result.ownership.isOwner ? 'success' : 'warning',
                title: result.ownership.isOwner ? 'NFT encontrado (Te pertenece)' : 'NFT encontrado (No te pertenece)',
                html: `
                    <strong>Token ID:</strong> ${result.tokenId}<br>
                    <strong>Prestamo ID:</strong> ${result.metadata.prestamoId}<br> 
                    <strong>Cliente ID:</strong> ${result.metadata.clienteId}<br> 
                    <strong>Monto:</strong> ${result.metadata.monto}<br>
                    <strong>Plazo:</strong> ${result.metadata.plazo}<br> 
                    <strong>Interés:</strong> ${result.metadata.interes}<br>
                    <strong>Estado:</strong> ${result.metadata.estado}<br>  
                    <strong>Hash:</strong> ${result.metadata.hash}<br>
                    <strong>Fecha:</strong> ${new Date(result.metadata.timestamp * 1000).toLocaleString()}<br><br>

                    <strong>Propietario:</strong> ${result.ownership.owner}<br>
                    <strong>Tu Cuenta:</strong> ${cuentaBlockchain}<br>
                    <strong>Te pertenece:</strong> ${result.ownership.isOwner ? 'Sí' : 'No'}<br>


                `
            } );
        } else {
            Swal.fire('Información', 'No se encontró un NFT para esta factura.', 'info');
        }



    } catch (error) {
        console.error('Error al verificar el NFT:', error);
        Swal.close();
        Swal.fire('Error', error.message, 'error');
    }
}