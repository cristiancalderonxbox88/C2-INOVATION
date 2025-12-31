// Constantes
const TALLOS_POR_MALLA = 25;

// Estado de la aplicación
let trabajadores = [];
let historial = [];
let trabajadorSeleccionado = null;
let nextId = 1;

// Datos de ejemplo iniciales
const trabajadoresEjemplo = [
    { id: 1, nombre: "Carlos Rodríguez", rendimiento: 28.5, rendimiento_tallos: 28.5 * 25 },
    { id: 2, nombre: "Ana Martínez", rendimiento: 32.1, rendimiento_tallos: 32.1 * 25 },
    { id: 3, nombre: "Luis González", rendimiento: 25.8, rendimiento_tallos: 25.8 * 25 }
];

// Nombres para generación aleatoria
const nombres = ["Carlos", "Ana", "Luis", "María", "Pedro", "Laura", "José", "Sofía", "Miguel", "Elena"];
const apellidos = ["García", "Rodríguez", "Martínez", "López", "Sánchez", "Pérez", "Gómez", "Fernández", "Díaz", "Moreno"];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
    cargarDatosEjemplo();
    actualizarEstadisticas();
});

// Funciones de inicialización
function inicializarApp() {
    console.log("🔄 Inicializando aplicación...");
    
    // Configurar eventos de tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => cambiarTab(tab.dataset.tab));
    });

    // Configurar eventos de subtabs
    document.querySelectorAll('.subtab').forEach(subtab => {
        if (subtab.dataset.subtab) {
            subtab.addEventListener('click', () => cambiarSubtab(subtab.dataset.subtab));
        }
        if (subtab.dataset.analyticsTab) {
            subtab.addEventListener('click', () => cambiarAnalyticsTab(subtab.dataset.analyticsTab));
        }
    });

    // Configurar modo de cálculo
    document.querySelectorAll('input[name="modo"]').forEach(radio => {
        radio.addEventListener('change', cambiarModoCalculo);
    });

    // Configurar eventos de entrada
    document.getElementById('cantidad').addEventListener('input', actualizarConversion);
    document.getElementById('rendimiento-trabajador').addEventListener('input', actualizarConversionTrabajador);

    // Configurar botones
    document.getElementById('calcular-btn').addEventListener('click', calcularProduccion);
    document.getElementById('agregar-btn').addEventListener('click', agregarTrabajador);
    document.getElementById('aleatorio-btn').addEventListener('click', generarTrabajadorAleatorio);
    document.getElementById('eliminar-btn').addEventListener('click', eliminarTrabajador);
    document.getElementById('limpiar-historial').addEventListener('click', limpiarHistorial);

    // Inicializar gráfico
    inicializarGrafico();

    // Configurar modo inicial
    cambiarModoCalculo();
    
    // Configurar eventos de la tabla dinámicamente
    configurarEventosTabla();
    
    // Agregar botones de exportación
    agregarFuncionesImportExport();
    
    console.log("✅ Aplicación inicializada correctamente");
}

function configurarEventosTabla() {
    document.getElementById('trabajadores-body').addEventListener('change', function(event) {
        if (event.target.classList.contains('select-trabajador')) {
            manejarSeleccionTrabajador(event.target);
        }
    });
}

// Funciones de UI
function cambiarTab(tabId) {
    console.log(`Cambiando a tab: ${tabId}`);
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabId) {
            tab.classList.add('active');
        }
    });

    if (tabId === 'analytics') {
        actualizarAnalytics();
    }
}

