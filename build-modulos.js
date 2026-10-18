// Genera una página de QUIZ por cada documento de un módulo (por defecto
// "normativa-general") a partir de <carpeta>/documentos.js, usando el tema único (style.css).
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

function paginaQuiz(doc) {
    const data = JSON.stringify(doc).replace(/<\//g, '<\\/');
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${doc.n}</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <a href="../index.html" class="btn-back">
                <i class="fas fa-arrow-left"></i> Volver al Panel
            </a>
            <h1 class="header-title">${doc.n}</h1>
            <p class="header-subtitle">${doc.d} · ${doc.q.length} preguntas</p>
        </header>

        <main id="app"></main>
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
        app.innerHTML='<div class="bar"><div style="width:'+(st.n/st.qs.length*100)+'%"></div></div>'+
        '<div class="box"><small>Pregunta '+(st.n+1)+' de '+st.qs.length+'</small><h3>'+q.t+'</h3><div id="o"></div><div id="f"></div></div>';
        const o=document.getElementById("o");
        q.o.forEach(t=>{const b=document.createElement("button");b.className="opt";b.textContent=t;b.onclick=()=>answer(b,t,q);o.appendChild(b)});
    }
    function answer(b,t,q){
        [...document.querySelectorAll(".opt")].forEach(x=>{x.disabled=true;if(x.textContent===q.c)x.classList.add("ok")});
        if(t===q.c)st.ok++;else b.classList.add("ko");
        const last=st.n===st.qs.length-1;
        document.getElementById("f").innerHTML=(q.f?'<p class="fb"><b>'+(t===q.c?"✔ Correcto. ":"✘ Incorrecto. ")+'</b>'+q.f+'</p>':'')+'<button class="btn" onclick="next()">'+(last?"Ver resultado":"Siguiente")+'</button>';
    }
    function next(){st.n++;st.n<st.qs.length?show():result()}
    function result(){
        const p=Math.round(st.ok/st.qs.length*100);
        app.innerHTML='<div class="box"><h2>Resultado: '+st.ok+' / '+st.qs.length+' ('+p+'%)</h2><p>'+(p>=80?"¡Excelente dominio!":p>=60?"Buen avance, repasa los errores.":"Sigue practicando, ¡tú puedes!")+'</p><button class="btn" onclick="start()">Reintentar</button><a class="btn g" href="../index.html">Volver al Panel</a></div>';
    }
    start();
    </script>
</body>
</html>
`;
}

for (const d of docs) {
    fs.writeFileSync(path.join(dir, carpeta, archivo(d)), paginaQuiz(d), 'utf8');
}
console.log('Generadas ' + docs.length + ' páginas de quiz en ' + carpeta + '/');
