/* ===============================================
   EcoClima Chatbot - Asistente virtual
   Rule-based NLU especializado en aire acondicionado
   =============================================== */
(function () {
  'use strict';

  const dom = {
    trigger:  document.getElementById('chatbotOpen'),
    widget:   document.getElementById('chatbot'),
    close:    document.getElementById('chatbotClose'),
    messages: document.getElementById('chatbotMessages'),
    quick:    document.getElementById('chatbotQuick'),
    form:     document.getElementById('chatbotForm'),
    input:    document.getElementById('chatbotInput'),
    badge:    document.getElementById('chatbotBadge')
  };

  if (!dom.widget || !dom.trigger) return;

  /* ---------- Knowledge base ---------- */
  const KB = [
    {
      id: 'greet',
      keywords: ['hola', 'buenas', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'holi', 'que tal', 'qué tal'],
      answer: '¡Hola! 👋 Soy el asistente de EcoClima Barcelona. Puedo ayudarte con precios, instalaciones, reparaciones y mantenimiento. ¿En qué te ayudo?',
      quick: ['¿Cuánto cuesta?', '¿Venís hoy?', 'Tengo una avería', 'Hablar con persona']
    },
    {
      id: 'price',
      keywords: ['precio', 'precios', 'cuesta', 'cuanto', 'cuánto', 'coste', 'valor', 'tarifa', 'presupuesto', 'oferta', 'barato', 'economico', 'económico', 'pagar'],
      answer: '💰 Nuestros precios:<br>• <b>Instalación</b> desde <b>99€</b><br>• <b>Reparación</b> desde <b>80€</b><br>• <b>Mantenimiento</b> desde <b>60€</b><br><br>Esta semana tenemos <b>-20% de descuento</b>. ¿Quieres un presupuesto exacto?',
      quick: ['Quiero presupuesto', 'Usar calculadora', '¿Hay descuento?']
    },
    {
      id: 'install',
      keywords: ['instalar', 'instalacion', 'instalación', 'montar', 'poner', 'nuevo equipo', 'comprar', 'split', 'multisplit', 'conductos'],
      answer: '❄️ Instalamos Split 1x1, multisplit y conductos. Incluye material básico, puesta en marcha y retirada del equipo antiguo. Disponibilidad <b>HOY</b> en toda Barcelona. ¿Qué tipo de vivienda es?',
      quick: ['Piso', 'Casa', 'Oficina', 'Pedir presupuesto']
    },
    {
      id: 'repair',
      keywords: ['reparar', 'reparacion', 'reparación', 'averia', 'avería', 'roto', 'no enfria', 'no enfría', 'no funciona', 'fuga', 'gas', 'ruido', 'ruidoso', 'gotea', 'gotear', 'agua', 'estropeado'],
      answer: '🔧 Reparamos cualquier marca: averías, fugas de gas (R32/R410A), placa electrónica, ruidos y goteos. <b>Diagnóstico en 30 min</b> y presupuesto antes de tocar nada. El 90% se resuelve en 1 visita. ¿Qué problema tienes?',
      quick: ['No enfría', 'Hace ruido', 'Gotea agua', 'Llamar ahora']
    },
    {
      id: 'maintenance',
      keywords: ['mantenimiento', 'mantener', 'limpieza', 'limpiar', 'limpio', 'revision', 'revisión', 'desinfeccion', 'desinfección', 'filtros', 'anual'],
      answer: '🧽 El mantenimiento anual incluye limpieza profunda de filtros y evaporador, revisión de presiones y gas, más informe. Desde <b>60€</b>. Alarga hasta un 40% la vida del equipo.',
      quick: ['Reservar mantenimiento', '¿Cada cuánto?', 'Pedir precio']
    },
    {
      id: 'warranty',
      keywords: ['garantia', 'garantía', 'garantiza', 'asegurar'],
      answer: '🛡️ Ofrecemos <b>2 años de garantía escrita</b> en instalación y equipos, sin letra pequeña. Técnicos certificados y marcas A+++ (Mitsubishi, Daikin, LG, Panasonic).',
      quick: ['Ver servicios', 'Pedir presupuesto']
    },
    {
      id: 'time',
      keywords: ['hoy', 'urgente', 'urgencia', 'rapido', 'rápido', '24h', 'cuando', 'cuándo', 'horario', 'abiertos', 'domingo', 'sabado', 'sábado', 'fin de semana', 'ahora', 'ya'],
      answer: '⏰ Horario:<br>• <b>Lun-Vie</b>: 08:00 - 20:00<br>• <b>Sábado</b>: 09:00 - 18:00<br>• <b>Domingo</b>: urgencias<br><br>Servicio en el día en toda Barcelona. ¿Necesitas visita urgente?',
      quick: ['Sí, urgente', 'Llamar ahora', 'WhatsApp']
    },
    {
      id: 'zone',
      keywords: ['barcelona', 'zona', 'zonas', 'donde', 'dónde', 'cobertura', 'área', 'area', 'ciudad', 'eixample', 'gracia', 'gràcia', 'sants', 'sarria', 'sarrià', 'sant marti', 'horta', 'les corts', 'hospitalet', 'badalona', 'sant cugat', 'castelldefels'],
      answer: '📍 Trabajamos en toda <b>Barcelona y área metropolitana</b>: Eixample, Gràcia, Sant Martí, Sarrià, Les Corts, Horta, Ciutat Vella, Sants, Nou Barris, Sant Andreu, L\'Hospitalet, Badalona, Sant Cugat, Castelldefels... ¿Dónde estás?',
      quick: ['Pedir presupuesto', 'WhatsApp']
    },
    {
      id: 'contact',
      keywords: ['telefono', 'teléfono', 'llamar', 'llamada', 'whatsapp', 'wasap', 'email', 'correo', 'persona', 'humano', 'agente', 'operador', 'tecnico', 'técnico', 'contacto', 'contactar', 'hablar'],
      answer: '📞 Contacta con nosotros:<br>• Tel: <a href="tel:+34600000000"><b>+34 600 000 000</b></a><br>• <a href="https://wa.me/34600000000" target="_blank">WhatsApp</a><br>• <a href="mailto:info@ecoclima-barcelona.es">info@ecoclima-barcelona.es</a><br><br>Te responde un técnico en menos de 10 min.',
      quick: ['Abrir WhatsApp', 'Dejar mis datos']
    },
    {
      id: 'calc',
      keywords: ['calculadora', 'calcular', 'estimar', 'estimacion', 'estimación'],
      answer: '🧮 Tenemos una <b>calculadora online</b> que te da el precio al instante según servicio, vivienda y accesibilidad. ¿Te llevo hasta ella?',
      quick: ['Ir a calculadora', 'Pedir presupuesto']
    },
    {
      id: 'discount',
      keywords: ['descuento', 'promocion', 'promoción', 'oferta', 'rebaja', 'codigo', 'código', 'cupon', 'cupón'],
      answer: '🎉 Sí, esta semana <b>-20% en instalaciones</b> contratadas antes del domingo. Se aplica al solicitar presupuesto desde la web.',
      quick: ['Reservar descuento', 'Ver calculadora']
    },
    {
      id: 'brand',
      keywords: ['marca', 'marcas', 'mitsubishi', 'daikin', 'lg', 'panasonic', 'samsung', 'toshiba', 'fujitsu', 'haier'],
      answer: '🏷️ Trabajamos con Mitsubishi, Daikin, LG, Panasonic, Samsung, Toshiba, Fujitsu y Haier. Todas A+++.',
      quick: ['Recomendar marca', 'Pedir presupuesto']
    },
    {
      id: 'consumption',
      keywords: ['consumo', 'factura', 'luz', 'electricidad', 'ahorro', 'ahorrar', 'eficiencia', 'eficiente'],
      answer: '⚡ Un equipo A+++ Inverter reduce hasta un <b>40% la factura de luz</b>. Te asesoramos gratis sobre el equipo ideal.',
      quick: ['Quiero ahorrar', 'Pedir presupuesto']
    },
    {
      id: 'thanks',
      keywords: ['gracias', 'thx', 'thanks', 'ok', 'vale', 'perfecto', 'genial'],
      answer: '¡De nada! 😊 Si tienes cualquier pregunta, aquí estoy. ¿Quieres que te llamemos?',
      quick: ['Sí, llamadme', 'Más preguntas', 'WhatsApp']
    },
    {
      id: 'bye',
      keywords: ['adios', 'adiós', 'bye', 'chao', 'hasta luego', 'hasta pronto'],
      answer: '¡Hasta pronto! ❄️ Recuerda: instalación en 24h con garantía escrita.',
      quick: ['Pedir presupuesto']
    }
  ];

  const ACTIONS = {
    '¿Cuánto cuesta?': 'precio',
    '¿Venís hoy?': 'hoy urgente',
    'Tengo una avería': 'averia',
    'Hablar con persona': 'persona',
    'Quiero presupuesto': 'presupuesto',
    'Usar calculadora': 'calculadora',
    'Ir a calculadora': { scroll: '#calculadora', say: 'Te llevo a la calculadora ⬇️' },
    'Ir al formulario': { scroll: '#form-hero', say: 'Perfecto, te llevo al formulario ⬇️' },
    '¿Hay descuento?': 'descuento',
    'Piso': 'instalacion en piso',
    'Casa': 'instalacion en casa',
    'Oficina': 'instalacion en oficina',
    'Pedir presupuesto': { scroll: '#form-hero', say: 'Rellena el formulario y te llamamos en 10 min 📞' },
    'No enfría': 'no enfria',
    'Hace ruido': 'ruido',
    'Gotea agua': 'gotea agua',
    'Llamar ahora': { link: 'tel:+34600000000', say: 'Abriendo llamada... 📞' },
    'Reservar mantenimiento': 'mantenimiento',
    '¿Cada cuánto?': { say: 'Recomendamos 1 revisión al año, idealmente antes del verano.' },
    'Pedir precio': 'precio',
    'Ver servicios': { scroll: '#servicios', say: 'Aquí tienes nuestros servicios ⬇️' },
    'Sí, urgente': { say: 'Perfecto. Llámanos o déjanos tus datos y te contactamos en 10 min.', quick: ['Llamar ahora', 'Pedir presupuesto'] },
    'WhatsApp': { link: 'https://wa.me/34600000000', say: 'Abriendo WhatsApp... 💬' },
    'Abrir WhatsApp': { link: 'https://wa.me/34600000000', say: 'Abriendo WhatsApp... 💬' },
    'Dejar mis datos': { scroll: '#form-hero', say: 'Formulario abierto, rellénalo ⬇️' },
    'Ver calculadora': { scroll: '#calculadora', say: 'Calculadora ⬇️' },
    'Reservar descuento': { scroll: '#form-hero', say: '¡Reserva tu -20% rellenando el formulario! ⬇️' },
    'Recomendar marca': { say: 'Para pisos recomendamos <b>Mitsubishi MSZ-AP</b> (silencioso) o <b>Daikin Sensira</b> (mejor precio-calidad). ¿Quieres recomendación personalizada?', quick: ['Sí, recomiéndame', 'Pedir presupuesto'] },
    'Sí, recomiéndame': { scroll: '#form-hero', say: 'Déjanos tus datos y un técnico te llama con opciones adaptadas.' },
    'Quiero ahorrar': { say: 'Equipos A+++ Inverter ahorran hasta 40%. Además asesoramos la mejor posición.', quick: ['Pedir presupuesto'] },
    'Sí, llamadme': { scroll: '#form-hero', say: 'Déjanos tu teléfono ⬇️' },
    'Más preguntas': { say: '¿Sobre qué quieres saber más?', quick: ['Precios', 'Garantía', 'Zonas', 'Marcas'] },
    'Precios': 'precio',
    'Garantía': 'garantia',
    'Zonas': 'barcelona zonas',
    'Marcas': 'marcas'
  };

  function normalize(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,;:()"']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function match(text) {
    const t = normalize(text);
    let best = null, bestScore = 0;
    for (const item of KB) {
      let score = 0;
      for (const kw of item.keywords) {
        const n = normalize(kw);
        if (t === n) score += 5;
        else if (t.includes(n)) score += n.length >= 5 ? 3 : 2;
      }
      if (score > bestScore) { bestScore = score; best = item; }
    }
    return bestScore > 0 ? best : null;
  }

  function scrollToBottom() { dom.messages.scrollTop = dom.messages.scrollHeight; }

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'bubble bubble--' + sender;
    if (sender === 'bot') {
      msg.innerHTML = '<div class="bubble__avatar" aria-hidden="true">E</div><div class="bubble__body">' + text + '</div>';
    } else {
      msg.innerHTML = '<div class="bubble__body">' + escapeHtml(text) + '</div>';
    }
    dom.messages.appendChild(msg);
    scrollToBottom();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c]));
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'bubble bubble--bot bubble--typing';
    t.id = 'typing';
    t.innerHTML = '<div class="bubble__avatar" aria-hidden="true">E</div><div class="bubble__body"><span></span><span></span><span></span></div>';
    dom.messages.appendChild(t);
    scrollToBottom();
  }
  function hideTyping() { const t = document.getElementById('typing'); if (t) t.remove(); }

  function setQuick(options) {
    dom.quick.innerHTML = '';
    (options || []).forEach(label => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chatbot__chip';
      btn.textContent = label;
      btn.addEventListener('click', () => handleQuickReply(label));
      dom.quick.appendChild(btn);
    });
  }

  function respond(userText) {
    showTyping();
    const delay = 500 + Math.min(userText.length * 20, 1000);
    setTimeout(() => {
      hideTyping();
      const hit = match(userText);
      if (hit) {
        addMessage(hit.answer, 'bot');
        setQuick(hit.quick || defaultQuick());
      } else {
        addMessage(
          'Mmm, no estoy seguro de haberte entendido 🤔. Puedo ayudarte con <b>precios</b>, <b>instalación</b>, <b>reparación</b>, <b>mantenimiento</b>, <b>garantía</b> o ponerte con un técnico.',
          'bot'
        );
        setQuick(['¿Cuánto cuesta?', 'Tengo una avería', 'Hablar con persona', 'WhatsApp']);
      }
    }, delay);
  }

  function defaultQuick() { return ['¿Cuánto cuesta?', 'Pedir presupuesto', 'WhatsApp']; }

  function handleQuickReply(label) {
    addMessage(label, 'user');
    const action = ACTIONS[label];

    if (typeof action === 'string') { respond(action); return; }
    if (action && typeof action === 'object') {
      if (action.say) {
        showTyping();
        setTimeout(() => {
          hideTyping();
          addMessage(action.say, 'bot');
          setQuick(action.quick || defaultQuick());
          if (action.scroll) {
            setTimeout(() => {
              const t = document.querySelector(action.scroll);
              if (t) {
                const headerH = document.getElementById('header')?.offsetHeight || 0;
                window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - headerH - 8, behavior: 'smooth' });
                closeWidget();
              }
            }, 800);
          }
          if (action.link) {
            setTimeout(() => window.open(action.link, action.link.startsWith('tel:') ? '_self' : '_blank'), 400);
          }
        }, 500);
        return;
      }
    }
    respond(label);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = dom.input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    dom.input.value = '';
    respond(text);
  }

  let opened = false;
  const LS_OPENED_KEY = 'ecoclima_chat_seen_v1';

  function openWidget() {
    dom.widget.hidden = false;
    requestAnimationFrame(() => dom.widget.classList.add('is-open'));
    dom.widget.setAttribute('aria-hidden', 'false');
    dom.trigger.classList.add('is-open');
    if (dom.badge) dom.badge.hidden = true;
    localStorage.setItem(LS_OPENED_KEY, '1');

    if (!opened) {
      opened = true;
      setTimeout(() => {
        addMessage('¡Hola! 👋 Soy el asistente virtual de <b>EcoClima Barcelona</b>. Estoy aquí 24/7 para responder sobre aire acondicionado. ¿En qué te ayudo?', 'bot');
        setQuick(['¿Cuánto cuesta?', '¿Venís hoy?', 'Tengo una avería', 'Hablar con persona']);
        setTimeout(() => dom.input && dom.input.focus(), 200);
      }, 250);
    } else {
      setTimeout(() => dom.input && dom.input.focus(), 200);
    }

    if (typeof gtag === 'function') {
      gtag('event', 'chatbot_open', { event_category: 'engagement' });
    }
  }

  function closeWidget() {
    dom.widget.classList.remove('is-open');
    dom.widget.setAttribute('aria-hidden', 'true');
    dom.trigger.classList.remove('is-open');
    setTimeout(() => { dom.widget.hidden = true; }, 250);
  }

  dom.trigger.addEventListener('click', () => {
    if (dom.widget.classList.contains('is-open')) closeWidget();
    else openWidget();
  });
  dom.close && dom.close.addEventListener('click', closeWidget);
  dom.form && dom.form.addEventListener('submit', handleSubmit);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dom.widget.classList.contains('is-open')) closeWidget();
  });

  if (localStorage.getItem(LS_OPENED_KEY) && dom.badge) {
    dom.badge.hidden = true;
  }
})();
