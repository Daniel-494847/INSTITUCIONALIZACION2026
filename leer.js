// Botón "Leer" — síntesis de voz (Web Speech API) para los resúmenes.
(function () {
    var article = document.querySelector('article');
    if (!article || !('speechSynthesis' in window)) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btn-leer';
    btn.setAttribute('aria-label', 'Leer el resumen en voz alta');
    btn.innerHTML = '<i class="fas fa-volume-high"></i><span> Leer</span>';
    btn.style.cssText =
        'position:fixed;bottom:20px;right:20px;z-index:1080;display:inline-flex;align-items:center;gap:.5rem;' +
        'padding:.6rem 1.1rem;border:none;border-radius:999px;background:#0d6efd;color:#fff;font-weight:600;' +
        'font-family:inherit;font-size:.95rem;box-shadow:0 4px 12px rgba(0,0,0,.25);cursor:pointer;' +
        'transition:transform .15s ease, background .15s ease;';
    btn.addEventListener('mouseenter', function () { btn.style.transform = 'translateY(-2px)'; });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    document.body.appendChild(btn);

    var leyendo = false, pausado = false;

    function setText(icon, label, bg) {
        btn.innerHTML = '<i class="fas ' + icon + '"></i><span> ' + label + '</span>';
        btn.style.background = bg;
    }

    function hablar() {
        var texto = article.innerText.replace(/\s+/g, ' ').trim();
        if (!texto) return;
        // Dividir en frases para evitar cortes en chunk largos.
        var partes = texto.match(/[^.!?¡¿]+[.!?¡¿]*\s*/g) || [texto];
        var u = new SpeechSynthesisUtterance();
        u.lang = 'es-ES';
        u.rate = 1;
        var voces = speechSynthesis.getVoices();
        var voz = voces.find(function (v) { return /^es/i.test(v.lang); });
        if (voz) u.voice = voz;
        speechSynthesis.speak(u);
        partes.forEach(function (p) {
            if (!p.trim()) return;
            var chunk = new SpeechSynthesisUtterance(p);
            chunk.lang = u.lang;
            if (voz) chunk.voice = voz;
            speechSynthesis.speak(chunk);
        });
        leyendo = true;
        pausado = false;
        setText('fa-pause', 'Pausar', '#6c757d');
    }

    function detener() {
        speechSynthesis.cancel();
        leyendo = false;
        pausado = false;
        setText('fa-volume-high', 'Leer', '#0d6efd');
    }

    btn.addEventListener('click', function () {
        if (!leyendo) { hablar(); return; }
        if (pausado) {
            speechSynthesis.resume();
            pausado = false;
            setText('fa-pause', 'Pausar', '#6c757d');
        } else {
            speechSynthesis.pause();
            pausado = true;
            setText('fa-play', 'Continuar', '#6c757d');
        }
    });

    // Si el usuario navega o el sistema corta la voz, resetear el botón.
    speechSynthesis.addEventListener('end', detener);
    speechSynthesis.addEventListener('error', detener);
    window.addEventListener('beforeunload', function () { speechSynthesis.cancel(); });
})();
