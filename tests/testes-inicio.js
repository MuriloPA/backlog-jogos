import { saudacao, progressoDe, emAndamento, proximoDaFila, recentes, melhoresNotas } from "../js/destaques.js";

const AGORA = new Date("2026-11-06T12:00:00Z");
const MS_POR_DIA = 24 * 60 * 60 * 1000;

let contadorId = 0;
const resultados = [];

function diasAtras(dias) {
    return new Date(AGORA.getTime() - dias * MS_POR_DIA).toISOString();
}

function criarJogo(parcial = {}) {
    contadorId += 1;
    return {
        id: contadorId,
        titulo: "Jogo " + contadorId,
        plataforma: null,
        genero: null,
        capa_url: null,
        status: "fila",
        nota: null,
        horas_jogadas: 0,
        horas_estimadas: null,
        opiniao: null,
        criado_em: diasAtras(0),
        ...parcial
    };
}

function titulos(jogos) {
    return jogos.map((jogo) => jogo.titulo);
}

function teste(grupo, nome, funcao) {
    try {
        funcao();
        resultados.push({ grupo: grupo, nome: nome, ok: true });
    } catch (erro) {
        resultados.push({ grupo: grupo, nome: nome, ok: false, mensagem: erro.message });
    }
}

function igual(atual, esperado) {
    const textoAtual = JSON.stringify(atual);
    const textoEsperado = JSON.stringify(esperado);
    if (textoAtual !== textoEsperado) {
        throw new Error("esperado " + textoEsperado + " mas veio " + textoAtual);
    }
}

teste("Início", "saudacao muda conforme a hora do dia", () => {
    igual(saudacao(0), "Bom dia");
    igual(saudacao(11), "Bom dia");
    igual(saudacao(12), "Boa tarde");
    igual(saudacao(17), "Boa tarde");
    igual(saudacao(18), "Boa noite");
    igual(saudacao(23), "Boa noite");
});

teste("Início", "progressoDe usa horas jogadas sobre estimadas e nunca passa de 100%", () => {
    igual(progressoDe(criarJogo({ horas_jogadas: 5, horas_estimadas: 10 })), 0.5);
    igual(progressoDe(criarJogo({ horas_jogadas: 30, horas_estimadas: 10 })), 1);
    igual(progressoDe(criarJogo({ horas_jogadas: 5 })), null);
});

teste("Início", "emAndamento traz só jogos em andamento, do mais adiantado ao menos", () => {
    const jogos = [
        criarJogo({ titulo: "A", status: "jogando", horas_jogadas: 2, horas_estimadas: 10 }),
        criarJogo({ titulo: "B", status: "jogando", horas_jogadas: 9, horas_estimadas: 10 }),
        criarJogo({ titulo: "C", status: "fila" }),
        criarJogo({ titulo: "D", status: "jogando" }),
        criarJogo({ titulo: "E", status: "zerado" })
    ];
    igual(titulos(emAndamento(jogos, 10)), ["B", "A", "D"]);
});

teste("Início", "emAndamento respeita o limite", () => {
    const jogos = [
        criarJogo({ titulo: "A", status: "jogando" }),
        criarJogo({ titulo: "B", status: "jogando" }),
        criarJogo({ titulo: "C", status: "jogando" })
    ];
    igual(emAndamento(jogos, 2).length, 2);
});

teste("Início", "proximoDaFila escolhe o jogo que espera há mais tempo", () => {
    const jogos = [
        criarJogo({ titulo: "Novo", criado_em: diasAtras(2) }),
        criarJogo({ titulo: "Antigo", criado_em: diasAtras(30) }),
        criarJogo({ titulo: "Jogando", status: "jogando", criado_em: diasAtras(90) })
    ];
    igual(proximoDaFila(jogos, AGORA).titulo, "Antigo");
});

teste("Início", "proximoDaFila desempata pelo jogo mais curto e deixa os sem estimativa por último", () => {
    const jogos = [
        criarJogo({ titulo: "Sem estimativa", criado_em: diasAtras(10) }),
        criarJogo({ titulo: "Longo", criado_em: diasAtras(10), horas_estimadas: 40 }),
        criarJogo({ titulo: "Curto", criado_em: diasAtras(10), horas_estimadas: 5 })
    ];
    igual(proximoDaFila(jogos, AGORA).titulo, "Curto");
});

teste("Início", "proximoDaFila devolve null quando a fila está vazia", () => {
    igual(proximoDaFila([criarJogo({ status: "zerado" })], AGORA), null);
    igual(proximoDaFila([], AGORA), null);
});

teste("Início", "recentes ordena do mais novo ao mais antigo e respeita o limite", () => {
    const jogos = [
        criarJogo({ titulo: "Velho", criado_em: diasAtras(20) }),
        criarJogo({ titulo: "Novo", criado_em: diasAtras(1) }),
        criarJogo({ titulo: "Meio", criado_em: diasAtras(5) })
    ];
    igual(titulos(recentes(jogos, 2)), ["Novo", "Meio"]);
});

teste("Início", "recentes não altera a lista original", () => {
    const jogos = [criarJogo({ titulo: "A", criado_em: diasAtras(9) }), criarJogo({ titulo: "B", criado_em: diasAtras(1) })];
    recentes(jogos, 5);
    igual(titulos(jogos), ["A", "B"]);
});

teste("Início", "melhoresNotas só traz nota 4 ou 5, da maior para a menor", () => {
    const jogos = [
        criarJogo({ titulo: "A", nota: 4 }),
        criarJogo({ titulo: "B", nota: 5 }),
        criarJogo({ titulo: "C", nota: 3 }),
        criarJogo({ titulo: "D" })
    ];
    igual(titulos(melhoresNotas(jogos, 10)), ["B", "A"]);
});

teste("Início", "melhoresNotas desempata por horas jogadas", () => {
    const jogos = [
        criarJogo({ titulo: "Pouco", nota: 5, horas_jogadas: 3 }),
        criarJogo({ titulo: "Muito", nota: 5, horas_jogadas: 40 })
    ];
    igual(titulos(melhoresNotas(jogos, 10)), ["Muito", "Pouco"]);
});

function renderizar() {
    const area = document.getElementById("resultados-inicio");
    const resumo = document.getElementById("resumo-inicio");
    const aprovados = resultados.filter((resultado) => resultado.ok).length;

    resumo.textContent = aprovados + " de " + resultados.length + " testes da tela Início passaram.";
    resumo.className = aprovados === resultados.length ? "resumo ok" : "resumo erro";

    resultados.forEach((resultado) => {
        const linha = document.createElement("p");
        linha.className = resultado.ok ? "linha ok" : "linha erro";
        const marca = resultado.ok ? "✔ " : "✘ ";
        linha.textContent = marca + resultado.nome + (resultado.ok ? "" : " — " + resultado.mensagem);
        area.appendChild(linha);
    });
}

renderizar();