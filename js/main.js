// ============================================
// SISTEMA DE CONTROL DE FOLIOS - VERSIÓN PRUEBA
// Manejo de usuarios en localStorage
// ============================================

// ========== CONFIGURACIÓN Y DATOS INICIALES ==========

// Tipos de OFICIO y sus tablas independientes
const TIPOS_OFICIO = {
  oficio: 'oficios',
  memorandum: 'memorandums',
  circular: 'circulares',
  incidencias: 'incidencias',
  'memorandum_comision': 'memorandums_comision'
};

const NOMBRES_OFICIO = {
  oficios: 'Oficio',
  memorandums: 'Memorandum',
  circulares: 'Circular',
  incidencias: 'Incidencias',
  memorandums_comision: 'Memorandum Comisión'
};

// Roles del sistema (1-6)
const ROLES = {
  SUPER_ADMIN: 1,
  VISOR_GENERAL: 2,
  LIBERADOR_SUPERIOR: 3,
  LIBERADOR_DEPARTAMENTAL: 4,
  LIBERADOR_JUNIOR: 5,
  SOLICITANTE: 6
};

const NOMBRES_ROLES = {
  1: 'Super Administrador',
  2: 'Visor General',
  3: 'Liberador Superior',
  4: 'Liberador Departamental',
  5: 'Liberador Junior',
  6: 'Solicitante'
};

// ========== INICIALIZACIÓN DE DATOS DE PRUEBA ==========

function crearDatosPrueba() {
  const usuariosPrueba = {
    'user-superadmin': {
      id: 'user-superadmin',
      nombre: 'Admin General',
      numero_empleado: 'ADM-001',
      rol: ROLES.SUPER_ADMIN,
      area: 1,
      activo: true
    },
    'user-visor': {
      id: 'user-visor',
      nombre: 'Secretaria',
      numero_empleado: 'SEC-001',
      rol: ROLES.VISOR_GENERAL,
      area: 1,
      activo: true
    },
    'user-liberador-sup': {
      id: 'user-liberador-sup',
      nombre: 'Liberador Sup',
      numero_empleado: 'LS-001',
      rol: ROLES.LIBERADOR_SUPERIOR,
      area: 1,
      activo: true
    },
    'user-liberador-dept': {
      id: 'user-liberador-dept',
      nombre: 'Liberador Dept',
      numero_empleado: 'LD-001',
      rol: ROLES.LIBERADOR_DEPARTAMENTAL,
      area: 3,
      activo: true
    },
    'user-liberador-junior': {
      id: 'user-liberador-junior',
      nombre: 'Liberador Junior',
      numero_empleado: 'LJ-001',
      rol: ROLES.LIBERADOR_JUNIOR,
      area: 5,
      activo: true
    },
    'user-solicitante': {
      id: 'user-solicitante',
      nombre: 'Juan Pérez',
      numero_empleado: 'SOL-001',
      rol: ROLES.SOLICITANTE,
      area: 6,
      activo: true
    }
  };

  const oficiosData = {
    'oficios': [],
    'memorandums': [],
    'circulares': [],
    'incidencias': [],
    'memorandums_comision': []
  };

  const areasData = [
    { id: 1, nombre: 'Secretaría de la Dependencia', nombre_area: 'Secretaría de la Dependencia', sigla: 'SPyAP', nivel: 1, padre: null, activo: true },
    { id: 2, nombre: 'Subsecretaría de Planeación', nombre_area: 'Subsecretaría de Planeación', sigla: 'SS', nivel: 2, padre: 1, activo: true },
    { id: 3, nombre: 'Dirección de Administración', nombre_area: 'Dirección de Administración', sigla: 'DG', nivel: 3, padre: 1, activo: true },
    { id: 4, nombre: 'Jefatura de Recursos Humanos', nombre_area: 'Jefatura de Recursos Humanos', sigla: 'JD', nivel: 4, padre: 3, activo: true },
    { id: 5, nombre: 'Jefatura de Unidad de Informática', nombre_area: 'Jefatura de Unidad de Informática', sigla: 'JU', nivel: 5, padre: 3, activo: true },
    { id: 6, nombre: 'Área de Captura', nombre_area: 'Área de Captura', sigla: 'AR', nivel: 6, padre: 5, activo: true }
  ];

  function datosValidos(value, tipo) {
    try {
      const parsed = JSON.parse(localStorage.getItem(value));
      if (tipo === 'array') return Array.isArray(parsed);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed);
    } catch (e) {
      return false;
    }
  }

  if (!datosValidos('usuarios', 'object')) {
    localStorage.setItem('usuarios', JSON.stringify(usuariosPrueba));
  }
  if (!datosValidos('oficios', 'object')) {
    guardarOficios(oficiosData);
  }
  if (!datosValidos('areas', 'array')) {
    guardarAreas(areasData);
  }
}

