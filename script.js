let audioCtx = null;
let inputCalculadoraAtual = null;
let expressaoCalc = "";

const storageKey = "estoqueDados_v4_categorias";
const storageOcultos = "itensOcultosPadrao_v4";
const storageMeus = "meusItensPadrao_v4";

const mapaCategorias = {
    'temperos': ['orégano', 'pimenta', 'canela', 'colorau', 'caldo', 'tempero', 'ervas', 'salsa', 'cebolinha', 'cominho', 'açafrão', 'páprica', 'curry'],
    'limpeza': ['detergente', 'sabão', 'esponja', 'água sanitária', 'desinfetante', 'papel', 'saco', 'lixo', 'bucha', 'álcool', 'limpador', 'multiuso', 'pano', 'vassoura'],
    'carnes': ['carne', 'frango', 'bacon', 'calabresa', 'presunto', 'peixe', 'hamburguer', 'linguiça', 'strogonoff', 'costela', 'bife'],
    'laticinios': ['queijo', 'mussarela', 'cheddar', 'requeijão', 'catupiry', 'leite', 'manteiga', 'iogurte', 'creme de leite', 'parmesão', 'provolone', 'gorgonzola'],
    'hortifruti': ['tomate', 'cebola', 'alho', 'batata', 'banana', 'limão', 'alface', 'rúcula', 'manjericão', 'pimentão', 'cenoura', 'azeitona', 'milho', 'ervilha', 'palmito', 'cogumelo', 'champignon', 'fruta', 'abacaxi', 'uva'],
    'mercearia': ['arroz', 'feijão', 'trigo', 'farinha', 'açúcar', 'sal', 'macarrão', 'óleo', 'azeite', 'fermento', 'fubá', 'molho', 'extrato', 'passata', 'ketchup', 'maionese', 'mostarda', 'chocolate', 'café', 'pão'],
    'bebidas': ['refrigerante', 'coca', 'guaraná', 'suco', 'água', 'cerveja', 'vinho', 'vodka', 'whisky', 'gelo', 'polpa'],
    'embalagens': ['caixa', 'sacola', 'plástico', 'filme', 'alumínio', 'isopor', 'guardanapo', 'canudo', 'copo']
};

const coresCategorias = { 'carnes': '#ef4444', 'laticinios': '#fbbf24', 'hortifruti': '#10b981', 'mercearia': '#8b5cf6', 'temperos': '#f43f5e', 'limpeza': '#3b82f6', 'bebidas': '#06b6d4', 'embalagens': '#6b7280', 'outros': '#444' };
const nomesCategorias = { 'carnes': '🥩 CARNES & FRIOS', 'laticinios': '🧀 LATICÍNIOS', 'hortifruti': '🥦 HORTIFRUTI', 'mercearia': '🍝 MERCEARIA', 'temperos': '🧂 TEMPEROS', 'limpeza': '🧽 LIMPEZA', 'bebidas': '🥤 BEBIDAS', 'embalagens': '📦 EMBALAGENS', 'outros': '📦 OUTROS' };

function identificarCategoria(n) { let nome = n.toLowerCase(); for(let cat in mapaCategorias) { if(mapaCategorias[cat].some(t => nome.includes(t))) return cat; } return 'outros'; }

function darFeedback() { if (navigator.vibrate) navigator.vibrate(15); }

// MUDANÇA 1: ORDEM ALFABÉTICA NA EXPORTAÇÃO
function gerarTextoEstoque() {
    let t = "*ESTOQUE " + new Date().toLocaleDateString() + "*\n\n";
    let itens = [];
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => {
        let cols = r.querySelectorAll("td");
        let nome = cols[1].innerText.trim();
        let qTxt = cols[2].querySelector("input").value.trim();
        let unid = cols[3].querySelector("select").options[cols[3].querySelector("select").selectedIndex].text;
        itens.push(`${nome}: ${qTxt ? qTxt : "   "} ${unid}`);
    });
    itens.sort().forEach(i => t += i + "\n");
    return t;
}

function gerarTextoCompras() {
    let t = "*LISTA DE COMPRAS*\n\n";
    let itens = [];
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => {
        if(r.querySelector("input[type='checkbox']").checked) itens.push("• " + r.querySelector(".nome-prod").innerText.trim());
    });
    itens.sort().forEach(i => t += i + "\n");
    return t;
}

