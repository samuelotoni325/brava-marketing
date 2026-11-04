(function () {
  'use strict';
  var C = window.BRAVA || {};
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ano */
  var ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();

  /* instagram */
  var ig = $('#link-ig');
  if (ig && C.instagram) { ig.href = C.instagram; ig.hidden = false; }

  /* casos reais */
  if (Array.isArray(C.casos) && C.casos.length) {
    var g = $('#casos-grade');
    C.casos.forEach(function (c) {
      var a = document.createElement('article'); a.className = 'caso revela';
      [['caso__num', c.numero], ['caso__neg', c.negocio], ['caso__loc', c.local], ['caso__res', c.resultado], ['caso__fonte', c.fonte ? 'Fonte: ' + c.fonte : '']]
        .forEach(function (p) { if (!p[1]) return; var e = document.createElement('p'); e.className = p[0]; e.textContent = p[1]; a.appendChild(e); });
      g.appendChild(a);
    });
    $('#casos').hidden = false;
  }

  /* cabeçalho */
  var topo = $('#topo');
  var aoRolar = function () { topo.classList.toggle('rolou', window.scrollY > 12); };
  aoRolar(); window.addEventListener('scroll', aoRolar, { passive: true });

  /* link ativo */
  var links = $$('.topo__nav a');
  if ('IntersectionObserver' in window) {
    var mapa = {}; links.forEach(function (l) { mapa[l.getAttribute('href').slice(1)] = l; });
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting && mapa[e.target.id]) {
          links.forEach(function (l) { l.classList.remove('ativo'); l.removeAttribute('aria-current'); });
          mapa[e.target.id].classList.add('ativo'); mapa[e.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(mapa).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* entrada da abertura */
  var entra = $$('.entra');
  entra.forEach(function (el, i) { el.style.setProperty('--atraso', (reduz ? 0 : 90 + i * 110) + 'ms'); });
  requestAnimationFrame(function () { requestAnimationFrame(function () { entra.forEach(function (el) { el.classList.add('visto'); }); }); });

  /* revelação ao rolar */
  var revela = $$('.revela');
  var mostrarTudo = function () { revela.forEach(function (el) { el.classList.add('visto'); }); };
  if (reduz || !('IntersectionObserver' in window)) { mostrarTudo(); }
  else {
    var grupos = new Map();
    var ob = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, pai = el.parentElement;
        var n = grupos.get(pai) || 0; grupos.set(pai, n + 1);
        el.style.setProperty('--atraso', Math.min(n, 5) * 80 + 'ms');
        el.classList.add('visto'); ob.unobserve(el);
        setTimeout(function () { grupos.set(pai, Math.max(0, (grupos.get(pai) || 1) - 1)); }, 500);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    revela.forEach(function (el) { ob.observe(el); });
    /* segurança: nada fica escondido se o observador falhar */
    setTimeout(function () { revela.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < window.innerHeight) el.classList.add('visto'); }); }, 2500);
  }

  /* linha do método */
  var etapas = $('.etapas');
  if (etapas && 'IntersectionObserver' in window) {
    var oe = new IntersectionObserver(function (ents) {
      if (ents[0].isIntersecting) { etapas.style.setProperty('--prog', '100%'); oe.disconnect(); }
    }, { threshold: 0.4 });
    oe.observe(etapas);
  } else if (etapas) { etapas.style.setProperty('--prog', '100%'); }

  /* paralaxe só nos módulos decorativos */
  var mods = $$('[data-paralaxe]');
  if (!reduz && mods.length && window.matchMedia('(min-width: 641px)').matches) {
    var pedido = false;
    var mover = function () {
      var y = window.scrollY;
      if (y < 1200) mods.forEach(function (m) { m.style.transform = 'translate3d(0,' + (y * parseFloat(m.dataset.paralaxe)) + 'px,0)'; });
      pedido = false;
    };
    window.addEventListener('scroll', function () { if (!pedido) { pedido = true; requestAnimationFrame(mover); } }, { passive: true });
  }

  /* acordeão */
  $$('.ac__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var aberto = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!aberto));
      b.closest('.ac').classList.toggle('aberto', !aberto);
    });
  });

  /* formulário */
  var form = $('#form'), msg = $('#form-msg');
  if (form) form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    msg.className = 'form__msg'; msg.textContent = '';
    var faltando = null;
    $$('[required]', form).forEach(function (c) {
      var ok = c.value.trim() !== '';
      if (c.type === 'tel') ok = c.value.replace(/\D/g, '').length >= 10;
      c.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok && !faltando) faltando = c;
    });
    if (faltando) { msg.classList.add('erro'); msg.textContent = 'Confira os campos marcados.'; faltando.focus(); return; }

    var d = {}; new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
    var texto = 'Olá, BRAVA! Quero o diagnóstico grátis.\nNome: ' + d.nome + '\nEmpresa: ' + d.empresa + '\nServiço: ' + d.servico + '\nCidade: ' + d.cidade + '\nWhatsApp: ' + d.telefone;

    if (C.envioFormulario) {
      var btn = $('button[type=submit]', form); btn.disabled = true;
      fetch(C.envioFormulario, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(d) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); msg.textContent = 'Recebemos seu pedido. A BRAVA vai chamar você no WhatsApp.'; })
        .catch(function () {
          msg.classList.add('erro');
          msg.textContent = C.whatsapp ? 'Não foi possível enviar. Abrindo o WhatsApp…' : 'Não foi possível enviar agora. Tente de novo em instantes.';
          if (C.whatsapp) window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
        })
        .then(function () { btn.disabled = false; });
    } else if (C.whatsapp) {
      window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
      msg.textContent = 'Abrimos o WhatsApp com sua mensagem pronta. É só enviar.';
    } else {
      msg.classList.add('erro');
      msg.textContent = 'O contato ainda não foi configurado nesta página.';
    }
  });
})();
