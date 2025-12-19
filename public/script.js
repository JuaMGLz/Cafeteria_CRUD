document.addEventListener('DOMContentLoaded', () => {
    actualizarInterfaz();
    
    configurarFormularios();

    document.getElementById('seccion-ventas').classList.add('activo');
});

function abrirTab(evt, tabId) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let content of tabContents) {
        content.classList.remove("active");
    }

    const tabBtns = document.getElementsByClassName("tab-btn");
    for (let btn of tabBtns) {
        btn.classList.remove("active");
    }

    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
}

async function actualizarInterfaz() {
    await cargarProductos();
    await cargarClientes();
    await cargarVentas();
}

async function cargarProductos() {
    const res = await fetch('/api/productos');
    const productos = await res.json();
    const tbody = document.querySelector('#tabla-productos tbody');
    const selectProd = document.getElementById('select-producto');
    
    tbody.innerHTML = '';
    selectProd.innerHTML = '<option value="">Selecciona un producto</option>';

    productos.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.descripcion || 'Sin descripción'}</td> 
                <td>$${p.precio}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicionProducto(${p.id}, '${p.nombre}', '${p.descripcion}', ${p.precio}, ${p.stock})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarDato('/api/productos', ${p.id})">Eliminar</button>
                </td>
            </tr>`;
        
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.dataset.precio = p.precio; 
        opt.dataset.stock = p.stock;
        opt.textContent = `${p.nombre} ($${p.precio})`;
        selectProd.appendChild(opt);
    });
}

async function cargarClientes() {
    const res = await fetch('/api/clientes');
    const clientes = await res.json();
    const tbody = document.querySelector('#tabla-clientes tbody');
    const selectCli = document.getElementById('select-cliente');
    
    tbody.innerHTML = '';
    selectCli.innerHTML = '<option value="">Selecciona un cliente</option>';

    clientes.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.id}</td>
                <td>${c.nombre}</td>
                <td>${c.email || 'N/A'}</td>
                <td>${c.telefono || 'Sin número'}</td> <td>
                    <button class="btn-editar" onclick="prepararEdicionCliente(${c.id}, '${c.nombre}', '${c.email}', '${c.telefono}')">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarDato('/api/clientes', ${c.id})">Eliminar</button>
                </td>
            </tr>`;
        
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nombre;
        selectCli.appendChild(opt);
    });
}

