/* ===============================================
   Interactive Price Calculator
   Parameters:
     - service     : instalacion | reparacion | mantenimiento
     - property    : piso | casa | oficina
     - access      : facil | medio | dificil
     - units       : 1..6
   =============================================== */
(function () {
  'use strict';

  const form = document.getElementById('calcForm');
  if (!form) return;

  const priceEl = document.getElementById('calcPrice');
  const breakdownEl = document.getElementById('calcBreakdown');
  const unitsInput = document.getElementById('units');
  const unitsVal = document.getElementById('unitsVal');

  const state = {
    service: 'instalacion',
    property: 'piso',
    access: 'facil',
    units: 1
  };

  const i18n = window.EcoClimaI18n;
  const getLang = () => document.documentElement.getAttribute('data-lang') || 'es';
  const tr = (key, fallback) => (i18n && typeof i18n.t === 'function' ? i18n.t(key, getLang()) : fallback);

  const BASE = {
    instalacion:   { base: 99, key: 'calc.service.install' },
    reparacion:    { base: 80, key: 'calc.service.repair' },
    mantenimiento: { base: 60, key: 'calc.service.maintenance' }
  };

  const PROPERTY_MULT = {
    piso:    { mult: 1.0,  key: 'calc.property.flat' },
    casa:    { mult: 1.25, key: 'calc.property.house' },
    oficina: { mult: 1.15, key: 'calc.property.office' }
  };

  const ACCESS_MULT = {
    facil:   { mult: 1.0,  key: 'calc.access.easy' },
    medio:   { mult: 1.15, key: 'calc.access.medium' },
    dificil: { mult: 1.35, key: 'calc.access.hard' }
  };

  function calculate() {
    const svc = BASE[state.service];
    const prop = PROPERTY_MULT[state.property];
    const acc = ACCESS_MULT[state.access];

    let unitFactor;
    if (state.units === 1) unitFactor = 1;
    else unitFactor = 1 + (state.units - 1) * 0.7;

    const raw = svc.base * prop.mult * acc.mult * unitFactor;
    const price = Math.round(raw / 5) * 5;

    // update UI
    animateNumber(priceEl, parseInt(priceEl.textContent, 10) || 0, price, 400);

    // breakdown
    const unitsLabel = unitLabel(state.units);
    const items = [
      { label: tr(svc.key, 'Instalación'), value: `${tr('price.from', 'desde')} ${svc.base}€` },
      { label: tr(prop.key, 'Piso'), value: multiplierText(prop.mult) },
      { label: tr(acc.key, 'Acceso fácil'), value: multiplierText(acc.mult) },
      { label: `${state.units} ${unitsLabel}`, value: unitFactor === 1 ? includedText() : `x${unitFactor.toFixed(1)}` }
    ];
    breakdownEl.innerHTML = items.map(i => `<li><span>${i.label}</span><span>${i.value}</span></li>`).join('');
  }

  function unitLabel(units) {
    const lang = getLang();
    if (lang === 'en') return units === 1 ? 'unit' : 'units';
    if (lang === 'ca') return units === 1 ? 'equip' : 'equips';
    return units === 1 ? 'equipo' : 'equipos';
  }

  function includedText() {
    const lang = getLang();
    if (lang === 'en') return 'included';
    if (lang === 'ca') return 'inclòs';
    return 'incluido';
  }

  function multiplierText(m) {
    if (m === 1) {
      const lang = getLang();
      if (lang === 'en') return 'standard';
      if (lang === 'ca') return 'estàndard';
      return 'estándar';
    }
    return `+${Math.round((m - 1) * 100)}%`;
  }

  function animateNumber(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = val;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Chip groups
  form.querySelectorAll('.chips[data-name]').forEach(group => {
    const name = group.dataset.name;
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn || btn.classList.contains('chip--static')) return;
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
      btn.classList.add('is-active');
      state[name] = btn.dataset.value;
      calculate();
    });
  });

  // Range
  if (unitsInput) {
    unitsInput.addEventListener('input', () => {
      state.units = parseInt(unitsInput.value, 10);
      unitsVal.textContent = state.units === 6 ? '6+' : state.units;
      calculate();
    });
  }

  document.addEventListener('ecoclima:langchange', () => calculate());
  calculate();
})();
