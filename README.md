# EcoClima Barcelona — Landing Page

Landing page de alta conversión para empresa de instalación, reparación y mantenimiento de aire acondicionado en Barcelona.

## Stack

- **HTML5** semántico con SEO, Open Graph y JSON-LD `LocalBusiness`
- **CSS3** puro — fluid responsive (clamp + grid auto-fit), mobile-first, REM
- **Vanilla JavaScript** (0 dependencias)
- **Google Fonts** — Inter
- Sin bundler, sin build — subir y listo

## Estructura

```
/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js          (header, menú, reveal, form, cookies)
│   ├── calculator.js    (calculadora interactiva de precio)
│   └── countdown.js     (cuenta atrás de oferta semanal)
├── images/              (añadir imágenes reales aquí)
└── README.md
```

## Secciones (12)

1. **Sticky Header** — logo, navegación, teléfono y CTA "Presupuesto"
2. **Hero** — H1 + subtítulo + CTA dobles + formulario lateral + trust badges
3. **Beneficios** — 4 iconos SVG outline
4. **Sale / Urgencia** — bloque rojo con countdown JS
5. **Problema → Solución** — 2 columnas (1 en móvil)
6. **Servicios** — 3 tarjetas con hover
7. **Calculadora interactiva** — JS en vivo con desglose
8. **Cómo trabajamos** — 4 pasos
9. **Opiniones** — 3 reviews con estrellas
10. **Cobertura Barcelona** — chips + Google Maps embebido
11. **Stats + CTA Final**
12. **Footer** — contacto, horario, redes sociales

Extras: **WhatsApp + Telegram flotantes**, **cookie consent**, **scroll reveal**.

## Despliegue

Cualquier hosting estático funciona:

- **Netlify / Vercel** — arrastra la carpeta, hecho
- **GitHub Pages** — push + activar Pages
- **Hosting tradicional (FTP)** — subir todo por FTP a `public_html`

## Personalización rápida

Edita estos valores antes de publicar:

### 1. Datos de contacto (en `index.html`)

Busca y reemplaza:

- `+34 600 000 000` → tu teléfono real
- `600000000` → sin prefijo (para WhatsApp: `wa.me/34XXXXXXXXX`)
- `info@ecoclima-barcelona.es` → tu email
- `t.me/ecoclima` → tu Telegram
- `ecoclima-barcelona.es` → tu dominio
- URLs de Facebook / Instagram

### 2. Google Analytics

En `index.html`, línea con `G-XXXXXXXXXX` — reemplaza por tu ID real de GA4.

### 3. Google Maps

Ya viene embebido apuntando a Barcelona. Para personalizar zona/dirección, cambia en `index.html`:

```html
<iframe src="https://www.google.com/maps?q=TU_DIRECCION&output=embed" ...>
```

### 4. Imagen Open Graph

Añade un archivo `images/og-cover.jpg` (1200 × 630 px) con tu branding.

### 5. Colores (en `css/style.css`)

Los tokens están en `:root` al inicio:

```css
--primary-600: #0284c7;  /* azul principal */
--accent:      #f97316;  /* naranja CTA */
```

## Formulario — conexión con backend

Actualmente el formulario tiene un **handler de demostración** que muestra "solicitud enviada".

Para conectarlo a un backend real, edita `js/main.js`, busca el bloque `form.addEventListener('submit', ...)` y reemplaza el `setTimeout` por:

```js
fetch('/api/lead', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, phone, message })
})
.then(r => r.json())
.then(() => { /* mostrar éxito */ })
.catch(() => { /* manejar error */ });
```

### Backend mínimo (Node.js + Express)

Si necesitas un backend rápido, ejemplo con Express + Nodemailer:

```js
// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());
app.use(express.static('.'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

app.post('/api/lead', async (req, res) => {
  const { name, phone, message } = req.body;
  await transporter.sendMail({
    from: '"EcoClima Web" <no-reply@ecoclima.es>',
    to: 'info@ecoclima-barcelona.es',
    subject: 'Nueva solicitud web',
    text: `Nombre: ${name}\nTel: ${phone}\n${message}`
  });
  res.json({ ok: true });
});

app.listen(3000);
```

Alternativas sin código: **Formspree**, **Getform**, **Netlify Forms**.

## Rendimiento

- **First Paint**: ~1s (CSS inline crítico no necesario por el tamaño)
- **Sin JS bloqueante** (todos los `<script>` usan `defer`)
- **Lazy loading** en iframe de Maps
- **Fuentes** con `preconnect` a Google Fonts
- **SVG inline** para iconos (evita peticiones)

## Accesibilidad

- HTML semántico (`header`, `main`, `section`, `footer`, `nav`)
- Contraste AA
- `aria-label` en botones icono
- `:focus-visible` personalizado
- `prefers-reduced-motion` respetado

## Licencia

Proyecto privado para EcoClima Barcelona.
