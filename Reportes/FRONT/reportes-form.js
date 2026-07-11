let id = null;

window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  id = urlParams.get('id');
  if (id) buscarPorId(id);
});

function obtenerDatosFormulario() {
  return {
    estadoCuenta: document.getElementById('estadoCuenta').value,
    prestamosPendientes: Number(document.getElementById('prestamosPendientes').value),
    prestamosPagados: Number(document.getElementById('prestamosPagados').value),
    totalFinanciero: Number(document.getElementById('totalFinanciero').value).toFixed(2)
  };
}

function guardarReporte() {
  const reporte = obtenerDatosFormulario();
  const axiosConfig = { headers: { 'Content-Type': 'application/json' } };

  if (id) {
    axios.put('http://localhost:3000/api/reportes/' + id, reporte, axiosConfig)
      .then(() => cancelar())
      .catch(error => Swal.fire('Error', 'No se pudo actualizar el reporte: ' + error.message, 'error'));
  } else {
    axios.post('http://localhost:3000/api/reportes', reporte, axiosConfig)
      .then(() => cancelar())
      .catch(error => Swal.fire('Error', 'No se pudo guardar el reporte: ' + error.message, 'error'));
  }
}

function cancelar() {
  window.location.href = 'reportes.html';
}

function buscarPorId(id) {
  axios.get('http://localhost:3000/api/reportes/' + id)
    .then(response => {
      const reporte = response.data;
      document.getElementById('estadoCuenta').value = reporte.estado_cuenta;
      document.getElementById('prestamosPendientes').value = reporte.prestamos_pendientes;
      document.getElementById('prestamosPagados').value = reporte.prestamos_pagados;
      document.getElementById('totalFinanciero').value = reporte.total_financiero;
    })
    .catch(error => Swal.fire('Error', 'No se pudo cargar el reporte: ' + error.message, 'error'));
}
