export function separarLista(texto) {
    return (texto || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function normalizar(texto) {
    return (texto || "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function filtrarJogos(jogos, criterios) {
    const busca = normalizar(criterios.busca.trim());
    const plataforma = normalizar(criterios.plataforma);
    const genero = normalizar(criterios.genero);

    return jogos.filter((jogo) => {
        if (busca && !normalizar(jogo.titulo).includes(busca)) return false;
        if (criterios.status && jogo.status !== criterios.status) return false;
        if (plataforma) {
            const plataformasDoJogo = separarLista(jogo.plataforma).map(normalizar);
            if (!plataformasDoJogo.includes(plataforma)) return false;
        }
        if (genero) {
            const generosDoJogo = separarLista(jogo.genero).map(normalizar);
            if (!generosDoJogo.includes(genero)) return false;
        }
        return true;
    });
}

const COMPARADORES = {
    recentes: (a, b) => new Date(b.criado_em) - new Date(a.criado_em),
    antigos: (a, b) => new Date(a.criado_em) - new Date(b.criado_em),
    titulo: (a, b) => a.titulo.localeCompare(b.titulo, "pt-BR", { sensitivity: "base" }),
    nota: (a, b) => (b.nota ?? 0) - (a.nota ?? 0),
    horas: (a, b) => Number(b.horas_jogadas) - Number(a.horas_jogadas),
    curtos: (a, b) => {
        const tempoA = a.horas_estimadas === null ? Infinity : Number(a.horas_estimadas);
        const tempoB = b.horas_estimadas === null ? Infinity : Number(b.horas_estimadas);
        if (tempoA === tempoB) return 0;
        return tempoA - tempoB;
    }
};

export function ordenarJogos(jogos, chave) {
    const comparador = COMPARADORES[chave] || COMPARADORES.recentes;
    return [...jogos].sort(comparador);
}

export function listarOpcoes(jogos, extrair) {
    const vistos = new Map();
    jogos.forEach((jogo) => {
        extrair(jogo).forEach((valor) => {
            const chave = normalizar(valor);
            if (chave && !vistos.has(chave)) vistos.set(chave, valor);
        });
    });
    return Array.from(vistos.values()).sort((a, b) =>
        a.localeCompare(b, "pt-BR", { sensitivity: "base" })
    );
}