crearDatosPrueba();

// ========== FUNCIONES DE AUTENTICACIÓN ==========

function login(numeroEmpleado, password) {
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};

  let usuarioEncontrado = null;
  for (const key of Object.keys(usuarios)) {
    const usuario = usuarios[key];
    if (usuario && usuario.numero_empleado === numeroEmpleado) {
      usuarioEncontrado = usuario;
      break;
    }
  }

  if (!usuarioEncontrado) {
    return { success: false, mensaje: 'Credenciales inválidas' };
  }

  if (usuarioEncontrado.activo === false) {
    return { success: false, mensaje: 'El usuario está desactivado. Contacte al administrador' };
  }

  // Normalizar área a id numérico (datos viejos podrían tener slug)
  let areaUsuario = usuarioEncontrado.area;
  if (typeof areaUsuario === 'string') {
    const areaPorSlug = getAreaIdBySlug(areaUsuario);
    if (areaPorSlug) areaUsuario = areaPorSlug;
  }

  const sessionData = {
    id: usuarioEncontrado.id,
    nombre: usuarioEncontrado.nombre,
    numero_empleado: usuarioEncontrado.numero_empleado,
    rol: usuarioEncontrado.rol,
    area: areaUsuario,
    loggedIn: true
  };

  localStorage.setItem('session', JSON.stringify(sessionData));
  return { success: true, session: sessionData };
}

function logout() {
  localStorage.removeItem('session');
  window.location.href = 'index.html';
}

function getSession() {
  return JSON.parse(localStorage.getItem('session')) || null;
}

function hasPermission(accion) {
  const session = getSession();
  if (!session) return false;

  const permisos = {
    [ROLES.SUPER_ADMIN]: ['todos'],
    [ROLES.VISOR_GENERAL]: ['consultar_oficios'],
    [ROLES.LIBERADOR_SUPERIOR]: ['liberar_oficio', 'ver_oficina'],
    [ROLES.LIBERADOR_DEPARTAMENTAL]: ['liberar_oficio', 'ver_departamento'],
    [ROLES.LIBERADOR_JUNIOR]: ['liberar_oficio', 'ver_areas'],
    [ROLES.SOLICITANTE]: ['solicitar_oficio', 'mis_oficios']
  };

  const rolPermisos = permisos[session.rol] || [];
  return rolPermisos.includes('todos') || rolPermisos.includes(accion);
}

function getRolName(idRol) {
  return nombreRol(idRol);
}

// ========== UTILIDADES DE ÁREAS ==========

function getAreas() {
  try {
    const data = JSON.parse(localStorage.getItem('areas'));
    if (Array.isArray(data)) {
      return data.filter(a => a && typeof a === 'object' && a.id !== null && a.id !== undefined);
    }
  } catch (e) { /* dato corrupto: devolver vacío para repararlo abajo */ }
  return [];
}

function getSiglaArea(areaRef) {
  // Acepta sigla o id de área; devuelve null si no existe
  const areas = getAreas();
  const area = areas.find(a => a.sigla === areaRef) ||
               areas.find(a => String(a.id) === String(areaRef));
  return area ? area.sigla : null;
}

