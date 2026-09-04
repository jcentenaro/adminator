import { describe, it, expect, beforeEach } from 'vitest';
import { getKpiExportData } from '../src/assets/scripts/2026/export.js';

describe('export.js — getKpiExportData', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section class="kpi-grid">
        <article class="kpi-card c-success">
          <div class="kpi-label">Visitas totales</div>
          <div class="kpi-value">1.24<sup>M</sup></div>
        </article>
        <article class="kpi-card c-danger">
          <div class="kpi-label">Páginas vistas</div>
          <div class="kpi-value">4.08<sup>M</sup></div>
        </article>
        <article class="kpi-card c-purple">
          <div class="kpi-label">Visitas únicas</div>
          <div class="kpi-value">842<sup>K</sup></div>
        </article>
        <article class="kpi-card c-primary">
          <div class="kpi-label">Tasa de rebote</div>
          <div class="kpi-value">33<sup>%</sup></div>
        </article>
      </section>
    `;
  });

  it('correctly extracts labels and values matching user specification', () => {
    const data = getKpiExportData();
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      'Visitas totales': '1.24',
      'Páginas vistas': '4.08',
      'Visitas únicas': '842',
      'Tasa de rebote': '33%',
    });
  });
});
