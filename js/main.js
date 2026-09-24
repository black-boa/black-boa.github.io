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

// Foliador: nivel derivado del área
const ROLES = {
  ADMINISTRADOR: 1,
  VISOR: 2,
  FOLIADOR: 3
};

const NOMBRES_ROLES = {
  1: 'Administrador',
  2: 'Visor',
  3: 'Foliador'
};

// Datos de prueba

function crearDatosPrueba() {
  const usuariosPrueba = {
    'user-admin': {
      id: 'user-admin',
      nombre: 'Administrador del Sistema',
      numero_empleado: 'ADM-001',
      password: '1234',
      rol: ROLES.ADMINISTRADOR,
      area: 1,
      activo: true
    },
    'user-visor': {
      id: 'user-visor',
      nombre: 'Secretaria de la Dependencia',
      numero_empleado: 'SEC-001',
      password: '1234',
      rol: ROLES.VISOR,
      area: 1,
      activo: true
    },
    'user-titular': {
      id: 'user-titular',
      nombre: 'Foliador de Secretaría',
      numero_empleado: 'LS-001',
      password: '1234',
      rol: ROLES.FOLIADOR,
      area: 1,
      activo: true
    },
    'user-asignador-dir': {
      id: 'user-asignador-dir',
      nombre: 'Foliador de Área · Dirección de Administración',
      numero_empleado: 'LD-001',
      password: '1234',
      rol: ROLES.FOLIADOR,
      area: 3,
      activo: true
    },
    'user-asignador-unidad': {
      id: 'user-asignador-unidad',
      nombre: 'Foliador de Área · Jefatura de Unidad de Informática',
      numero_empleado: 'LD-002',
      password: '1234',
      rol: ROLES.FOLIADOR,
      area: 5,
      activo: true
    },
    'user-asignador-area-cap': {
      id: 'user-asignador-area-cap',
      nombre: 'Foliador de Área · Área de Captura',
      numero_empleado: 'SOL-001',
      password: '1234',
      rol: ROLES.FOLIADOR,
      area: 6,
      activo: true
    },
    'user-asignador-area-sop': {
      id: 'user-asignador-area-sop',
      nombre: 'Foliador de Área · Área de Soporte Técnico',
      numero_empleado: 'SOL-002',
      password: '1234',
      rol: ROLES.FOLIADOR,
      area: 7,
      activo: true
    },
    'user-asignador-area-dev': {
      id: 'user-asignador-area-dev',
      nombre: 'Foliador de Área · Área de Desarrollo de Sistemas',
      numero_empleado: 'SOL-003',
      password: '1234',
      rol: ROLES.FOLIADOR,
      area: 8,
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
    { id: 1, nombre: 'Secretaría de la Dependencia', sigla: 'SPyAP', padre: null, activo: true },
    { id: 2, nombre: 'Subsecretaría de Planeación', sigla: 'SS', padre: 1, activo: true },
    { id: 3, nombre: 'Dirección de Administración', sigla: 'DG', padre: 1, activo: true },
    { id: 4, nombre: 'Jefatura de Recursos Humanos', sigla: 'JD', padre: 3, activo: true },
    { id: 5, nombre: 'Jefatura de Unidad de Informática', sigla: 'JU', padre: 3, activo: true },
    { id: 6, nombre: 'Área de Captura', sigla: 'AC', padre: 5, activo: true },
    { id: 7, nombre: 'Área de Soporte Técnico', sigla: 'ST', padre: 5, activo: true },
    { id: 8, nombre: 'Área de Desarrollo de Sistemas', sigla: 'DS', padre: 5, activo: true }
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

  const VERSION_DATOS = 'usuario-contrasena';
  const versionActual = localStorage.getItem('cd_version_datos');
  if (!datosValidos('usuarios', 'object') || !datosValidos('areas', 'array') || versionActual !== VERSION_DATOS) {
    localStorage.setItem('usuarios', JSON.stringify(usuariosPrueba));
    guardarAreas(areasData);
    guardarOficios(oficiosData);
    localStorage.setItem('cd_version_datos', VERSION_DATOS);
  }
  if (!datosValidos('oficios', 'object')) {
    guardarOficios(oficiosData);
  }
}

crearDatosPrueba();

// Autenticación

function login(numeroEmpleado, password) {
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || {};
  const empleadoNorm = (numeroEmpleado || '').trim().toUpperCase();

  let usuarioEncontrado = null;
  for (const key of Object.keys(usuarios)) {
    const usuario = usuarios[key];
    if (usuario && usuario.numero_empleado === empleadoNorm) {
      usuarioEncontrado = usuario;
      break;
    }
  }

  if (!usuarioEncontrado) {
    return { success: false, mensaje: 'Credenciales inválidas' };
  }

  if (usuarioEncontrado.password && usuarioEncontrado.password !== password) {
    return { success: false, mensaje: 'Credenciales inválidas' };
  }

  if (usuarioEncontrado.activo === false) {
    return { success: false, mensaje: 'El usuario está desactivado. Contacte al administrador' };
  }

  // Normaliza área a id numérico
  let areaUsuario = usuarioEncontrado.area;
  if (typeof areaUsuario === 'string' && areaUsuario.trim() !== '') {
    const areaNumero = Number(areaUsuario.trim());
    if (!Number.isNaN(areaNumero) && String(areaNumero) === areaUsuario.trim()) {
      areaUsuario = areaNumero;
    }
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
    [ROLES.ADMINISTRADOR]: ['todos'],
    [ROLES.VISOR]: ['consultar_oficios'],
    [ROLES.FOLIADOR]: ['asignar_oficio', 'solicitar_oficio']
  };

  // El área central no solicita folios (no hay nivel superior).
  if (accion === 'solicitar_oficio' && esAreaCentral(session.area)) return false;

  const rolPermisos = permisos[session.rol] || [];
  return rolPermisos.includes('todos') || rolPermisos.includes(accion);
}

// Utilidades de áreas

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
  return area ? area.nombre || area.nombre_area : 'N/A';
}

// Área raíz (padre nulo): única que recibe y asigna solicitudes.
function getAreaRaiz() {
  const areas = getAreas();
  return areas.find(a => a && a.activo && a.padre == null) || areas.find(a => a) || null;
}

function esAreaCentral(areaId) {
  if (areaId == null) return false;
  const area = getAreaById(areaId);
  return !!area && area.padre == null;
}

// Nivel jerárquico derivado del árbol (raíz=1); no se almacena.
function nivelDeArea(area) {
  if (!area) return 1;
  let nivel = 1;
  let actual = area;
  let pasos = 0;
  while (actual && actual.padre != null) {
    actual = getAreaById(actual.padre);
    nivel++;
    if (++pasos > 50) break; // protección contra ciclos en los datos
  }
  return nivel;
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

// Escapa para atributos onclick (contexto JS)
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

// Generación de folios

// Siguiente número de la tabla; incluye cancelados en el máximo para no reutilizarlos.
function siguienteNumeroFolio(tabla) {
  const tablas = getOficios();
  const datosTabla = tablas[tabla] || [];
  const anioActual = new Date().getFullYear();

  let maxAnio = 0;
  let maxHistorico = 0;
  datosTabla.forEach(f => {
    if (f.estatus === 'Rechazado') return;
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

// Número siguiente por serie de área (numeración independiente por área y tipo).
function siguienteNumeroFolioArea(tabla, areaId) {
  const tablas = getOficios();
  const datosTabla = tablas[tabla] || [];
  const anioActual = new Date().getFullYear();
  const sigla = getSiglaByAreaId(areaId);
  if (!sigla) return siguienteNumeroFolio(tabla);

  const re = new RegExp('^' + sigla.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/(\\d+)/(\\d+)$');
  let maxAnio = 0;
  let maxHistorico = 0;
  datosTabla.forEach(f => {
    if (Number(f.id_area) !== Number(areaId)) return;
    if (f.estatus === 'Rechazado') return;
    const match = (f.folio || '').match(re);
    if (!match) return;
    const num = parseInt(match[1], 10);
    const anioFolio = parseInt(match[2], 10);
    if (anioFolio === anioActual && num > maxAnio) maxAnio = num;
    if (num > maxHistorico) maxHistorico = num;
  });

  if (maxAnio > 0) return maxAnio + 1;
  return maxHistorico + 1;
}

// Genera folio con la nomenclatura SIGLA/NUMERO/AÑO.
function generarFolioAutomatico(tipoOficio, areaSigla, areaId) {
  const anio = new Date().getFullYear();
  const tabla = TIPOS_OFICIO[tipoOficio];
  if (!tabla) return null;

  const sigla = getSiglaArea(areaSigla);
  if (!sigla) return null;
  const siguienteNumero = (areaId != null) ? siguienteNumeroFolioArea(tabla, areaId) : siguienteNumeroFolio(tabla);
  return `${sigla}/${String(siguienteNumero).padStart(3, '0')}/${anio}`;
}

// Ruteo de dashboards

function getDashboardByRol(session) {
  if (!session) return 'index.html';
  const rol = Number(session.rol);
  if (rol === ROLES.ADMINISTRADOR) return 'dashboard-admin.html';
  if (rol === ROLES.VISOR) return 'dashboard-visor-general.html';
  if (rol === ROLES.FOLIADOR) {
    // El foliador central asigna solicitudes; los demás asignan sus propios folios y solicitan a la central.
    return esAreaCentral(session.area)
      ? 'dashboard-asignador-superior.html'
      : 'dashboard-asignador-area.html';
  }
  return 'index.html';
}

// Utilidades de UI

const TOAST_CONFIG = {
  success: {
    color: '#10b981',
    icono: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  },
  danger: {
    color: '#f87171',
    icono: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
  },
  warning: {
    color: '#fbbf24',
    icono: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>'
  },
  info: {
    color: '#60a5fa',
    icono: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
  }
};

const TOAST_DURACION = { success: 3200, danger: 4800, warning: 4800, info: 3600 };

function showToast(mensaje, tipo = 'info', opciones = '') {
  const conf = TOAST_CONFIG[tipo] || TOAST_CONFIG.info;
  const toasts = document.getElementById('toast-container') || createToastContainer();
  if (typeof toasts.classList !== 'undefined'
      && typeof toasts.classList.contains === 'function'
      && !toasts.classList.contains('toast-container')
      && typeof toasts.classList.add === 'function') {
    toasts.classList.add('toast-container');
  }
  if (typeof toasts.getAttribute === 'function' && !toasts.getAttribute('aria-live')) {
    toasts.setAttribute('aria-live', 'polite');
    toasts.setAttribute('aria-atomic', 'false');
  }
  asegurarCierreConEscape();
  const config = typeof opciones === 'string' ? { detalle: opciones } : (opciones || {});
  const duracion = config.persistente ? 0 : (config.duracion || TOAST_DURACION[tipo] || TOAST_DURACION.info);
  const detalle = config.detalle || config.detalles || '';
  const expandible = config.expandible || '';
  const accion = config.accion && typeof config.accion.onClick === 'function' ? config.accion : null;

  const toast = document.createElement('div');
  toast.className = `cd-toast cd-toast--${tipo}${duracion ? '' : ' cd-toast--persistente'}`;
  toast.setAttribute('role', tipo === 'danger' || tipo === 'warning' ? 'alert' : 'status');
  toast.style.setProperty('--duracion', duracion + 'ms');
  toast.style.setProperty('--toast-color', conf.color);
  toast.innerHTML = `
    <span class="cd-toast__icon">${conf.icono}</span>
    <div class="cd-toast__cuerpo">
      <p class="cd-toast__titulo">${escapeHtml(mensaje)}</p>
      ${detalle ? `<p class="cd-toast__detalle">${escapeHtml(detalle)}</p>` : ''}
      ${expandible ? `
        <button type="button" class="cd-toast__detalle-toggle" aria-expanded="false">Ver detalles</button>
        <div class="cd-toast__detalle-expandible"><div><p>${escapeHtml(expandible)}</p></div></div>
      ` : ''}
      ${accion ? `<div class="cd-toast__acciones"><button type="button" class="cd-toast__accion">${escapeHtml(accion.etiqueta || 'Ver')}</button></div>` : ''}
    </div>
    <button type="button" class="cd-toast__cerrar" aria-label="Cerrar">&times;</button>
    <span class="cd-toast__barra" aria-hidden="true"></span>
  `;

  toasts.appendChild(toast);

  toast.querySelector('.cd-toast__cerrar').addEventListener('click', () => cerrarToast(toast));
  const toggleDetalle = toast.querySelector('.cd-toast__detalle-toggle');
  if (toggleDetalle) {
    toggleDetalle.addEventListener('click', () => {
      const expandido = toast.classList.toggle('cd-toast--expandido');
      toggleDetalle.setAttribute('aria-expanded', String(expandido));
      toggleDetalle.textContent = expandido ? 'Ocultar detalles' : 'Ver detalles';
    });
  }
  const botonAccion = toast.querySelector('.cd-toast__accion');
  if (botonAccion) {
    botonAccion.addEventListener('click', () => {
      accion.onClick();
      if (accion.cerrar !== false) cerrarToast(toast);
    });
  }

  requestAnimationFrame(() => toast.classList.add('cd-toast--visible'));

  let restante = duracion;
  let inicio = null;
  let temporal = null;

  const valido = () => restante > 0 && !toast.classList.contains('cd-toast--saliendo') && document.body.contains(toast);
  const getBarra = () => toast.querySelector('.cd-toast__barra');

  const detenerCierre = () => {
    if (!valido()) return;
    const barra = getBarra();
    if (!barra) return;
    if (getComputedStyle(barra).animationPlayState === 'running') {
      restante = Math.max(0, restante - (Date.now() - inicio));
      barra.style.animationPlayState = 'paused';
    }
    if (temporal) { clearTimeout(temporal); temporal = null; }
  };

  const reanudarCierre = () => {
    if (!valido()) return;
    if (restante <= 0) { cerrarToast(toast); return; }
    const barra = getBarra();
    if (!barra) return;
    barra.style.animationPlayState = 'running';
    inicio = Date.now();
    temporal = setTimeout(() => cerrarToast(toast), restante);
  };

  ['mouseenter', 'focusin'].forEach(e => toast.addEventListener(e, detenerCierre));
  ['mouseleave', 'focusout'].forEach(e => toast.addEventListener(e, reanudarCierre));

  if (duracion) {
    inicio = Date.now();
    temporal = setTimeout(() => cerrarToast(toast), duracion);
  }
  asegurarCierreConEscape();

  while (toasts.children.length > 3) cerrarToast(toasts.firstElementChild);
}

function cerrarToast(el) {
  if (!el || !el.classList || el.classList.contains('cd-toast--saliendo')) return;
  if (!document.body.contains(el)) return;
  el.classList.add('cd-toast--saliendo');
  el.addEventListener('transitionend', () => el.remove(), { once: true });
  setTimeout(() => el.remove(), 400);
}

let _escListenersRegistrados = false;

function asegurarCierreConEscape() {
  if (!_escListenersRegistrados) {
    _escListenersRegistrados = true;
    document.addEventListener('keydown', cerrarConEscape);
  }
}

function cerrarConEscape(e) {
  if (e.key !== 'Escape') return;
  const toasts = document.getElementById('toast-container');
  if (!toasts || !toasts.children.length) return;
  e.preventDefault();
  cerrarToast(toasts.lastElementChild);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('aria-atomic', 'false');
  document.body.appendChild(container);
  return container;
}

// Calendario de folios

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

function resolverSolicitante(texto, session) {
  const txt = (texto || '').trim();
  if (txt) {
    const usuarios = getUsuarios();
    for (const k of Object.keys(usuarios)) {
      const u = usuarios[k];
      if (u && String(u.numero_empleado).toUpperCase() === txt.toUpperCase()) {
        return { id: u.id, nombre: u.nombre || txt };
      }
    }
    return { id: session ? session.id : null, nombre: txt };
  }
  return { id: session ? session.id : null, nombre: session ? session.nombre : '' };
}

// Puebla el <datalist> con usuarios registrados.
function poblarDatalistSolicitantes() {
  const datalist = document.getElementById('lista-solicitantes');
  if (!datalist) return;
  datalist.innerHTML = '';
  const usuarios = getUsuarios();
  const opciones = [];
  Object.keys(usuarios).forEach(k => {
    const u = usuarios[k];
    if (!u || u.activo === false || !u.numero_empleado) return;
    const etiqueta = [u.nombre, u.numero_empleado, getAreaNameById(u.area)].filter(Boolean).join(' · ');
    opciones.push({ valor: String(u.numero_empleado), etiqueta: etiqueta });
  });
  opciones.sort(function (a, b) { return a.valor.localeCompare(b.valor); });
  opciones.forEach(function (o) {
    const opt = document.createElement('option');
    opt.value = o.valor;
    opt.textContent = o.etiqueta;
    datalist.appendChild(opt);
  });
}

// Etiqueta del foliador según el área (central vs área).
function etiquetaRol(session) {
  if (!session) return '';
  if (Number(session.rol) === Number(ROLES.FOLIADOR)) {
    return esAreaCentral(session.area) ? 'Foliador de Secretaría' : 'Foliador de Área';
  }
  return NOMBRES_ROLES[session.rol] || 'Desconocido';
}

// Texto rol · área para la barra superior.
function descAreaUsuario(session) {
  if (!session) return '';
  const rol = etiquetaRol(session);
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
  document.getElementById('rol-badge').textContent = etiquetaRol(session);
  document.getElementById('rol-badge').className = 'rol-badge rol-' + session.rol;
}

function badgeEstatus(estatus) {
  if (estatus === 'Pendiente') return '<span class="badge-status badge-pendiente">Pendiente</span>';
  if (estatus === 'Asignado') return '<span class="badge-status badge-asignado">Asignado</span>';
  if (estatus === 'Rechazado') return '<span class="badge-status badge-rechazado">Rechazado</span>';
  if (estatus === 'Cancelado') return '<span class="badge-status badge-cancelado">Cancelado</span>';
  return `<span class="badge bg-secondary text-capitalize">${estatus || 'N/A'}</span>`;
}

function cerrarSesion() {
  logout();
}

// Guarda de arranque: valida sesión y permiso/rol.
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
    window.location.href = getDashboardByRol(session);
    return null;
  }
  return session;
}

function llenarSelectAreas(selectId, areasLista) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const lista = (Array.isArray(areasLista) && areasLista.length ? areasLista : getAreas()).filter(a => a.activo !== false);
  lista.forEach(area => {
    const option = document.createElement('option');
    option.value = area.sigla;
    option.textContent = area.nombre + ' (' + area.sigla + ')';
    select.appendChild(option);
  });
}

// Selector tipo de documento (chips)

const SVG_ICONO_OFICIO = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8"/></svg>';
const SVG_ICONO_MEMORANDUM = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12l2 2 4-4"/></svg>';
const SVG_ICONO_CIRCULAR = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>';
const SVG_ICONO_INCIDENCIAS = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>';
const SVG_ICONO_COMISION = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/></svg>';

const TIPOS_DOCUMENTO_CHIP = {
  oficio: { label: 'Oficio', icono: SVG_ICONO_OFICIO },
  memorandum: { label: 'Memorándum', icono: SVG_ICONO_MEMORANDUM },
  circular: { label: 'Circular', icono: SVG_ICONO_CIRCULAR },
  incidencias: { label: 'Incidencias', icono: SVG_ICONO_INCIDENCIAS },
  memorandum_comision: { label: 'Comisión', icono: SVG_ICONO_COMISION }
};

// Callbacks por contenedor para refrescar el resumen al cambiar de tipo.
const _cambioTipoChip = {};

function registrarCambioTipoChip(contenedorId, onChange) {
  _cambioTipoChip[contenedorId] = onChange;
}

function notificarCambioTipoChip(contenedor) {
  if (!contenedor || !contenedor.id) return;
  const onChange = _cambioTipoChip[contenedor.id];
  if (typeof onChange === 'function') onChange(getTipoOficioChipSeleccionado(contenedor.id));
}

function selectTipoChip(contenedor, tipo) {
  if (contenedor.getAttribute('data-modo') === 'fijo') {
    const pill = contenedor.querySelector('.tipo-chip--fijo');
    if (pill) {
      const info = TIPOS_DOCUMENTO_CHIP[tipo] || { label: NOMBRES_OFICIO[TIPOS_OFICIO[tipo]] || tipo, icono: SVG_ICONO_OFICIO };
      pill.innerHTML = `<span class="tipo-chip__icono">${info.icono}</span><span class="tipo-chip__label">${info.label}</span>`;
    }
    contenedor.setAttribute('data-seleccion', tipo);
    notificarCambioTipoChip(contenedor);
    return;
  }
  Array.from(contenedor.children).forEach(btn => {
    const esActivo = btn.getAttribute('data-tipo') === tipo;
    btn.classList.toggle('tipo-chip--activo', esActivo);
    btn.setAttribute('aria-checked', String(esActivo));
  });
  contenedor.setAttribute('data-seleccion', tipo);
  notificarCambioTipoChip(contenedor);
}

function renderTipoOficioChips(contenedorId, onChange, tipoInicial) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor || contenedor.getAttribute('data-chips')) return;
  registrarCambioTipoChip(contenedorId, onChange);
  contenedor.setAttribute('data-chips', '1');
  contenedor.setAttribute('role', 'radiogroup');
  contenedor.setAttribute('aria-label', 'Tipo de documento');

  const tipos = Object.keys(TIPOS_OFICIO);
  const seleccionado = tipos.includes(tipoInicial) ? tipoInicial : 'oficio';
  contenedor.innerHTML = '';

  tipos.forEach(tipo => {
    const info = TIPOS_DOCUMENTO_CHIP[tipo] || { label: NOMBRES_OFICIO[TIPOS_OFICIO[tipo]] || tipo, icono: SVG_ICONO_OFICIO };
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tipo-chip' + (tipo === seleccionado ? ' tipo-chip--activo' : '');
    btn.setAttribute('data-tipo', tipo);
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(tipo === seleccionado));
    btn.innerHTML = `<span class="tipo-chip__icono">${info.icono}</span><span class="tipo-chip__label">${info.label}</span><span class="tipo-chip__check">✓</span>`;
    btn.addEventListener('click', function () {
      selectTipoChip(contenedor, tipo);
    });
    contenedor.appendChild(btn);
  });

  contenedor.setAttribute('data-seleccion', seleccionado);
}

