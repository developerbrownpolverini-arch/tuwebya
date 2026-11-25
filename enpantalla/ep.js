/*
 * enpantalla: datos (paletas, fuentes, rubros) + epPlayer, el reproductor.
 * epPlayer es ES5 y no usa nada de afuera: se serializa con toString() dentro del
 * HTML que se exporta, así lo que se ve en el editor es lo mismo que corre en la tele.
 */
(function (w) {
  'use strict';

  // Roles de color: fondo (superficie) / texto (tinta sobre el fondo) / primario (color de marca:
  // barra y bloques, siempre con letra blanca) / acento (etiquetas y precios sobre el primario)
  // / realce (color de precios y títulos de lista sobre el fondo). test.js valida los contrastes.
  var PALETAS = [
    { id: 'oceano', nombre: 'Océano', fondo: '#f3f8fb', texto: '#0b2540', primario: '#0b5c8f', acento: '#f5b942', realce: '#0b5c8f' },
    { id: 'salvia', nombre: 'Salvia', fondo: '#f3f7f2', texto: '#1c2b22', primario: '#2f6b4f', acento: '#f2c14e', realce: '#2f6b4f' },
    { id: 'marino', nombre: 'Marino y arena', fondo: '#f7f1e6', texto: '#1d2b36', primario: '#1f3a4d', acento: '#d4a95f', realce: '#1f3a4d' },
    { id: 'vino', nombre: 'Vino', fondo: '#f9f2ec', texto: '#2b1a1a', primario: '#6e1f2f', acento: '#e0b04a', realce: '#6e1f2f' },
    { id: 'brasa', nombre: 'Brasa', fondo: '#1b1411', texto: '#f6ece0', primario: '#b83a1e', acento: '#f2b134', realce: '#f2b134' },
    { id: 'tomate', nombre: 'Tomate', fondo: '#fff6ee', texto: '#2b1d16', primario: '#c2371b', acento: '#ffc83d', realce: '#c2371b' },
    { id: 'frambuesa', nombre: 'Frambuesa', fondo: '#fff1f5', texto: '#3a0d1f', primario: '#b0124f', acento: '#ffd447', realce: '#b0124f' },
    { id: 'noche', nombre: 'Noche', fondo: '#0f172a', texto: '#f1f5f9', primario: '#3730a3', acento: '#5eead4', realce: '#5eead4' },
    { id: 'grafito', nombre: 'Grafito', fondo: '#f2f2f0', texto: '#161616', primario: '#222222', acento: '#ff7a3d', realce: '#b8420f' }
  ];

  // archivo: el .woff2 de fonts/ que viaja dentro del paquete descargado
  var FUENTES = [
    { id: 'moderna', nombre: 'Moderna', titulo: 'Poppins', peso: 800, mayus: false, archivo: 'poppins-800.woff2' },
    { id: 'impacto', nombre: 'Impacto', titulo: 'Bebas Neue', peso: 400, mayus: true, archivo: 'bebasneue-400.woff2' },
    { id: 'elegante', nombre: 'Elegante', titulo: 'Playfair Display', peso: 800, mayus: false, archivo: 'playfair-800.woff2' },
    { id: 'clasica', nombre: 'Clásica', titulo: 'Oswald', peso: 700, mayus: true, archivo: 'oswald-700.woff2' }
  ];

  var LAYOUTS = [
    { id: 'oferta', nombre: 'Foto + texto' },
    { id: 'full', nombre: 'Foto completa' },
    { id: 'precio', nombre: 'Precio gigante' },
    { id: 'lista', nombre: 'Lista de precios u horarios' },
    { id: 'video', nombre: 'Video' }
  ];

  // Rubros: cada uno arranca con su propio estilo y avisos típicos de ese negocio.
  var RUBROS = [
    { id: 'clinica', nombre: 'Clínica / Consultorio', icono: '🩺', paleta: 'oceano', fuente: 'moderna', slides: [
      { layout: 'oferta', etiqueta: 'Turnos', titulo: 'Pedí tu turno online', texto: 'Escribinos por WhatsApp y evitá las esperas.\nLunes a viernes de 8 a 20 hs.', precio: '' },
      { layout: 'lista', titulo: 'Especialidades', texto: 'Clínica médica|Lun · Mié · Vie\nPediatría|Mar · Jue\nCardiología|Lun · Jue\nDermatología|Miércoles', precio: '', etiqueta: '' },
      { layout: 'precio', etiqueta: 'Consulta particular', titulo: 'Atención sin vueltas', texto: 'Con obra social, consultá la cobertura en recepción.', precio: '$30.000' },
      { layout: 'full', etiqueta: 'Prevención', titulo: 'Vacunación al día', texto: 'Calendario completo para chicos y adultos.', precio: '' },
      { layout: 'oferta', etiqueta: 'Laboratorio', titulo: 'Análisis sin turno', texto: 'De lunes a sábados de 7 a 10 hs.\nTraé tu orden médica y tu DNI.', precio: '' }
    ] },
    { id: 'hotel', nombre: 'Hotel / Hostel', icono: '🏨', paleta: 'marino', fuente: 'elegante', slides: [
      { layout: 'full', etiqueta: '', titulo: 'Bienvenidos', texto: 'Estamos felices de recibirte.\nRecepción 24 horas.', precio: '' },
      { layout: 'lista', titulo: 'Horarios', texto: 'Desayuno|7:00 a 10:30\nCheck-in|desde las 14:00\nCheck-out|hasta las 10:00\nPileta|9:00 a 20:00', precio: '', etiqueta: '' },
      { layout: 'oferta', etiqueta: 'Excursión', titulo: 'City tour', texto: 'Salida diaria a las 10 hs desde el lobby.\nReservá en recepción.', precio: '$30.000' },
      { layout: 'precio', etiqueta: 'Late check-out', titulo: 'Quedate un rato más', texto: 'Salida hasta las 16 hs. Consultá disponibilidad.', precio: '$15.000' },
      { layout: 'lista', titulo: 'Servicios', texto: 'Spa|Reservá en recepción\nLavandería|$4.000 por kilo\nTraslados|Consultá', precio: '', etiqueta: '' }
    ] },
    { id: 'gastronomia', nombre: 'Bar / Restaurante', icono: '🍔', paleta: 'brasa', fuente: 'impacto', slides: [
      { layout: 'full', etiqueta: 'Plato del día', titulo: 'Hamburguesa de la casa', texto: 'Doble carne, cheddar, panceta y papas.', precio: '$12.500' },
      { layout: 'precio', etiqueta: 'Lunes a jueves', titulo: 'Happy hour', texto: 'En todos los tragos de 19 a 21 hs.', precio: '2x1' },
      { layout: 'oferta', etiqueta: 'Mediodía', titulo: 'Menú ejecutivo', texto: 'Entrada + plato + bebida.\nDe lunes a viernes.', precio: '$14.900' },
      { layout: 'lista', titulo: 'Postres', texto: 'Flan casero|$5.000\nBrownie con helado|$6.500\nCheesecake|$6.800', precio: '', etiqueta: '' },
      { layout: 'full', etiqueta: '', titulo: 'Seguinos', texto: '@turestaurante\nReservas por WhatsApp', precio: '' }
    ] },
    { id: 'comercio', nombre: 'Comercio / Local', icono: '🛍️', paleta: 'frambuesa', fuente: 'clasica', slides: [
      { layout: 'precio', etiqueta: 'Solo esta semana', titulo: 'Liquidación de temporada', texto: 'Hasta agotar stock.', precio: '40% OFF' },
      { layout: 'oferta', etiqueta: 'Nuevo', titulo: 'Ya llegó la nueva colección', texto: 'Pasá a verla en el local.\nTalles del S al XXL.', precio: '' },
      { layout: 'precio', etiqueta: 'Medios de pago', titulo: 'Cuotas sin interés', texto: 'Con tarjetas seleccionadas.\nEfectivo: 10% de descuento.', precio: '6x' },
      { layout: 'lista', titulo: 'Combos', texto: 'Combo básico|$19.900\nCombo plus|$29.900\nCombo familiar|$39.900', precio: '', etiqueta: '' },
      { layout: 'full', etiqueta: '', titulo: 'Seguinos en Instagram', texto: '@tunegocio\nLunes a sábados de 9 a 20 hs.', precio: '' }
    ] }
  ];

  function porId(lista, id) {
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return lista[0];
  }

  function epPlayer(cfg, root, opts) {
    opts = opts || {};
    var V = cfg.orientacion === 'v', W = V ? 1080 : 1920, H = V ? 1920 : 1080;
    var P = cfg.p, F = cfg.f;
    function esc(t) {
      return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function url(u) { return /^(data:image\/|https?:\/\/|blob:|media\/)/.test(u || '') ? u : ''; }
    function bg(u) { return u ? 'background-image:url(' + JSON.stringify(url(u)).replace(/"/g, "'") + ')' : ''; }

    var css = '.ep-st{position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;transform-origin:0 0;overflow:hidden;' +
      'background:' + P.fondo + ';color:' + P.texto + ';font-family:Poppins,Arial,sans-serif}' +
      '.ep-st *{box-sizing:border-box;margin:0}' +
      '.ep-sl{position:absolute;left:0;top:0;right:0;bottom:0;opacity:0;transition:opacity .8s;display:flex;flex-direction:' + (V ? 'column' : 'row') + '}' +
      '.ep-sl.on{opacity:1}' +
      '.ep-ft{font-family:"' + F.titulo + '",Poppins,sans-serif;font-weight:' + F.peso + ';' + (F.mayus ? 'text-transform:uppercase;' : '') + 'line-height:1.05}' +
      '.ep-ph{background:linear-gradient(135deg,' + P.primario + ',' + P.acento + ')}' +
      '.ep-im{flex:1;background-size:cover;background-position:center}' +
      '.ep-tx{flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px;padding:' + (V ? '70px' : '90px') + '}' +
      '.ep-tx h1{font-size:' + (V ? 96 : 104) + 'px}' +
      '.ep-tx p{font-size:' + (V ? 44 : 40) + 'px;line-height:1.35;white-space:pre-line}' +
      '.ep-pr{font-size:' + (V ? 150 : 170) + 'px;color:' + P.realce + '}' +
      '.ep-tag{align-self:flex-start;background:' + P.acento + ';color:#1a1a1a;padding:10px 28px;border-radius:99px;font-size:34px;font-weight:800}' +
      '.ep-ov{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:flex-end;gap:24px;padding:90px 90px 150px;color:#fff;' +
      'background:linear-gradient(0deg,rgba(0,0,0,.78),rgba(0,0,0,.05) 70%)}' +
      '.ep-ov h1{font-size:' + (V ? 110 : 120) + 'px}.ep-ov p{font-size:44px;white-space:pre-line}.ep-ov .ep-pr{color:' + P.acento + '}' +
      '.ep-cen{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:30px;padding:90px;' +
      'background:' + P.primario + 'e6;color:#fff}' +
      '.ep-cen h1{font-size:' + (V ? 90 : 100) + 'px}.ep-cen p{font-size:44px}.ep-cen .ep-pr{font-size:' + (V ? 190 : 300) + 'px;color:' + P.acento + '}' +
      '.ep-li{flex:1;padding:90px 110px 160px;display:flex;flex-direction:column;justify-content:center;gap:34px;background:' + P.fondo + '}' +
      '.ep-li h1{font-size:96px;color:' + P.realce + '}' +
      '.ep-row{display:flex;justify-content:space-between;gap:40px;font-size:54px;border-bottom:3px dotted ' + P.realce + '66;padding-bottom:14px}' +
      '.ep-row b{color:' + P.realce + ';white-space:nowrap}' +
      '.ep-bar{position:absolute;left:0;right:0;bottom:0;height:90px;display:flex;align-items:center;justify-content:space-between;padding:0 60px;' +
      'background:' + P.primario + ';color:#fff;font-size:34px;z-index:2}' +
      '.ep-bar img{height:56px;margin-right:20px;border-radius:8px}.ep-bar span{display:flex;align-items:center}';

    var uid = 'ep' + Math.random().toString(36).slice(2, 8);
    // Cada instancia scopea su CSS: en la landing conviven varias con paletas distintas.
    css = css.replace(/(^|\})([^{}]+)\{/g, function (m, a, sel) {
      return a + sel.split(',').map(function (x) { return '#' + uid + ' ' + x; }).join(',') + '{';
    });
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    function slide(s) {
      var ft = 'ep-ft', img = bg(s.img), tag = s.etiqueta ? '<div class="ep-tag">' + esc(s.etiqueta) + '</div>' : '';
      var pr = s.precio ? '<div class="ep-pr ep-ft">' + esc(s.precio) + '</div>' : '';
      var h = '<h1 class="' + ft + '">' + esc(s.titulo) + '</h1>', t = s.texto ? '<p>' + esc(s.texto) + '</p>' : '';
      var ph = img ? '' : ' ep-ph';
      if (s.layout === 'full') return '<div class="ep-im' + ph + '" style="' + img + '"></div><div class="ep-ov">' + tag + h + t + pr + '</div>';
      if (s.layout === 'precio') return '<div class="ep-im' + ph + '" style="' + img + '"></div><div class="ep-cen">' + tag + h + pr + t + '</div>';
      if (s.layout === 'video') {
        var v = /^(https?:\/\/|blob:|media\/)/.test(s.video || '') ? '<video src="' + esc(s.video) + '" muted loop playsinline style="position:absolute;left:0;top:0;right:0;bottom:0;width:100%;height:100%;object-fit:cover"></video>' : '';
        return v + '<div class="ep-ov">' + h + t + '</div>';
      }
      if (s.layout === 'lista') {
        var rows = String(s.texto || '').split('\n').filter(Boolean).map(function (l) {
          var i = l.lastIndexOf('|');
          return '<div class="ep-row"><span>' + esc(i < 0 ? l : l.slice(0, i)) + '</span>' + (i < 0 ? '' : '<b class="ep-ft">' + esc(l.slice(i + 1)) + '</b>') + '</div>';
        }).join('');
        return '<div class="ep-li">' + h + rows + '</div>';
      }
      return '<div class="ep-im' + ph + '" style="' + img + '"></div><div class="ep-tx">' + tag + h + t + pr + '</div>';
    }

    var stage = document.createElement('div');
    stage.className = 'ep-st';
    var logo = url(cfg.logo) ? '<img src="' + url(cfg.logo) + '" alt="">' : '';
    var bar = '<div class="ep-bar"><span>' + logo + esc(cfg.nombre) + '</span><span>' + esc(cfg.pie) + '</span></div>';
    stage.innerHTML = cfg.slides.map(function (s) { return '<div class="ep-sl">' + slide(s) + '</div>'; }).join('') + bar;
    var wrap = document.createElement('div');
    wrap.id = uid;
    wrap.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden';
    wrap.appendChild(stage);
    root.innerHTML = '';
    root.appendChild(wrap);

    function fit() {
      var k = Math.min(root.clientWidth / W, root.clientHeight / H) || 1;
      stage.style.transform = 'scale(' + k + ')';
      stage.style.left = (root.clientWidth - W * k) / 2 + 'px';
      stage.style.top = (root.clientHeight - H * k) / 2 + 'px';
    }
    fit();
    window.addEventListener('resize', fit);

    var els = stage.querySelectorAll('.ep-sl'), cur = -1, timer = 0;
    function go(i) {
      if (!els.length) return;
      cur = (i + els.length) % els.length;
      for (var n = 0; n < els.length; n++) {
        els[n].className = 'ep-sl' + (n === cur ? ' on' : '');
        var vd = els[n].querySelector('video');
        if (vd) { if (n === cur) { vd.currentTime = 0; var pl = vd.play(); if (pl && pl.catch) pl.catch(function () {}); } else vd.pause(); }
      }
      if (!opts.fija && els.length > 1) {
        clearTimeout(timer);
        timer = setTimeout(function () { go(cur + 1); }, (cfg.slides[cur].segundos || 8) * 1000);
      }
    }
    go(opts.indice || 0);
    return { ir: go, fit: fit, parar: function () { clearTimeout(timer); window.removeEventListener('resize', fit); st.remove(); } };
  }

  // HTML autocontenido: las tipografías van inline (base64) y las fotos/videos por ruta relativa.
  function exportarHTML(cfg, fontCss) {
    var json = JSON.stringify(cfg).replace(/</g, '\\u003c');
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + cfg.nombre.replace(/[<>&"]/g, '') + ' · Pantalla</title><style>' + (fontCss || '') +
      'html,body{margin:0;height:100%;background:#000;overflow:hidden;cursor:none}#s{position:fixed;left:0;top:0;right:0;bottom:0}</style></head>' +
      '<body><div id="s"></div><script>(' + epPlayer.toString() + ')(' + json + ',document.getElementById("s"));<\/script></body></html>';
  }

  var CRC = (function () {
    var t = [];
    for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(d) {
    var c = 0xffffffff;
    for (var i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  // ZIP sin compresión (jpg, mp4 y woff2 ya vienen comprimidos): alcanza con "store".
  function zip(files) {
    var enc = new TextEncoder(), parts = [], central = [], off = 0, cdSize = 0;
    files.forEach(function (f) {
      var n = enc.encode(f.name), d = f.data, crc = crc32(d);
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(12, 0x21, true);
      h.setUint32(14, crc, true); h.setUint32(18, d.length, true); h.setUint32(22, d.length, true); h.setUint16(26, n.length, true);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(14, 0x21, true);
      c.setUint32(16, crc, true); c.setUint32(20, d.length, true); c.setUint32(24, d.length, true); c.setUint16(28, n.length, true); c.setUint32(42, off, true);
      parts.push(h.buffer, n, d); central.push(c.buffer, n);
      off += 30 + n.length + d.length; cdSize += 46 + n.length;
    });
    var e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cdSize, true); e.setUint32(16, off, true);
    return new Blob(parts.concat(central, [e.buffer]), { type: 'application/zip' });
  }

  function bytesDeDataURL(d) {
    var m = /^data:([^;]+);base64,(.*)$/.exec(d), bin = atob(m[2]), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return { mime: m[1], data: u };
  }
  function b64(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
    return btoa(s);
  }
  function faceCss(familia, peso, u8) {
    return '@font-face{font-family:"' + familia + '";font-weight:' + peso + ';src:url(data:font/woff2;base64,' + b64(u8) + ') format("woff2")}';
  }

  // Paquete descargable: index.html + media/ (fotos y videos). Se descomprime y se sube a un repo tal cual.
  // leer(ruta) devuelve los bytes de un archivo del sitio (fuentes); en el navegador es fetch.
  async function paquete(cfg, leer) {
    var c = JSON.parse(JSON.stringify(cfg)), files = [], enc = new TextEncoder();
    function ext(mime) { return mime === 'image/png' ? 'png' : 'jpg'; }
    if (c.logo && c.logo.indexOf('data:') === 0) {
      var l = bytesDeDataURL(c.logo); c.logo = 'media/logo.' + ext(l.mime); files.push({ name: c.logo, data: l.data });
    }
    for (var i = 0; i < c.slides.length; i++) {
      var s = c.slides[i];
      if (s.img && s.img.indexOf('data:') === 0) {
        var f = bytesDeDataURL(s.img); s.img = 'media/foto-' + (i + 1) + '.' + ext(f.mime); files.push({ name: s.img, data: f.data });
      }
      if (s.video && s.video.indexOf('blob:') === 0) {
        var m = /\.(mp4|webm|mov|m4v)$/i.exec(s.videoNombre || '');
        var v = new Uint8Array(await (await fetch(s.video)).arrayBuffer());
        s.video = 'media/video-' + (i + 1) + '.' + (m ? m[1].toLowerCase() : 'mp4'); files.push({ name: s.video, data: v });
      }
    }
    var fuente = porId(FUENTES, c.fuente), css = '';
    css += faceCss('Poppins', 500, await leer('fonts/poppins-500.woff2')) + faceCss('Poppins', 800, await leer('fonts/poppins-800.woff2'));
    if (fuente.titulo !== 'Poppins') css += faceCss(fuente.titulo, fuente.peso, await leer('fonts/' + fuente.archivo));
    files.unshift({ name: 'index.html', data: enc.encode(exportarHTML(c, css)) });
    files.push({ name: 'LEEME.txt', data: enc.encode('Pantalla de ' + c.nombre + '\n\nAbrí index.html en el navegador y poné pantalla completa (F11).\nFunciona sin internet. Para publicarla, subí esta carpeta tal cual a un hosting o repositorio.\n') });
    return zip(files);
  }

  w.EP = { PALETAS: PALETAS, FUENTES: FUENTES, LAYOUTS: LAYOUTS, RUBROS: RUBROS, porId: porId, player: epPlayer, exportarHTML: exportarHTML, paquete: paquete };
})(typeof window !== 'undefined' ? window : globalThis);