async function cargarVentas() {
    const res = await fetch('/api/ventas');
    const ventas = await res.json();
    const tbody = document.querySelector('#tabla-ventas tbody');
    tbody.innerHTML = '';

    ventas.forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td>${new Date(v.fecha).toLocaleString()}</td>
                <td>${v.cliente}</td>
                <td>${v.producto}</td>
                <td>$${v.total}</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicionVenta(${v.id}, ${v.cliente_id}, ${v.producto_id}, ${v.cantidad})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarDato('/api/ventas', ${v.id})">Eliminar</button>
                </td>
            </tr>`;
    });
}

function actualizarAvisoStock() {
    const selectProd = document.getElementById('select-producto');
    const aviso = document.getElementById('aviso-stock');
    
    if (selectProd && selectProd.selectedIndex !== -1) {
        const opcion = selectProd.options[selectProd.selectedIndex];
        if (opcion && opcion.value) {
            aviso.textContent = `Stock actual: ${opcion.dataset.stock} unidades.`;
            return;
        }
    }
    aviso.textContent = "";
}

function cambiarTab(evt, tabId) {
    const secciones = document.querySelectorAll('.contenido-tab');
    secciones.forEach(s => s.classList.remove('activo'));

    const botones = document.querySelectorAll('.boton-nav');
    botones.forEach(b => b.classList.remove('activo'));

    document.getElementById(tabId).classList.add('activo');
    evt.currentTarget.classList.add('activo');
}

function configurarFormularios() {
    document.getElementById('form-venta').addEventListener('submit', async (e) => {
    e.preventDefault();

    const vta_id = document.getElementById('vta_id').value; 
    const selectProd = document.getElementById('select-producto');
    const opcionSeleccionada = selectProd.options[selectProd.selectedIndex];
    
    const cliente_id = document.getElementById('select-cliente').value;
    const producto_id = selectProd.value;
    const cantidad = document.getElementById('vta_cantidad').value;
    
    const precio_unitario = opcionSeleccionada.dataset.precio;

    const datosVenta = {
        cliente_id,
        producto_id,
        cantidad,
        precio_unitario 
    };

    const metodo = vta_id ? 'PUT' : 'POST';
    const url = vta_id ? `/api/ventas/${vta_id}` : '/api/ventas';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosVenta)
        });

        if (respuesta.ok) {
            alert(vta_id ? 'Venta actualizada' : 'Venta creada');
            resetearFormVenta();
            await actualizarInterfaz();
        } else {
            const err = await respuesta.json();
            alert("Error: " + err.error);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
});

    document.getElementById('form-producto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('prod_id').value;
        const data = {
            nombre: document.getElementById('prod_nombre').value,
            descripcion: document.getElementById('prod_desc').value,
            precio: document.getElementById('prod_precio').value,
            stock: document.getElementById('prod_stock').value
        };

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `/api/productos/${id}` : '/api/productos';

        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert(id ? 'Producto actualizado' : 'Producto creado');
            resetearFormProducto();
            actualizarInterfaz();
        }
    });

    document.getElementById('form-cliente').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('cli_id').value;
        const data = {
            nombre: document.getElementById('cli_nombre').value,
            email: document.getElementById('cli_email').value,
            telefono: document.getElementById('cli_telefono').value
        };

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `/api/clientes/${id}` : '/api/clientes';

        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert(id ? 'Cliente actualizado' : 'Cliente registrado');
            resetearFormCliente();
            actualizarInterfaz();
        }
    });
}

function prepararEdicionVenta(id, clienteId, productoId, cantidad) {
    document.getElementById('vta_id').value = id;
    document.getElementById('vta_cantidad').value = cantidad;
    
    document.getElementById('select-cliente').value = clienteId;
    document.getElementById('select-producto').value = productoId;
    
    document.getElementById('btn-venta').textContent = "Actualizar Venta";
    document.getElementById('titulo-ventas').textContent = "Editando Venta ID: " + id;
    document.getElementById('btn-cancelar-vta').style.display = "inline-block";
    
    actualizarAvisoStock();
}

function resetearFormVenta() {
    document.getElementById('form-venta').reset();
    document.getElementById('vta_id').value = "";
    document.getElementById('btn-venta').textContent = "Procesar Venta";
    document.getElementById('titulo-ventas').textContent = "Nueva Venta";
    document.getElementById('btn-cancelar-vta').style.display = "none";
    document.getElementById('aviso-stock').textContent = "";
}

function prepararEdicionProducto(id, nombre, desc, precio, stock) {
    document.getElementById('prod_id').value = id;
    document.getElementById('prod_nombre').value = nombre;
    document.getElementById('prod_desc').value = desc;
    document.getElementById('prod_precio').value = precio;
    document.getElementById('prod_stock').value = stock;
    
    document.getElementById('titulo-form-producto').textContent = "Editando Producto";
    document.getElementById('btn-guardar-prod').textContent = "Actualizar Cambios";
    document.getElementById('btn-cancelar-prod').style.display = "inline-block";
}

function resetearFormProducto() {
    document.getElementById('form-producto').reset();
    document.getElementById('prod_id').value = "";
    document.getElementById('titulo-form-producto').textContent = "Registrar Producto";
    document.getElementById('btn-guardar-prod').textContent = "Guardar Producto";
    document.getElementById('btn-cancelar-prod').style.display = "none";
}

function prepararEdicionCliente(id, nombre, email, tel) {
    document.getElementById('cli_id').value = id;
    document.getElementById('cli_nombre').value = nombre;
    document.getElementById('cli_email').value = email;
    document.getElementById('cli_telefono').value = tel;

    document.getElementById('titulo-form-cliente').textContent = "Editando Cliente";
    document.getElementById('btn-guardar-cli').textContent = "Actualizar Datos";
    document.getElementById('btn-cancelar-cli').style.display = "inline-block";
}

function resetearFormCliente() {
    document.getElementById('form-cliente').reset();
    document.getElementById('cli_id').value = "";
    document.getElementById('titulo-form-cliente').textContent = "Registrar Cliente";
    document.getElementById('btn-guardar-cli').textContent = "Guardar Cliente";
    document.getElementById('btn-cancelar-cli').style.display = "none";
}

async function eliminarDato(url, id) {
    if (!confirm('¿Confirmas la eliminación permanente?')) return;

    const res = await fetch(`${url}/${id}`, { method: 'DELETE' });
    if (res.ok) {
        alert('Registro eliminado');
        actualizarInterfaz();
    } else {
        alert('Error: No se pudo eliminar (verifica integridad de datos)');
    }
}