function renderTipoOficioFijo(contenedorId, tipoInicial, onChange) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor || contenedor.getAttribute('data-chips')) return;
  registrarCambioTipoChip(contenedorId, onChange);
  contenedor.setAttribute('data-chips', '1');
  contenedor.setAttribute('data-modo', 'fijo');
  contenedor.setAttribute('aria-label', 'Tipo de documento elegido');

  const tipos = Object.keys(TIPOS_OFICIO);
  const seleccionado = tipos.includes(tipoInicial) ? tipoInicial : 'oficio';
  const info = TIPOS_DOCUMENTO_CHIP[seleccionado] || { label: NOMBRES_OFICIO[TIPOS_OFICIO[seleccionado]] || seleccionado, icono: SVG_ICONO_OFICIO };

  const pill = document.createElement('span');
  pill.className = 'tipo-chip tipo-chip--activo tipo-chip--fijo';
  pill.innerHTML = `<span class="tipo-chip__icono">${info.icono}</span><span class="tipo-chip__label">${info.label}</span>`;
  contenedor.appendChild(pill);
  contenedor.setAttribute('data-seleccion', seleccionado);
  if (typeof onChange === 'function') onChange(seleccionado);
}

function getTipoOficioChipSeleccionado(contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  const tipo = contenedor ? contenedor.getAttribute('data-seleccion') : null;
  return TIPOS_OFICIO[tipo] ? tipo : 'oficio';
}

