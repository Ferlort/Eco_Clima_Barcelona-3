/* ===============================================
   EcoClima Chatbot - Multilingual assistant
   Rule-based NLU for ES / CA / EN
   =============================================== */
(function () {
  'use strict';

  const dom = {
    trigger: document.getElementById('chatbotOpen'),
    widget: document.getElementById('chatbot'),
    close: document.getElementById('chatbotClose'),
    messages: document.getElementById('chatbotMessages'),
    quick: document.getElementById('chatbotQuick'),
    form: document.getElementById('chatbotForm'),
    input: document.getElementById('chatbotInput'),
    badge: document.getElementById('chatbotBadge')
  };

  if (!dom.widget || !dom.trigger) return;

  const getLang = () => document.documentElement.getAttribute('data-lang') || 'es';
  const textFor = (value) => (typeof value === 'string' ? value : (value[getLang()] || value.es || ''));

  const QUICK_LABELS = {
    ask_price: { es: '¿Cuánto cuesta?', ca: 'Quant costa?', en: 'How much does it cost?' },
    today: { es: '¿Venís hoy?', ca: 'Veniu avui?', en: 'Can you come today?' },
    issue: { es: 'Tengo una avería', ca: 'Tinc una avaria', en: 'I have a breakdown' },
    human: { es: 'Hablar con persona', ca: 'Parlar amb una persona', en: 'Talk to a person' },
    quote: { es: 'Quiero presupuesto', ca: 'Vull pressupost', en: 'I want a quote' },
    use_calc: { es: 'Usar calculadora', ca: 'Fer servir calculadora', en: 'Use calculator' },
    discount: { es: '¿Hay descuento?', ca: 'Hi ha descompte?', en: 'Any discount?' },
    flat: { es: 'Piso', ca: 'Pis', en: 'Flat' },
    house: { es: 'Casa', ca: 'Casa', en: 'House' },
    office: { es: 'Oficina', ca: 'Oficina', en: 'Office' },
    no_cool: { es: 'No enfría', ca: 'No refreda', en: 'Not cooling' },
    noise: { es: 'Hace ruido', ca: 'Fa soroll', en: 'It is noisy' },
    water: { es: 'Gotea agua', ca: 'Degota aigua', en: 'Leaking water' },
    call_now: { es: 'Llamar ahora', ca: 'Trucar ara', en: 'Call now' },
    book_maint: { es: 'Reservar mantenimiento', ca: 'Reservar manteniment', en: 'Book maintenance' },
    how_often: { es: '¿Cada cuánto?', ca: 'Cada quant?', en: 'How often?' },
    ask_price_short: { es: 'Pedir precio', ca: 'Demanar preu', en: 'Ask price' },
    view_services: { es: 'Ver servicios', ca: 'Veure serveis', en: 'View services' },
    urgent_yes: { es: 'Sí, urgente', ca: 'Sí, urgent', en: 'Yes, urgent' },
    open_wa: { es: 'WhatsApp', ca: 'WhatsApp', en: 'WhatsApp' },
    open_wa_full: { es: 'Abrir WhatsApp', ca: 'Obrir WhatsApp', en: 'Open WhatsApp' },
    leave_data: { es: 'Dejar mis datos', ca: 'Deixar dades', en: 'Leave my details' },
    go_calc: { es: 'Ir a calculadora', ca: 'Anar a la calculadora', en: 'Go to calculator' },
    view_calc: { es: 'Ver calculadora', ca: 'Veure calculadora', en: 'View calculator' },
    book_discount: { es: 'Reservar descuento', ca: 'Reservar descompte', en: 'Book discount' },
    recommend_brand: { es: 'Recomendar marca', ca: 'Recomanar marca', en: 'Recommend brand' },
    recommend_yes: { es: 'Sí, recomiéndame', ca: 'Sí, recomana-me', en: 'Yes, recommend me' },
    save_energy: { es: 'Quiero ahorrar', ca: 'Vull estalviar', en: 'I want to save' },
    call_me: { es: 'Sí, llamadme', ca: 'Sí, truqueu-me', en: 'Yes, call me' },
    more_q: { es: 'Más preguntas', ca: 'Més preguntes', en: 'More questions' },
    topic_prices: { es: 'Precios', ca: 'Preus', en: 'Prices' },
    topic_warranty: { es: 'Garantía', ca: 'Garantia', en: 'Warranty' },
    topic_zones: { es: 'Zonas', ca: 'Zones', en: 'Areas' },
    topic_brands: { es: 'Marcas', ca: 'Marques', en: 'Brands' }
  };
  const q = (id) => textFor(QUICK_LABELS[id] || id);

  const KB = [
    {
      keywords: ['hola', 'buenas', 'hello', 'hi', 'hey', 'bon dia', 'bona tarda'],
      answer: {
        es: '¡Hola! 👋 Soy el asistente de EcoClima Barcelona. Puedo ayudarte con precios, instalaciones, reparaciones y mantenimiento. ¿En qué te ayudo?',
        ca: 'Hola! 👋 Sóc l’assistent d’EcoClima Barcelona. Et puc ajudar amb preus, instal·lacions, reparacions i manteniment. En què et puc ajudar?',
        en: 'Hi! 👋 I am EcoClima Barcelona assistant. I can help with prices, installation, repairs and maintenance. How can I help you?'
      },
      quick: ['ask_price', 'today', 'issue', 'human']
    },
    {
      keywords: ['precio', 'precios', 'cuanto', 'coste', 'presupuesto', 'price', 'prices', 'quote', 'cost', 'preu', 'pressupost'],
      answer: {
        es: '💰 Nuestros precios:<br>• <b>Instalación</b> desde <b>99€</b><br>• <b>Reparación</b> desde <b>80€</b><br>• <b>Mantenimiento</b> desde <b>60€</b><br><br>Esta semana tenemos <b>-20% de descuento</b>. ¿Quieres un presupuesto exacto?',
        ca: '💰 Els nostres preus:<br>• <b>Instal·lació</b> des de <b>99€</b><br>• <b>Reparació</b> des de <b>80€</b><br>• <b>Manteniment</b> des de <b>60€</b><br><br>Aquesta setmana tenim <b>-20% de descompte</b>. Vols un pressupost exacte?',
        en: '💰 Our prices:<br>• <b>Installation</b> from <b>€99</b><br>• <b>Repair</b> from <b>€80</b><br>• <b>Maintenance</b> from <b>€60</b><br><br>This week we have a <b>-20% discount</b>. Want an exact quote?'
      },
      quick: ['quote', 'use_calc', 'discount']
    },
    {
      keywords: ['instalar', 'instalacion', 'split', 'multisplit', 'conductos', 'installation', 'ducted', 'instalacio', 'conductes'],
      answer: {
        es: '❄️ Instalamos Split 1x1, multisplit y conductos. Incluye material básico, puesta en marcha y retirada del equipo antiguo. Disponibilidad <b>HOY</b> en toda Barcelona. ¿Qué tipo de vivienda es?',
        ca: '❄️ Instal·lem Split 1x1, multisplit i conductes. Inclou material bàsic, posada en marxa i retirada de l’equip antic. Disponibilitat <b>AVUI</b> a tota Barcelona. Quin tipus d’habitatge és?',
        en: '❄️ We install Split 1x1, multisplit and ducted systems. Includes basic materials, startup and old unit removal. Available <b>TODAY</b> in all Barcelona. What type of property is it?'
      },
      quick: ['flat', 'house', 'office', 'quote']
    },
    {
      keywords: ['reparar', 'reparacion', 'averia', 'no enfria', 'fuga', 'ruido', 'gotea', 'repair', 'broken', 'leak', 'noise', 'avaria', 'no refreda'],
      answer: {
        es: '🔧 Reparamos cualquier marca: averías, fugas de gas (R32/R410A), placa electrónica, ruidos y goteos. <b>Diagnóstico en 30 min</b> y presupuesto antes de tocar nada. El 90% se resuelve en 1 visita. ¿Qué problema tienes?',
        ca: '🔧 Reparem qualsevol marca: avaries, fuites de gas (R32/R410A), placa electrònica, sorolls i degoteigs. <b>Diagnòstic en 30 min</b> i pressupost abans de tocar res. El 90% es resol en 1 visita. Quin problema tens?',
        en: '🔧 We repair any brand: breakdowns, gas leaks (R32/R410A), control board issues, noise and dripping. <b>Diagnosis in 30 min</b> and quote before any work. 90% solved in one visit. What issue do you have?'
      },
      quick: ['no_cool', 'noise', 'water', 'call_now']
    },
    {
      keywords: ['mantenimiento', 'limpieza', 'revision', 'filtros', 'maintenance', 'cleaning', 'manteniment', 'neteja'],
      answer: {
        es: '🧽 El mantenimiento anual incluye limpieza profunda de filtros y evaporador, revisión de presiones y gas, más informe. Desde <b>60€</b>. Alarga hasta un 40% la vida del equipo.',
        ca: '🧽 El manteniment anual inclou neteja profunda de filtres i evaporador, revisió de pressions i gas, més informe. Des de <b>60€</b>. Allarga fins a un 40% la vida de l’equip.',
        en: '🧽 Annual maintenance includes deep filter and evaporator cleaning, pressure and gas check, plus report. From <b>€60</b>. Extends unit life up to 40%.'
      },
      quick: ['book_maint', 'how_often', 'ask_price_short']
    },
    {
      keywords: ['garantia', 'warranty', 'asegurar'],
      answer: {
        es: '🛡️ Ofrecemos <b>2 años de garantía escrita</b> en instalación y equipos, sin letra pequeña. Técnicos certificados y marcas A+++.',
        ca: '🛡️ Oferim <b>2 anys de garantia escrita</b> en instal·lació i equips, sense lletra petita. Tècnics certificats i marques A+++.',
        en: '🛡️ We offer <b>2 years written warranty</b> on installation and equipment, no fine print. Certified technicians and A+++ brands.'
      },
      quick: ['view_services', 'quote']
    },
    {
      keywords: ['hoy', 'urgente', '24h', 'horario', 'today', 'urgent', 'hours', 'avui'],
      answer: {
        es: '⏰ Horario:<br>• <b>Lun-Vie</b>: 08:00 - 20:00<br>• <b>Sábado</b>: 09:00 - 18:00<br>• <b>Domingo</b>: urgencias<br><br>Servicio en el día en toda Barcelona. ¿Necesitas visita urgente?',
        ca: '⏰ Horari:<br>• <b>Dl-Dv</b>: 08:00 - 20:00<br>• <b>Dissabte</b>: 09:00 - 18:00<br>• <b>Diumenge</b>: urgències<br><br>Servei el mateix dia a tota Barcelona. Necessites visita urgent?',
        en: '⏰ Schedule:<br>• <b>Mon-Fri</b>: 08:00 - 20:00<br>• <b>Saturday</b>: 09:00 - 18:00<br>• <b>Sunday</b>: emergencies<br><br>Same-day service across Barcelona. Need an urgent visit?'
      },
      quick: ['urgent_yes', 'call_now', 'open_wa']
    },
    {
      keywords: ['zona', 'zonas', 'barcelona', 'cobertura', 'area', 'where', 'coverage', 'zones'],
      answer: {
        es: '📍 Trabajamos en toda <b>Barcelona y área metropolitana</b>. ¿Dónde estás?',
        ca: '📍 Treballem a tota <b>Barcelona i àrea metropolitana</b>. On ets?',
        en: '📍 We work across <b>Barcelona and metro area</b>. Where are you located?'
      },
      quick: ['quote', 'open_wa']
    },
    {
      keywords: ['telefono', 'llamar', 'whatsapp', 'email', 'persona', 'contacto', 'call', 'contact', 'telefon', 'contacte'],
      answer: {
        es: '📞 Contacta con nosotros:<br>• Tel: <a href="tel:+34600000000"><b>+34 600 000 000</b></a><br>• <a href="https://wa.me/34600000000" target="_blank">WhatsApp</a><br>• <a href="mailto:info@ecoclima-barcelona.es">info@ecoclima-barcelona.es</a><br><br>Te responde un técnico en menos de 10 min.',
        ca: '📞 Contacta amb nosaltres:<br>• Tel: <a href="tel:+34600000000"><b>+34 600 000 000</b></a><br>• <a href="https://wa.me/34600000000" target="_blank">WhatsApp</a><br>• <a href="mailto:info@ecoclima-barcelona.es">info@ecoclima-barcelona.es</a><br><br>Et respon un tècnic en menys de 10 min.',
        en: '📞 Contact us:<br>• Tel: <a href="tel:+34600000000"><b>+34 600 000 000</b></a><br>• <a href="https://wa.me/34600000000" target="_blank">WhatsApp</a><br>• <a href="mailto:info@ecoclima-barcelona.es">info@ecoclima-barcelona.es</a><br><br>A technician replies in less than 10 min.'
      },
      quick: ['open_wa_full', 'leave_data']
    },
    {
      keywords: ['calculadora', 'calcular', 'calculator', 'estimate', 'estimacion'],
      answer: {
        es: '🧮 Tenemos una <b>calculadora online</b> que te da el precio al instante según servicio, vivienda y accesibilidad. ¿Te llevo hasta ella?',
        ca: '🧮 Tenim una <b>calculadora online</b> que et dona el preu a l’instant segons servei, habitatge i accessibilitat. T’hi porto?',
        en: '🧮 We have an <b>online calculator</b> that gives instant pricing by service, property and accessibility. Want me to take you there?'
      },
      quick: ['go_calc', 'quote']
    },
    {
      keywords: ['descuento', 'oferta', 'promocion', 'discount', 'offer', 'descompte'],
      answer: {
        es: '🎉 Sí, esta semana <b>-20% en instalaciones</b> contratadas antes del domingo. Se aplica al solicitar presupuesto desde la web.',
        ca: '🎉 Sí, aquesta setmana <b>-20% en instal·lacions</b> contractades abans de diumenge. S’aplica en demanar pressupost des de la web.',
        en: '🎉 Yes, this week there is a <b>-20% discount on installations</b> booked before Sunday. Applied when requesting quote on the website.'
      },
      quick: ['book_discount', 'view_calc']
    },
    {
      keywords: ['marca', 'marcas', 'mitsubishi', 'daikin', 'lg', 'panasonic', 'brands', 'marques'],
      answer: {
        es: '🏷️ Trabajamos con Mitsubishi, Daikin, LG, Panasonic, Samsung, Toshiba, Fujitsu y Haier. Todas A+++.',
        ca: '🏷️ Treballem amb Mitsubishi, Daikin, LG, Panasonic, Samsung, Toshiba, Fujitsu i Haier. Totes A+++.',
        en: '🏷️ We work with Mitsubishi, Daikin, LG, Panasonic, Samsung, Toshiba, Fujitsu and Haier. All A+++.'
      },
      quick: ['recommend_brand', 'quote']
    },
    {
      keywords: ['consumo', 'factura', 'ahorro', 'consumption', 'bill', 'save', 'estalvi'],
      answer: {
        es: '⚡ Un equipo A+++ Inverter reduce hasta un <b>40% la factura de luz</b>. Te asesoramos gratis sobre el equipo ideal.',
        ca: '⚡ Un equip A+++ Inverter redueix fins a un <b>40% la factura de llum</b>. T’assessorem gratis sobre l’equip ideal.',
        en: '⚡ An A+++ Inverter unit can reduce your <b>electric bill by up to 40%</b>. We advise you for free on the ideal unit.'
      },
      quick: ['save_energy', 'quote']
    },
    {
      keywords: ['gracias', 'thanks', 'thank you', 'ok', 'perfecto', 'gracies'],
      answer: {
        es: '¡De nada! 😊 Si tienes cualquier pregunta, aquí estoy. ¿Quieres que te llamemos?',
        ca: 'De res! 😊 Si tens qualsevol pregunta, aquí estic. Vols que et truquem?',
        en: 'You are welcome! 😊 If you have any questions, I am here. Want us to call you?'
      },
      quick: ['call_me', 'more_q', 'open_wa']
    },
    {
      keywords: ['adios', 'bye', 'hasta luego', 'adeu', 'see you'],
      answer: {
        es: '¡Hasta pronto! ❄️ Recuerda: instalación en 24h con garantía escrita.',
        ca: 'Fins aviat! ❄️ Recorda: instal·lació en 24h amb garantia escrita.',
        en: 'See you soon! ❄️ Remember: 24h installation with written warranty.'
      },
      quick: ['quote']
    }
  ];

  const ACTIONS = {
    ask_price: 'precio',
    today: 'hoy urgente',
    issue: 'averia',
    human: 'persona',
    quote: 'presupuesto',
    use_calc: 'calculadora',
    go_calc: { scroll: '#calculadora', say: { es: 'Te llevo a la calculadora ⬇️', ca: 'Et porto a la calculadora ⬇️', en: 'Taking you to the calculator ⬇️' } },
    discount: 'descuento',
    flat: 'instalacion en piso',
    house: 'instalacion en casa',
    office: 'instalacion en oficina',
    no_cool: 'no enfria',
    noise: 'ruido',
    water: 'gotea agua',
    call_now: { link: 'tel:+34600000000', say: { es: 'Abriendo llamada... 📞', ca: 'Obrint trucada... 📞', en: 'Opening call... 📞' } },
    book_maint: 'mantenimiento',
    how_often: { say: { es: 'Recomendamos 1 revisión al año, idealmente antes del verano.', ca: 'Recomanem 1 revisió a l’any, idealment abans de l’estiu.', en: 'We recommend 1 check-up per year, ideally before summer.' } },
    ask_price_short: 'precio',
    view_services: { scroll: '#servicios', say: { es: 'Aquí tienes nuestros servicios ⬇️', ca: 'Aquí tens els nostres serveis ⬇️', en: 'Here are our services ⬇️' } },
    urgent_yes: {
      say: {
        es: 'Perfecto. Llámanos o déjanos tus datos y te contactamos en 10 min.',
        ca: 'Perfecte. Truca’ns o deixa les teves dades i et contactem en 10 min.',
        en: 'Perfect. Call us or leave your details and we will contact you in 10 min.'
      },
      quick: ['call_now', 'quote']
    },
    open_wa: { link: 'https://wa.me/34600000000', say: { es: 'Abriendo WhatsApp... 💬', ca: 'Obrint WhatsApp... 💬', en: 'Opening WhatsApp... 💬' } },
    open_wa_full: { link: 'https://wa.me/34600000000', say: { es: 'Abriendo WhatsApp... 💬', ca: 'Obrint WhatsApp... 💬', en: 'Opening WhatsApp... 💬' } },
    leave_data: { scroll: '#form-hero', say: { es: 'Formulario abierto, rellénalo ⬇️', ca: 'Formulari obert, omple’l ⬇️', en: 'Form opened, fill it in ⬇️' } },
    view_calc: { scroll: '#calculadora', say: { es: 'Calculadora ⬇️', ca: 'Calculadora ⬇️', en: 'Calculator ⬇️' } },
    book_discount: {
      scroll: '#form-hero',
      say: {
        es: '¡Reserva tu -20% rellenando el formulario! ⬇️',
        ca: 'Reserva el teu -20% omplint el formulari! ⬇️',
        en: 'Book your -20% by filling out the form! ⬇️'
      }
    },
    recommend_brand: {
      say: {
        es: 'Para pisos recomendamos <b>Mitsubishi MSZ-AP</b> (silencioso) o <b>Daikin Sensira</b> (mejor precio-calidad). ¿Quieres recomendación personalizada?',
        ca: 'Per a pisos recomanem <b>Mitsubishi MSZ-AP</b> (silenciós) o <b>Daikin Sensira</b> (millor qualitat-preu). Vols recomanació personalitzada?',
        en: 'For flats we recommend <b>Mitsubishi MSZ-AP</b> (quiet) or <b>Daikin Sensira</b> (best value). Do you want a personalized recommendation?'
      },
      quick: ['recommend_yes', 'quote']
    },
    recommend_yes: {
      scroll: '#form-hero',
      say: {
        es: 'Déjanos tus datos y un técnico te llama con opciones adaptadas.',
        ca: 'Deixa les teves dades i un tècnic et truca amb opcions adaptades.',
        en: 'Leave your details and a technician will call you with tailored options.'
      }
    },
    save_energy: {
      say: {
        es: 'Equipos A+++ Inverter ahorran hasta 40%. Además asesoramos la mejor posición.',
        ca: 'Els equips A+++ Inverter estalvien fins al 40%. També assessorem la millor posició.',
        en: 'A+++ Inverter units save up to 40%. We also advise on the best unit placement.'
      },
      quick: ['quote']
    },
    call_me: { scroll: '#form-hero', say: { es: 'Déjanos tu teléfono ⬇️', ca: 'Deixa el teu telèfon ⬇️', en: 'Leave your phone number ⬇️' } },
    more_q: {
      say: { es: '¿Sobre qué quieres saber más?', ca: 'Sobre què vols saber més?', en: 'What would you like to know more about?' },
      quick: ['topic_prices', 'topic_warranty', 'topic_zones', 'topic_brands']
    },
    topic_prices: 'precio',
    topic_warranty: 'garantia',
    topic_zones: 'barcelona zonas',
    topic_brands: 'marcas'
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
    let best = null;
    let bestScore = 0;
    for (const item of KB) {
      let score = 0;
      for (const kw of item.keywords) {
        const n = normalize(kw);
        if (t === n) score += 5;
        else if (t.includes(n)) score += n.length >= 5 ? 3 : 2;
      }
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
    return bestScore > 0 ? best : null;
  }

  function scrollToBottom() {
    dom.messages.scrollTop = dom.messages.scrollHeight;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
  }

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'bubble bubble--' + sender;
    if (sender === 'bot') msg.innerHTML = '<div class="bubble__avatar" aria-hidden="true">E</div><div class="bubble__body">' + text + '</div>';
    else msg.innerHTML = '<div class="bubble__body">' + escapeHtml(text) + '</div>';
    dom.messages.appendChild(msg);
    scrollToBottom();
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'bubble bubble--bot bubble--typing';
    t.id = 'typing';
    t.innerHTML = '<div class="bubble__avatar" aria-hidden="true">E</div><div class="bubble__body"><span></span><span></span><span></span></div>';
    dom.messages.appendChild(t);
    scrollToBottom();
  }

  function hideTyping() {
    const t = document.getElementById('typing');
    if (t) t.remove();
  }

  let currentQuickIds = [];
  function setQuick(ids) {
    currentQuickIds = ids || [];
    dom.quick.innerHTML = '';
    currentQuickIds.forEach((id) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chatbot__chip';
      btn.textContent = q(id);
      btn.addEventListener('click', () => handleQuickReply(id));
      dom.quick.appendChild(btn);
    });
  }

  function defaultQuick() {
    return ['ask_price', 'quote', 'open_wa'];
  }

  function respond(userText) {
    showTyping();
    const delay = 500 + Math.min(userText.length * 20, 1000);
    setTimeout(() => {
      hideTyping();
      const hit = match(userText);
      if (hit) {
        addMessage(textFor(hit.answer), 'bot');
        setQuick(hit.quick || defaultQuick());
      } else {
        addMessage(
          textFor({
            es: 'Mmm, no estoy seguro de haberte entendido 🤔. Puedo ayudarte con <b>precios</b>, <b>instalación</b>, <b>reparación</b>, <b>mantenimiento</b>, <b>garantía</b> o ponerte con un técnico.',
            ca: 'Mmm, no estic segur d’haver-te entès 🤔. Et puc ajudar amb <b>preus</b>, <b>instal·lació</b>, <b>reparació</b>, <b>manteniment</b>, <b>garantia</b> o posar-te amb un tècnic.',
            en: 'Hmm, I am not sure I understood 🤔. I can help with <b>prices</b>, <b>installation</b>, <b>repair</b>, <b>maintenance</b>, <b>warranty</b> or connect you with a technician.'
          }),
          'bot'
        );
        setQuick(['ask_price', 'issue', 'human', 'open_wa']);
      }
    }, delay);
  }

  function handleQuickReply(id) {
    addMessage(q(id), 'user');
    const action = ACTIONS[id];

    if (typeof action === 'string') {
      respond(action);
      return;
    }
    if (action && typeof action === 'object' && action.say) {
      showTyping();
      setTimeout(() => {
        hideTyping();
        addMessage(textFor(action.say), 'bot');
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

    respond(id);
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
        addMessage(
          textFor({
            es: '¡Hola! 👋 Soy el asistente virtual de <b>EcoClima Barcelona</b>. Estoy aquí 24/7 para responder sobre aire acondicionado. ¿En qué te ayudo?',
            ca: 'Hola! 👋 Sóc l’assistent virtual d’<b>EcoClima Barcelona</b>. Estic aquí 24/7 per respondre sobre aire condicionat. En què et puc ajudar?',
            en: 'Hi! 👋 I am the virtual assistant of <b>EcoClima Barcelona</b>. I am here 24/7 to answer AC questions. How can I help you?'
          }),
          'bot'
        );
        setQuick(['ask_price', 'today', 'issue', 'human']);
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
    setTimeout(() => {
      dom.widget.hidden = true;
    }, 250);
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

  document.addEventListener('ecoclima:langchange', () => {
    if (currentQuickIds.length) setQuick(currentQuickIds);
  });

  if (localStorage.getItem(LS_OPENED_KEY) && dom.badge) {
    dom.badge.hidden = true;
  }
})();
