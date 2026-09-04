import { describe, it, expect, beforeEach } from 'vitest';
import {
  processMetricsData,
  parseNumber,
  normalizeKey,
  renderMetrics,
  formatValue,
} from '../src/assets/scripts/2026/dataLoader.js';

describe('dataLoader.js', () => {
  describe('normalizeKey & parseNumber', () => {
    it('normalizes accents, spaces, and punctuation', () => {
      expect(normalizeKey('OBJ. MES')).toBe('objmes');
      expect(normalizeKey('VG. MES')).toBe('vgmes');
      expect(normalizeKey('VG. TOTAL')).toBe('vgtotal');
      expect(normalizeKey('PLANES')).toBe('planes');
      expect(normalizeKey('RCA')).toBe('rca');
    });

    it('parses numbers formatted in various locales', () => {
      expect(parseNumber(100)).toBe(100);
      expect(parseNumber('100')).toBe(100);
      expect(parseNumber('1.250,50')).toBe(1250.5);
      expect(parseNumber('1250.50')).toBe(1250.5);
      expect(parseNumber('$ 3.500')).toBe(3500);
      expect(parseNumber('0')).toBe(0);
      expect(parseNumber('')).toBe(0);
    });
  });

  describe('processMetricsData', () => {
    it('ignores rows where PLANES is 0 or empty and sums columns correctly', () => {
      const mockRows = [
        {
          'PLANES': 5,
          'OBJ. MES PLAN ACT.': 100,
          'VG. MES': 80,
          'RCA': 20,
          'VG. TOTAL': 120,
        },
        {
          'PLANES': 0, // Should be ignored
          'OBJ. MES PLAN ACT.': 500,
          'VG. MES': 400,
          'RCA': 100,
          'VG. TOTAL': 600,
        },
        {
          'PLANES': '0', // Should be ignored
          'OBJ. MES PLAN ACT.': 300,
          'VG. MES': 200,
          'RCA': 50,
          'VG. TOTAL': 350,
        },
        {
          'PLANES': 3,
          'OBJ. MES PLAN ACT.': 50,
          'VG. MES': 40,
          'RCA': 10,
          'VG. TOTAL': 60,
        },
      ];

      const result = processMetricsData(mockRows);

      expect(result.count).toBe(2);
      expect(result.totalPlanes).toBe(8);
      expect(result.totalObjMes).toBe(150);
      expect(result.totalVgMes).toBe(120);
      expect(result.totalRca).toBe(30);
      expect(result.totalVgTotal).toBe(180);
    });
  });

  describe('renderMetrics', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="kpi-obj-mes">0</div>
        <div id="kpi-vg-mes">0</div>
        <div id="kpi-rca">0</div>
        <div id="kpi-vg-total">0</div>
        <div id="kpi-planes">0</div>
        <div id="geo-obj-mes">0<span class="pct" id="geo-obj-mes-pct">0%</span></div>
        <div id="geo-vg-mes">0<span class="pct" id="geo-vg-mes-pct">0%</span></div>
        <div id="geo-rca">0<span class="pct" id="geo-rca-pct">0%</span></div>
        <div id="geo-vg-total">0<span class="pct" id="geo-vg-total-pct">0%</span></div>
        <div id="geo-obj-mes-bar" style="width: 0%;"></div>
        <div id="geo-vg-mes-bar" style="width: 0%;"></div>
        <div id="geo-rca-bar" style="width: 0%;"></div>
        <div id="geo-vg-total-bar" style="width: 0%;"></div>
      `;
    });

    it('updates DOM elements with formatted values', () => {
      const metrics = {
        totalObjMes: 1500,
        totalVgMes: 1200,
        totalRca: 300,
        totalVgTotal: 1800,
        totalPlanes: 50,
        count: 10,
      };

      renderMetrics(metrics);

      expect(document.getElementById('kpi-obj-mes').textContent).toBe(formatValue(1500));
      expect(document.getElementById('kpi-vg-mes').textContent).toBe(formatValue(1200));
      expect(document.getElementById('kpi-rca').textContent).toBe(formatValue(300));
      expect(document.getElementById('kpi-vg-total').textContent).toBe(formatValue(1800));
      expect(document.getElementById('kpi-planes').textContent).toBe(formatValue(50));
      expect(document.getElementById('geo-obj-mes').textContent).toContain(formatValue(1500));
    });
  });
});

