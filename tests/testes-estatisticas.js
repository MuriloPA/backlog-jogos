import { contarGeneros, contarPlataformas, contarNotas, horasPorGenero, maisJogados } from "../js/stats.js";

let contadorId = 0;
const resultados = [];

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
        criado_em: "2026-11-06T12:00:00Z",
        ...parcial
    };
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

teste("Gráficos novos", "contarPlataformas conta cada plataforma, junta variações e informa jogos sem plataforma", () => {
    const jogos = [
        criarJogo({ plataforma: "PC, PlayStation 5" }),
        criarJogo({ plataforma: "pc" }),
        criarJogo({ plataforma: "Switch" }),
        criarJogo()
    ];
    const { itens, semPlataforma } = contarPlataformas(jogos);
    igual(itens.map((item) => item.nome), ["PC", "PlayStation 5", "Switch"]);
    igual(itens.map((item) => item.total), [2, 1, 1]);
    igual(semPlataforma, 1);
});

teste("Gráficos novos", "contarGeneros continua devolvendo semGenero", () => {
    const { itens, semGenero } = contarGeneros([criarJogo({ genero: "RPG" }), criarJogo()]);
    igual(itens.length, 1);
    igual(semGenero, 1);
});

teste("Gráficos novos", "contarNotas devolve de 5 a 1 e inclui notas com zero jogos", () => {
    const jogos = [
        criarJogo({ nota: 5 }),
        criarJogo({ nota: 5 }),
        criarJogo({ nota: 3 }),
        criarJogo()
    ];
    igual(contarNotas(jogos), [
        { nota: 5, total: 2 },
        { nota: 4, total: 0 },
        { nota: 3, total: 1 },
        { nota: 2, total: 0 },
        { nota: 1, total: 0 }
    ]);
});

teste("Gráficos novos", "contarNotas com biblioteca vazia devolve tudo zero", () => {
    igual(contarNotas([]).map((item) => item.total), [0, 0, 0, 0, 0]);
});

teste("Gráficos novos", "horasPorGenero soma as horas, conta o jogo em todos os gêneros e ignora quem não tem horas", () => {
    const jogos = [
        criarJogo({ genero: "RPG, Ação", horas_jogadas: 10 }),
        criarJogo({ genero: "RPG", horas_jogadas: 5.5 }),
        criarJogo({ genero: "Puzzle", horas_jogadas: 0 }),
        criarJogo({ horas_jogadas: 8 })
    ];
    igual(horasPorGenero(jogos), [
        { nome: "RPG", horas: 15.5 },
        { nome: "Ação", horas: 10 }
    ]);
});

teste("Gráficos novos", "maisJogados ordena por horas, ignora quem tem zero e respeita o limite", () => {
    const jogos = [
        criarJogo({ titulo: "A", horas_jogadas: 5 }),
        criarJogo({ titulo: "B", horas_jogadas: 50 }),
        criarJogo({ titulo: "C", horas_jogadas: 0 }),
        criarJogo({ titulo: "D", horas_jogadas: 20 })
    ];
    igual(maisJogados(jogos, 2).map((jogo) => jogo.titulo), ["B", "D"]);
    igual(maisJogados(jogos, 10).map((jogo) => jogo.titulo), ["B", "D", "A"]);
});

function renderizar() {
    const area = document.getElementById("resultados-estatisticas");
    const resumo = document.getElementById("resumo-estatisticas");
    const aprovados = resultados.filter((resultado) => resultado.ok).length;

    resumo.textContent = aprovados + " de " + resultados.length + " testes dos gráficos novos passaram.";
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