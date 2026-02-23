// compras.js
import { coletarDadosDaTabela } from './ui.js';
import { obterDataAmanha } from './utils.js'; // criaremos a seguir

const ulCompras = document.getElementById("lista-compras-visual");
const areaCompras = document.getElementById("area-compras");

export function atualizarPainelCompras() {
    ulCompras.innerHTML = "";
    var temItens = false;
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => {
        var checkbox = r.querySelector("input[type='checkbox']");
        if (checkbox && checkbox.checked) {
            temItens = true;
            var li = document.createElement("li");
            li.innerText = r.querySelector(".nome-prod").innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
            ulCompras.appendChild(li);
        }
    });
    areaCompras.style.display = temItens ? "block" : "none";
}

export function gerarTextoCompras() {
    let t = "*LISTA DE COMPRAS " + obterDataAmanha() + "*\n\n";
    let itens = [];
    document.querySelectorAll("#lista-itens-container tr:not(.categoria-header-row)").forEach(r => {
        var check = r.querySelector("input[type='checkbox']");
        if (check && check.checked) {
            itens.push(r.querySelector(".nome-prod").innerText.replace(/(\r\n|\n|\r)/gm, " ").trim());
        }
    });
    itens.sort();
    itens.forEach(i => t += `${i}\n`);
    return t;
}
