/*
 * enpantalla: datos (paletas, fuentes, rubros) + epPlayer, el reproductor.
 * epPlayer es ES5 y no usa nada de afuera: se serializa con toString() dentro del
 * HTML que se exporta, así lo que se ve en el editor es lo mismo que corre en la tele.
 */
(function (w) {
  'use strict';

  var PALETAS = [
    { id: 'tomate', nombre: 'Tomate', fondo: '#fff4ec', primario: '#e85e31', acento: '#ffd23f', texto: '#2b1d16' },
    { id: 'noche', nombre: 'Noche', fondo: '#111827', primario: '#1f2937', acento: '#fbbf24', texto: '#f9fafb' },
    { id: 'menta', nombre: 'Menta', fondo: '#ecfdf5', primario: '#0f766e', acento: '#fbbf24', texto: '#064e3b' },
    { id: 'frambuesa', nombre: 'Frambuesa', fondo: '#fdf2f8', primario: '#be185d', acento: '#fde047', texto: '#500724' },
    { id: 'cafe', nombre: 'Café', fondo: '#f5ebe0', primario: '#6b4226', acento: '#e9b949', texto: '#3b2416' },
    { id: 'cielo', nombre: 'Cielo', fondo: '#eff6ff', primario: '#1d4ed8', acento: '#fb923c', texto: '#1e3a8a' }
  ];

  var FUENTES = [
    { id: 'moderna', nombre: 'Moderna', titulo: 'Poppins', peso: 800, mayus: false },
    { id: 'impacto', nombre: 'Impacto', titulo: 'Bebas Neue', peso: 400, mayus: true },
    { id: 'elegante', nombre: 'Elegante', titulo: 'Playfair Display', peso: 800, mayus: false },
    { id: 'clasica', nombre: 'Clásica', titulo: 'Oswald', peso: 700, mayus: true }
  ];

  var LAYOUTS = [
    { id: 'oferta', nombre: 'Foto + texto' },
    { id: 'full', nombre: 'Foto completa' },
    { id: 'precio', nombre: 'Precio gigante' },
    { id: 'lista', nombre: 'Lista de precios' },
    { id: 'video', nombre: 'Video (link .mp4)' }
  ];

  var FONTS_URL = 'https://fonts.googleapis.com/css2?family=Poppins:wght@500;800&family=Bebas+Neue&family=Playfair+Display:wght@800&family=Oswald:wght@700&display=swap';

  // Rubros: cada uno arranca con un estilo y slides de ejemplo para editar.
  var RUBROS = [
    { id: 'clinica', nombre: 'Clínica / Consultorio', icono: '🩺', paleta: 'cielo', fuente: 'moderna', slides: [
      { layout: 'oferta', titulo: 'Turnos online', texto: 'Pedí tu turno por WhatsApp, sin esperas.', precio: '', etiqueta: 'Nuevo' },
      { layout: 'precio', titulo: 'Consulta general', texto: 'Aceptamos las principales obras sociales.', precio: '$25.000', etiqueta: '' },
      { layout: 'lista', titulo: 'Especialidades', texto: 'Clínica médica|Lun a Vie\nPediatría|Mar y Jue\nDermatología|Miércoles', precio: '', etiqueta: '' }
    ] },
    { id: 'hotel', nombre: 'Hotel / Hostel', icono: '🏨', paleta: 'cafe', fuente: 'elegante', slides: [
      { layout: 'full', titulo: 'Bienvenidos', texto: 'Desayuno de 7 a 10 hs en el salón principal.', precio: '', etiqueta: '' },
      { layout: 'oferta', titulo: 'Late check-out', texto: 'Quedate hasta las 16 hs. Consultá en recepción.', precio: '$15.000', etiqueta: 'Promo' },
      { layout: 'lista', titulo: 'Excursiones', texto: 'City tour|$30.000\nCatamarán|$45.000\nTraslado aeropuerto|$20.000', precio: '', etiqueta: '' }
    ] },
    { id: 'gastronomia', nombre: 'Bar / Restaurante', icono: '🍔', paleta: 'tomate', fuente: 'impacto', slides: [
      { layout: 'full', titulo: 'Hamburguesa de la casa', texto: 'Doble carne, cheddar y panceta.', precio: '$12.500', etiqueta: 'Del día' },
      { layout: 'precio', titulo: '2x1 en tragos', texto: 'De lunes a jueves de 19 a 21 hs.', precio: '2x1', etiqueta: 'Happy hour' },
      { layout: 'lista', titulo: 'Postres', texto: 'Flan casero|$5.000\nBrownie con helado|$6.500\nCheesecake|$6.800', precio: '', etiqueta: '' }
    ] },
    { id: 'comercio', nombre: 'Comercio / Local', icono: '🛍️', paleta: 'frambuesa', fuente: 'clasica', slides: [
      { layout: 'oferta', titulo: 'Liquidación de temporada', texto: 'Hasta agotar stock.', precio: '40% OFF', etiqueta: 'Solo hoy' },
      { layout: 'precio', titulo: 'Combo del mes', texto: 'Consultá por nuestros combos.', precio: '$19.900', etiqueta: '' },
      { layout: 'full', titulo: 'Seguinos en Instagram', texto: '@tunegocio', precio: '', etiqueta: '' }
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
    function url(u) { return /^(data:image\/|https?:\/\/)/.test(u || '') ? u : ''; }
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
      '.ep-pr{font-size:' + (V ? 150 : 170) + 'px;color:' + P.primario + '}' +
      '.ep-tag{align-self:flex-start;background:' + P.acento + ';color:#1a1a1a;padding:10px 28px;border-radius:99px;font-size:34px;font-weight:800}' +
      '.ep-ov{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:flex-end;gap:24px;padding:90px 90px 150px;color:#fff;' +
      'background:linear-gradient(0deg,rgba(0,0,0,.78),rgba(0,0,0,.05) 70%)}' +
      '.ep-ov h1{font-size:' + (V ? 110 : 120) + 'px}.ep-ov p{font-size:44px;white-space:pre-line}.ep-ov .ep-pr{color:' + P.acento + '}' +
      '.ep-cen{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:30px;padding:90px;' +
      'background:' + P.primario + 'e6;color:#fff}' +
      '.ep-cen h1{font-size:' + (V ? 90 : 100) + 'px}.ep-cen p{font-size:44px}.ep-cen .ep-pr{font-size:' + (V ? 190 : 300) + 'px;color:' + P.acento + '}' +
      '.ep-li{flex:1;padding:90px 110px 160px;display:flex;flex-direction:column;justify-content:center;gap:34px;background:' + P.fondo + '}' +
      '.ep-li h1{font-size:96px;color:' + P.primario + '}' +
      '.ep-row{display:flex;justify-content:space-between;gap:40px;font-size:54px;border-bottom:3px dotted ' + P.primario + '66;padding-bottom:14px}' +
      '.ep-row b{color:' + P.primario + ';white-space:nowrap}' +
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
        var v = /^https?:\/\//.test(s.video || '') ? '<video src="' + esc(s.video) + '" muted loop playsinline style="position:absolute;left:0;top:0;right:0;bottom:0;width:100%;height:100%;object-fit:cover"></video>' : '';
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

  // HTML autocontenido para pasar por WhatsApp y abrir en la tele (F11 / pantalla completa).
  function exportarHTML(cfg) {
    var json = JSON.stringify(cfg).replace(/</g, '\\u003c');
    return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + cfg.nombre.replace(/[<>&"]/g, '') + ' · Pantalla</title><link rel="stylesheet" href="' + FONTS_URL + '">' +
      '<style>html,body{margin:0;height:100%;background:#000;overflow:hidden;cursor:none}#s{position:fixed;left:0;top:0;right:0;bottom:0}</style></head>' +
      '<body><div id="s"></div><script>(' + epPlayer.toString() + ')(' + json + ',document.getElementById("s"));<\/script></body></html>';
  }

  w.EP = { PALETAS: PALETAS, FUENTES: FUENTES, LAYOUTS: LAYOUTS, RUBROS: RUBROS, FONTS_URL: FONTS_URL, porId: porId, player: epPlayer, exportarHTML: exportarHTML };
})(window);
