/* ═══════════════════════════════════════════════════════════════
   Widget do chat — balão flutuante para o site do seu cliente.
   Cole antes do </body> do site:

   <script src="https://SEU-ENDERECO/widget.js" data-empresa="slug-da-empresa" data-cor="#4f46e5" async></script>
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var s = document.currentScript; if (!s) return;
  var slug = s.getAttribute('data-empresa'); if (!slug) return console.warn('[chat] faltou data-empresa no widget.js');
  var cor = s.getAttribute('data-cor') || '#4f46e5';
  var base = s.src.replace(/widget\.js(\?.*)?$/, '');
  var url = base + 'index.html?embed=1&c=' + encodeURIComponent(slug);

  var css = document.createElement('style');
  css.textContent =
    '.smw-btn{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;z-index:2147483000;' +
    'box-shadow:0 6px 24px rgba(0,0,0,.25);color:#fff;font-size:26px;display:flex;align-items:center;justify-content:center;transition:transform .15s}' +
    '.smw-btn:hover{transform:scale(1.06)}' +
    '.smw-box{position:fixed;right:20px;bottom:92px;width:380px;height:600px;max-height:calc(100vh - 110px);border-radius:18px;overflow:hidden;z-index:2147483000;' +
    'box-shadow:0 12px 48px rgba(0,0,0,.28);background:#fff;display:none}' +
    '.smw-box.on{display:block}.smw-box iframe{width:100%;height:100%;border:0}' +
    '@media (max-width:520px){.smw-box{right:0;bottom:0;width:100vw;height:100vh;max-height:none;border-radius:0}.smw-box.on~.smw-btn{bottom:auto;top:12px;right:12px;width:40px;height:40px;font-size:18px}}';
  document.head.appendChild(css);

  var box = document.createElement('div'); box.className = 'smw-box';
  var btn = document.createElement('button'); btn.className = 'smw-btn'; btn.style.background = cor;
  btn.setAttribute('aria-label', 'Abrir atendimento'); btn.textContent = '💬';
  var carregado = false;
  btn.onclick = function () {
    if (!carregado) { var f = document.createElement('iframe'); f.src = url; f.title = 'Atendimento'; f.allow = 'clipboard-write'; box.appendChild(f); carregado = true; }
    var abrir = !box.classList.contains('on');
    box.classList.toggle('on', abrir);
    btn.textContent = abrir ? '✕' : '💬';
    btn.setAttribute('aria-label', abrir ? 'Fechar atendimento' : 'Abrir atendimento');
  };
  document.body.appendChild(box);
  document.body.appendChild(btn);
})();
