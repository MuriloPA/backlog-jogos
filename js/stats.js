import { separarLista, normalizar } from "./filtros.js";
import { tempoRestante } from "./sorteio.js";

export function formatarNumero(valor) {
    return Number(valor.toFixed(1)).toString().replace(".", ",");
}

export function calcularResumo(jogos) {
    const porStatus = { fila: 0, jogando: 0, zerado: 0 };
    let somaNotas = 0;
    let avaliados = 0;
    let horasJogadas = 0;
    let horasRestantesFila = 0;
    let filaSemEstimativa = 0;

    jogos.forEach((jogo) => {
        if (jogo.status in porStatus) porStatus[jogo.status] += 1;

        if (jogo.nota !== null) {
            somaNotas += Number(jogo.nota);
            avaliados += 1;
        }

        horasJogadas += Number(jogo.horas_jogadas);

        if (jogo.status === "fila") {
            const restante = tempoRestante(jogo);
            if (restante === null) {
                filaSemEstimativa += 1;
            } else {
                horasRestantesFila += restante;
            }
        }
    });

    return {
        total: jogos.length,
        porStatus: porStatus,
        notaMedia: avaliados > 0 ? somaNotas / avaliados : null,
        avaliados: avaliados,
        horasJogadas: horasJogadas,
        horasRestantesFila: horasRestantesFila,
        filaSemEstimativa: filaSemEstimativa
    };
}

export function contarGeneros(jogos) {
    const contagem = new Map();
    let semGenero = 0;

    jogos.forEach((jogo) => {
        const generos = separarLista(jogo.genero);
        if (generos.length === 0) {
            semGenero += 1;
            return;
        }

        generos.forEach((genero) => {
            const chave = normalizar(genero);
            const atual = contagem.get(chave);
            if (atual) {
                atual.total += 1;
            } else {
                contagem.set(chave, { nome: genero, total: 1 });
            }
        });
    });

    const itens = Array.from(contagem.values()).sort((a, b) =>
        b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );

    return { itens: itens, semGenero: semGenero };
}