function setTipoOficioChip(contenedorId, tipo) {
  const contenedor = document.getElementById(contenedorId);
  if (contenedor && TIPOS_OFICIO[tipo]) selectTipoChip(contenedor, tipo);
}

function asignarOficio(tipo, areaSigla, asunto, fechaDoc, session, idSolicitanteInput, dirigidoA) {
  if (!areaSigla) return null;
  const areaId = getAreaIdBySigla(areaSigla);
  const folio = generarFolioAutomatico(tipo, areaSigla, areaId);
  if (!folio) return null;

  const tabla = TIPOS_OFICIO[tipo];
  const tablas = getOficios();
  if (!tablas[tabla]) tablas[tabla] = [];

  const solicitante = resolverSolicitante(document.getElementById(idSolicitanteInput).value, session);
  tablas[tabla].push({
    folio: folio,
    tipo_oficio: tipo,
    id_area: areaId,
    dirigido_a: dirigidoA || '',
    asunto: asunto,
    fecha_documento: fechaDoc,
    fecha_solicitud: fechaHoyLocal(),
    id_usuario_solicitante: solicitante.id,
    nombre_solicitante: solicitante.nombre,
    id_usuario_liberador: session.id,
    estatus: 'Asignado',
    anio: new Date().getFullYear()
  });
  guardarOficios(tablas);
  return folio;
}

