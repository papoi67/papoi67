let id = null;
window. addEventListener('DOMContentLoaded', // Evento al cargar la pagina
    () => {
        const urlParams = new URLSearchParams (window. location. search) ;
        id = urlParams.get('id');
        if (id) {
            buscarPorId(id);
        }
    }
);

function guardarCliente() {

    const cliente = {
        dni: document.getElementById('dni').value,
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        correo: document.getElementById('correo').value,
        activo: document.getElementById('activo').value
    };

    const axiosConfig = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (id) {
        // Actualizar cliente
        axios.put(
            'http://localhost:3000/api/clientes/' + id,
            cliente,
            axiosConfig
        )
        .then(response => {
            cancelarCliente();
        })
        .catch(error => {
            Swal.fire(
                'Error',
                'No se pudo actualizar el cliente',
                'error'
            );
        });

    } else {
        // Nuevo cliente
        axios.post(
            'http://localhost:3000/api/clientes',
            cliente,
            axiosConfig
        )
        .then(response => {
            cancelarCliente();
        })
        .catch(error => {
            Swal.fire(
                'Error',
                'No se pudo guardar el cliente',
                'error'
            );
        });
    }
}



function cancelarCliente() {
    window.location.href = "clientes.html";
}



function buscarPorId(id) {
    axios.get('http://localhost:3000/api/clientes/' + id)
        .then(response => {
            const cliente = response.data;

            document.getElementById('dni').value = cliente.dni;
            document.getElementById('nombre').value = cliente.nombre;
            document.getElementById('telefono').value = cliente.telefono;
            document.getElementById('direccion').value = cliente.direccion;
            document.getElementById('correo').value = cliente.correo;
            document.getElementById('activo').value = cliente.activo;            
        })
        .catch(error => {
            console.error(error);

            Swal.fire(
                'Error',
                'No se pudo cargar el cliente por ID: ' + id,
                'error'
            );
        });
}