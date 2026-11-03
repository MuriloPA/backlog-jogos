import { separarLista, normalizar } from "./filtros.js";

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const DIAS_MAXIMOS = 365;
const DIAS_POR_PONTO = 7;

export function tempoRestante(jogo) {
    if (jogo.horas_estimadas === null) return null;
    return Math.max(Number(jogo.horas_estimadas) - Number(jogo.horas_jogadas), 0);
}

export function diasNaFila(jogo, agora = new Date()) {
    const dias = (agora - new Date(jogo.criado_em)) / MS_POR_DIA;
    return Math.max(Math.floor(dias), 0);
}

export function calcularPeso(jogo, agora = new Date()) {
    const dias = Math.min(diasNaFila(jogo, agora), DIAS_MAXIMOS);
    return 1 + dias / DIAS_POR_PONTO;
}

export function selecionarElegiveis(jogos, criterios) {
    const genero = normalizar(criterios.genero);
    const daFila = jogos.filter((jogo) => jogo.status === "fila");
    const doGenero = genero
        ? daFila.filter((jogo) => separarLista(jogo.genero).map(normalizar).includes(genero))
        : daFila;

    if (criterios.horas === null) {
        return { candidatos: doGenero, semEstimativa: 0 };
    }

    const semEstimativa = doGenero.filter((jogo) => tempoRestante(jogo) === null).length;
    const candidatos = doGenero.filter((jogo) => {
        const restante = tempoRestante(jogo);
        return restante !== null && restante <= criterios.horas;
    });

    return { candidatos, semEstimativa };
}

export function sortear(candidatos, agora = new Date(), aleatorio = Math.random) {
    if (candidatos.length === 0) return null;

    const pesos = candidatos.map((jogo) => calcularPeso(jogo, agora));
    const total = pesos.reduce((soma, peso) => soma + peso, 0);
    let ponto = aleatorio() * total;

    for (let i = 0; i < candidatos.length; i++) {
        ponto -= pesos[i];
        if (ponto < 0) return candidatos[i];
    }
    return candidatos[candidatos.length - 1];
}

export function chanceDe(jogo, candidatos, agora = new Date()) {
    const total = candidatos.reduce((soma, item) => soma + calcularPeso(item, agora), 0);
    if (total === 0) return 0;
    return calcularPeso(jogo, agora) / total;
}