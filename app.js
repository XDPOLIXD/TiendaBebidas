// Definir funciones al principio
function cargarProductos() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log(data)

            const agregarBotones = document.getElementsByClassName('agregar')
            for (const boton of agregarBotones) {
                boton.remove()
            }

            for (const producto of data) {
                agregarBotonProducto(producto)
            }
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error)
        })
}

function agregarBotonProducto(producto) {
    const boton = document.createElement('button')
    boton.textContent = `Agregar ${producto.nombre}`
    boton.dataset.producto = producto.nombre
    boton.dataset.precio = producto.precio
    boton.className = 'agregar'

    boton.addEventListener('click', (event) => { // Pasa el evento como argumento
        agregarProductoAlCarrito(producto.nombre, producto.precio, event) // Pasa el evento
    })

    document.body.appendChild(boton)
}

function agregarProductoAlCarrito(nombreProducto, precioProducto, evento) {
    const carrito = document.getElementById('carrito')
    const totalCarrito = document.getElementById('totalCarrito')
    const cantidadInput = document.getElementById(`cantidad${nombreProducto.replace(/\s+/g, '')}`)
    const cantidad = parseInt(cantidadInput.value)

    /* Eliminar productos previos con el mismo nombre */
    const productosAnteriores = document.querySelectorAll(`div[data-producto="${nombreProducto}"]`)
    productosAnteriores.forEach(productoAnterior => {
        carrito.removeChild(productoAnterior)
    })

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

    totalCarrito.textContent = total.toFixed(2)

    /* Mostrar una alerta de producto(s) agregado(s) al carrito solo si es un evento de clic */
    if (evento instanceof Event) {
        alert(`${cantidad} Agregado/s.`)
    }

    // Guardar la cantidad en el almacenamiento local
    const carritoGuardado = obtenerCarrito()
    carritoGuardado[nombreProducto] = cantidad
    guardarCarrito(carritoGuardado)

    // Restaurar la cantidad del producto desde el carrito guardado en el almacenamiento local
    const cantidadGuardada = carritoGuardado[nombreProducto] || 0
    if (cantidadGuardada) {
        cantidadInput.value = cantidadGuardada
    }
}


function obtenerCarrito() {
    const carritoGuardadoJSON = localStorage.getItem('carrito')
    return carritoGuardadoJSON ? JSON.parse(carritoGuardadoJSON) : {}
}

function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito))
}

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

    /* agregar un producto al carrito */
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('agregar')) {
            const nombreProducto = event.target.dataset.producto;
            const precioProducto = parseFloat(event.target.dataset.precio)
            agregarProductoAlCarrito(nombreProducto, precioProducto, event) // Pasamos el evento de clic
        }
    })

    /* mostrar la ventana modal del carrito */
    verCarrito.addEventListener('click', () => {
        modal.style.display = 'block'
    })

    /* cerrar la ventana modal del carrito */
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none'
    })

/* comprar los productos */
comprarBtn.addEventListener('click', () => {
    Swal.fire({
        position: 'center', // Centra la alerta en la pantalla
        icon: 'success',
        title: 'Gracias por tu compra',
        showConfirmButton: false,
        timer: 1500
    }).then(() => {
        modal.style.display = 'none'
        const carrito = document.getElementById('carrito')
        const totalCarrito = document.getElementById('totalCarrito')
        carrito.textContent = ''
        totalCarrito.textContent = '0'
        localStorage.removeItem('carrito')
    })
})

    /* vaciar el carrito */
    vaciarCarritoBtn.addEventListener('click', () => {
        const confirmacion = confirm('¿Estás seguro de que deseas vaciar el carrito?')
        if (confirmacion) {
            const carrito = document.getElementById('carrito')
            const totalCarrito = document.getElementById('totalCarrito')
            carrito.textContent = ''
            totalCarrito.textContent = '0'
            localStorage.removeItem('carrito')  // Eliminar el carrito del almacenamiento local
        }
    })
})
