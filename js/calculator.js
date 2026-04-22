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

  const BASE = {
    instalacion:   { base: 99, label: 'Instalación' },
    reparacion:    { base: 80, label: 'Reparación' },
    mantenimiento: { base: 60, label: 'Mantenimiento' }
  };

  const PROPERTY_MULT = {
    piso:    { mult: 1.0,  label: 'Piso' },
    casa:    { mult: 1.25, label: 'Casa' },
    oficina: { mult: 1.15, label: 'Oficina' }
  };

  const ACCESS_MULT = {
    facil:   { mult: 1.0,  label: 'Acceso fácil' },
    medio:   { mult: 1.15, label: 'Acceso medio' },
    dificil: { mult: 1.35, label: 'Acceso difícil' }
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
    const items = [
      { label: svc.label, value: `desde ${svc.base}€` },
      { label: prop.label, value: multiplierText(prop.mult) },
      { label: acc.label, value: multiplierText(acc.mult) },
      { label: `${state.units} ${state.units === 1 ? 'equipo' : 'equipos'}`, value: unitFactor === 1 ? 'incluido' : `x${unitFactor.toFixed(1)}` }
    ];
    breakdownEl.innerHTML = items.map(i => `<li><span>${i.label}</span><span>${i.value}</span></li>`).join('');
  }

  function multiplierText(m) {
    if (m === 1) return 'estándar';
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

  calculate();
})();