function getAreaIdBySigla(sigla) {
  const areas = getAreas();
  const area = areas.find(a => a.sigla === sigla);
  return area ? area.id : 1;
}

function getAreaIdBySlug(slug) {
  // Mapas inversos (slug estático → id) por compatibilidad con datos viejos
  const slugToId = {
    'secretaria': 1,
    'subsecretaria': 2,
    'direccion': 3,
    'jefatura': 4,
    'jefatura_unidad': 5,
    'area': 6
  };
  return slugToId[slug] || null;
}

function getSiglaByAreaId(id) {
  const area = getAreaById(id);
  return area ? area.sigla : null;
}

function getAreaById(id) {
  const areas = getAreas();
  return areas.find(a => a.id === Number(id)) || null;
}

function getAreaNameById(id) {
  const area = getAreaById(id);
  return area ? area.nombre_area || area.nombre : 'N/A';
}

function guardarAreas(areas) {
  localStorage.setItem('areas', JSON.stringify(areas));
}

function guardarUsuarios(usuarios) {
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function getUsuarios() {
  try {
    const data = JSON.parse(localStorage.getItem('usuarios'));
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const limpio = {};
      Object.keys(data).forEach(k => {
        if (data[k] && typeof data[k] === 'object') limpio[k] = data[k];
      });
      return limpio;
    }
  } catch (e) { /* dato corrupto */ }
  return {};
}

function guardarOficios(tablas) {
  localStorage.setItem('oficios', JSON.stringify(tablas));
}

function getOficios() {
  try {
    const data = JSON.parse(localStorage.getItem('oficios'));
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const limpio = {};
      Object.keys(data).forEach(k => {
        limpio[k] = Array.isArray(data[k]) ? data[k] : [];
      });
      return limpio;
    }
  } catch (e) { /* dato corrupto */ }
  return {};
}

function generarNextAreaId() {
  const areas = getAreas();
  return areas.reduce((max, a) => Math.max(max, a.id || 0), 0) + 1;
}

function generarNextUserId() {
  const usuarios = getUsuarios();
  const keys = Object.keys(usuarios);
  return keys.reduce((max, k) => {
    const n = parseInt((k.match(/(\d+)$/) || [0, 0])[1], 10);
    return Math.max(max, n || 0);
  }, 0) + 1;
}

function areaExistsBySigla(sigla, exceptId) {
  return getAreas().some(a => a.sigla === sigla && (exceptId == null || String(a.id) !== String(exceptId)));
}

function empleadoExists(numeroEmpleado, exceptId) {
  return Object.values(getUsuarios()).some(u =>
    u.numero_empleado === numeroEmpleado && (exceptId == null || String(u.id) !== String(exceptId))
  );
}

