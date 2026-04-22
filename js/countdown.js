/* ===============================================
   Countdown Timer - Urgency section
   Counts down to next Sunday 23:59:59 (weekly reset)
   =============================================== */
(function () {
  'use strict';

  const el = {
    days:  document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    min:   document.getElementById('cd-min'),
    sec:   document.getElementById('cd-sec')
  };

  if (!el.days || !el.hours || !el.min || !el.sec) return;

  function getTargetDate() {
    const now = new Date();
    const target = new Date(now);
    const dayOfWeek = now.getDay(); // 0 Sun ... 6 Sat
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    target.setDate(now.getDate() + daysUntilSunday);
    target.setHours(23, 59, 59, 999);
    return target;
  }

  let targetDate = getTargetDate();

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = Date.now();
    let diff = targetDate - now;

    if (diff <= 0) {
      targetDate = getTargetDate();
      diff = targetDate - now;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    el.days.textContent  = pad(days);
    el.hours.textContent = pad(hours);
    el.min.textContent   = pad(minutes);
    el.sec.textContent   = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
})();
