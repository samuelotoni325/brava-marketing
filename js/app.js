(function () {
  var cfg = window.BRAVA || {};
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temGsap = !!(window.gsap && window.ScrollTrigger);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var dolar = function (v) { return 'US$ ' + Math.round(v).toLocaleString('pt-BR'); };

  /* Conteúdo vindo da configuração */
  (cfg.lideres || []).forEach(function (l, i) {
    var el = $('[data-lider="' + i + '"]');
    if (!el || !l.nome) return;
    $('b', el).textContent = l.nome;
    $('span', el).textContent = l.cargo || '';
    el.hidden = false;
  });
  if (cfg.casos && cfg.casos.length) {
    var casos = $('#casos');
    cfg.casos.forEach(function (c) {
      var a = document.createElement('article');
      a.className = 'caso';
      [['b', c.numero], ['span', c.resultado], ['span', c.negocio + ' · ' + c.local], ['small', 'Fonte: ' + c.fonte]].forEach(function (p) {
        var e = document.createElement(p[0]);
        e.textContent = p[1];
        a.appendChild(e);
      });
      casos.appendChild(a);
    });
    casos.hidden = false;
  }

  /* Campo de passos da abertura: cada traço tem a inclinação do V e reage ao cursor */
  (function () {
    var c = $('#campo');
    if (!c) return;
    var x = c.getContext('2d'), W = 0, H = 0, pts = [], mx = -999, my = -999, ativo = true, t = 0;
    var dx = .426, dy = -.905, passo = 34;
    function mede() {
      var r = Math.min(window.devicePixelRatio || 1, 2), b = c.getBoundingClientRect();
      W = b.width; H = b.height;
      c.width = W * r; c.height = H * r;
      x.setTransform(r, 0, 0, r, 0, 0);
      passo = W < 700 ? 42 : 34;
      pts = [];
      for (var i = 0, px = 0; px < W + passo; px += passo, i++)
        for (var py = (i % 2) * passo / 2; py < H + passo; py += passo) pts.push([px, py]);
    }
    function traco(lista, cor, larg) {
      if (!lista.length) return;
      x.strokeStyle = cor; x.lineWidth = larg;
      x.beginPath();
      for (var i = 0; i < lista.length; i += 3) {
        x.moveTo(lista[i] - dx * lista[i + 2], lista[i + 1] - dy * lista[i + 2]);
        x.lineTo(lista[i] + dx * lista[i + 2], lista[i + 1] + dy * lista[i + 2]);
      }
      x.stroke();
    }
    function quadro() {
      x.clearRect(0, 0, W, H);
      var base = [], onda = [], quente = [];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], d = Math.hypot(p[0] - mx, p[1] - my), f = Math.max(0, 1 - d / 210);
        var w = Math.sin((p[0] * .905 + p[1] * .426) * .0075 - t * 1.1);
        w = w > .55 ? (w - .55) / .45 : 0;
        var tam = 3 + w * 3.5 + f * 9;
        (f > .4 ? quente : w > .25 || f > .1 ? onda : base).push(p[0], p[1], tam);
      }
      traco(base, '#1B2946', 2);
      traco(onda, '#3A4A70', 2.2);
      traco(quente, '#FF6B35', 2.6);
    }
    function loop() {
      if (ativo) { t += .016; quadro(); }
      requestAnimationFrame(loop);
    }
    mede();
    window.addEventListener('resize', mede);
    var h = $('.hero');
    h.addEventListener('pointermove', function (e) {
      var b = c.getBoundingClientRect();
      mx = e.clientX - b.left; my = e.clientY - b.top;
    });
    h.addEventListener('pointerleave', function () { mx = my = -999; });
    if (calmo) { quadro(); return; }
    new IntersectionObserver(function (e) { ativo = e[0].isIntersecting; }).observe(h);
    loop();
  })();

  /* Calculadora */
  (function () {
    var tk = $('#c-ticket'), fr = $('#c-freq'), nv = $('#c-novos'), barras = $('#r-barras');
    for (var i = 0; i < 12; i++) barras.appendChild(document.createElement('i'));
    var atual = 46800, alvo = { v: 46800 };
    function pinta(el) {
      el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%');
    }
    function calcula() {
      var t = +tk.value, f = +fr.value, n = +nv.value, porCliente = t * f, ano = n * 52, total = ano * porCliente;
      $('#o-ticket').textContent = dolar(t);
      $('#o-freq').textContent = f;
      $('#o-novos').textContent = n;
      $('#r-cliente').textContent = dolar(porCliente) + ' por ano';
      $('#r-ano').textContent = ano.toLocaleString('pt-BR');
      $('#r-semana').textContent = dolar(n * porCliente);
      [tk, fr, nv].forEach(pinta);
      $$('i', barras).forEach(function (b, m) { b.style.height = (14 + (m + 1) / 12 * 86) + '%'; });
      var el = $('#r-total');
      if (temGsap && !calmo) {
        gsap.killTweensOf(alvo);
        alvo.v = atual;
        gsap.to(alvo, { v: total, duration: .5, ease: 'power3.out', onUpdate: function () { el.textContent = dolar(alvo.v); } });
      } else el.textContent = dolar(total);
      atual = total;
    }
    [tk, fr, nv].forEach(function (e) { e.addEventListener('input', calcula); });
    calcula();
  })();

  /* Sistema: abas com avanço automático até a primeira interação */
  (function () {
    var D = [
      ['O cliente certo vê você primeiro.', 'Google, Instagram e Facebook levam sua oferta para quem está perto e pronto para comprar.'],
      ['Quem chega entende e confia.', 'Uma página rápida, feita para celular, com sua oferta clara e um único próximo passo.'],
      ['Interesse vira contato.', 'Cada clique segue para o WhatsApp, a ligação ou a reserva, com a origem registrada.'],
      ['Nenhum contato esfria.', 'Respostas rápidas e lembretes mantêm a conversa viva enquanto você atende quem está na sua frente.'],
      ['Você vê o que traz dinheiro.', 'Acompanhe de onde vêm os clientes e invista mais no que funciona.']
    ];
    var abas = $$('#abas button'), i = 0, tempo = null;
    function mostra(n, foco) {
      i = n;
      abas.forEach(function (a, k) {
        a.setAttribute('aria-selected', k === n ? 'true' : 'false');
        a.tabIndex = k === n ? 0 : -1;
      });
      if (foco) abas[n].focus();
      $('#painel-sis').setAttribute('aria-labelledby', 'aba-' + n);
      $('#sis-t').textContent = D[n][0];
      $('#sis-p').textContent = D[n][1];
      if (temGsap && !calmo) gsap.fromTo('.aba-texto', { y: 14 }, { y: 0, duration: .45, ease: 'power3.out' });
    }
    function para() { clearInterval(tempo); tempo = null; }
    abas.forEach(function (a, k) {
      a.addEventListener('click', function () { para(); mostra(k); });
      a.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault(); para();
        mostra((i + (e.key === 'ArrowDown' ? 1 : abas.length - 1)) % abas.length, true);
      });
    });
    if (!calmo) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting && tempo === null && tempo !== false) tempo = setInterval(function () { mostra((i + 1) % abas.length); }, 4200);
        else if (!e[0].isIntersecting && tempo) para();
      }).observe($('#sistema'));
    }
  })();

  /* Diagnóstico */
  (function () {
    var Q = [
      ['Quem procura seu serviço no Google encontra seu negócio?', 'Aparecer para quem já está procurando'],
      ['Seu perfil mostra em segundos o que você vende, onde e como comprar?', 'Deixar a oferta clara no perfil'],
      ['Você aparece toda semana, com conteúdo ou anúncios?', 'Manter presença constante'],
      ['Você sabe de onde veio seu último cliente?', 'Medir de onde vêm os clientes'],
      ['Um contato novo recebe resposta em poucos minutos?', 'Responder antes do concorrente']
    ];
    var R = [
      ['Seu negócio está escondido.', 'Quase todo cliente que poderia comprar de você ainda não tem como te encontrar.'],
      ['Seu negócio está escondido.', 'Quase todo cliente que poderia comprar de você ainda não tem como te encontrar.'],
      ['Tem presença, mas tem vazamento.', 'Parte do seu trabalho já aparece, mas clientes estão escapando no caminho.'],
      ['Tem presença, mas tem vazamento.', 'Parte do seu trabalho já aparece, mas clientes estão escapando no caminho.'],
      ['Falta pouco para virar referência.', 'A base está boa. Agora o ganho está em ajustar os detalhes e colocar mais força.'],
      ['Sua base está forte.', 'Você faz o essencial. O próximo passo é escalar o que já funciona.']
    ];
    var i = 0, sim = 0, falhas = [], marcas = $$('#diag-passos i');
    function pergunta() {
      $('#diag-n').textContent = 'Pergunta ' + (i + 1) + ' de ' + Q.length;
      $('#diag-p').textContent = Q[i][0];
    }
    function fim() {
      var r = R[sim];
      $('#diag-q').hidden = true;
      $('#diag-r').hidden = false;
      $('#diag-nota').textContent = sim + ' de ' + Q.length + ' pontos fortes';
      $('#diag-titulo').textContent = r[0];
      $('#diag-texto').textContent = r[1];
      var ul = $('#diag-falhas');
      ul.textContent = '';
      falhas.forEach(function (f) {
        var li = document.createElement('li');
        li.textContent = f;
        ul.appendChild(li);
      });
      $('#diag-campo').value = sim + '/5. Pontos a resolver: ' + (falhas.join('; ') || 'nenhum');
    }
    function responde(ok) {
      marcas[i].classList.add(ok ? 'ok' : 'feito');
      if (ok) sim++; else falhas.push(Q[i][1]);
      i++;
      if (i < Q.length) pergunta(); else fim();
    }
    $('#diag-sim').addEventListener('click', function () { responde(true); });
    $('#diag-nao').addEventListener('click', function () { responde(false); });
    $('#diag-refaz').addEventListener('click', function () {
      i = sim = 0; falhas = [];
      marcas.forEach(function (m) { m.className = ''; });
      $('#diag-campo').value = '';
      $('#diag-r').hidden = true;
      $('#diag-q').hidden = false;
      pergunta();
    });
  })();

  /* Formulário */
  (function () {
    var form = $('#form'), aviso = $('#aviso'), botao = $('#enviar');
    function diz(t) { aviso.hidden = false; aviso.textContent = t; }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var falta = Array.prototype.filter.call(form.elements, function (c) { return c.required && !c.value.trim(); });
      if (falta.length) { diz('Preencha todos os campos para continuar.'); falta[0].focus(); return; }
      var d = new FormData(form);
      if (cfg.envioFormulario) {
        botao.disabled = true;
        fetch(cfg.envioFormulario, { method: 'POST', body: d, headers: { Accept: 'application/json' } }).then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          diz('Recebemos seus dados. A BRAVA vai falar com você pelo WhatsApp.');
        }).catch(function () {
          diz('Não foi possível enviar agora. Tente de novo em instantes.');
        }).then(function () { botao.disabled = false; });
        return;
      }
      if (cfg.whatsapp) {
        var msg = 'Olá, BRAVA. Sou ' + d.get('nome') + ', do negócio ' + d.get('negocio') + ' (' + d.get('tipo') + '), em ' + d.get('cidade') + '. Quero atrair mais clientes.';
        if (d.get('diagnostico')) msg += ' Meu diagnóstico: ' + d.get('diagnostico');
        window.location.href = 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg);
        return;
      }
      diz('Prévia: seus dados não foram enviados. O formulário ainda será conectado.');
    });
  })();

  /* Botão fixo do celular aparece depois da abertura e some quando o formulário está na tela */
  (function () {
    var fixo = $('#fixo'), naAbertura = true, noForm = false;
    function atualiza() { fixo.classList.toggle('oculto', naAbertura || noForm); }
    new IntersectionObserver(function (e) { naAbertura = e[0].isIntersecting; atualiza(); }).observe($('.hero-txt'));
    new IntersectionObserver(function (e) { noForm = e[0].isIntersecting; atualiza(); }).observe($('#contato'));
  })();

  if (!temGsap || calmo) return;
  gsap.registerPlugin(ScrollTrigger);

  /* Títulos entram palavra por palavra */
  function divide(el) {
    function anda(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (n) {
        if (n.nodeType === 1) { anda(n); return; }
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          var m = document.createElement('span'), i = document.createElement('i');
          m.className = 'm'; i.textContent = p;
          m.appendChild(i); frag.appendChild(m);
        });
        no.replaceChild(frag, n);
      });
    }
    anda(el);
    return $$('.m i', el);
  }

  var titulo = $('#titulo');
  titulo.setAttribute('aria-label', titulo.textContent);
  var palavras = divide(titulo);

  /* Abertura: o V se monta e abre a página em duas lâminas a 65° */
  var cortina = document.createElement('div');
  cortina.className = 'cortina';
  cortina.setAttribute('aria-hidden', 'true');
  cortina.innerHTML = '<i></i><i></i><svg viewBox="0 -868 976 868"><path class="cv" fill="#F5F2EB" d="M0 -700H242.4L448.5 -262.4L516.1 -406H758.5L567.2 0H329.7Z"/><path class="cp" fill="#FF6B35" d="M536.8 -450L733.7 -868H976.1L779.2 -450Z"/></svg>';
  document.body.appendChild(cortina);

  var inicio = gsap.timeline({ onComplete: function () { cortina.remove(); } });
  /* Aba em segundo plano pausa a animação: a página nunca fica coberta */
  setTimeout(function () { if (inicio.progress() < 1) inicio.progress(1); }, 2600);
  inicio.from('.cv', { opacity: 0, duration: .25 })
    .from('.cp', { x: -94, y: 200, opacity: 0, duration: .5, ease: 'power4.out' }, .1)
    .to('.cortina svg', { opacity: 0, scale: 1.08, duration: .2 }, .72)
    .to('.cortina i:first-child', { xPercent: -130, duration: .8, ease: 'power4.inOut' }, .78)
    .to('.cortina i:last-of-type', { xPercent: 130, duration: .8, ease: 'power4.inOut' }, .78)
    .from(palavras, { yPercent: 115, duration: .8, stagger: .022, ease: 'power4.out' }, .95)
    .from('.hero-in', { y: 22, duration: .7, stagger: .08, ease: 'power3.out' }, 1.15)
    .from('.lider-a', { y: 60, duration: 1, ease: 'power3.out' }, .95)
    .from('.lider-b', { y: 80, duration: 1, ease: 'power3.out' }, 1.02)
    .from('#ponta', { x: -94, y: 200, duration: 1, ease: 'power4.out' }, 1)
    .from('.chip', { scale: .7, duration: .6, stagger: .12, ease: 'back.out(2)' }, 1.45);

  /* Fotos seguem o cursor com pesos diferentes */
  var palco = $('#palco');
  if (window.matchMedia('(pointer:fine)').matches) {
    var q = [['.lider-a', 12], ['.lider-b', 20], ['.palco-v', -14]].map(function (a) {
      return { x: gsap.quickTo(a[0], 'x', { duration: .8, ease: 'power3' }), p: a[1] };
    });
    $('.hero').addEventListener('pointermove', function (e) {
      var r = (e.clientX / window.innerWidth - .5) * 2;
      q.forEach(function (o) { o.x(r * o.p); });
    });
    /* Botões magnéticos */
    $$('.ima').forEach(function (b) {
      var bx = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' }), by = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        bx((e.clientX - r.left - r.width / 2) * .18);
        by((e.clientY - r.top - r.height / 2) * .3);
      });
      b.addEventListener('pointerleave', function () { bx(0); by(0); });
    });
  }

  /* Barra de progresso */
  gsap.to('#progresso', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

  /* A ponta do V sobe pela própria inclinação durante a rolagem */
  gsap.to('#ponta', { x: 47, y: -100, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Faixa acelera e inclina com a velocidade da rolagem */
  var faixa = $('#faixa'), xF = 0, meta = 1, largura = 1;
  function medeFaixa() { largura = faixa.scrollWidth / 2; }
  medeFaixa();
  window.addEventListener('resize', medeFaixa);
  var skew = gsap.quickTo(faixa, 'skewX', { duration: .4, ease: 'power3' });
  ScrollTrigger.create({
    onUpdate: function (s) {
      var v = s.getVelocity();
      meta = 1 + Math.min(Math.abs(v) / 300, 6);
      skew(gsap.utils.clamp(-10, 10, v / -180));
    }
  });
  gsap.ticker.add(function (t, d) {
    xF -= .05 * d * meta;
    meta += (1 - meta) * .04;
    if (-xF >= largura) xF += largura;
    gsap.set(faixa, { x: xF });
  });

  /* Manifesto acende palavra por palavra */
  var mf = $('#manifesto');
  mf.setAttribute('aria-label', mf.textContent);
  var pals = mf.textContent.split(' ').map(function (p) {
    var s = document.createElement('span');
    s.className = 'pal'; s.textContent = p + ' ';
    return s;
  });
  mf.textContent = '';
  pals.forEach(function (s) { mf.appendChild(s); });
  gsap.fromTo(pals, { color: '#55648A' }, {
    color: '#F5F2EB', stagger: .08, ease: 'none',
    scrollTrigger: { trigger: mf, start: 'top 82%', end: 'bottom 48%', scrub: .4 }
  });

  /* Entradas por movimento: o conteúdo já está visível em repouso */
  gsap.utils.toArray('.vaza').forEach(function (e, i) {
    gsap.from(e, { y: 70, duration: .9, delay: i * .08, ease: 'power3.out', scrollTrigger: { trigger: '.vazamentos', start: 'top 86%', once: true } });
  });
  gsap.from('.calc-res', { y: 60, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.calc', start: 'top 80%', once: true } });
  $$('.moldura img').forEach(function (i) {
    gsap.from(i, { y: 60, ease: 'none', scrollTrigger: { trigger: i.parentNode, start: 'top bottom', end: 'center center', scrub: true } });
  });

  /* Painel: linhas desenhadas pela rolagem */
  ['#linha-a', '#linha-b'].forEach(function (s) {
    var p = $(s), L = p.getTotalLength();
    gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#dash', start: 'top 85%', end: 'center 45%', scrub: .5 } });
  });
  gsap.from('.kpi i', { scaleX: .08, duration: 1.1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '#dash', start: 'top 80%', once: true } });

  /* Contadores */
  $$('[data-conta]').forEach(function (el) {
    var fim = +el.dataset.conta, o = { v: fim > 1000 ? fim - 3 : 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: function () {
        gsap.to(o, { v: fim, duration: 1.4, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
      }
    });
  });

  /* Método: trilho horizontal fixado, só em telas grandes */
  gsap.matchMedia().add('(min-width:1041px)', function () {
    var trilho = $('#trilho');
    var dist = function () { return Math.max(0, trilho.scrollWidth - window.innerWidth); };
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#metodo-pino', start: 'top 80px', end: function () { return '+=' + dist() * 1.15; },
        pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true
      }
    });
    tl.to(trilho, { x: function () { return -dist(); }, ease: 'none' }, 0)
      .to('#metodo-prog', { scaleX: 1, ease: 'none' }, 0);
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
