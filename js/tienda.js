// Verificar si el usuario está autenticado
if (localStorage.getItem('autenticado') !== 'true') {
    alert('Debes iniciar sesión para acceder a esta página.');
    window.location.href = './cliente_login.html'; // Redirigir a la página de login
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function toggleModal() {
    const modal = document.getElementById('modalCerrarSesion');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function cerrarSesion() {
    localStorage.removeItem('autenticado');
    alert('Has cerrado sesión');
    window.location.href = './cliente_login.html'; // Redirigir a la página de login
}

// Funciones para manejar los productos y el carrito
let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function cargarProductos() {
    fetch('./json/productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo JSON');
            }
            return response.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                productos = data.map(producto => ({
                    ...producto,
                    precio: parseFloat(producto.precio),
                    cantidad: parseInt(producto.cantidad)
                }));
                mostrarProductos(); // Mostrar productos inicialmente
            } else {
                console.error('Formato de JSON incorrecto');
            }
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
        });
}

function filtrarProductos() {
    const busqueda = document.getElementById('busqueda').value.toLowerCase();
    const categoria = document.getElementById('categoria').value;
    const precioMaximo = parseFloat(document.getElementById('precio').value) || Infinity;

    const productosFiltrados = productos.filter(producto => {
        const nombreCoincide = producto.nombre.toLowerCase().includes(busqueda);
        const categoriaCoincide = categoria ? producto.categoria === categoria : true;
        const precioCoincide = producto.precio <= precioMaximo;

        return nombreCoincide && categoriaCoincide && precioCoincide;
    });

    mostrarProductos(productosFiltrados);
}

function mostrarProductos(listaProductos = productos) {
    const productosContainer = document.getElementById('productosContainer');
    productosContainer.innerHTML = '';

    // Filtrar productos para que solo se muestren los que tienen cantidad mayor a 0
    const productosVisibles = listaProductos.filter(producto => producto.cantidad > 0);

    productosVisibles.forEach((producto, index) => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.innerHTML = `
            <img src="./productos_img/${producto.imagen}" alt="${producto.nombre}">
            <div>
                <h3>${producto.nombre}</h3>
                <p><strong>Descripción:</strong> ${producto.descripcion}</p>
                <p><strong>Precio:</strong> ${producto.precio} $</p>
                <p><strong>Cantidad Disponible:</strong> ${producto.cantidad}</p>
                <button onclick="agregarAlCarrito(${index})">Agregar al Carrito</button>
            </div>
        `;
        productosContainer.appendChild(productoDiv);
    });
}

function agregarAlCarrito(index) {
    const producto = productos[index];
    const productoEnCarrito = carrito.find(p => p.nombre === producto.nombre);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += 1;
    } else {
        carrito.push({...producto, cantidad: 1});
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();
}

function mostrarCarrito() {
    const carritoList = document.getElementById('carritoList');
    const totalElement = document.getElementById('total');
    carritoList.innerHTML = '';

    let total = 0;

    carrito.forEach(item => {
        const itemLi = document.createElement('li');
        itemLi.innerHTML = `
            <img src="./productos_img/${item.imagen}" alt="${item.nombre}">
            <p>${item.nombre} - Cantidad: ${item.cantidad}</p>
            <p>$${(item.precio * item.cantidad).toFixed(2)}</p>
        `;
        carritoList.appendChild(itemLi);

        total += item.precio * item.cantidad;
    });

    totalElement.textContent = `Total: $${total.toFixed(2)}`;
}

function vaciarCarrito() {
    carrito = []; // Vaciar el array del carrito
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Actualizar en localStorage
    mostrarCarrito(); // Actualizar la vista del carrito
}

// Mostrar carrito al cargar la página
mostrarCarrito();

// Cargar productos al iniciar
cargarProductos();

function shinyLogo(){
    let logo = document.getElementById("logo")
    logo.classList.add("shiny")
};

function normalLogo(){
    let logo = document.getElementById("logo")
    logo.classList.remove("shiny")
    logo.classList.add("ynihs")
};

let logo = document.getElementById("logo")


// Funciones para abrir y cerrar el formulario de pago
function abrirFormularioPago() {
    document.getElementById('modalFormularioPago').style.display = 'block';
}

function cerrarFormularioPago() {
    document.getElementById('modalFormularioPago').style.display = 'none';
}

function procesarCompra(event) {
    event.preventDefault();

    // Reducir las cantidades de los productos en el carrito
    carrito.forEach(item => {
        const productoOriginal = productos.find(p => p.nombre === item.nombre);
        if (productoOriginal) {
            productoOriginal.cantidad -= item.cantidad;
        }
    });

    // Filtrar productos con cantidad mayor a 0 para la descarga
    const productosActualizados = productos.filter(producto => producto.cantidad > 0);

    // Vaciar el carrito
    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarCarrito();

    // Descargar el JSON actualizado sin productos con cantidad 0
    descargarJSON(productosActualizados, 'productos_actualizados.json');

    // Cerrar el formulario de pago
    cerrarFormularioPago();

    alert('Compra realizada con éxito!');
}

// Función para descargar un archivo JSON
function descargarJSON(objeto, nombreArchivo) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objeto));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", nombreArchivo);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}