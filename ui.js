// ui.js
import { identificarCategoria, coresCategorias, nomesCategorias } from './categorias.js';
import { salvarDados } from './storage.js';
import { abrirCalculadora } from './calculadora.js';
import { atualizarPainelCompras } from './compras.js'; // será criado a seguir

let containerItens = document.getElementById("lista-itens-container");

export function renderizarListaCompleta(dados) {
    containerItens.innerHTML = "";
    dados.sort((a, b) => a.n.localeCompare(b.n));
    let grupos = {
        'carnes': [], 'laticinios': [], 'hortifruti': [], 'mercearia': [],
        'temperos': [], 'limpeza': [], 'bebidas': [], 'embalagens': [], 'outros': []
    };
    dados.forEach(item => {
        let cat = identificarCategoria(item.n);
        grupos[cat].push(item);
    });
    for (let cat in grupos) {
        if (grupos[cat].length > 0) {
            let trHeader = document.createElement("tr");
            trHeader.classList.add("categoria-header-row");
            trHeader.innerHTML = `<td colspan="4" class="categoria-header" style="background-color: ${coresCategorias[cat]}">${nomesCategorias[cat]}</td>`;
            containerItens.appendChild(trHeader);
            grupos[cat].forEach(item => {
                inserirLinhaNoDOM(item.n, item.q, item.u, item.c, item.min, item.max);
            });
        }
    }
}

export function inserirLinhaNoDOM(n, q, u, chk, min, max) {
    var tr = document.createElement("tr");
    if (chk) tr.classList.add("linha-marcada");
    tr.dataset.min = min !== null && min !== undefined ? min : '';
    tr.dataset.max = max !== null && max !== undefined ? max : '';

    tr.innerHTML = `
        <td class="col-check"><input type="checkbox" ${chk ? 'checked' : ''}></td>
        <td class="col-desc">
            <span contenteditable="true" class="nome-prod">${n}</span>
        </td>
        <td class="col-qtd"><input type="text" class="input-qtd-tabela" value="${q}" readonly></td>
        <td class="col-unid"><select class="select-tabela">
            <option value="kg" ${u === 'kg' ? 'selected' : ''}>kg</option>
            <option value="g" ${u === 'g' ? 'selected' : ''}>g</option>
            <option value="uni" ${u === 'uni' ? 'selected' : ''}>uni</option>
            <option value="pct" ${u === 'pct' ? 'selected' : ''}>pct</option>
            <option value="cx" ${u === 'cx' ? 'selected' : ''}>cx</option>
            <option value="bld" ${u === 'bld' ? 'selected' : ''}>bld</option>
            <option value="crt" ${u === 'crt' ? 'selected' : ''}>crt</option>
        </select></td>
    `;
    containerItens.appendChild(tr);
}

export function coletarDadosDaTabela() {
    let dados = [];
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => {
        var c = r.querySelectorAll("td");
        if (c.length > 0) {
            let nome = c[1].querySelector('.nome-prod').innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
            let qtd = c[2].querySelector("input").value.trim();
            let unid = c[3].querySelector("select").value;
            let chk = c[0].querySelector("input[type='checkbox']").checked;
            let min = r.dataset.min ? parseFloat(r.dataset.min) : null;
            let max = r.dataset.max ? parseFloat(r.dataset.max) : null;
            dados.push({ n: nome, q: qtd, u: unid, c: chk, min: min, max: max });
        }
    });
    return dados;
}

export function atualizarStatusSave() {
    var s = document.getElementById("status-save");
    s.style.opacity = "1";
    setTimeout(() => s.style.opacity = "0", 1500);
}

// Função que será chamada após salvar
export function salvarEAtualizar() {
    const dados = coletarDadosDaTabela();
    salvarDados(dados);
    renderizarListaCompleta(dados);
    atualizarDropdown();
}