const TODAS_LAS_TABLAS = Object.keys(TIPOS_OFICIO).map(function (tipo) { return TIPOS_OFICIO[tipo]; });

// Solicitudes y asignación

// Destino de solicitudes: el área central (raíz); las otras áreas no reciben solicitudes.
function getDestinoSolicitud() {
  const raiz = getAreaRaiz();
  return raiz ? raiz.id : 1;
}

function solicitarFolio(tipo, asunto, fechaDoc, session, idSolicitanteInput, dirigidoA) {
  if (!session) return null;
  const destino = getDestinoSolicitud(session.area);
  const siglaDestino = getSiglaByAreaId(destino);
  const folio = generarFolioAutomatico(tipo, siglaDestino, destino);
  if (!folio) return null;

  const tabla = TIPOS_OFICIO[tipo];
  const tablas = getOficios();
  if (!tablas[tabla]) tablas[tabla] = [];

  const solicitante = resolverSolicitante(document.getElementById(idSolicitanteInput).value, session);
  tablas[tabla].push({
    folio: folio,
    tipo_oficio: tipo,
    id_area: destino,
    id_area_solicitante: session.area,
    dirigido_a: dirigidoA || '',
    asunto: asunto,
    fecha_documento: fechaDoc,
    fecha_solicitud: fechaHoyLocal(),
    id_usuario_solicitante: solicitante.id,
    nombre_solicitante: solicitante.nombre,
    id_usuario_liberador: null,
    estatus: 'Pendiente',
    anio: new Date().getFullYear()
  });
  guardarOficios(tablas);
  return { folio: folio, destino: getAreaNameById(destino), destinoSigla: siglaDestino };
}

