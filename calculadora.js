// calculadora.js
import { darFeedback } from './utils.js';
import { mostrarToast } from './toast.js';
import { salvarDados } from './storage.js';
import { coletarDadosDaTabela } from './ui.js';
import { verificarAlertas } from './alerta.js';

let inputCalculadoraAtual = null;
let expressaoCalc = "";

export function abrirCalculadora(inputElement) {
    // (mesmo código anterior, usando as variáveis locais)
    darFeedback();
    inputElement.blur();
    inputCalculadoraAtual = inputElement;
    let tituloCalc = "🧮 Calculadora";
    if (inputElement.id === "novoQtd") {
        let nomeNovo = document.getElementById("novoProduto").value.trim();
        tituloCalc = nomeNovo ? "🧮 " + nomeNovo : "🧮 NOVO ITEM";
    } else {
        let linha = inputElement.closest("tr");
        if (linha) {
            let nomeTabela = linha.querySelector(".nome-prod").innerText.trim();
            tituloCalc = "🧮 " + nomeTabela;
        }
    }
    document.getElementById("calc-title").innerText = tituloCalc;
    let val = inputElement.value.replace(',', '.').trim();
    expressaoCalc = val || "";
    atualizarDisplayCalc();
    document.getElementById('modal-calc').style.display = 'flex';
}

export function fecharCalculadora() {
    darFeedback();
    document.getElementById('modal-calc').style.display = 'none';
    inputCalculadoraAtual = null;
}

export function calcDigito(digito) {
    darFeedback();
    if (digito === 'C') {
        expressaoCalc = "";
    } else if (digito === 'BACK') {
        expressaoCalc = expressaoCalc.slice(0, -1);
    } else {
        if (digito === ',') digito = '.';
        expressaoCalc += digito;
    }
    atualizarDisplayCalc();
}

function atualizarDisplayCalc() {
    let display = document.getElementById('calc-display');
    display.innerText = expressaoCalc.replace(/\./g, ',') || "0";
}

export function calcSalvar() {
    darFeedback();
    try {
        let expr = expressaoCalc.replace(/×/g, '*').replace(/÷/g, '/');
        expr = expr.replace(/[^0-9+\-*/.]/g, '');
        if (expr) {
            let resultado = Function('"use strict";return (' + expr + ')')();
            if (!isFinite(resultado)) throw new Error("Erro");
            resultado = Math.round(resultado * 100) / 100;
            inputCalculadoraAtual.value = resultado.toString().replace('.', ',');
        } else {
            inputCalculadoraAtual.value = "";
        }
        // Salva os dados atuais (pode ser que o campo seja da tabela)
        const dados = coletarDadosDaTabela();
        salvarDados(dados);
        fecharCalculadora();
        mostrarToast("Quantidade Salva ✅");
        verificarAlertas();
    } catch (e) {
        document.getElementById('calc-display').innerText = "Erro";
        setTimeout(atualizarDisplayCalc, 1000);
    }
}

// Para uso em outros módulos (ex: teclado.js)
export function getInputCalculadoraAtual() {
    return inputCalculadoraAtual;
}
