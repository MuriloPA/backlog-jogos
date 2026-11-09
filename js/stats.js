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

function contarPorCampo(jogos, campo) {
    const contagem = new Map();
    let semValor = 0;

    jogos.forEach((jogo) => {
        const valores = separarLista(jogo[campo]);
        if (valores.length === 0) {
            semValor += 1;
            return;
        }

        valores.forEach((valor) => {
            const chave = normalizar(valor);
            const atual = contagem.get(chave);
            if (atual) {
                atual.total += 1;
            } else {
                contagem.set(chave, { nome: valor, total: 1 });
            }
        });
    });

    const itens = Array.from(contagem.values()).sort((a, b) =>
        b.total - a.total || a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );

    return { itens: itens, semValor: semValor };
}

export function contarGeneros(jogos) {
    const { itens, semValor } = contarPorCampo(jogos, "genero");
    return { itens: itens, semGenero: semValor };
}

export function contarPlataformas(jogos) {
    const { itens, semValor } = contarPorCampo(jogos, "plataforma");
    return { itens: itens, semPlataforma: semValor };
}

export function contarNotas(jogos) {
    const contagem = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    jogos.forEach((jogo) => {
        if (jogo.nota !== null && contagem[jogo.nota] !== undefined) {
            contagem[jogo.nota] += 1;
        }
    });

    return [5, 4, 3, 2, 1].map((nota) => ({ nota: nota, total: contagem[nota] }));
}

export function horasPorGenero(jogos) {
    const soma = new Map();

    jogos.forEach((jogo) => {
        const horas = Number(jogo.horas_jogadas);
        if (horas <= 0) return;

        separarLista(jogo.genero).forEach((genero) => {
            const chave = normalizar(genero);
            const atual = soma.get(chave);
            if (atual) {
                atual.horas += horas;
            } else {
                soma.set(chave, { nome: genero, horas: horas });
            }
        });
    });

    return Array.from(soma.values()).sort((a, b) =>
        b.horas - a.horas || a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
}

export function maisJogados(jogos, limite) {
    return jogos
        .filter((jogo) => Number(jogo.horas_jogadas) > 0)
        .sort((a, b) =>
            Number(b.horas_jogadas) - Number(a.horas_jogadas) ||
            a.titulo.localeCompare(b.titulo, "pt-BR", { sensitivity: "base" })
        )
        .slice(0, limite);
}