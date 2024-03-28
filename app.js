// Definir funciones al principio
function cargarProductos() {
    fetch('data.json') // Hace una solicitud para obtener el archivo JSON que contiene los productos
        .then(response => response.json()) // Convierte la respuesta en formato JSON
        .then(data => { // Ejecuta esta función cuando la data esté disponible
            console.log(data) // Imprime los datos en la consola

            // Elimina todos los botones con la clase 'agregar' del DOM
            const agregarBotones = document.getElementsByClassName('agregar')
            for (const boton of agregarBotones) {
                boton.remove()
            }

            // Por cada producto en los datos, agrega un botón al DOM
            for (const producto of data) {
                agregarBotonProducto(producto)
            }
        })
        .catch(error => { // Captura cualquier error ocurrido durante la carga de los productos
            console.error('Error al cargar los productos:', error)
        })
}

function agregarBotonProducto(producto) {
    // Crea un nuevo botón en el DOM y configura sus atributos y eventos
    const boton = document.createElement('button')
    boton.textContent = `Agregar ${producto.nombre}`
    boton.dataset.producto = producto.nombre
    boton.dataset.precio = producto.precio
    boton.className = 'agregar'

    // Agrega un evento 'click' al botón para agregar el producto al carrito
    boton.addEventListener('click', (event) => { // Pasa el evento como argumento
        agregarProductoAlCarrito(producto.nombre, producto.precio, event) // Pasa el evento
    })

    // Agrega el botón al final del cuerpo del documento
    document.body.appendChild(boton)
}

function agregarProductoAlCarrito(nombreProducto, precioProducto, evento) {
    // Obtiene elementos del DOM relacionados con el carrito y el producto
    const carrito = document.getElementById('carrito')
    const totalCarrito = document.getElementById('totalCarrito')
    const cantidadInput = document.getElementById(`cantidad${nombreProducto.replace(/\s+/g, '')}`)
    const cantidad = parseInt(cantidadInput.value)

    /* Eliminar productos previos con el mismo nombre */
    const productosAnteriores = document.querySelectorAll(`div[data-producto="${nombreProducto}"]`)
    productosAnteriores.forEach(productoAnterior => {
        carrito.removeChild(productoAnterior)
    })

    // Crea un nuevo elemento de producto en el carrito y lo agrega al DOM
    const productoElement = document.createElement('div')
    productoElement.textContent = `${cantidad} x ${nombreProducto} - Precio total: $${(precioProducto * cantidad).toFixed(2)}`
    productoElement.dataset.producto = nombreProducto // Agregar un atributo de dataset con el nombre del producto
    carrito.appendChild(productoElement)

    /* Calcular el total del carrito desde cero */
    let total = 0
    const productosEnCarrito = carrito.querySelectorAll('div[data-producto]')
    productosEnCarrito.forEach(productoEnCarrito => {
        const cantidadProducto = parseInt(productoEnCarrito.textContent.split(' ')[0])
        const precioProducto = parseFloat(productoEnCarrito.textContent.split('$')[1])
        total += cantidadProducto * precioProducto
    })

    // Actualiza el total del carrito en el DOM
    totalCarrito.textContent = total.toFixed(2)

    /* Mostrar una alerta de producto(s) agregado(s) al carrito solo si es un evento de clic */
    if (evento instanceof Event) {
        alert(`${cantidad} Agregado/s.`)
    }

    // Guarda la cantidad en el almacenamiento local
    const carritoGuardado = obtenerCarrito()
    carritoGuardado[nombreProducto] = cantidad
    guardarCarrito(carritoGuardado)

    // Restaura la cantidad del producto desde el carrito guardado en el almacenamiento local
    const cantidadGuardada = carritoGuardado[nombreProducto] || 0
    if (cantidadGuardada) {
        cantidadInput.value = cantidadGuardada
    }
}

// Funciones para manejar el almacenamiento local del carrito
function obtenerCarrito() {
    const carritoGuardadoJSON = localStorage.getItem('carrito')
    return carritoGuardadoJSON ? JSON.parse(carritoGuardadoJSON) : {}
}

function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito))
}

// Evento que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    /* Obtener elementos del DOM */
    const modal = document.getElementById('modal')
    const closeModal = document.getElementsByClassName('close')[0]
    const verCarrito = document.getElementById('verCarrito')
    const comprarBtn = document.getElementById('comprar')
    const vaciarCarritoBtn = document.getElementById('vaciarCarrito')

    /* Cargar el carrito guardado desde el almacenamiento local */
    const carritoGuardado = obtenerCarrito()

    /* Agregar un producto al carrito desde el carrito guardado */
    for (const nombreProducto in carritoGuardado) {
        const cantidad = carritoGuardado[nombreProducto]
        const precioProducto = parseFloat(document.querySelector(`[data-producto="${nombreProducto}"]`).dataset.precio);
        agregarProductoAlCarrito(nombreProducto, precioProducto, null) // Pasamos null como evento
    }

    /* Agregar un producto al carrito cuando se hace clic en el documento */
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('agregar')) {
            const nombreProducto = event.target.dataset.producto;
            const precioProducto = parseFloat(event.target.dataset.precio)
            agregarProductoAlCarrito(nombreProducto, precioProducto, event) // Pasamos el evento de clic
        }
    })

    /* Mostrar la ventana modal del carrito */
    verCarrito.addEventListener('click', () => {
        modal.style.display = 'block'
    })

    /* Cerrar la ventana modal del carrito */
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none'
    })

    /* Comprar los productos */
    comprarBtn.addEventListener('click', () => {
        // Muestra una alerta de compra exitosa utilizando la librería SweetAlert2
        Swal.fire({
            position: 'center', // Centra la alerta en la pantalla
            icon: 'success',
            title: 'Gracias por tu compra',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            modal.style.display = 'none' // Oculta la ventana modal
            const carrito = document.getElementById('carrito')
            const totalCarrito = document.getElementById('totalCarrito')
            carrito.textContent = '' // Limpia el contenido del carrito en el DOM
            totalCarrito.textContent = '0' // Restablece el total del carrito en el DOM a cero
            localStorage.removeItem('carrito') // Elimina el carrito del almacenamiento local
        })
    })

    /* Vaciar el carrito */
    vaciarCarritoBtn.addEventListener('click', () => {
        // Pide confirmación antes de vaciar el carrito
        const confirmacion = confirm('¿Estás seguro de que deseas vaciar el carrito?')
        if (confirmacion) {
            const carrito = document.getElementById('carrito')
            const totalCarrito = document.getElementById('totalCarrito')
            carrito.textContent = '' // Limpia el contenido del carrito en el DOM
            totalCarrito.textContent = '0' // Restablece el total del carrito en el DOM a cero
            localStorage.removeItem('carrito') // Elimina el carrito del almacenamiento local
        }
    })
})