function cambiarSubtab(subtabId) {
    document.querySelectorAll('.subtab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const subtabContent = document.getElementById(`${subtabId}-content`);
    if (subtabContent) {
        subtabContent.classList.add('active');
    }
    
    document.querySelectorAll('.subtab[data-subtab]').forEach(subtab => {
        subtab.classList.remove('active');
        if (subtab.dataset.subtab === subtabId) {
            subtab.classList.add('active');
        }
    });
}

function cambiarAnalyticsTab(tabId) {
    document.querySelectorAll('.analytics-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const analyticsContent = document.getElementById(`${tabId}-content`);
    if (analyticsContent) {
        analyticsContent.classList.add('active');
    }
    
    document.querySelectorAll('.subtab[data-analytics-tab]').forEach(subtab => {
        subtab.classList.remove('active');
        if (subtab.dataset.analyticsTab === tabId) {
            subtab.classList.add('active');
        }
    });
}

function cambiarModoCalculo() {
    const modo = document.querySelector('input[name="modo"]:checked').value;
    const label = document.getElementById('cantidad-label');
    const unidad = document.getElementById('unidad');
    
    if (modo === 'mallas') {
        label.innerHTML = '<i class="fas fa-hashtag"></i> Cantidad de Mallas a Producir:';
        unidad.textContent = 'MALLAS';
        actualizarStatus('✅ Sistema listo - Modo: MALLAS');
    } else {
        label.innerHTML = '<i class="fas fa-hashtag"></i> Cantidad de Tallos a Producir:';
        unidad.textContent = 'TALLOS';
        actualizarStatus('✅ Sistema listo - Modo: TALLOS');
    }
    
    actualizarConversion();
}

function actualizarConversion() {
    const modo = document.querySelector('input[name="modo"]:checked').value;
    const cantidadInput = document.getElementById('cantidad');
    const conversionDisplay = document.getElementById('conversion-display');
    
    try {
        const cantidad = parseFloat(cantidadInput.value) || 0;
        
        if (modo === 'mallas') {
            const tallos = cantidad * TALLOS_POR_MALLA;
            conversionDisplay.innerHTML = `Equivalente a: <strong>${tallos.toLocaleString()}</strong> TALLOS`;
        } else {
            const mallas = cantidad / TALLOS_POR_MALLA;
            conversionDisplay.innerHTML = `Equivalente a: <strong>${mallas.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong> MALLAS`;
        }
    } catch (error) {
        conversionDisplay.innerHTML = 'Error en la conversión';
    }
}

function actualizarConversionTrabajador() {
    const rendimientoInput = document.getElementById('rendimiento-trabajador');
    const conversionDisplay = document.getElementById('tallos-conversion');
    
    try {
        const rendimiento = parseFloat(rendimientoInput.value) || 0;
        const tallos = rendimiento * TALLOS_POR_MALLA;
        conversionDisplay.innerHTML = `Equivalente a: <strong>${tallos.toFixed(0)}</strong> tallos/hora`;
    } catch (error) {
        conversionDisplay.innerHTML = 'Error en el cálculo';
    }
}

// Funciones de trabajadores
function cargarDatosEjemplo() {
    console.log("📥 Cargando datos de ejemplo...");
    trabajadores = [...trabajadoresEjemplo];
    nextId = trabajadores.length > 0 ? Math.max(...trabajadores.map(t => t.id)) + 1 : 1;
    actualizarTablaTrabajadores();
    mostrarToast('✅ Datos de ejemplo cargados - 3 trabajadores agregados', 'success');
}

function agregarTrabajador() {
    console.log("🔄 Intentando agregar trabajador...");
    
    const nombreInput = document.getElementById('nombre-trabajador');
    const rendimientoInput = document.getElementById('rendimiento-trabajador');
    
    const nombre = nombreInput.value.trim();
    const rendimiento = parseFloat(rendimientoInput.value);
    
    console.log(`Datos ingresados: Nombre: "${nombre}", Rendimiento: ${rendimiento}`);
    
    if (!nombre) {
        mostrarToast('⚠️ Ingresa un nombre para el trabajador', 'warning');
        nombreInput.focus();
        return;
    }
    
    if (isNaN(rendimiento) || rendimiento <= 0) {
        mostrarToast('⚠️ El rendimiento debe ser mayor a 0', 'warning');
        rendimientoInput.focus();
        return;
    }
    
    const nuevoTrabajador = {
        id: nextId++,
        nombre: nombre,
        rendimiento: rendimiento,
        rendimiento_tallos: rendimiento * TALLOS_POR_MALLA,
        fechaRegistro: new Date().toLocaleString('es-ES')
    };
    
    console.log(`Nuevo trabajador creado:`, nuevoTrabajador);
    
    trabajadores.push(nuevoTrabajador);
    
    actualizarTablaTrabajadores();
    actualizarEstadisticas();
    
    nombreInput.value = '';
    rendimientoInput.value = '25.0';
    actualizarConversionTrabajador();
    
    mostrarToast(`✅ Trabajador '${nombre}' agregado - Rendimiento: ${rendimiento.toFixed(1)} mallas/hora`, 'success');
    actualizarStatus(`✅ Trabajador '${nombre}' agregado`);
    
    console.log(`✅ Total trabajadores: ${trabajadores.length}`);
}

function generarTrabajadorAleatorio() {
    const nombre = `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`;
    const rendimiento = parseFloat((Math.random() * 15 + 20).toFixed(1));
    
    document.getElementById('nombre-trabajador').value = nombre;
    document.getElementById('rendimiento-trabajador').value = rendimiento;
    actualizarConversionTrabajador();
    
    mostrarToast(`🎲 Datos aleatorios generados: ${nombre} - ${rendimiento} mallas/hora`, 'success');
}

function actualizarTablaTrabajadores() {
    console.log("🔄 Actualizando tabla de trabajadores...");
    
    const tbody = document.getElementById('trabajadores-body');
    const totalElement = document.getElementById('total-trabajadores');
    const eliminarBtn = document.getElementById('eliminar-btn');
    
    tbody.innerHTML = '';
    
    console.log(`Total de trabajadores a mostrar: ${trabajadores.length}`);
    
    trabajadores.forEach(trabajador => {
        const row = document.createElement('tr');
        row.dataset.id = trabajador.id;
        
        if (trabajadorSeleccionado === trabajador.id) {
            row.classList.add('selected');
        }
        
        row.innerHTML = `
            <td>${trabajador.id}</td>
            <td>${trabajador.nombre}</td>
            <td>${trabajador.rendimiento.toFixed(1)}</td>
            <td>${trabajador.rendimiento_tallos.toFixed(0)}</td>
            <td>
                <input type="checkbox" class="select-trabajador" data-id="${trabajador.id}"
                    ${trabajadorSeleccionado === trabajador.id ? 'checked' : ''}>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    totalElement.textContent = `${trabajadores.length} trabajador${trabajadores.length !== 1 ? 'es' : ''}`;
    eliminarBtn.disabled = trabajadorSeleccionado === null;
    
    console.log("✅ Tabla actualizada correctamente");
}

function manejarSeleccionTrabajador(checkbox) {
    const id = parseInt(checkbox.dataset.id);
    const isChecked = checkbox.checked;
    
    console.log(`Checkbox clickeado: ID=${id}, checked=${isChecked}`);
    
    if (isChecked) {
        document.querySelectorAll('.select-trabajador').forEach(cb => {
            if (cb !== checkbox) {
                cb.checked = false;
            }
        });
        
        trabajadorSeleccionado = id;
    } else {
        trabajadorSeleccionado = null;
    }
    
    actualizarTablaTrabajadores();
}

function eliminarTrabajador() {
    console.log(`🔄 Intentando eliminar trabajador ID: ${trabajadorSeleccionado}`);
    
    if (trabajadorSeleccionado === null) {
        mostrarToast('⚠️ Selecciona un trabajador para eliminar', 'warning');
        return;
    }
    
    const trabajador = trabajadores.find(t => t.id === trabajadorSeleccionado);
    if (!trabajador) {
        mostrarToast('❌ Error: Trabajador no encontrado', 'error');
        return;
    }
    
    const nombre = trabajador.nombre;
    
    if (!confirm(`¿Eliminar al trabajador '${nombre}'?`)) {
        return;
    }
    
    const index = trabajadores.findIndex(t => t.id === trabajadorSeleccionado);
    if (index !== -1) {
        trabajadores.splice(index, 1);
    }
    
    trabajadorSeleccionado = null;
    
    actualizarTablaTrabajadores();
    actualizarEstadisticas();
    
    mostrarToast(`✅ Trabajador '${nombre}' eliminado`, 'success');
    actualizarStatus(`✅ Trabajador '${nombre}' eliminado`);
    
    console.log(`✅ Trabajador eliminado. Total restante: ${trabajadores.length}`);
}

// Funciones de cálculo
function calcularProduccion() {
    console.log("🔄 Iniciando cálculo de producción...");
    
    if (trabajadores.length === 0) {
        mostrarToast('⚠️ Agrega al menos un trabajador primero', 'warning');
        cambiarTab('equipo');
        return;
    }
    
    try {
        const modo = document.querySelector('input[name="modo"]:checked').value;
        const cantidad = parseFloat(document.getElementById('cantidad').value);
        const horaInicio = document.getElementById('hora-inicio').value;
        const horasDia = parseFloat(document.getElementById('horas-dia').value);
        const costoHora = parseFloat(document.getElementById('costo-hora').value);
        
        console.log(`Parámetros: Modo=${modo}, Cantidad=${cantidad}, HoraInicio=${horaInicio}, HorasDia=${horasDia}, CostoHora=${costoHora}`);
        
        if (isNaN(cantidad) || cantidad <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
        }
        
        if (isNaN(horasDia) || horasDia <= 0) {
            throw new Error('Las horas por día deben ser mayores a 0');
        }
        
        if (isNaN(costoHora) || costoHora < 0) {
            throw new Error('El costo por hora debe ser un valor válido');
        }
        
        let mallasTotales, tallosTotales, modoText;
        
        if (modo === 'mallas') {
            mallasTotales = cantidad;
            tallosTotales = cantidad * TALLOS_POR_MALLA;
            modoText = 'MALLAS';
        } else {
            tallosTotales = cantidad;
            mallasTotales = cantidad / TALLOS_POR_MALLA;
            modoText = 'TALLOS';
        }
        
        const rendimientos = trabajadores.map(t => t.rendimiento);
        const rendimientoTotal = rendimientos.reduce((a, b) => a + b, 0);
        const rendimientoPromedio = rendimientoTotal / rendimientos.length;
        
        const horasTotales = mallasTotales / rendimientoTotal;
        
        let horaSalidaInfo = '';
        try {
            if (horaInicio && horaInicio.includes(':')) {
                const [horaStr, minutoStr] = horaInicio.split(':');
                const hora = parseInt(horaStr);
                const minuto = parseInt(minutoStr);
                
                if (hora >= 0 && hora <= 23 && minuto >= 0 && minuto <= 59) {
                    const hoy = new Date();
                    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), hora, minuto);
                    const fin = new Date(inicio.getTime() + horasTotales * 60 * 60 * 1000);
                    
                    const inicioStr = inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                    const finStr = fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                    const fechaFin = fin.toLocaleDateString('es-ES');
                    
                    const diasExtra = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
                    const diasInfo = diasExtra > 0 ? ` (+${diasExtra} día${diasExtra > 1 ? 's' : ''})` : '';
                    
                    horaSalidaInfo = `
   ⏰ HORARIOS ESTIMADOS:
   • Hora de inicio: ${inicioStr}
   • Hora de salida: ${finStr}${diasInfo}
   • Fecha de término: ${fechaFin}`;
                } else {
                    horaSalidaInfo = '\n   ⚠️  Hora de inicio inválida';
                }
            } else {
                horaSalidaInfo = '\n   ⚠️  No se especificó hora de inicio';
            }
        } catch (e) {
            horaSalidaInfo = `\n   ⚠️  Error calculando hora: ${e.message}`;
        }
        
        const costoTotal = horasTotales * costoHora * trabajadores.length;
        const costoPorMalla = costoTotal / mallasTotales;
        const costoPorTallo = costoTotal / tallosTotales;
        const costoPorHoraTotal = costoHora * trabajadores.length;
        
        let diasInfo;
        if (horasDia > 0) {
            const diasTotales = horasTotales / horasDia;
            const diasCompletos = Math.floor(diasTotales);
            const horasRestantes = (diasTotales - diasCompletos) * horasDia;
            
            if (diasCompletos > 0) {
                diasInfo = `${diasCompletos} día${diasCompletos !== 1 ? 's' : ''}`;
                if (horasRestantes > 0) {
                    diasInfo += ` + ${horasRestantes.toFixed(1)} horas`;
                }
            } else {
                diasInfo = `${horasTotales.toFixed(1)} horas (menos de un día)`;
            }
        } else {
            diasInfo = 'Horas por día no definidas';
        }
        
        const mallasPorDia = rendimientoTotal * horasDia;
        const tallosPorDia = rendimientoTotal * TALLOS_POR_MALLA * horasDia;
        
        const reporte = `
${'='.repeat(70)}
📊 REPORTE COMPLETO DE PRODUCCIÓN - ${modoText}
${'='.repeat(70)}

📦 PRODUCCIÓN SOLICITADA:
   • Cantidad en ${modoText.toLowerCase()}: ${cantidad.toLocaleString()}
   • Mallas totales: ${mallasTotales.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
   • Tallos totales: ${tallosTotales.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
   • Conversión: 1 Malla = ${TALLOS_POR_MALLA} Tallos

👥 EQUIPO DE TRABAJO:
   • Número de trabajadores: ${trabajadores.length}
   • Rendimiento total equipo: ${rendimientoTotal.toFixed(1)} mallas/hora
   • Rendimiento promedio: ${rendimientoPromedio.toFixed(1)} mallas/hora
   • Equivalente en tallos: ${(rendimientoTotal * TALLOS_POR_MALLA).toFixed(0)} tallos/hora

⏱️  TIEMPOS ESTIMADOS:
   • Horas totales necesarias: ${horasTotales.toFixed(2)} horas
   • Días laborales (${horasDia}h/día): ${diasInfo}${horaSalidaInfo}

💰 ANÁLISIS DE COSTOS:
   • Costo por hora por trabajador: $${costoHora.toFixed(2)}
   • Costo total por hora (equipo): $${costoPorHoraTotal.toFixed(2)}
   • Costo total estimado: $${costoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
   • Costo por malla: $${costoPorMalla.toFixed(4)}
   • Costo por tallo: $${costoPorTallo.toFixed(6)}

📈 PRODUCCIÓN DIARIA:
   • Mallas por día (${horasDia}h): ${mallasPorDia.toFixed(0)}
   • Tallos por día (${horasDia}h): ${tallosPorDia.toFixed(0)}
   • Días necesarios: ${(mallasTotales / mallasPorDia).toFixed(1)} días

🎯 EFICIENCIA:
   • Horas por 1000 mallas: ${(1000 / rendimientoTotal).toFixed(1)} horas
   • Mallas por hora por trabajador: ${rendimientoPromedio.toFixed(1)}
   • Tallos por hora por trabajador: ${(rendimientoPromedio * TALLOS_POR_MALLA).toFixed(0)}

${'='.repeat(70)}
✅ CÁLCULO COMPLETADO EXITOSAMENTE
${'='.repeat(70)}`;
        
        document.getElementById('detalles-text').textContent = reporte;
        document.getElementById('tiempo-total').textContent = horasTotales.toFixed(1);
        
        try {
            if (horaInicio && horaInicio.includes(':')) {
                const [horaStr, minutoStr] = horaInicio.split(':');
                const hoy = new Date();
                const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), parseInt(horaStr), parseInt(minutoStr));
                const fin = new Date(inicio.getTime() + horasTotales * 60 * 60 * 1000);
                document.getElementById('fecha-fin').textContent = fin.toLocaleDateString('es-ES') + '\n' + fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            } else {
                document.getElementById('fecha-fin').textContent = 'Sin hora inicio';
            }
        } catch (e) {
            document.getElementById('fecha-fin').textContent = 'Error cálculo';
        }
        
        document.getElementById('rendimiento-eq').textContent = rendimientoTotal.toFixed(1);
        document.getElementById('tallos-hora').textContent = (rendimientoTotal * TALLOS_POR_MALLA).toFixed(0);
        document.getElementById('mallas-dia').textContent = mallasPorDia.toFixed(0);
        document.getElementById('tallos-dia').textContent = tallosPorDia.toFixed(0);
        
        document.getElementById('costo-total').textContent = `$${costoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('costo-malla').textContent = `$${costoPorMalla.toFixed(4)}`;
        document.getElementById('costo-tallo').textContent = `$${costoPorTallo.toFixed(6)}`;
        document.getElementById('costo-hora-total').textContent = `$${costoPorHoraTotal.toFixed(2)}`;
        
        const registro = {
            timestamp: new Date().toLocaleString('es-ES'),
            modo: modo,
            cantidad: cantidad,
            mallas: mallasTotales,
            tallos: tallosTotales,
            trabajadores: trabajadores.length,
            horas: horasTotales,
            costo: costoTotal,
            costoPorMalla: costoPorMalla,
            costoPorTallo: costoPorTallo,
            horaInicio: horaInicio || 'No especificada',
            horasDia: horasDia
        };
        
        historial.unshift(registro);
        actualizarHistorial();
        actualizarAnalytics();
        
        mostrarToast(`✅ Cálculo completado - ${horasTotales.toFixed(1)} horas necesarias`, 'success');
        actualizarStatus(`✅ Cálculo completado - ${mallasTotales.toLocaleString('es-ES', { maximumFractionDigits: 0 })} mallas`);
        
        console.log("✅ Cálculo completado exitosamente");
        
    } catch (error) {
        console.error("❌ Error en el cálculo:", error);
        mostrarToast(`❌ Error: ${error.message}`, 'error');
        actualizarStatus('❌ Error en el cálculo');
    }
}

// Funciones de estadísticas
function actualizarEstadisticas() {
    console.log("🔄 Actualizando estadísticas...");
    
    const countElement = document.getElementById('stats-count');
    const promedioElement = document.getElementById('stats-promedio');
    const totalElement = document.getElementById('stats-total');
    const statusCount = document.getElementById('trabajadores-count');
    
    if (trabajadores.length > 0) {
        const rendimientos = trabajadores.map(t => t.rendimiento);
        const promedio = rendimientos.reduce((a, b) => a + b, 0) / rendimientos.length;
        const total = rendimientos.reduce((a, b) => a + b, 0);
        
        countElement.textContent = trabajadores.length;
        promedioElement.textContent = promedio.toFixed(1);
        totalElement.textContent = total.toFixed(1);
        statusCount.innerHTML = `<i class="fas fa-users"></i> Trabajadores: ${trabajadores.length}`;
    } else {
        countElement.textContent = '0';
        promedioElement.textContent = '0.0';
        totalElement.textContent = '0.0';
        statusCount.innerHTML = '<i class="fas fa-users"></i> Trabajadores: 0';
    }
    
    console.log(`✅ Estadísticas actualizadas: ${trabajadores.length} trabajadores`);
}

function actualizarAnalytics() {
    console.log("🔄 Actualizando analytics...");
    
    if (trabajadores.length === 0) {
        resetearAnalytics();
        return;
    }
    
    const rendimientos = trabajadores.map(t => t.rendimiento);
    
    const count = rendimientos.length;
    const total = rendimientos.reduce((a, b) => a + b, 0);
    const promedio = total / count;
    const maximo = Math.max(...rendimientos);
    const minimo = Math.min(...rendimientos);
    
    const sorted = [...rendimientos].sort((a, b) => a - b);
    const mediana = count % 2 === 0 
        ? (sorted[count/2 - 1] + sorted[count/2]) / 2 
        : sorted[Math.floor(count/2)];
    
    const variance = rendimientos.reduce((acc, val) => acc + Math.pow(val - promedio, 2), 0) / count;
    const stdev = Math.sqrt(variance);
    
    document.getElementById('analytics-count').textContent = count;
    document.getElementById('analytics-mean-mallas').textContent = promedio.toFixed(1);
    document.getElementById('analytics-mean-tallos').textContent = (promedio * TALLOS_POR_MALLA).toFixed(0);
    document.getElementById('analytics-total-mallas').textContent = total.toFixed(1);
    document.getElementById('analytics-total-tallos').textContent = (total * TALLOS_POR_MALLA).toFixed(0);
    document.getElementById('analytics-stdev').textContent = stdev.toFixed(1);
    document.getElementById('analytics-min').textContent = minimo.toFixed(1);
    document.getElementById('analytics-max').textContent = maximo.toFixed(1);
    document.getElementById('analytics-median').textContent = mediana.toFixed(1);
    
    actualizarDistribucion(rendimientos);
    actualizarGrafico(rendimientos);
    
    console.log("✅ Analytics actualizados");
}

function resetearAnalytics() {
    const metrics = [
        'analytics-count', 'analytics-mean-mallas', 'analytics-mean-tallos',
        'analytics-total-mallas', 'analytics-total-tallos', 'analytics-stdev',
        'analytics-min', 'analytics-max', 'analytics-median'
    ];
    
    metrics.forEach(id => {
        document.getElementById(id).textContent = '0';
    });
    
    document.getElementById('distribucion-text').innerHTML = '<p>No hay datos disponibles</p>';
}

function actualizarDistribucion(rendimientos) {
    const excelente = rendimientos.filter(r => r >= 30).length;
    const bueno = rendimientos.filter(r => r >= 25 && r < 30).length;
    const regular = rendimientos.filter(r => r >= 20 && r < 25).length;
    const bajo = rendimientos.filter(r => r < 20).length;
    
    const total = rendimientos.length;
    
    const html = `
        <div class="distribution-levels">
            <div class="level">
                <span class="level-label">🏆 Excelente (≥30 mallas/h)</span>
                <span class="level-value">${excelente} trabajadores (${total > 0 ? ((excelente/total)*100).toFixed(1) : 0}%)</span>
            </div>
            <div class="level">
                <span class="level-label">👍 Bueno (25-29 mallas/h)</span>
                <span class="level-value">${bueno} trabajadores (${total > 0 ? ((bueno/total)*100).toFixed(1) : 0}%)</span>
            </div>
            <div class="level">
                <span class="level-label">📊 Regular (20-24 mallas/h)</span>
                <span class="level-value">${regular} trabajadores (${total > 0 ? ((regular/total)*100).toFixed(1) : 0}%)</span>
            </div>
            <div class="level">
                <span class="level-label">⚠️  Bajo (<20 mallas/h)</span>
                <span class="level-value">${bajo} trabajadores (${total > 0 ? ((bajo/total)*100).toFixed(1) : 0}%)</span>
            </div>
        </div>
        <div class="distribution-summary">
            <p><strong>📈 RESUMEN:</strong></p>
            <p>• Total trabajadores: ${total}</p>
            <p>• Rango: ${Math.min(...rendimientos).toFixed(1)} - ${Math.max(...rendimientos).toFixed(1)} mallas/hora</p>
            <p>• Promedio: ${(rendimientos.reduce((a, b) => a + b, 0) / total).toFixed(1)} mallas/hora</p>
            <p>• Mediana: ${([...rendimientos].sort((a, b) => a - b)[Math.floor(total/2)] || 0).toFixed(1)} mallas/hora</p>
        </div>
    `;
    
    document.getElementById('distribucion-text').innerHTML = html;
}

function actualizarHistorial() {
    const historialText = document.getElementById('historial-text');
    
    if (historial.length === 0) {
        historialText.innerHTML = '<p>No hay cálculos en el historial</p>';
        return;
    }
    
    let html = '<div class="history-list">';
    
    historial.slice(0, 10).forEach((registro, index) => {
        html += `
            <div class="history-item">
                <div class="history-header">
                    <strong>${index + 1}. ${registro.timestamp}</strong>
                    <span class="history-modo">${registro.modo.toUpperCase()}</span>
                </div>
                <div class="history-details">
                    <p>• Mallas: ${registro.mallas.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</p>
                    <p>• Tallos: ${registro.tallos.toLocaleString('es-ES', { maximumFractionDigits: 0 })}</p>
                    <p>• Trabajadores: ${registro.trabajadores}</p>
                    <p>• Horas estimadas: ${registro.horas.toFixed(1)}</p>
                    <p>• Costo estimado: $${registro.costo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    historialText.innerHTML = html;
}

function limpiarHistorial() {
    if (historial.length === 0) {
        mostrarToast('ℹ️ El historial ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Eliminar todo el historial de cálculos?')) {
        historial = [];
        actualizarHistorial();
        mostrarToast('✅ Historial limpiado', 'success');
    }
}

// Funciones del gráfico
let distribucionChart = null;

function inicializarGrafico() {
    const ctx = document.getElementById('distribucion-chart');
    if (!ctx) {
        console.log("⚠️ No se encontró el canvas para el gráfico");
        return;
    }
    
    const ctx2d = ctx.getContext('2d');
    distribucionChart = new Chart(ctx2d, {
        type: 'bar',
        data: {
            labels: ['<20', '20-24', '25-29', '≥30'],
            datasets: [{
                label: 'Trabajadores',
                data: [0, 0, 0, 0],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(59, 130, 246, 0.7)'
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)',
                    'rgb(16, 185, 129)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribución de Rendimiento del Equipo',
                    color: '#e2e8f0',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    labels: {
                        color: '#e2e8f0'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        precision: 0
                    },
                    grid: {
                        color: '#415a77'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#415a77'
                    }
                }
            }
        }
    });
    
    console.log("✅ Gráfico inicializado");
}

function actualizarGrafico(rendimientos) {
    if (!distribucionChart) {
        console.log("⚠️ Gráfico no inicializado");
        return;
    }
    
    const bajo = rendimientos.filter(r => r < 20).length;
    const regular = rendimientos.filter(r => r >= 20 && r < 25).length;
    const bueno = rendimientos.filter(r => r >= 25 && r < 30).length;
    const excelente = rendimientos.filter(r => r >= 30).length;
    
    distribucionChart.data.datasets[0].data = [bajo, regular, bueno, excelente];
    distribucionChart.update();
    
    console.log(`✅ Gráfico actualizado: Bajo=${bajo}, Regular=${regular}, Bueno=${bueno}, Excelente=${excelente}`);
}

// ============================================
// NUEVAS FUNCIONES DE EXPORTACIÓN A EXCEL
// ============================================

function exportarExcel() {
    console.log("📊 Preparando exportación a Excel...");
    
    if (trabajadores.length === 0 && historial.length === 0) {
        mostrarToast('⚠️ No hay datos para exportar', 'warning');
        return;
    }
    
    try {
        // Crear un nuevo libro de trabajo
        const wb = XLSX.utils.book_new();
        const fechaActual = new Date().toISOString().split('T')[0];
        const horaActual = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        // Hoja 1: RESUMEN GENERAL
        const resumenData = [
            ["RESUMEN GENERAL - SISTEMA DE CÁLCULO DE PRODUCCIÓN"],
            ["Fecha de exportación:", fechaActual],
            ["Hora de exportación:", horaActual],
            [], // Fila vacía
            ["ESTADÍSTICAS DEL EQUIPO"],
            ["Total de trabajadores:", trabajadores.length],
            ["Rendimiento promedio:", trabajadores.length > 0 ? 
                (trabajadores.reduce((sum, t) => sum + t.rendimiento, 0) / trabajadores.length).toFixed(2) + " mallas/hora" : "0.00"],
            ["Rendimiento total:", trabajadores.reduce((sum, t) => sum + t.rendimiento, 0).toFixed(2) + " mallas/hora"],
            ["Conversión:", "1 Malla = " + TALLOS_POR_MALLA + " Tallos"],
            [], // Fila vacía
            ["ESTADÍSTICAS DE CÁLCULOS"],
            ["Total de cálculos en historial:", historial.length],
            ["Último cálculo:", historial.length > 0 ? historial[0].timestamp : "No hay cálculos"]
        ];
        
        const ws_resumen = XLSX.utils.aoa_to_sheet(resumenData);
        XLSX.utils.book_append_sheet(wb, ws_resumen, "Resumen General");
        
        // Hoja 2: TRABAJADORES
        if (trabajadores.length > 0) {
            const trabajadoresData = [
                ["REGISTRO DE TRABAJADORES"],
                ["Fecha de exportación:", fechaActual],
                [], // Fila vacía
                ["ID", "NOMBRE COMPLETO", "RENDIMIENTO (MALLAS/HORA)", "RENDIMIENTO (TALLOS/HORA)", "CATEGORÍA", "FECHA DE REGISTRO"],
                ...trabajadores.map(t => {
                    // Determinar categoría según rendimiento
                    let categoria = "";
                    let colorCategoria = "";
                    if (t.rendimiento >= 30) {
                        categoria = "EXCELENTE";
                        colorCategoria = "#4CAF50"; // Verde
                    } else if (t.rendimiento >= 25) {
                        categoria = "BUENO";
                        colorCategoria = "#8BC34A"; // Verde claro
                    } else if (t.rendimiento >= 20) {
                        categoria = "REGULAR";
                        colorCategoria = "#FFC107"; // Amarillo
                    } else {
                        categoria = "BAJO";
                        colorCategoria = "#F44336"; // Rojo
                    }
                    
                    return [
                        t.id,
                        t.nombre,
                        parseFloat(t.rendimiento.toFixed(2)),
                        parseFloat(t.rendimiento_tallos.toFixed(0)),
                        categoria,
                        t.fechaRegistro || fechaActual
                    ];
                }),
                [], // Fila vacía
                ["ESTADÍSTICAS"],
                ["Total trabajadores:", trabajadores.length],
                ["Promedio rendimiento:", 
                 (trabajadores.reduce((sum, t) => sum + t.rendimiento, 0) / trabajadores.length).toFixed(2)],
                ["Máximo rendimiento:", Math.max(...trabajadores.map(t => t.rendimiento)).toFixed(2)],
                ["Mínimo rendimiento:", Math.min(...trabajadores.map(t => t.rendimiento)).toFixed(2)],
                ["Rendimiento total:", trabajadores.reduce((sum, t) => sum + t.rendimiento, 0).toFixed(2)],
                ["Tallos totales/hora:", trabajadores.reduce((sum, t) => sum + t.rendimiento_tallos, 0).toFixed(0)]
            ];
            
            const ws_trabajadores = XLSX.utils.aoa_to_sheet(trabajadoresData);
            
            // Configurar anchos de columnas para mejor visualización
            const colWidths_trabajadores = [
                { wch: 8 },   // ID
                { wch: 30 },  // Nombre
                { wch: 20 },  // Rendimiento mallas
                { wch: 20 },  // Rendimiento tallos
                { wch: 15 },  // Categoría
                { wch: 20 }   // Fecha
            ];
            ws_trabajadores['!cols'] = colWidths_trabajadores;
            
            XLSX.utils.book_append_sheet(wb, ws_trabajadores, "Trabajadores");
        }
        
        // Hoja 3: HISTORIAL DE CÁLCULOS
        if (historial.length > 0) {
            const historialData = [
                ["HISTORIAL DE CÁLCULOS DE PRODUCCIÓN"],
                ["Fecha de exportación:", fechaActual],
                [], // Fila vacía
                ["N°", "FECHA Y HORA", "MODO", "CANTIDAD ORIGINAL", "MALLAS TOTALES", "TALLOS TOTALES", 
                 "TRABAJADORES", "HORAS ESTIMADAS", "HORAS POR DÍA", "HORA INICIO", "COSTO ESTIMADO", 
                 "COSTO POR MALLA", "COSTO POR TALLO"],
                ...historial.map((registro, index) => [
                    index + 1,
                    registro.timestamp,
                    registro.modo.toUpperCase(),
                    parseFloat(registro.cantidad.toFixed(2)),
                    parseFloat(registro.mallas.toFixed(0)),
                    parseFloat(registro.tallos.toFixed(0)),
                    registro.trabajadores,
                    parseFloat(registro.horas.toFixed(2)),
                    registro.horasDia || 8,
                    registro.horaInicio || "No especificada",
                    parseFloat(registro.costo.toFixed(2)),
                    parseFloat((registro.costo / registro.mallas).toFixed(4)),
                    parseFloat((registro.costo / registro.tallos).toFixed(6))
                ]),
                [], // Fila vacía
                ["TOTALES"],
                ["Total cálculos:", historial.length],
                ["Mallas totales calculadas:", historial.reduce((sum, r) => sum + r.mallas, 0).toLocaleString('es-ES')],
                ["Tallos totales calculados:", historial.reduce((sum, r) => sum + r.tallos, 0).toLocaleString('es-ES')],
                ["Horas totales estimadas:", historial.reduce((sum, r) => sum + r.horas, 0).toFixed(1)],
                ["Costo total estimado:", "$" + historial.reduce((sum, r) => sum + r.costo, 0).toFixed(2)]
            ];
            
            const ws_historial = XLSX.utils.aoa_to_sheet(historialData);
            
            const colWidths_historial = [
                { wch: 5 },   // N°
                { wch: 20 },  // Fecha
                { wch: 10 },  // Modo
                { wch: 15 },  // Cantidad
                { wch: 15 },  // Mallas
                { wch: 15 },  // Tallos
                { wch: 12 },  // Trabajadores
                { wch: 15 },  // Horas
                { wch: 12 },  // Horas/día
                { wch: 12 },  // Hora inicio
                { wch: 15 },  // Costo
                { wch: 15 },  // Costo/malla
                { wch: 15 }   // Costo/tallo
            ];
            ws_historial['!cols'] = colWidths_historial;
            
            XLSX.utils.book_append_sheet(wb, ws_historial, "Historial");
        }
        
        // Hoja 4: ANÁLISIS ESTADÍSTICO
        if (trabajadores.length > 0) {
            const rendimientos = trabajadores.map(t => t.rendimiento);
            const promedio = rendimientos.reduce((a, b) => a + b, 0) / rendimientos.length;
            
            const estadisticasData = [
                ["ANÁLISIS ESTADÍSTICO DEL EQUIPO"],
                ["Fecha de análisis:", fechaActual],
                [], // Fila vacía
                ["ESTADÍSTICAS DESCRIPTIVAS"],
                ["Métrica", "Valor", "Unidad"],
                ["Número de trabajadores", trabajadores.length, "personas"],
                ["Rendimiento promedio", promedio.toFixed(2), "mallas/hora"],
                ["Rendimiento total", rendimientos.reduce((a, b) => a + b, 0).toFixed(2), "mallas/hora"],
                ["Máximo rendimiento", Math.max(...rendimientos).toFixed(2), "mallas/hora"],
                ["Mínimo rendimiento", Math.min(...rendimientos).toFixed(2), "mallas/hora"],
                ["Rango", (Math.max(...rendimientos) - Math.min(...rendimientos)).toFixed(2), "mallas/hora"],
                [], // Fila vacía
                ["DISTRIBUCIÓN POR CATEGORÍAS"],
                ["Categoría", "Cantidad", "Porcentaje", "Rango (mallas/hora)"],
                ["Excelente", rendimientos.filter(r => r >= 30).length, 
                 ((rendimientos.filter(r => r >= 30).length / rendimientos.length) * 100).toFixed(1) + "%", "≥30"],
                ["Bueno", rendimientos.filter(r => r >= 25 && r < 30).length,
                 ((rendimientos.filter(r => r >= 25 && r < 30).length / rendimientos.length) * 100).toFixed(1) + "%", "25-29"],
                ["Regular", rendimientos.filter(r => r >= 20 && r < 25).length,
                 ((rendimientos.filter(r => r >= 20 && r < 25).length / rendimientos.length) * 100).toFixed(1) + "%", "20-24"],
                ["Bajo", rendimientos.filter(r => r < 20).length,
                 ((rendimientos.filter(r => r < 20).length / rendimientos.length) * 100).toFixed(1) + "%", "<20"],
                [], // Fila vacía
                ["CÁLCULOS DE EFICIENCIA"],
                ["Concepto", "Valor", "Fórmula"],
                ["Horas por 1000 mallas", (1000 / rendimientos.reduce((a, b) => a + b, 0)).toFixed(1), "1000 / RendimientoTotal"],
                ["Mallas por hora por persona", promedio.toFixed(1), "Promedio individual"],
                ["Tallos por hora por persona", (promedio * TALLOS_POR_MALLA).toFixed(0), "Promedio * 25"],
                ["Eficiencia relativa", ((promedio / 30) * 100).toFixed(1) + "%", "(Promedio / 30) * 100"]
            ];
            
            const ws_estadisticas = XLSX.utils.aoa_to_sheet(estadisticasData);
            
            const colWidths_estadisticas = [
                { wch: 30 },  // Métrica
                { wch: 15 },  // Valor
                { wch: 25 }   // Unidad/Fórmula
            ];
            ws_estadisticas['!cols'] = colWidths_estadisticas;
            
            XLSX.utils.book_append_sheet(wb, ws_estadisticas, "Análisis Estadístico");
        }
        
        // Generar nombre de archivo con fecha
        const fileName = `Produccion_Mallas_${fechaActual}_${horaActual.replace(/:/g, '-')}.xlsx`;
        
        // Exportar el archivo Excel
        XLSX.writeFile(wb, fileName);
        
        console.log(`✅ Archivo Excel exportado: ${fileName}`);
        mostrarToast(`✅ Archivo Excel exportado exitosamente: ${fileName}`, 'success');
        actualizarStatus(`✅ Excel exportado: ${fileName}`);
        
    } catch (error) {
        console.error("❌ Error al exportar a Excel:", error);
        mostrarToast(`❌ Error al exportar: ${error.message}`, 'error');
    }
}

// Función para exportar datos en JSON
function exportarJSON() {
    const datos = {
        trabajadores: trabajadores,
        historial: historial,
        configuracion: {
            tallosPorMalla: TALLOS_POR_MALLA,
            fechaExportacion: new Date().toISOString()
        },
        estadisticas: {
            totalTrabajadores: trabajadores.length,
            rendimientoPromedio: trabajadores.length > 0 ? 
                (trabajadores.reduce((sum, t) => sum + t.rendimiento, 0) / trabajadores.length).toFixed(2) : 0,
            totalCalculos: historial.length
        }
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mallascalc_datos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarToast('✅ Datos JSON exportados exitosamente', 'success');
}

// Función para cargar datos desde JSON
function cargarDatosJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            
            if (datos.trabajadores && Array.isArray(datos.trabajadores)) {
                trabajadores = datos.trabajadores;
                historial = datos.historial || [];
                nextId = trabajadores.length > 0 ? Math.max(...trabajadores.map(t => t.id)) + 1 : 1;
                
                actualizarTablaTrabajadores();
                actualizarEstadisticas();
                actualizarAnalytics();
                actualizarHistorial();
                
                mostrarToast('✅ Datos cargados exitosamente', 'success');
            } else {
                throw new Error('Formato de archivo inválido');
            }
        } catch (error) {
            mostrarToast(`❌ Error al cargar datos: ${error.message}`, 'error');
        }
    };
    reader.readAsText(file);
}

// Función para agregar botones de exportación
function agregarFuncionesImportExport() {
    const header = document.querySelector('.header');
    if (!header) {
        console.log("⚠️ No se encontró el header");
        return;
    }
    
    // Verificar si ya existen los botones
    if (document.getElementById('exportar-excel-btn')) {
        return;
    }
    
    const importExportDiv = document.createElement('div');
    importExportDiv.className = 'import-export';
    importExportDiv.innerHTML = `
        <button id="exportar-excel-btn" class="btn-excel" title="Exportar a Excel">
            <i class="fas fa-file-excel"></i> Excel
        </button>
        <button id="exportar-json-btn" class="btn-secondary" title="Exportar a JSON">
            <i class="fas fa-file-code"></i> JSON
        </button>
        <label for="importar-input" class="btn-secondary" title="Importar datos">
            <i class="fas fa-upload"></i> Importar
        </label>
        <input type="file" id="importar-input" accept=".json" style="display: none;">
    `;
    
    header.appendChild(importExportDiv);
    
    // Configurar eventos
    document.getElementById('exportar-excel-btn').addEventListener('click', exportarExcel);
    document.getElementById('exportar-json-btn').addEventListener('click', exportarJSON);
    document.getElementById('importar-input').addEventListener('change', cargarDatosJSON);
    
    console.log("✅ Botones de import/export agregados");
}

// Funciones de utilidad
function actualizarStatus(mensaje) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.innerHTML = `<i class="fas fa-check-circle"></i> ${mensaje}`;
    }
}

function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.log("⚠️ No se encontró el contenedor de toasts");
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    let icon = 'info-circle';
    if (tipo === 'success') icon = 'check-circle';
    if (tipo === 'error') icon = 'exclamation-circle';
    if (tipo === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${mensaje}</span>
    `;
    
    container.appendChild(toast);
    
    console.log(`📨 Toast mostrado: ${mensaje}`);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Estilos adicionales
const importExportStyles = `
.import-export {
    display: flex;
    gap: 10px;
    margin-left: auto;
    margin-right: 20px;
    align-items: center;
}

.import-export button,
.import-export label {
    padding: 8px 15px;
    font-size: 0.9rem;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.btn-excel {
    background: #217346;
    color: white;
}

.btn-excel:hover {
    background: #1a5c38;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(33, 115, 70, 0.3);
}

.btn-secondary {
    background: #415a77;
    color: white;
}

.btn-secondary:hover {
    background: #4ea8de;
    transform: translateY(-2px);
}

.history-item {
    background: #1b263b;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    border-left: 4px solid #4ea8de;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.history-modo {
    background: #4ea8de;
    color: white;
    padding: 3px 10px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: bold;
}

.history-details {
    font-size: 0.9rem;
    color: #94a3b8;
}

.history-details p {
    margin: 5px 0;
}

.distribution-levels {
    margin-bottom: 20px;
}

.level {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin: 5px 0;
    background: #0d1b2a;
    border-radius: 5px;
}

.level-label {
    display: flex;
    align-items: center;
    gap: 10px;
}

.level-value {
    font-weight: bold;
    color: #4ea8de;
}

.distribution-summary {
    background: #0d1b2a;
    padding: 15px;
    border-radius: 5px;
    margin-top: 20px;
}

.distribution-summary p {
    margin: 5px 0;
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

tr.selected {
    background-color: rgba(78, 168, 222, 0.2) !important;
}

tr.selected td {
    border-left: 3px solid #4ea8de;
}

.select-trabajador {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.select-trabajador:checked {
    accent-color: #4ea8de;
}
`;

// ============================================
// ESTILOS PARA IMPORT/EXPORT Y FOOTER
// ============================================

const styleSheet = document.createElement("style");
styleSheet.textContent = importExportStyles + `

/* ========== ESTILOS DEL FOOTER ========== */
.app-footer {
    background: rgba(13, 27, 42, 0.95);
    padding: 15px 20px;
    margin-top: 30px;
    border-top: 1px solid rgba(78, 168, 222, 0.3);
    width: 100%;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    color: #94a3b8;
    font-size: 0.9rem;
}

.author-info, .version-info, .copyright {
    display: flex;
    align-items: center;
    gap: 8px;
}

.author-info strong {
    color: #4ea8de;
    font-weight: 600;
}

.author-info i {
    color: #4ea8de;
}

.version-info i {
    color: #60a5fa;
}

.copyright i {
    color: #94a3b8;
}

/* Responsive para móviles */
@media (max-width: 768px) {
    .footer-content {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }
}
`;
document.head.appendChild(styleSheet);

// ============================================
// FUNCIÓN PARA AGREGAR AUTOR (FOOTER)
// ============================================

function agregarAutor() {
    console.log("👤 Agregando información del autor...");
    
    // ⬇️⬇️⬇️ REEMPLAZA ESTO CON TU NOMBRE ⬇️⬇️⬇️
    const nombreAutor = "Cristian Calderón VC"; // Ejemplo: "Carlos Rodríguez"
    
    // No crear múltiples footers
    if (document.querySelector('.app-footer')) {
        console.log("✅ Footer ya existe");
        return;
    }
    
    const footer = document.createElement('footer');
    footer.className = 'app-footer';
    
    const añoActual = new Date().getFullYear();
    
    footer.innerHTML = `
        <div class="footer-content">
            <div class="author-info">
                <i class="fas fa-code"></i>
                <span>Desarrollado por: <strong>${nombreAutor}</strong></span>
            </div>
            <div class="version-info">
                <i class="fas fa-calculator"></i>
                <span>Sistema de Producción v1.0</span>
            </div>
            <div class="copyright">
                <i class="fas fa-copyright"></i>
                <span>© ${añoActual}</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(footer);
    console.log(`✅ Autor '${nombreAutor}' agregado correctamente`);
}

// ============================================
// MODIFICAR LA FUNCIÓN inicializarApp
// ============================================

// ENCUENTRA la función inicializarApp() en tu código
// y AGREGA ESTA LÍNEA al final, justo antes del último console.log:

/*
function inicializarApp() {
    console.log("🔄 Inicializando aplicación...");
    
    // ... todo tu código existente ...
    
    // Inicializar gráfico
    inicializarGrafico();

    // Configurar modo inicial
    cambiarModoCalculo();
    
    // Configurar eventos de la tabla dinámicamente
    configurarEventosTabla();
    
    // Agregar botones de exportación
    agregarFuncionesImportExport();
    
    // ============ AGREGAR ESTA LÍNEA ============
    agregarAutor();
    // ============================================
    
    console.log("✅ Aplicación inicializada correctamente");
}*/

// ============================================
// LLAMAR A agregarAutor DESPUÉS DE TODO
// ============================================

// Esto asegura que se agregue incluso si hay errores en otras partes
setTimeout(() => {
    if (!document.querySelector('.app-footer')) {
        agregarAutor();
    }
}, 1000);

// ============================================
// FUNCIÓN DE DEPURACIÓN (mantener la que tenías)
// ============================================

window.debugApp = function() {
    console.log("=== DEBUG APP ===");
    console.log("Trabajadores:", trabajadores);
    console.log("Historial:", historial);
    console.log("Trabajador seleccionado:", trabajadorSeleccionado);
    console.log("Next ID:", nextId);
    console.log("=== FIN DEBUG ===");
};

console.log("🎉 Aplicación web lista para usar!");