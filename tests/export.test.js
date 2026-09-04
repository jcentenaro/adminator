import { describe, it, expect, beforeEach } from 'vitest';
import { getKpiExportData } from '../src/assets/scripts/2026/export.js';

describe('export.js — getKpiExportData', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section class="kpi-grid">
        <article class="kpi-card c-success">
          <div class="kpi-label">OBJ. MES</div>
          <div class="kpi-value" id="kpi-obj-mes">150</div>
        </article>
        <article class="kpi-card c-danger">
          <div class="kpi-label">VG. MES</div>
          <div class="kpi-value" id="kpi-vg-mes">120</div>
        </article>
        <article class="kpi-card c-purple">
          <div class="kpi-label">RCA</div>
          <div class="kpi-value" id="kpi-rca">30</div>
        </article>
      </section>
      <section class="kpi-grid kpi-grid-2">
        <article class="kpi-card c-primary">
          <div class="kpi-label">VG. TOTAL</div>
          <div class="kpi-value" id="kpi-vg-total">180</div>
        </article>
        <article class="kpi-card c-warning">
          <div class="kpi-label">PLANES</div>
          <div class="kpi-value" id="kpi-planes">8</div>
        </article>
      </section>
    `;
  });

  it('correctly extracts labels and values matching user specification', () => {
    const data = getKpiExportData();
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      'OBJ. MES': '150',
      'VG. MES': '120',
      'RCA': '30',
      'VG. TOTAL': '180',
      'PLANES': '8',
    });
  });
});

