// parser.js
import { mostrarToast } from './toast.js';
import { salvarDados } from './storage.js';
import { coletarDadosDaTabela } from './ui.js';

export function parseFractionToDecimal(str) {
    if (!str) return '';
    let s = str.trim().replace(',', '.');
    
    let fractionMatch = s.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
        let num = parseInt(fractionMatch[1]);
        let den = parseInt(fractionMatch[2]);
        if (den === 0) {
            mostrarToast("Denominador não pode ser zero.");
            return str;
        }
        return (num / den).toString().replace('.', ',');
    }
    
    let mixedMatch = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
        let whole = parseInt(mixedMatch[1]);
        let num = parseInt(mixedMatch[2]);
        let den = parseInt(mixedMatch[3]);
        if (den === 0) {
            mostrarToast("Denominador não pode ser zero.");
            return str;
        }
        return (whole + num / den).toString().replace('.', ',');
    }
    
    let num = parseFloat(s);
    if (!isNaN(num)) {
        return num.toString().replace('.', ',');
    }
    
    mostrarToast("Formato inválido. Use números ou frações (ex: 1/2, 2 1/2)");
    return str;
}

export function parseAndUpdateQuantity(input) {
    let original = input.value;
    let parsed = parseFractionToDecimal(original);
    if (parsed !== original) {
        input.value = parsed;
        const dados = coletarDadosDaTabela();
        salvarDados(dados);
    }
}