function solicitudesPendientesDe(areaId) {
  const oficios = getOficios();
  const filas = [];
  TODAS_LAS_TABLAS.forEach(tabla => {
    (oficios[tabla] || []).forEach(f => {
      if (f.estatus === 'Pendiente' && String(f.id_area) === String(areaId)) {
        filas.push({ tabla: tabla, f: f });
      }
    });
  });
  filas.sort((a, b) => String(b.f.folio || '').localeCompare(String(a.f.folio || '')));
  return filas;
}

// Folios de un área: propios (id_area) o asignados desde sus solicitudes.
function asignadosDe(areaId) {
  const oficios = getOficios();
  const filas = [];
  TODAS_LAS_TABLAS.forEach(tabla => {
    (oficios[tabla] || []).forEach(f => {
      if (f.estatus === 'Asignado' &&
          (String(f.id_area) === String(areaId) || String(f.id_area_solicitante) === String(areaId))) {
        filas.push({ tabla: tabla, f: f });
      }
    });
  });
  filas.sort((a, b) => String(b.f.folio || '').localeCompare(String(a.f.folio || '')));
  return filas;
}

function renderSolicitudesPendientes(tbodyId, contadorId, areaId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const filas = solicitudesPendientesDe(areaId);
  tbody.innerHTML = '';
  filas.forEach(({ tabla, f }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(f.folio)}</strong></td>
      <td><span class="badge bg-primario text-capitalize">${escapeHtml(NOMBRES_OFICIO[tabla] || tabla)}</span></td>
      <td>${escapeHtml(getAreaNameById(f.id_area_solicitante))}</td>
      <td>${escapeHtml(f.dirigido_a || '—')}</td>
      <td>${escapeHtml(f.asunto ? f.asunto.substring(0, 40) : 'Sin asunto')}</td>
      <td>${escapeHtml(f.nombre_solicitante || f.id_usuario_solicitante || 'N/A')}</td>
      <td>${f.fecha_solicitud ? presentarFecha(f.fecha_solicitud) : 'N/A'}</td>
      <td class="text-end">
        <button type="button" class="btn btn-asiste-primary btn-sm" onclick="asignarOficioManual('${escapeJs(f.folio)}', '${escapeJs(tabla)}')"><i class="bi bi-check2-circle me-1" aria-hidden="true"></i>Asignar</button>
        <button type="button" class="btn btn-sm btn-danger" onclick="rechazarSolicitudManual('${escapeJs(f.folio)}', '${escapeJs(tabla)}')"><i class="bi bi-x-circle me-1" aria-hidden="true"></i>Rechazar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  if (filas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-secondary">No hay solicitudes pendientes por asignar</td></tr>`;
  }
  const contador = document.getElementById(contadorId);
  if (contador) contador.textContent = filas.length;
}

function renderAsignadosDe(tbodyId, totalId, areaId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const filas = asignadosDe(areaId);
  tbody.innerHTML = '';
  filas.slice(0, 30).forEach(({ tabla, f }) => {
    const esCancelable = puedeCancelarFolio(tabla, f);
    const accion = esCancelable
      ? `<button type="button" class="btn btn-sm btn-danger" onclick="cancelarFolioManual('${escapeJs(f.folio)}', '${escapeJs(tabla)}')"><i class="bi bi-x-circle me-1" aria-hidden="true"></i>Cancelar</button>`
      : `<button type="button" class="btn btn-sm btn-asiste-secondary" onclick="abrirReasignarFolio('${escapeJs(f.folio)}', '${escapeJs(tabla)}')"><i class="bi bi-arrow-repeat me-1" aria-hidden="true"></i>Reasignar</button>`;
    const areaDestino = f.id_area_solicitante ? getAreaNameById(f.id_area_solicitante) : getAreaNameById(f.id_area);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(f.folio)}</strong></td>
      <td><span class="badge bg-primario text-capitalize">${escapeHtml(NOMBRES_OFICIO[tabla] || tabla)}</span></td>
      <td>${escapeHtml(areaDestino)}</td>
      <td>${escapeHtml(f.dirigido_a || '—')}</td>
      <td>${escapeHtml(f.asunto ? f.asunto.substring(0, 40) : 'Sin asunto')}</td>
      <td>${badgeEstatus(f.estatus)}</td>
      <td>${f.fecha_solicitud ? presentarFecha(f.fecha_solicitud) : 'N/A'}</td>
      <td class="text-end">${accion}</td>
    `;
    tbody.appendChild(tr);
  });
  if (filas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-secondary">Aún no hay folios asignados de esta área</td></tr>`;
  }
  const total = document.getElementById(totalId);
  if (total) total.textContent = filas.length;
}

function puedeCancelarFolio(tabla, f) {
  const oficios = getOficios();
  const mismaSerie = (oficios[tabla] || []).filter(r => String(r.id_area) === String(f.id_area));
  const actual = numeroDeFolio(f.folio);
  if (!actual) return false;
  return mismaSerie.some(r => {
    const n = numeroDeFolio(r.folio);
    return n && (n.anio > actual.anio || (n.anio === actual.anio && n.numero > actual.numero));
  });
}

function numeroDeFolio(folio) {
  const m = /^([^/]+)\/(\d+)\/(\d{4})$/.exec(String(folio || '').trim());
  return m ? { anio: Number(m[3]), numero: Number(m[2]) } : null;
}

// Cancela folio; no aplica al último de la serie (se reasigna).
function cancelarFolioManual(folio, tabla) {
  const tablas = getOficios();
  const registros = tablas[tabla] || [];
  const f = registros.find(r => r.folio === folio);
  if (!f || f.estatus !== 'Asignado') {
    showToast('No se pudo cancelar el folio', 'warning');
    return;
  }
  if (!puedeCancelarFolio(tabla, f)) {
    showToast('Este folio es el último de la serie; use Reasignar folio', 'warning');
    return;
  }
  f.estatus = 'Cancelado';
  f.id_usuario_liberador = null;
  guardarOficios(tablas);
  showToast('Folio ' + folio + ' cancelado', 'success');
  if (typeof window.__refrescarTablas === 'function') window.__refrescarTablas();
}

function abrirReasignarFolio(folio, tabla) {
  const tablas = getOficios();
  const f = (tablas[tabla] || []).find(r => r.folio === folio);
  if (!f) return;

  const existente = document.getElementById('modal-reasignar-folio');
  if (existente) {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const instanciaPrevia = bootstrap.Modal.getInstance(existente);
      if (instanciaPrevia) instanciaPrevia.hide();
    }
    existente.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'modal-reasignar-folio';
  modal.className = 'modal fade modal--formulario';
  modal.tabIndex = -1;
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header modal-header-asiste">
          <h5 class="modal-title">Reasignar folio ${escapeHtml(f.folio)}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <div class="modal-aviso"><i class="bi bi-arrow-repeat" aria-hidden="true"></i><span>Este folio es el último de la serie y no puede cancelarse. Capture de nuevo los datos para reutilizarlo.</span></div>
          <input type="hidden" id="reasignar-folio" value="${escapeHtml(f.folio)}">
          <input type="hidden" id="reasignar-tabla" value="${escapeHtml(tabla)}">
          <div class="row g-3">
            <div class="col-md-8">
              <label class="form-label">Dirigido a</label>
              <input type="text" class="form-control" id="reasignar-dirigido" value="${escapeHtml(f.dirigido_a || '')}" placeholder="Nombre de la dependencia o persona">
            </div>
            <div class="col-md-4">
              <label class="form-label">Fecha del documento</label>
              <input type="date" class="form-control" id="reasignar-fecha" value="${escapeHtml(f.fecha_documento || '')}">
            </div>
            <div class="col-12">
              <label class="form-label">Asunto</label>
              <textarea class="form-control" id="reasignar-asunto" rows="2">${escapeHtml(f.asunto || '')}</textarea>
            </div>
            <div class="col-12">
              <label class="form-label">Solicitante</label>
              <input type="text" class="form-control" id="reasignar-solicitante" value="${escapeHtml(f.nombre_solicitante || '')}" placeholder="Nombre del solicitante">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-asiste-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-asiste-primary" onclick="guardarReasignarFolio()"><i class="bi bi-arrow-repeat me-1" aria-hidden="true"></i>Reasignar</button>
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

function guardarReasignarFolio() {
  const folio = document.getElementById('reasignar-folio').value;
  const tabla = document.getElementById('reasignar-tabla').value;
  const dirigido = document.getElementById('reasignar-dirigido').value.trim();
  const asunto = document.getElementById('reasignar-asunto').value.trim();
  const fecha = document.getElementById('reasignar-fecha').value;
  const solicitante = document.getElementById('reasignar-solicitante').value.trim();

  if (!dirigido) { showToast('Ingrese el destinatario (Dirigido a)', 'warning'); return; }
  if (!asunto) { showToast('Ingrese el asunto del documento', 'warning'); return; }

  const tablas = getOficios();
  const f = (tablas[tabla] || []).find(r => r.folio === folio);
  if (!f) { showToast('No se encontró el folio', 'warning'); return; }

  f.dirigido_a = dirigido;
  f.asunto = asunto;
  f.fecha_documento = fecha || f.fecha_documento;
  f.nombre_solicitante = solicitante || f.nombre_solicitante;
  f.estatus = 'Asignado';
  f.id_usuario_liberador = getSession() ? getSession().id : null;
  guardarOficios(tablas);

  const modalEl = document.getElementById('modal-reasignar-folio');
  if (modalEl) {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const inst = bootstrap.Modal.getInstance(modalEl);
      if (inst) inst.hide();
    }
    modalEl.remove();
  }
  showToast('Folio ' + folio + ' reasignado', 'success');
  if (typeof window.__refrescarTablas === 'function') window.__refrescarTablas();
}

function asignarOficioManual(folio, tabla) {
  const tablas = getOficios();
  const registros = tablas[tabla] || [];
  const f = registros.find(r => r.folio === folio);
  if (f && f.estatus === 'Pendiente') {
    const session = getSession();
    f.estatus = 'Asignado';
    f.id_usuario_liberador = session ? session.id : null;
    guardarOficios(tablas);
    showToast('Folio ' + folio + ' asignado', 'success');
    if (typeof window.__refrescarTablas === 'function') window.__refrescarTablas();
  } else {
    showToast('No se pudo asignar el folio', 'warning');
  }
}

// Rechaza solicitud; libera el folio para su posterior emisión.
function rechazarSolicitudManual(folio, tabla) {
  const tablas = getOficios();
  const registros = tablas[tabla] || [];
  const f = registros.find(r => r.folio === folio);
  if (f && f.estatus === 'Pendiente') {
    f.estatus = 'Rechazado';
    f.folio = null;
    guardarOficios(tablas);
    showToast('Solicitud ' + folio + ' rechazada, folio liberado', 'warning');
    if (typeof window.__refrescarTablas === 'function') window.__refrescarTablas();
  } else {
    showToast('No se pudo rechazar la solicitud', 'warning');
  }
}

function solicitudesEnviadas(areaId) {
  const oficios = getOficios();
  const filas = [];
  TODAS_LAS_TABLAS.forEach(tabla => {
    (oficios[tabla] || []).forEach(f => {
      if (String(f.id_area_solicitante) === String(areaId)) {
        filas.push({ tabla: tabla, f: f });
      }
    });
  });
  filas.sort((a, b) => String(b.f.folio || '').localeCompare(String(a.f.folio || '')));
  return filas;
}

function renderSolicitudesEnviadas(tbodyId, totalId, areaId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const filas = solicitudesEnviadas(areaId);
  tbody.innerHTML = '';
  filas.slice(0, 30).forEach(({ tabla, f }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(f.folio || '—')}</strong></td>
      <td><span class="badge bg-primario text-capitalize">${escapeHtml(NOMBRES_OFICIO[tabla] || tabla)}</span></td>
      <td>${escapeHtml(getAreaNameById(f.id_area))}</td>
      <td>${escapeHtml(f.dirigido_a || '—')}</td>
      <td>${escapeHtml(f.asunto ? f.asunto.substring(0, 40) : 'Sin asunto')}</td>
      <td>${f.fecha_solicitud ? presentarFecha(f.fecha_solicitud) : 'N/A'}</td>
      <td>${badgeEstatus(f.estatus)}</td>
    `;
    tbody.appendChild(tr);
  });
  if (filas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary">No ha solicitado folios a su superior</td></tr>`;
  }
  const total = document.getElementById(totalId);
  if (total) total.textContent = filas.length;
}

const NOMBRES_MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const NOMBRES_DIAS_CALENDARIO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

let calendarioFolios = { anio: new Date().getFullYear(), mes: new Date().getMonth() };
let calendarioPorDia = {};
// Rango de años del calendario.
const ANIO_CAL_MIN = 2000;
const ANIO_CAL_MAX = 2100;

function obtenerFoliosFiltradosCalendario() {
  const session = getSession();
  if (!session) return [];
  // rol puede venir como string o número
  const esAdministrador = Number(session.rol) === Number(ROLES.ADMINISTRADOR);
  const esVisor = Number(session.rol) === Number(ROLES.VISOR);
  const oficios = getOficios();
  const registros = [];
  Object.keys(oficios).forEach(tabla => {
    (oficios[tabla] || []).forEach(f => {
      if (f.estatus === 'Rechazado') return;
      // Admin/Visor: todo; asignadores: su área + propio/asignado
      if (esAdministrador || esVisor) {
        registros.push({ tabla: tabla, f: f });
        return;
      }
      const esPropio = String(f.id_usuario_solicitante) === String(session.id);
      const esAsignador = String(f.id_usuario_liberador || '') === String(session.id);
      const esDeSuArea = String(f.id_area) === String(session.area);
      const esSolicitanteArea = String(f.id_area_solicitante || '') === String(session.area);
      if (esPropio || esAsignador || esDeSuArea || esSolicitanteArea) {
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
  const sat = 55 + r * 44;
  const lig = 92 - r * 52;
  return 'hsl(330, ' + sat + '%, ' + lig + '%)';
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
  modal.className = 'modal fade modal--detalle';
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

function detalleFolioHtml(tabla, registro) {
  const fechaDocumento = registro.fecha_documento ? presentarFecha(registro.fecha_documento) : 'N/A';
  const fechaSolicitud = registro.fecha_solicitud ? presentarFecha(registro.fecha_solicitud) : 'N/A';
  return `
    <div class="table-responsive">
      <table class="table table-sm detalle-folio-table">
        <tbody>
          <tr><th>Folio</th><td><strong>${escapeHtml(registro.folio)}</strong></td></tr>
          <tr><th>Tipo de oficio</th><td>${escapeHtml(NOMBRES_OFICIO[tabla] || tabla)}</td></tr>
          <tr><th>Área</th><td>${escapeHtml(getAreaNameById(registro.id_area))} <span class="badge-status badge-en-atencion">${escapeHtml(getSiglaByAreaId(registro.id_area) || '')}</span></td></tr>
          <tr><th>Asunto</th><td>${escapeHtml(registro.asunto || 'Sin asunto')}</td></tr>
          <tr><th>Dirigido a</th><td>${escapeHtml(registro.dirigido_a || 'N/A')}</td></tr>
          <tr><th>Solicitante</th><td>${escapeHtml(registro.nombre_solicitante || 'N/A')}</td></tr>
          <tr><th>Fecha del documento</th><td>${fechaDocumento}</td></tr>
          <tr><th>Fecha de solicitud</th><td>${fechaSolicitud}</td></tr>
          <tr><th>Estatus</th><td>${badgeEstatus(registro.estatus)}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function mostrarDetalleFolioModal(tabla, folio, tituloId, contenidoId, modalId) {
  const oficios = getOficios();
  const registro = (oficios[tabla] || []).find(f => String(f.folio) === String(folio));
  if (!registro) {
    showToast('No se encontró el folio', 'danger');
    return;
  }
  const tituloEl = document.getElementById(tituloId);
  const contenidoEl = document.getElementById(contenidoId);
  const modalEl = document.getElementById(modalId);
  if (!tituloEl || !contenidoEl || !modalEl) return;
  tituloEl.textContent = 'Detalle del folio ' + registro.folio;
  contenidoEl.innerHTML = detalleFolioHtml(tabla, registro);
  const modal = (typeof bootstrap !== 'undefined' && bootstrap.Modal) ? new bootstrap.Modal(modalEl) : null;
  if (modal) modal.show();
}

// Selector de fecha inline.
const _selectoresFecha = {};

function crearSelectorFecha(opciones) {
  const contenedor = document.getElementById(opciones.contenedorId);
  const input = document.getElementById(opciones.inputId);
  if (!contenedor || !input) return;

  const hoy = fechaHoyLocal();
  const inicial = (typeof opciones.fechaInicial === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(opciones.fechaInicial))
    ? opciones.fechaInicial
    : hoy;
  const partes = inicial.split('-');

  _selectoresFecha[opciones.contenedorId] = {
    inputId: opciones.inputId,
    onCambio: typeof opciones.onCambio === 'function' ? opciones.onCambio : null,
    anio: Number(partes[0]),
    mes: Number(partes[1]) - 1,
    seleccionada: inicial
  };
  input.value = inicial;
  renderSelectorFecha(opciones.contenedorId);
}

function renderSelectorFecha(contenedorId) {
  const reg = _selectoresFecha[contenedorId];
  const contenedor = document.getElementById(contenedorId);
  if (!reg || !contenedor) return;

  const primerDia = new Date(reg.anio, reg.mes, 1);
  const diasEnMes = new Date(reg.anio, reg.mes + 1, 0).getDate();
  const offset = primerDia.getDay();
  const hoyCadena = fechaHoyLocal();

  let html = `
    <div class="cal-folios-header">
      <button type="button" class="cal-folios-nav" onclick="navegarSelectorFecha('${contenedorId}', -1)" aria-label="Mes anterior">&#8249;</button>
      <span class="cal-folios-titulo">${NOMBRES_MESES[reg.mes]} ${reg.anio}</span>
      <button type="button" class="cal-folios-nav" onclick="navegarSelectorFecha('${contenedorId}', 1)" aria-label="Mes siguiente">&#8250;</button>
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
    const clave = `${reg.anio}-${String(reg.mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const esHoy = clave === hoyCadena;
    const esSeleccion = clave === reg.seleccionada;
    const clases = ['cal-folios-dia', 'selector-fecha-dia', esHoy ? 'cal-hoy' : '', esSeleccion ? 'selector-fecha-dia-activo' : ''].filter(Boolean).join(' ');
    const etiqueta = presentarFecha(clave);
    html += `
      <div class="${clases}" role="button" tabindex="0" aria-label="Seleccionar ${etiqueta}" title="${etiqueta}" onclick="elegirDiaSelectorFecha('${contenedorId}', '${clave}')" onkeydown="if(event.key==='Enter'||event.key===' '){elegirDiaSelectorFecha('${contenedorId}', '${clave}');event.preventDefault();}">
        <span class="cal-numero">${d}</span>
      </div>
    `;
  }
  html += '</div>';

  html += `
    <div class="selector-fecha-pie">
      <button type="button" class="btn btn-asiste-secondary btn-sm" onclick="hoySelectorFecha('${contenedorId}')" aria-label="Seleccionar fecha de hoy">Hoy ${presentarFecha(hoyCadena, { day: 'numeric', month: 'short' })}</button>
      <span class="selector-fecha-seleccion">${presentarFecha(reg.seleccionada)}</span>
    </div>
  `;
  contenedor.innerHTML = html;
}

function navegarSelectorFecha(contenedorId, delta) {
  const reg = _selectoresFecha[contenedorId];
  if (!reg) return;
  let anio = reg.anio;
  let mes = reg.mes + delta;
  if (mes > 11) {
    mes = 0;
    anio++;
  } else if (mes < 0) {
    mes = 11;
    anio--;
  }
  if (anio < ANIO_CAL_MIN || anio > ANIO_CAL_MAX) return;
  reg.anio = anio;
  reg.mes = mes;
  renderSelectorFecha(contenedorId);
}

function elegirDiaSelectorFecha(contenedorId, clave) {
  const reg = _selectoresFecha[contenedorId];
  if (!reg) return;
  reg.seleccionada = clave;
  document.getElementById(reg.inputId).value = clave;
  const seleccion = new Date(reg.anio, reg.mes, 1);
  seleccion.setDate(Number(clave.split('-')[2]));
  reg.anio = seleccion.getFullYear();
  reg.mes = seleccion.getMonth();
  renderSelectorFecha(contenedorId);
  if (reg.onCambio) reg.onCambio(clave);
}

function hoySelectorFecha(contenedorId) {
  elegirDiaSelectorFecha(contenedorId, fechaHoyLocal());
}

function restablecerSelectorFecha(contenedorId) {
  const reg = _selectoresFecha[contenedorId];
  if (!reg) return;
  const hoy = fechaHoyLocal();
  const partes = hoy.split('-');
  reg.anio = Number(partes[0]);
  reg.mes = Number(partes[1]) - 1;
  reg.seleccionada = hoy;
  document.getElementById(reg.inputId).value = hoy;
  renderSelectorFecha(contenedorId);
  if (reg.onCambio) reg.onCambio(hoy);
}

// Folios próximos por asignar
function renderProximosFolios(contenedorId, areaId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;
  const siglaArea = getSiglaByAreaId(areaId) || getAreaNameById(areaId) || 'SPyAP';
  const anio = new Date().getFullYear();
  const chipsId = contenedor.getAttribute('data-chips-id') || '';

  const badge = document.getElementById(contenedor.getAttribute('data-badge-id') || '');
  if (badge) badge.textContent = 'Serie ' + siglaArea;

  let html = '';
  Object.keys(TIPOS_DOCUMENTO_CHIP).forEach(tipo => {
    const info = TIPOS_DOCUMENTO_CHIP[tipo];
    const num = siguienteNumeroFolioArea(TIPOS_OFICIO[tipo], areaId);
    const serie = siglaArea + '/' + String(num).padStart(3, '0') + '/' + anio;
    html += `
      <div class="folios-preview-item" role="button" tabindex="0" aria-label="Asignar ${escapeHtml(info.label)}: siguiente folio ${escapeHtml(serie)}" onclick="abrirPanelAsignar('${escapeJs(tipo)}', '${escapeJs(chipsId)}')" onkeydown="if(event.key==='Enter'||event.key===' '){abrirPanelAsignar('${escapeJs(tipo)}', '${escapeJs(chipsId)}');event.preventDefault();}">
        <span class="folios-preview-icono" aria-hidden="true">${info.icono}</span>
        <span class="fp-estado">Disponible</span>
        <span class="folios-preview-tipo">${escapeHtml(info.label)}</span>
        <span class="fp-etiqueta">Próximo folio</span>
        <span class="folios-preview-folio" aria-label="Siguiente folio de ${escapeHtml(info.label)}">
          <span class="fp-num"><span class="fp-num-part">${escapeHtml(siglaArea)}/</span>${String(num).padStart(3, '0')}<span class="fp-num-part">/${anio}</span></span>
        </span>
        <button type="button" class="fp-enlace" onclick="event.stopPropagation(); abrirPanelAsignar('${escapeJs(tipo)}', '${escapeJs(chipsId)}')">Asignar folio <span aria-hidden="true">&rarr;</span></button>
      </div>
    `;
  });
  contenedor.innerHTML = html;
}

function abrirPanelAsignar(tipo, chipsId) {
  const contenedor = document.getElementById(chipsId);
  if (!contenedor) return;
  setTipoOficioChip(chipsId, tipo);
  const form = contenedor.closest('form');
  if (!form) return;
  const panel = form.closest('.fp-panel-form');
  if (panel) {
    mostrarPanelAsignar(panel);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const asunto = form.querySelector('#asunto-oficio, #asunto-oficio-area') || form.querySelector('input[type="text"]:not([readonly])');
  if (asunto) setTimeout(function () { asunto.focus({ preventScroll: true }); }, 380);
}

function mostrarPanelAsignar(panel) {
  if (typeof bootstrap !== 'undefined' && panel.classList.contains('collapse') && bootstrap.Collapse) {
    bootstrap.Collapse.getOrCreateInstance(panel).show();
  } else {
    panel.classList.remove('collapse');
    panel.classList.add('show');
  }
}

function cerrarPanelAsignar() {
  const panel = document.querySelector('.fp-panel-form.show') || document.querySelector('.fp-panel-form');
  if (!panel) return;
  if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
    const collapse = bootstrap.Collapse.getInstance(panel);
    if (collapse) collapse.hide(); else panel.classList.add('collapse');
  } else {
    panel.classList.add('collapse');
    panel.classList.remove('show');
  }
}

window.crearSelectorFecha = crearSelectorFecha;
window.navegarSelectorFecha = navegarSelectorFecha;
window.elegirDiaSelectorFecha = elegirDiaSelectorFecha;
window.hoySelectorFecha = hoySelectorFecha;
window.restablecerSelectorFecha = restablecerSelectorFecha;
window.renderProximosFolios = renderProximosFolios;
window.abrirPanelAsignar = abrirPanelAsignar;
window.cerrarPanelAsignar = cerrarPanelAsignar;

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
          window.location.href = getDashboardByRol(result.session);
        }, 1200);
      } else {
        showToast(result.mensaje, 'danger');
      }
    });
  }
});

window.getSession = getSession;
window.login = login;
window.logout = logout;
window.getAreas = getAreas;
window.getAreaById = getAreaById;
window.getAreaNameById = getAreaNameById;
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
window.aFechaLocal = aFechaLocal;
window.presentarFecha = presentarFecha;
window.poblarDatalistSolicitantes = poblarDatalistSolicitantes;
window.pintarUsuario = pintarUsuario;
window.badgeEstatus = badgeEstatus;
window.asignarOficioManual = asignarOficioManual;
window.rechazarSolicitudManual = rechazarSolicitudManual;
window.cancelarFolioManual = cancelarFolioManual;
window.abrirReasignarFolio = abrirReasignarFolio;
window.guardarReasignarFolio = guardarReasignarFolio;
window.mostrarDetalleFolioModal = mostrarDetalleFolioModal;
window.renderSolicitudesEnviadas = renderSolicitudesEnviadas;
window.TODAS_LAS_TABLAS = TODAS_LAS_TABLAS;
window.showToast = showToast;
window.TIPOS_OFICIO = TIPOS_OFICIO;
window.NOMBRES_OFICIO = NOMBRES_OFICIO;