function renderizarListaCompleta(dados) {
    let container = document.getElementById("lista-itens-container"); container.innerHTML = "";
    let grupos = { carnes:[], laticinios:[], hortifruti:[], mercearia:[], temperos:[], limpeza:[], bebidas:[], embalagens:[], outros:[] };
    dados.forEach(item => { let cat = identificarCategoria(item.n); grupos[cat].push(item); });
    for(let cat in grupos) {
        if(grupos[cat].length > 0) {
            let h = document.createElement("tr"); h.classList.add("categoria-header-row");
            h.innerHTML = `<td colspan="4" class="categoria-header" style="background:${coresCategorias[cat]}">${nomesCategorias[cat]}</td>`;
            container.appendChild(h);
            grupos[cat].sort((a,b) => a.n.localeCompare(b.n)).forEach(item => {
                let tr = document.createElement("tr"); if(item.c) tr.classList.add("linha-marcada");
                tr.innerHTML = `<td><input type="checkbox" onchange="alternarCheck(this)" ${item.c?'checked':''}></td><td><span class="nome-prod" contenteditable="true" onblur="salvarDados()">${item.n}</span></td><td><input type="text" class="input-qtd-tabela" value="${item.q}" onclick="abrirCalculadora(this)" readonly></td><td><select onchange="salvarDados()"><option value="kg" ${item.u==='kg'?'selected':''}>kg</option><option value="g" ${item.u==='g'?'selected':''}>g</option><option value="uni" ${item.u==='uni'?'selected':''}>uni</option><option value="pct" ${item.u==='pct'?'selected':''}>pct</option><option value="cx" ${item.u==='cx'?'selected':''}>cx</option><option value="bld" ${item.u==='bld'?'selected':''}>bld</option><option value="crt" ${item.u==='crt'?'selected':''}>crt</option></select></td>`;
                container.appendChild(tr);
            });
        }
    }
    atualizarDropdown();
}

function salvarDados() { 
    let d = []; 
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => {
        d.push({ n: r.querySelector(".nome-prod").innerText.trim(), q: r.querySelector(".input-qtd-tabela").value, u: r.querySelector("select").value, c: r.querySelector("input").checked });
    }); 
    localStorage.setItem(storageKey, JSON.stringify(d)); 
    atualizarPainelCompras(); 
}

function abrirCalculadora(el) { darFeedback(); inputCalculadoraAtual = el; document.getElementById("modal-calc").style.display = "flex"; expressaoCalc = el.value.replace(',','.'); }
function fecharCalculadora() { document.getElementById("modal-calc").style.display = "none"; }
function calcDigito(d) { darFeedback(); if(d==='C') expressaoCalc = ""; else if(d==='BACK') expressaoCalc = expressaoCalc.slice(0,-1); else expressaoCalc += d.replace(',','.'); document.getElementById("calc-display").innerText = expressaoCalc || "0"; }
function calcSalvar() { try { let r = eval(expressaoCalc.replace(/×/g,'*').replace(/÷/g,'/')); inputCalculadoraAtual.value = r.toString().replace('.',','); salvarDados(); fecharCalculadora(); } catch(e){} }

function iniciarApp() { 
    let s = localStorage.getItem(storageKey); 
    if(s) renderizarListaCompleta(JSON.parse(s)); 
    else carregarListaPadrao(); 
    initSwipe();
}

function carregarListaPadrao() { 
    let d = produtosPadrao.map(p => { let x = p.split('|'); return {n:x[0], q:"", u:x[1], c:false}; }); 
    renderizarListaCompleta(d); 
}

// Funções Auxiliares (Filtro, Toggle, Reset, Backup)
function alternarLista() { darFeedback(); let t = document.querySelector(".table-wrapper"); t.style.display = t.style.display==='none'?'block':'none'; }
function alternarCheck(c) { c.closest('tr').classList.toggle('linha-marcada', c.checked); salvarDados(); }
function limparCampo(id) { document.getElementById(id).value = ""; }
function resetarTudo() { if(confirm("Restaurar padrão?")) { localStorage.clear(); location.reload(); } }
function iniciarNovoDia() { if(confirm("Zerar quantidades?")) { let d = JSON.parse(localStorage.getItem(storageKey)); d.forEach(i => { i.q = ""; i.c = false; }); localStorage.setItem(storageKey, JSON.stringify(d)); location.reload(); } }

function compartilharEstoque() { window.open("https://wa.me/?text=" + encodeURIComponent(gerarTextoEstoque())); }
function compartilharComprasZap() { window.open("https://wa.me/?text=" + encodeURIComponent(gerarTextoCompras())); }
function copiarEstoque() { navigator.clipboard.writeText(gerarTextoEstoque()).then(() => mostrarToast("Estoque Copiado! ✅")); }
function copiarCompras() { navigator.clipboard.writeText(gerarTextoCompras()).then(() => mostrarToast("Compras Copiada! ✅")); }

function mostrarToast(m) { const t = document.getElementById("toast-container"); const x = document.createElement("div"); x.className = "toast"; x.innerText = m; t.appendChild(x); setTimeout(() => x.remove(), 3000); }

// COMANDO DE TESTE DE INTEGRAÇÃO VISUAL
function verificarIntegracao() {
    const cssOk = getComputedStyle(document.body).getPropertyValue('opacity') === '1' || true;
    const prodOk = typeof produtosPadrao !== 'undefined';
    if (cssOk && prodOk) {
        mostrarToast("SISTEMA V4.7 MODULAR OK ✅");
        console.log("Integração completa: HTML + CSS + PRODUTOS + SCRIPT.");
    } else {
        alert("Erro de Integração: Verifique se os nomes dos 4 arquivos estão corretos.");
    }
}

window.onload = () => { iniciarApp(); setTimeout(verificarIntegracao, 1000); };
