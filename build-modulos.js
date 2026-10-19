// Genera una página de QUIZ por cada documento de un módulo (por defecto
// "normativa-general") a partir de <carpeta>/documentos.js, usando el tema único
// (style.css) sobre Bootstrap 5 en modo oscuro.
//
//   node build-modulos.js [carpeta]
//
// Cada documento puede incluir "f" (nombre de archivo html destino) para
// conservar nombres numerados, p. ej. "52-resolucion-suprema-212414", y
// "orden":true para conservar el orden original de las preguntas (por defecto
// se mezclan tanto preguntas como opciones).
// Los documentos se definen en <carpeta>/documentos.js:
//   module.exports = [ { i:"icono", n:"nombre", d:"detalle", q:["pregunta|correcta|mala1|mala2|mala3|retroalimentación", ...] }, ... ]
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const carpeta = process.argv[2] || 'normativa-general';
const docs = require(path.join(dir, carpeta, 'documentos.js'));

// Nombre de archivo a partir del nombre del documento
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);

// Nombre de archivo destino: usa el campo opcional "f" del documento o un slug del nombre
const archivo = d => (d.f || slug(d.n)) + '.html';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function paginaQuiz(doc) {
    const data = JSON.stringify(doc).replace(/<\//g, '<\\/');
    return `<!DOCTYPE html>
<html lang="es" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(doc.n)}</title>
    <meta name="description" content="${esc(doc.n)} — ${esc(doc.d)}. Cuestionario interactivo de ${doc.q.length} preguntas.">
    <meta property="og:title" content="${esc(doc.n)}">
    <meta property="og:description" content="${esc(doc.d)} · ${doc.q.length} preguntas — Sistema de Capacitación.">
    <meta property="og:type" content="website">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <div class="container py-4">
        <a href="../index.html" class="btn btn-sm btn-outline-secondary mb-4" onclick="if(history.length>1){history.back();return false;}">
            <i class="fas fa-arrow-left"></i> Volver al Panel
        </a>
        <header class="text-center mb-4">
            <h1 class="h3 fw-bold">${esc(doc.n)}</h1>
            <p class="text-body-secondary mb-0">${esc(doc.d)} · ${doc.q.length} preguntas</p>
        </header>

        <main id="app" class="mx-auto" style="max-width: 820px;"></main>
    </div>

    <script>
    // Cada pregunta: "pregunta|correcta|mala1|mala2|mala3|retroalimentación"
    const DOC=${data};
    const app=document.getElementById("app");
    let st={};
    const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
    function start(){
        const qs=(DOC.orden?DOC.q.slice():shuf(DOC.q)).map(s=>{const p=s.split("|");return{t:p[0],c:p[1],o:shuf(p.slice(1,5)),f:p[5]||""}});
        st={qs,n:0,ok:0};show();
    }
    function show(){
        const q=st.qs[st.n];
        app.innerHTML='<div class="progress mb-4" role="progressbar" aria-label="Avance" aria-valuenow="'+st.n+'" aria-valuemin="0" aria-valuemax="'+st.qs.length+'" style="height:8px"><div class="progress-bar" style="width:'+(st.n/st.qs.length*100)+'%"></div></div>'+
        '<div class="card shadow-sm"><div class="card-body p-4">'+
        '<div class="text-uppercase text-body-secondary fw-semibold mb-2" style="font-size:.75rem;letter-spacing:.05em">Pregunta '+(st.n+1)+' de '+st.qs.length+'</div>'+
        '<h2 class="h5 fw-semibold mb-3">'+q.t+'</h2>'+
        '<div id="o" class="d-grid gap-2"></div><div id="f"></div></div></div>';
        const o=document.getElementById("o");
        q.o.forEach(t=>{const b=document.createElement("button");b.type="button";b.className="btn btn-outline-secondary text-start";b.textContent=t;b.onclick=()=>answer(b,t,q);o.appendChild(b)});
    }
    function answer(b,t,q){
        [...document.querySelectorAll("#o .btn")].forEach(x=>{x.disabled=true;if(x.textContent===q.c)x.className="btn btn-success text-start"});
        if(t===q.c)st.ok++;else b.className="btn btn-danger text-start";
        const last=st.n===st.qs.length-1;
        document.getElementById("f").innerHTML=(q.f?'<div class="alert alert-secondary mt-3 mb-0"><b>'+(t===q.c?"✔ Correcto. ":"✘ Incorrecto. ")+'</b>'+q.f+'</div>':'')+'<button type="button" class="btn btn-primary mt-3" onclick="next()">'+(last?"Ver resultado":"Siguiente")+'</button>';
    }
    function next(){st.n++;st.n<st.qs.length?show():result()}
    function result(){
        const p=Math.round(st.ok/st.qs.length*100);
        app.innerHTML='<div class="card shadow-sm"><div class="card-body p-4 text-center"><h2 class="h4 mb-3">Resultado: '+st.ok+' / '+st.qs.length+' ('+p+'%)</h2><p class="text-body-secondary">'+(p>=80?"¡Excelente dominio!":p>=60?"Buen avance, repasa los errores.":"Sigue practicando, ¡tú puedes!")+'</p><button type="button" class="btn btn-primary me-2" onclick="start()">Reintentar</button><a class="btn btn-outline-secondary" href="../index.html">Volver al Panel</a></div></div>';
    }
    start();
    </script>
    <script src="../leer.js"></script>
</body>
</html>
`;
}

for (const d of docs) {
    fs.writeFileSync(path.join(dir, carpeta, archivo(d)), paginaQuiz(d), 'utf8');
}
console.log('Generadas ' + docs.length + ' páginas de quiz en ' + carpeta + '/');
