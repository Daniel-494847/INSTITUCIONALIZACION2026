// Botón flotante "Leer" — síntesis de voz (Web Speech API).
// Lee en voz alta el contenido principal de la página (<article> o <main>)
// eligiendo la voz en español más natural disponible (neural/Google/microsoft).
// Extra: permite cambiar la voz desde un pequeño panel y recuerda la elección.
(function () {
    var contenido = document.querySelector('article') || document.querySelector('main');
    if (!contenido || !('speechSynthesis' in window)) return;

    /* ---------- Estilos inyectados ---------- */
    var css = document.createElement('style');
    css.textContent =
        '#lector-caja{position:fixed;right:18px;bottom:18px;z-index:1080;display:flex;flex-direction:column;align-items:flex-end;gap:.5rem;font-family:inherit}' +
        '#btn-leer{display:inline-flex;align-items:center;gap:.5rem;padding:.65rem 1.15rem;border:0;border-radius:999px;' +
        'background:#2563eb;color:#fff;font-weight:600;font-size:.95rem;font-family:inherit;cursor:pointer;' +
        'box-shadow:0 6px 18px -6px rgba(37,99,235,.7);transition:transform .15s ease,background .15s ease}' +
        '#btn-leer:hover{transform:translateY(-2px)}' +
        '#btn-leer:focus-visible{outline:2px solid #0f172a;outline-offset:2px}' +
        '#btn-leer.leer-pausa{background:#64748b;box-shadow:0 6px 18px -6px rgba(100,116,139,.7)}' +
        '#btn-voz{width:2.1rem;height:2.1rem;display:grid;place-items:center;border:1px solid rgba(15,23,42,.14);' +
        'border-radius:50%;background:#fff;color:#334155;font-size:.8rem;cursor:pointer;box-shadow:0 4px 12px -6px rgba(0,0,0,.35)}' +
        '#btn-voz:hover{background:#f1f5f9}' +
        '#panel-voz{display:none;width:min(19rem,78vw);padding:.75rem;background:#fff;border:1px solid rgba(15,23,42,.12);' +
        'border-radius:.8rem;box-shadow:0 12px 30px -12px rgba(15,23,42,.45)}' +
        '#panel-voz.abierto{display:block}' +
        '#panel-voz label{display:block;margin:0 0 .35rem;font-size:.72rem;font-weight:600;letter-spacing:.04em;' +
        'text-transform:uppercase;color:#64748b}' +
        '#sel-voz{width:100%;padding:.45rem .5rem;border:1px solid rgba(15,23,42,.16);border-radius:.5rem;' +
        'background:#fff;color:#1f2937;font-family:inherit;font-size:.85rem}' +
        '#panel-voz .fila{display:flex;gap:.4rem;margin-top:.55rem}' +
        '#panel-voz .fila button{flex:1;padding:.35rem .5rem;border:1px solid rgba(15,23,42,.14);border-radius:.5rem;' +
        'background:#fff;color:#334155;font-family:inherit;font-size:.8rem;font-weight:600;cursor:pointer}' +
        '#panel-voz .fila button:hover{background:#f1f5f9}';
    document.head.appendChild(css);

    /* ---------- Elementos ---------- */
    var caja = document.createElement('div');
    caja.id = 'lector-caja';
    caja.innerHTML =
        '<div id="panel-voz" role="dialog" aria-label="Elegir voz">' +
        '  <label for="sel-voz">Voz para leer</label>' +
        '  <select id="sel-voz"></select>' +
        '  <div class="fila">' +
        '    <button type="button" id="btn-probar"><i class="fas fa-play"></i> Probar</button>' +
        '    <button type="button" id="btn-cerrar">Cerrar</button>' +
        '  </div>' +
        '</div>' +
        '<button type="button" id="btn-voz" aria-label="Cambiar la voz" title="Cambiar la voz"><i class="fas fa-gear"></i></button>' +
        '<button type="button" id="btn-leer" aria-label="Leer el contenido en voz alta">' +
        '  <i class="fas fa-volume-high"></i><span> Leer</span>' +
        '</button>';
    document.body.appendChild(caja);

    var btnLeer = caja.querySelector('#btn-leer');
    var btnVoz = caja.querySelector('#btn-voz');
    var panel = caja.querySelector('#panel-voz');
    var selVoz = caja.querySelector('#sel-voz');

    /* ---------- Selección de voz natural ---------- */
    var CLAVE = 'voz-lector';
    var leyendo = false, pausado = false, vozActual = null;

    // Puntúa las voces en español: prioriza las voces naturales/neurales y,
    // en su defecto, las voces remotas (Google/Microsoft), que suenan mejor
    // que las locales robotizadas.
    function puntuar(v) {
        var n = (v.name || '').toLowerCase();
        var l = (v.lang || '').toLowerCase();
        if (l.indexOf('es') !== 0) return -1;
        var s = 0;
        if (/es[-_]es/.test(l)) s += 30;          // España
        else if (/es[-_](mx|us|419)/.test(l)) s += 20; // México / US / Latinoamérica
        else s += 10;                              // otro español
        if (/natural|neural|premium|enhanced|siri/.test(n)) s += 60;
        else if (/google/.test(n)) s += 40;
        else if (/microsoft/.test(n)) s += 25;
        else if (/elvira|luc[íi]a|m[óo]nica|pablo|jorge|dalia|ximena|esmeralda|alvaro|álvaro|helena/.test(n)) s += 15;
        if (v.localService === false) s += 10;    // voz en la nube: más natural
        if (v.default) s += 5;
        return s;
    }

    function voces() { return speechSynthesis.getVoices(); }

    function vocesEs() { return voces().filter(function (v) { return /^es/i.test(v.lang || ''); }); }

    function mejorVoz() {
        var guardada = null;
        try { guardada = localStorage.getItem(CLAVE); } catch (e) { }
        var lista = voces();
        if (guardada) {
            for (var i = 0; i < lista.length; i++) {
                if (lista[i].name === guardada) return lista[i];
            }
        }
        var best = null, bestScore = -1;
        lista.forEach(function (v) {
            var p = puntuar(v);
            if (p > bestScore) { bestScore = p; best = v; }
        });
        return best;
    }

    function cargarSelVoz() {
        var lista = voces().slice().sort(function (a, b) {
            return puntuar(b) - puntuar(a) || a.name.localeCompare(b.name);
        });
        selVoz.innerHTML = '';
        if (!lista.length) {
            selVoz.innerHTML = '<option>Cargando voces…</option>';
            return;
        }
        lista.forEach(function (v) {
            var o = document.createElement('option');
            o.value = v.name;
            o.textContent = v.name + ' (' + (v.lang || '?') + ')' + (puntuar(v) >= 40 ? ' · natural' : '');
            selVoz.appendChild(o);
        });
        var mejor = vozActual || mejorVoz();
        if (mejor) selVoz.value = mejor.name;
    }

    // Las voces suelen cargar de forma asíncrona: esperar al evento.
    function refrescarVoces() {
        vozActual = mejorVoz();
        if (panel.classList.contains('abierto')) cargarSelVoz();
    }
    if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
        speechSynthesis.addEventListener('voiceschanged', refrescarVoces);
    }
    refrescarVoces();

    /* ---------- Lectura ---------- */
    function setTexto(icono, texto, pausa) {
        btnLeer.innerHTML = '<i class="fas ' + icono + '"></i><span> ' + texto + '</span>';
        btnLeer.classList.toggle('leer-pausa', !!pausa);
    }

    function hablar() {
        var texto = contenido.innerText.replace(/\s+/g, ' ').trim();
        if (!texto) return;
        // Trocear en frases: evita los cortes por límites largos de Chrome
        // y permite pausar con naturalidad.
        var frases = texto.match(/[^.!?¡¿]+[.!?¡¿]*\s*/g) || [texto];
        vozActual = vozActual || mejorVoz();
        frases.forEach(function (frase) {
            frase = frase.trim();
            if (!frase) return;
            var u = new SpeechSynthesisUtterance(frase);
            if (vozActual) { u.voice = vozActual; u.lang = vozActual.lang; }
            else u.lang = 'es-ES';
            u.rate = 1;
            u.pitch = 1;
            speechSynthesis.speak(u);
        });
        leyendo = true;
        pausado = false;
        setTexto('fa-pause', 'Pausar', true);
    }

    function detener() {
        speechSynthesis.cancel();
        leyendo = false;
        pausado = false;
        setTexto('fa-volume-high', 'Leer', false);
    }

    btnLeer.addEventListener('click', function () {
        if (!leyendo) { hablar(); return; }
        if (pausado) {
            speechSynthesis.resume();
            pausado = false;
            setTexto('fa-pause', 'Pausar', true);
        } else {
            speechSynthesis.pause();
            pausado = true;
            setTexto('fa-play', 'Continuar', true);
        }
    });

    speechSynthesis.addEventListener('end', function () {
        // El último fragmento marca el final real de la lectura.
        if (!speechSynthesis.speaking && !speechSynthesis.pending) detener();
    });
    speechSynthesis.addEventListener('error', detener);
    window.addEventListener('beforeunload', function () { speechSynthesis.cancel(); });

    /* ---------- Panel de voz ---------- */
    btnVoz.addEventListener('click', function () {
        var ab = panel.classList.toggle('abierto');
        if (ab) cargarSelVoz();
    });
    caja.querySelector('#btn-cerrar').addEventListener('click', function () {
        panel.classList.remove('abierto');
    });
    selVoz.addEventListener('change', function () {
        var lista = voces();
        for (var i = 0; i < lista.length; i++) {
            if (lista[i].name === selVoz.value) {
                vozActual = lista[i];
                try { localStorage.setItem(CLAVE, vozActual.name); } catch (e) { }
                break;
            }
        }
    });
    caja.querySelector('#btn-probar').addEventListener('click', function () {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance('Hola, así se oirá la voz al leer el documento.');
        if (vozActual) { u.voice = vozActual; u.lang = vozActual.lang; }
        else u.lang = 'es-ES';
        speechSynthesis.speak(u);
    });
})();
