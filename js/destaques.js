import { diasNaFila, tempoRestante } from "./sorteio.js";

function compararTitulo(a, b) {
    return a.titulo.localeCompare(b.titulo, "pt-BR", { sensitivity: "base" });
}

function compararRestante(a, b) {
    const restanteA = tempoRestante(a);
    const restanteB = tempoRestante(b);
    if (restanteA === null && restanteB === null) return 0;
    if (restanteA === null) return 1;
    if (restanteB === null) return -1;
    return restanteA - restanteB;
}

export function saudacao(hora) {
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
}

export function progressoDe(jogo) {
    if (jogo.horas_estimadas === null || Number(jogo.horas_estimadas) <= 0) return null;
    return Math.min(Number(jogo.horas_jogadas) / Number(jogo.horas_estimadas), 1);
}

export function emAndamento(jogos, limite) {
    return jogos
        .filter((jogo) => jogo.status === "jogando")
        .sort((a, b) => {
            const progressoA = progressoDe(a) === null ? -1 : progressoDe(a);
            const progressoB = progressoDe(b) === null ? -1 : progressoDe(b);
            return progressoB - progressoA || compararTitulo(a, b);
        })
        .slice(0, limite);
}

export function proximoDaFila(jogos, agora = new Date()) {
    const fila = jogos
        .filter((jogo) => jogo.status === "fila")
        .sort((a, b) =>
            diasNaFila(b, agora) - diasNaFila(a, agora) ||
            compararRestante(a, b) ||
            compararTitulo(a, b)
        );
    return fila.length > 0 ? fila[0] : null;
}

export function recentes(jogos, limite) {
    return [...jogos]
        .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em) || b.id - a.id)
        .slice(0, limite);
}

export function melhoresNotas(jogos, limite) {
    return jogos
        .filter((jogo) => jogo.nota !== null && jogo.nota >= 4)
        .sort((a, b) =>
            b.nota - a.nota ||
            Number(b.horas_jogadas) - Number(a.horas_jogadas) ||
            compararTitulo(a, b)
        )
        .slice(0, limite);
}