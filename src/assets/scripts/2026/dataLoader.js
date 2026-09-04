import * as XLSX from 'xlsx';

export const GOOGLE_SHEET_CSV_URLS = [
  'https://docs.google.com/spreadsheets/d/1s0u0zPyGwk9U79gAxzjiteBp9rU_-yPuSirtJJKCC3Y/gviz/tq?tqx=out:csv&sheet=Datos',
  'https://docs.google.com/spreadsheets/d/1s0u0zPyGwk9U79gAxzjiteBp9rU_-yPuSirtJJKCC3Y/export?format=csv&gid=0',
];

/**
 * Normalizes a header key for flexible matching.
 * @param {string} key
 * @returns {string}
 */
export function normalizeKey(key) {
  return String(key || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Parses numeric strings (handles commas, dots, currency symbols).
 * @param {any} val
 * @returns {number}
 */
export function parseNumber(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim().replace(/\$/g, '').replace(/%/g, '').replace(/\s/g, '');
  if (!str) return 0;

  if (str.includes(',') && str.includes('.')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      // 1.234,56 -> 1234.56
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,234.56 -> 1234.56
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  } else if (str.includes('.')) {
    // e.g. "3.500" (thousands in ES/AR)
    if (/^\d{1,3}\.\d{3}$/.test(str)) {
      str = str.replace('.', '');
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Finds a value in a row matching any of the candidate keys.
 * @param {Object} row
 * @param {Array<string>} candidateNormalizedKeys
 * @returns {any}
 */
export function getRowValue(row, candidateNormalizedKeys) {
  for (const [key, value] of Object.entries(row)) {
    const norm = normalizeKey(key);
    if (candidateNormalizedKeys.includes(norm)) {
      return value;
    }
  }
  return 0;
}

/**
 * Formats a number with thousands separators for Spanish locale.
 * @param {number} num
 * @returns {string}
 */
export function formatValue(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  // If integer or decimal
  const isInt = Number.isInteger(num);
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: isInt ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Processes raw worksheet rows: filters out PLANES === 0 and calculates totals.
 * @param {Array<Object>} rows
 * @returns {Object}
 */
export function processMetricsData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      totalObjMes: 0,
      totalVgMes: 0,
      totalRca: 0,
      totalVgTotal: 0,
      totalPlanes: 0,
      count: 0,
    };
  }

  const planesKeys = ['planes', 'plan', 'cantplanes', 'totalplanes'];
  const objMesKeys = ['objmes', 'objetivomes', 'objmesactual', 'objetivo'];
  const vgMesKeys = ['vgmes', 'ventasmes', 'ventasgeneradasmes', 'vgmesactual'];
  const rcaKeys = ['rca', 'totalrca'];
  const vgTotalKeys = ['vgtotal', 'ventastotal', 'ventasgeneradastotal', 'totalvg'];

  // Filter out records where PLANES == 0
  const filtered = rows.filter((row) => {
    const planesVal = parseNumber(getRowValue(row, planesKeys));
    return planesVal !== 0;
  });

  let totalObjMes = 0;
  let totalVgMes = 0;
  let totalRca = 0;
  let totalVgTotal = 0;
  let totalPlanes = 0;

  filtered.forEach((row) => {
    totalObjMes += parseNumber(getRowValue(row, objMesKeys));
    totalVgMes += parseNumber(getRowValue(row, vgMesKeys));
    totalRca += parseNumber(getRowValue(row, rcaKeys));
    totalVgTotal += parseNumber(getRowValue(row, vgTotalKeys));
    totalPlanes += parseNumber(getRowValue(row, planesKeys));
  });

  return {
    totalObjMes,
    totalVgMes,
    totalRca,
    totalVgTotal,
    totalPlanes,
    count: filtered.length,
  };
}

/**
 * Updates the DOM elements with computed metrics.
 * @param {Object} metrics
 */
export function renderMetrics(metrics) {
  // 1. KPI Cards
  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setElText('kpi-obj-mes', formatValue(metrics.totalObjMes));
  setElText('kpi-vg-mes', formatValue(metrics.totalVgMes));
  setElText('kpi-rca', formatValue(metrics.totalRca));
  setElText('kpi-vg-total', formatValue(metrics.totalVgTotal));
  setElText('kpi-planes', formatValue(metrics.totalPlanes));

  // 2. Geography / Visitas al sitio Section
  const geoTotal = (metrics.totalObjMes + metrics.totalVgMes + metrics.totalRca + metrics.totalVgTotal) || 1;
  const maxVal = Math.max(metrics.totalObjMes, metrics.totalVgMes, metrics.totalRca, metrics.totalVgTotal, 1);

  const updateGeoItem = (valId, pctId, barId, value) => {
    const valEl = document.getElementById(valId);
    const pctEl = document.getElementById(pctId);
    const barEl = document.getElementById(barId);

    const pct = Math.round((value / geoTotal) * 100);
    const barWidth = Math.min(100, Math.round((value / maxVal) * 100));

    if (valEl) {
      valEl.innerHTML = `${formatValue(value)}<span class="pct" id="${pctId}">${pct}%</span>`;
    }
    if (barEl) {
      barEl.style.width = `${barWidth}%`;
    }
  };

  updateGeoItem('geo-obj-mes', 'geo-obj-mes-pct', 'geo-obj-mes-bar', metrics.totalObjMes);
  updateGeoItem('geo-vg-mes', 'geo-vg-mes-pct', 'geo-vg-mes-bar', metrics.totalVgMes);
  updateGeoItem('geo-rca', 'geo-rca-pct', 'geo-rca-bar', metrics.totalRca);
  updateGeoItem('geo-vg-total', 'geo-vg-total-pct', 'geo-vg-total-bar', metrics.totalVgTotal);
}

/**
 * Parses a Workbook or CSV text and renders metrics.
 * @param {ArrayBuffer|string} rawData
 * @param {Object} options
 */
export function loadFromRawData(rawData, options = {}) {
  try {
    const workbook = XLSX.read(rawData, options);
    // Find sheet named 'Datos' or fallback to first sheet
    const sheetName = workbook.SheetNames.find((n) => normalizeKey(n) === 'datos') || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return null;

    const json = XLSX.utils.sheet_to_json(sheet, { defval: 0 });
    const metrics = processMetricsData(json);
    renderMetrics(metrics);
    return metrics;
  } catch (err) {
    console.error('Error procesando archivo Excel/CSV:', err);
    return null;
  }
}

/**
 * Attempts to fetch data from Google Sheets URLs.
 */
export async function fetchGoogleSheetData() {
  for (const url of GOOGLE_SHEET_CSV_URLS) {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        const csvText = await res.text();
        const metrics = loadFromRawData(csvText, { type: 'string' });
        if (metrics) return metrics;
      }
    } catch (e) {
      console.warn(`No se pudo cargar desde ${url}:`, e.message);
    }
  }
  return null;
}

/**
 * Initializes data loader behaviors (Google Sheet fetch + file input upload).
 */
export function initDataLoader() {
  // 1. Try fetching Google Sheet automatically
  fetchGoogleSheetData();

  // 2. Wire file input for manual Excel/CSV loading
  const input = document.getElementById('importExcelInput');
  if (input) {
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const buffer = await file.arrayBuffer();
        loadFromRawData(buffer, { type: 'array' });
      } catch (err) {
        console.error('Error leyendo archivo seleccionado:', err);
      }
    });
  }
}