function escapeHtml(texto) {
  return String(texto == null ? '' : texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Escapa para cadenas literal dentro de atributos onclick="..." (contexto JS)
function escapeJs(texto) {
  return String(texto == null ? '' : texto)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

// ========== GENERACIÓN AUTOMÁTICA DE FOLIOS ==========

/**
 * Siguiente número secuencial de una tabla. No reutiliza folios cancelados:
 * se incluyen en el máximo para evitar que un folio cancelado se vuelva a emitir.
 * @param {string} tabla - clave en TIPOS_OFICIO (ej. 'oficios')
 * @returns {number} siguiente número disponible
 */
function siguienteNumeroFolio(tabla) {
  const tablas = getOficios();
  const datosTabla = tablas[tabla] || [];
  const anioActual = new Date().getFullYear();

  let maxAnio = 0;
  let maxHistorico = 0;
  datosTabla.forEach(f => {
    const match = (f.folio || '').match(/\/(\d+)\/(\d+)$/);
    if (!match) return;
    const num = parseInt(match[1], 10);
    const anioFolio = parseInt(match[2], 10);
    if (anioFolio === anioActual && num > maxAnio) maxAnio = num;
    if (num > maxHistorico) maxHistorico = num;
  });

  if (maxAnio > 0) return maxAnio + 1;
  return maxHistorico + 1;
}

/**
 * Genera un folio automáticamente siguiendo la nomenclatura: SIGLA/NUMERO/AÑO
 * @param {string} tipoOficio - 'oficio', 'memorandum', 'circular', 'incidencias', 'memorandum_comision'
 * @param {string} areaSigla - sigla del área
 * @returns {string} folio generado o null si no puede
 */
function generarFolioAutomatico(tipoOficio, areaSigla) {
  const anio = new Date().getFullYear();
  const tabla = TIPOS_OFICIO[tipoOficio];
  if (!tabla) return null;

  const sigla = getSiglaArea(areaSigla);
  if (!sigla) return null;
  const siguienteNumero = siguienteNumeroFolio(tabla);
  return `${sigla}/${String(siguienteNumero).padStart(3, '0')}/${anio}`;
}

// ========== RUTEO DE DASHBOARDS ==========

function getDashboardByRol(rol) {
  const rutas = {
    [ROLES.SUPER_ADMIN]: 'dashboard-admin.html',
    [ROLES.VISOR_GENERAL]: 'dashboard-visor-general.html',
    [ROLES.LIBERADOR_SUPERIOR]: 'dashboard-liberador-superior.html',
    [ROLES.LIBERADOR_DEPARTAMENTAL]: 'dashboard-liberador-departamental.html',
    [ROLES.LIBERADOR_JUNIOR]: 'dashboard-liberador-junior.html',
    [ROLES.SOLICITANTE]: 'dashboard-solicitante.html'
  };
  return rutas[rol] || 'index.html';
}

// ========== UTILIDADES DE UI ==========

const TOAST_CONFIG = {
  success: {
    gradiente: 'linear-gradient(135deg, #c90166 0%, #ae192d 100%)',
    icono: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
  },
  danger: {
    gradiente: 'linear-gradient(135deg, #ae192d 0%, #6e0a1a 100%)',
    icono: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  },
  warning: {
    gradiente: 'linear-gradient(135deg, #f4a259 0%, #e08a2e 100%)',
    icono: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>'
  },
  info: {
    gradiente: 'linear-gradient(135deg, #2f7ee7 0%, #125ac9 100%)',
    icono: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
  }
};

const TOAST_DURACION = {
  success: 3200,
  danger: 5200,
  warning: 5200,
  info: 3600
};

function showToast(mensaje, tipo = 'info') {
  const conf = TOAST_CONFIG[tipo] || TOAST_CONFIG.info;
  const toasts = document.getElementById('toast-container') || createToastContainer();
  const duracion = TOAST_DURACION[tipo] || TOAST_DURACION.info;

  const toast = document.createElement('div');
  toast.className = `cd-toast cd-toast--${tipo}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.style.setProperty('--duracion', duracion + 'ms');
  toast.style.setProperty('--toast-gradiente', conf.gradiente);
  toast.innerHTML = `
    <span class="cd-toast__icon">${conf.icono}</span>
    <span class="cd-toast__texto">${escapeHtml(mensaje)}</span>
    <button type="button" class="cd-toast__cerrar" aria-label="Cerrar">&times;</button>
    <span class="cd-toast__barra"></span>
  `;

  toasts.appendChild(toast);

  const cerrar = () => {
    toast.classList.add('cd-toast--saliendo');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400);
  };

  toast.querySelector('.cd-toast__cerrar').addEventListener('click', cerrar);

  requestAnimationFrame(() => toast.classList.add('cd-toast--visible'));
  setTimeout(cerrar, duracion);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// ========== CALENDARIO DE FOLIOS ==========

// Helpers de fecha LOCAL (evitan el desplazamiento UTC de toISOString)
function aFechaLocal(fecha) {
  if (!fecha) return '';
  const texto = String(fecha).trim();
  const partes = texto.slice(0, 10).split('-').map(Number);
  if (partes.length === 3 && !isNaN(partes[0]) && !isNaN(partes[1]) && !isNaN(partes[2])) {
    return partes[0] + '-' + String(partes[1]).padStart(2, '0') + '-' + String(partes[2]).padStart(2, '0');
  }
  const d = new Date(texto);
  if (isNaN(d.getTime())) return '';
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function fechaHoyLocal() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function presentarFecha(fecha, opciones) {
  const local = aFechaLocal(fecha);
  if (!local) return 'N/A';
  const partes = local.split('-').map(Number);
  return new Date(partes[0], partes[1] - 1, partes[2]).toLocaleDateString('es-MX', opciones || { day: 'numeric', month: 'long', year: 'numeric' });
}

// Resuelve el solicitante de un folio desde un texto (nombre o no. de empleado)
function resolverSolicitante(texto, session) {
  const txt = (texto || '').trim();
  if (txt) {
    const usuarios = getUsuarios();
    for (const k of Object.keys(usuarios)) {
      const u = usuarios[k];
      if (u && u.numero_empleado === txt) {
        return { id: u.id, nombre: u.nombre || txt };
      }
    }
    return { id: session ? session.id : null, nombre: txt };
  }
  return { id: session ? session.id : null, nombre: session ? session.nombre : '' };
}

// Texto de rol · área para la barra superior
function descAreaUsuario(session) {
  if (!session) return '';
  const rol = NOMBRES_ROLES[session.rol] || 'Desconocido';
  const area = session.area != null ? getAreaNameById(session.area) : '';
  return area ? rol + ' · ' + area : rol;
}

function nombreRol(idRol) {
  return NOMBRES_ROLES[idRol] || 'Desconocido';
}

function pintarUsuario(session) {
  const iniciales = (session.nombre || '?').split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
  document.getElementById('avatar-iniciales').textContent = iniciales;
  document.getElementById('nombre-usuario').textContent = session.nombre + ' (' + session.numero_empleado + ')';
  document.getElementById('area-usuario').textContent = descAreaUsuario(session);
  document.getElementById('rol-badge').textContent = nombreRol(session.rol);
  document.getElementById('rol-badge').className = 'rol-badge rol-' + session.rol;
}

function badgeEstatus(estatus) {
  if (estatus === 'Pendiente') return '<span class="badge-status badge-pendiente">Pendiente</span>';
  if (estatus === 'Liberado') return '<span class="badge-status badge-liberado">Liberado</span>';
  if (estatus === 'Cancelado') return '<span class="badge-status badge-cancelado">Cancelado</span>';
  return `<span class="badge bg-secondary text-capitalize">${estatus || 'N/A'}</span>`;
}

function cerrarSesion() {
  logout();
}

// Guarda de arranque de dashboard: valida sesión y permiso (u rol) antes de renderizar.
// Devuelve la sesión o null (redirige al login o al dashboard permitido).
function sesionVigente(opciones) {
  const session = getSession();
  if (!session) {
    window.location.href = 'index.html';
    return null;
  }
  const sinAcceso = opciones.rol != null
    ? Number(session.rol) !== Number(opciones.rol)
    : !hasPermission(opciones.permiso);
  if (sinAcceso) {
    showToast(opciones.mensaje || 'No tiene permiso', 'danger');
    window.location.href = getDashboardByRol(session.rol);
    return null;
  }
  return session;
}

// Llena un <select> con las áreas activas, opcionalmente acotadas por nivel de jerarquía
function llenarSelectAreas(selectId, nivelMin, nivelMax) {
  const select = document.getElementById(selectId);
  if (!select) return;
  getAreas().forEach(area => {
    if (area.activo === false) return;
    if (nivelMin != null && area.nivel < nivelMin) return;
    if (nivelMax != null && area.nivel > nivelMax) return;
    const option = document.createElement('option');
    option.value = area.sigla;
    option.textContent = area.nombre_area + ' (' + area.sigla + ')';
    select.appendChild(option);
  });
}

// Registra un folio liberado directamente (roles liberadores)
function liberarOficio(tipo, areaSigla, asunto, fechaDoc, session, idSolicitanteInput) {
  if (!areaSigla) return null;
  const folio = generarFolioAutomatico(tipo, areaSigla);
  if (!folio) return null;

  const tabla = TIPOS_OFICIO[tipo];
  const tablas = getOficios();
  if (!tablas[tabla]) tablas[tabla] = [];

  const solicitante = resolverSolicitante(document.getElementById(idSolicitanteInput).value, session);
  tablas[tabla].push({
    folio: folio,
    tipo_oficio: tipo,
    id_area: getAreaIdBySigla(areaSigla),
    asunto: asunto,
    fecha_documento: fechaDoc,
    fecha_solicitud: new Date().toISOString(),
    id_usuario_solicitante: solicitante.id,
    nombre_solicitante: solicitante.nombre,
    id_usuario_liberador: session.id,
    estatus: 'Liberado',
    anio: new Date().getFullYear()
  });
  guardarOficios(tablas);
  return folio;
}

const TODAS_LAS_TABLAS = Object.keys(TIPOS_OFICIO).map(function (tipo) { return TIPOS_OFICIO[tipo]; });

const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const NOMBRES_DIAS_CALENDARIO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

let calendarioFolios = { anio: new Date().getFullYear(), mes: new Date().getMonth() };
let calendarioPorDia = {};
// Límites de navegación del calendario (años 2000-2100)
const ANIO_CAL_MIN = 2000;
const ANIO_CAL_MAX = 2100;

function obtenerFoliosFiltradosCalendario() {
  const session = getSession();
  if (!session) return [];
  // rol puede venir como string o número según origen de los datos
  const esSuperAdmin = Number(session.rol) === Number(ROLES.SUPER_ADMIN);
  const esVisorGeneral = Number(session.rol) === Number(ROLES.VISOR_GENERAL);
  const oficios = getOficios();
  const registros = [];
  Object.keys(oficios).forEach(tabla => {
    (oficios[tabla] || []).forEach(f => {
      const esPropio = String(f.id_usuario_solicitante) === String(session.id);
      const esLiberador = String(f.id_usuario_liberador || '') === String(session.id);
      if (esSuperAdmin || esVisorGeneral || esPropio || esLiberador) {
        registros.push({ tabla: tabla, f: f });
      }
    });
  });
  return registros;
}

function contarFoliosPorDia(registros) {
  const porDia = {};
  registros.forEach(({ tabla, f }) => {
    if (!f.fecha_solicitud) return;
    const clave = aFechaLocal(f.fecha_solicitud);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(clave)) return;
    const partes = clave.split('-').map(Number);
    const d = new Date(partes[0], partes[1] - 1, partes[2]);
    if (isNaN(d.getTime()) || d.getDate() !== partes[2]) return;
    if (!porDia[clave]) porDia[clave] = {};
    porDia[clave][tabla] = (porDia[clave][tabla] || 0) + 1;
  });
  return porDia;
}

function totalDia(conteo) {
  return Object.values(conteo).reduce((a, b) => a + b, 0);
}

function colorCalendario(total, maxDia) {
  const max = Math.max(maxDia, 1);
  const r = Math.max(0, Math.min(1, total / max));
  const hue = 28 - r * 28;
  const sat = 50 + r * 35;
  const lig = 88 - r * 43;
  return 'hsl(' + hue + ', ' + sat + '%, ' + lig + '%)';
}

function renderCalendarioFolios(contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const anio = calendarioFolios.anio;
  const mes = calendarioFolios.mes;
  const primerDia = new Date(anio, mes, 1);
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const offset = primerDia.getDay();

  calendarioPorDia = contarFoliosPorDia(obtenerFoliosFiltradosCalendario());

  let maxDia = 0;
  Object.values(calendarioPorDia).forEach(c => {
    const t = totalDia(c);
    if (t > maxDia) maxDia = t;
  });

  const hoyCadena = fechaHoyLocal();

  let html = `
    <div class="cal-folios-header">
      <button type="button" class="cal-folios-nav" onclick="cambiarMesCalendario(-1)" aria-label="Mes anterior">&#8249;</button>
      <span class="cal-folios-titulo">${NOMBRES_MESES[mes]} ${anio}</span>
      <button type="button" class="cal-folios-nav" onclick="cambiarMesCalendario(1)" aria-label="Mes siguiente">&#8250;</button>
    </div>
  `;

  html += '<div class="cal-folios-dias-nombres">';
  NOMBRES_DIAS_CALENDARIO.forEach(d => {
    html += `<div class="cal-folios-dia-nombre">${d}</div>`;
  });
  html += '</div>';

  html += '<div class="cal-folios-grid">';
  for (let i = 0; i < offset; i++) html += '<div class="cal-folios-vacio"></div>';

  for (let d = 1; d <= diasEnMes; d++) {
    const clave = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const conteo = calendarioPorDia[clave] || {};
    const total = totalDia(conteo);
    const esHoy = clave === hoyCadena;

    if (total > 0) {
      const ratio = total / Math.max(maxDia, 1);
      const color = colorCalendario(total, maxDia);
      const textoBlanco = ratio > 0.6 ? ' color:#ffffff;' : '';
      html += `
        <div class="cal-folios-dia cal-tiene-datos" style="background:${color};" title="${total} folio(s)" aria-label="${total} folio(s) el día ${d}" role="button" tabindex="0" onclick="mostrarDetalleDia('${clave}')" onkeydown="if(event.key==='Enter'||event.key===' '){mostrarDetalleDia('${clave}');event.preventDefault();}">
          <span class="cal-numero" style="${textoBlanco}">${d}</span>
          <span class="cal-conteo">${total}</span>
        </div>
      `;
    } else {
      html += `
        <div class="cal-folios-dia ${esHoy ? 'cal-hoy' : ''}">
          <span class="cal-numero">${d}</span>
        </div>
      `;
    }
  }
  html += '</div>';

  html += `
    <div class="cal-folios-leyenda">
      <span class="cal-leyenda-texto">Menos</span>
      <span class="cal-leyenda-item" style="background:${colorCalendario(1, Math.max(maxDia, 3))};"></span>
      <span class="cal-leyenda-item" style="background:${colorCalendario(Math.ceil(maxDia * 0.5), Math.max(maxDia, 3))};"></span>
      <span class="cal-leyenda-item" style="background:${colorCalendario(Math.max(maxDia, 3), Math.max(maxDia, 3))};"></span>
      <span class="cal-leyenda-texto">Más</span>
    </div>
  `;

  contenedor.innerHTML = html;
}

function cambiarMesCalendario(delta) {
  let anio = calendarioFolios.anio;
  let mes = calendarioFolios.mes + delta;
  if (mes > 11) {
    mes = 0;
    anio++;
  } else if (mes < 0) {
    mes = 11;
    anio--;
  }
  if (anio < ANIO_CAL_MIN || anio > ANIO_CAL_MAX) return;
  calendarioFolios.anio = anio;
  calendarioFolios.mes = mes;
  const contenedores = document.querySelectorAll('.cal-folios-contenedor');
  contenedores.forEach(c => renderCalendarioFolios(c.id));
}

function mostrarDetalleDia(clave) {
  const partes = clave.split('-').map(Number);
  const fechaValida = new Date(partes[0], partes[1] - 1, partes[2]);
  if (isNaN(fechaValida.getTime()) || fechaValida.getDate() !== partes[2]) return;

  const conteo = calendarioPorDia[clave] || {};
  const total = totalDia(conteo);

  const fechaLegible = new Date(partes[0], partes[1] - 1, partes[2]).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let filas = '';
  Object.keys(conteo).sort().forEach(tabla => {
    filas += `
      <tr>
        <td>${escapeHtml(NOMBRES_OFICIO[tabla] || tabla)}</td>
        <td class="text-end"><strong>${conteo[tabla]}</strong></td>
      </tr>
    `;
  });

  const existente = document.getElementById('modal-detalle-dia');
  if (existente) {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const instanciaPrevia = bootstrap.Modal.getInstance(existente);
      if (instanciaPrevia) instanciaPrevia.hide();
    }
    existente.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'modal-detalle-dia';
  modal.className = 'modal fade';
  modal.tabIndex = -1;
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header modal-header-asiste">
          <h5 class="modal-title">Folios del ${fechaLegible}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <div class="table-responsive">
            <table class="table detalle-folio-table">
              <thead><tr><th>Tipo de documento</th><th class="text-end">Cantidad</th></tr></thead>
              <tbody>${filas}</tbody>
            </table>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-3 ps-2 pe-2">
            <strong>Total</strong>
            <span class="badge text-primario fs-6">${total} folio(s)</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-asiste-secondary" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const instancia = (typeof bootstrap !== 'undefined' && bootstrap.Modal) ? new bootstrap.Modal(modal) : null;
  if (instancia) {
    instancia.show();
  } else {
    modal.classList.add('show');
    modal.style.display = 'block';
  }
}

window.renderCalendarioFolios = renderCalendarioFolios;
window.cambiarMesCalendario = cambiarMesCalendario;
window.mostrarDetalleDia = mostrarDetalleDia;

document.addEventListener('DOMContentLoaded', function () {
  const isLoginPage = window.location.pathname.endsWith('index.html') ||
                      window.location.pathname.endsWith('/') ||
                      window.location.pathname === '';
  const session = getSession();

  if (!isLoginPage && !session) {
    window.location.href = 'index.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const empleado = document.getElementById('empleado').value.trim();
      const password = document.getElementById('password').value.trim();

      const result = login(empleado, password);

      if (result.success) {
        showToast(`Bienvenido, ${result.session.nombre}`, 'success');
        setTimeout(function () {
          window.location.href = getDashboardByRol(result.session.rol);
        }, 1200);
      } else {
        showToast(result.mensaje, 'danger');
      }
    });
  }
});

// Exportar utilidades globales (accesibles desde HTML)
window.getSession = getSession;
window.login = login;
window.logout = logout;
window.hasPermission = hasPermission;
window.getRolName = getRolName;
window.getDashboardByRol = getDashboardByRol;
window.generarFolioAutomatico = generarFolioAutomatico;
window.getAreas = getAreas;
window.getAreaIdBySigla = getAreaIdBySigla;
window.getAreaIdBySlug = getAreaIdBySlug;
window.getAreaById = getAreaById;
window.getAreaNameById = getAreaNameById;
window.getSiglaArea = getSiglaArea;
window.getSiglaByAreaId = getSiglaByAreaId;
window.guardarAreas = guardarAreas;
window.guardarUsuarios = guardarUsuarios;
window.guardarOficios = guardarOficios;
window.getUsuarios = getUsuarios;
window.getOficios = getOficios;
window.generarNextAreaId = generarNextAreaId;
window.generarNextUserId = generarNextUserId;
window.areaExistsBySigla = areaExistsBySigla;
window.empleadoExists = empleadoExists;
window.escapeHtml = escapeHtml;
window.escapeJs = escapeJs;
window.siguienteNumeroFolio = siguienteNumeroFolio;
window.aFechaLocal = aFechaLocal;
window.fechaHoyLocal = fechaHoyLocal;
window.presentarFecha = presentarFecha;
window.resolverSolicitante = resolverSolicitante;
window.descAreaUsuario = descAreaUsuario;
window.nombreRol = nombreRol;
window.pintarUsuario = pintarUsuario;
window.badgeEstatus = badgeEstatus;
window.cerrarSesion = cerrarSesion;
window.sesionVigente = sesionVigente;
window.llenarSelectAreas = llenarSelectAreas;
window.liberarOficio = liberarOficio;
window.TODAS_LAS_TABLAS = TODAS_LAS_TABLAS;
window.showToast = showToast;
window.TIPOS_OFICIO = TIPOS_OFICIO;
window.NOMBRES_OFICIO = NOMBRES_OFICIO;
window.ROLES = ROLES;
window.NOMBRES_ROLES = NOMBRES_ROLES;