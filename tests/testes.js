import { separarLista, normalizar, filtrarJogos, ordenarJogos, listarOpcoes } from "../js/filtros.js";
import { tempoRestante, diasNaFila, calcularPeso, selecionarElegiveis, sortear, chanceDe } from "../js/sorteio.js";
import { formatarNumero, calcularResumo, contarGeneros } from "../js/stats.js";

const AGORA = new Date("2026-11-06T12:00:00Z");
const MS_POR_DIA = 24 * 60 * 60 * 1000;
const FILTROS_VAZIOS = { busca: "", status: "", plataforma: "", genero: "" };

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

function criarAleatorio(semente) {
    let estado = semente;
    return () => {
        estado = (estado * 1664525 + 1013904223) % 4294967296;
        return estado / 4294967296;
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

function verdadeiro(condicao, mensagem) {
    if (!condicao) throw new Error(mensagem || "condição falsa");
}

function proximo(atual, esperado, margem = 0.0001) {
    if (Math.abs(atual - esperado) > margem) {
        throw new Error("esperado perto de " + esperado + " mas veio " + atual);
    }
}

teste("Filtros", "separarLista divide, limpa espaços e ignora vazios", () => {
    igual(separarLista("RPG, Ação ,, Indie"), ["RPG", "Ação", "Indie"]);
    igual(separarLista(null), []);
    igual(separarLista(""), []);
});

teste("Filtros", "normalizar ignora acentos e maiúsculas", () => {
    igual(normalizar("Ação"), "acao");
    igual(normalizar("HÁDES"), "hades");
    igual(normalizar(null), "");
});

teste("Filtros", "a busca por título ignora acentos", () => {
    const jogos = [criarJogo({ titulo: "Ação Total" }), criarJogo({ titulo: "Hades" })];
    igual(titulos(filtrarJogos(jogos, { ...FILTROS_VAZIOS, busca: "acao" })), ["Ação Total"]);
});

teste("Filtros", "filtra por status", () => {
    const jogos = [criarJogo({ titulo: "A", status: "zerado" }), criarJogo({ titulo: "B" })];
    igual(titulos(filtrarJogos(jogos, { ...FILTROS_VAZIOS, status: "zerado" })), ["A"]);
});

teste("Filtros", "o filtro de gênero acha jogos com vários gêneros e não casa pedaço de nome", () => {
    const jogos = [
        criarJogo({ titulo: "A", genero: "RPG, Ação" }),
        criarJogo({ titulo: "B", genero: "RPG de Mesa" }),
        criarJogo({ titulo: "C" })
    ];
    igual(titulos(filtrarJogos(jogos, { ...FILTROS_VAZIOS, genero: "Ação" })), ["A"]);
    igual(titulos(filtrarJogos(jogos, { ...FILTROS_VAZIOS, genero: "RPG" })), ["A"]);
});

teste("Filtros", "o filtro de plataforma acha jogos com várias plataformas", () => {
    const jogos = [
        criarJogo({ titulo: "A", plataforma: "PC, PlayStation 5" }),
        criarJogo({ titulo: "B", plataforma: "PC" })
    ];
    igual(titulos(filtrarJogos(jogos, { ...FILTROS_VAZIOS, plataforma: "PlayStation 5" })), ["A"]);
    igual(titulos(filtrarJogos(jogos, { ...FILTROS_VAZIOS, plataforma: "PC" })), ["A", "B"]);
});

teste("Filtros", "combina vários critérios ao mesmo tempo", () => {
    const jogos = [
        criarJogo({ titulo: "Disco", status: "fila", genero: "RPG" }),
        criarJogo({ titulo: "Witcher", status: "zerado", genero: "RPG" }),
        criarJogo({ titulo: "Celeste", status: "fila", genero: "Plataforma" })
    ];
    const criterios = { ...FILTROS_VAZIOS, status: "fila", genero: "RPG" };
    igual(titulos(filtrarJogos(jogos, criterios)), ["Disco"]);
});

teste("Ordenação", "título em ordem alfabética, ignorando acento", () => {
    const jogos = [criarJogo({ titulo: "Zelda" }), criarJogo({ titulo: "Ação" }), criarJogo({ titulo: "Hades" })];
    igual(titulos(ordenarJogos(jogos, "titulo")), ["Ação", "Hades", "Zelda"]);
});

teste("Ordenação", "maior nota primeiro, sem nota por último", () => {
    const jogos = [
        criarJogo({ titulo: "A", nota: 3 }),
        criarJogo({ titulo: "B" }),
        criarJogo({ titulo: "C", nota: 5 })
    ];
    igual(titulos(ordenarJogos(jogos, "nota")), ["C", "A", "B"]);
});

teste("Ordenação", "mais curtos primeiro, sem estimativa por último", () => {
    const jogos = [
        criarJogo({ titulo: "A", horas_estimadas: 10 }),
        criarJogo({ titulo: "B" }),
        criarJogo({ titulo: "C", horas_estimadas: 2 })
    ];
    igual(titulos(ordenarJogos(jogos, "curtos")), ["C", "A", "B"]);
});

teste("Ordenação", "mais horas jogadas primeiro", () => {
    const jogos = [criarJogo({ titulo: "A", horas_jogadas: 5 }), criarJogo({ titulo: "B", horas_jogadas: "20" })];
    igual(titulos(ordenarJogos(jogos, "horas")), ["B", "A"]);
});

teste("Ordenação", "mais recentes e mais antigos", () => {
    const jogos = [criarJogo({ titulo: "A", criado_em: diasAtras(10) }), criarJogo({ titulo: "B", criado_em: diasAtras(1) })];
    igual(titulos(ordenarJogos(jogos, "recentes")), ["B", "A"]);
    igual(titulos(ordenarJogos(jogos, "antigos")), ["A", "B"]);
});

teste("Ordenação", "não altera a lista original e usa 'recentes' se a chave for desconhecida", () => {
    const jogos = [criarJogo({ titulo: "Z" }), criarJogo({ titulo: "A" })];
    ordenarJogos(jogos, "titulo");
    igual(titulos(jogos), ["Z", "A"]);
    verdadeiro(Array.isArray(ordenarJogos(jogos, "chave-inexistente")), "deveria devolver uma lista");
});

teste("Filtros", "listarOpcoes não repete (ignora caixa e acento) e ordena", () => {
    const jogos = [criarJogo({ genero: "RPG, Ação" }), criarJogo({ genero: "rpg, Puzzle" }), criarJogo()];
    igual(listarOpcoes(jogos, (jogo) => separarLista(jogo.genero)), ["Ação", "Puzzle", "RPG"]);
});

teste("Sorteio", "tempoRestante desconta as horas jogadas e nunca fica negativo", () => {
    igual(tempoRestante(criarJogo({ horas_estimadas: 10, horas_jogadas: 4 })), 6);
    igual(tempoRestante(criarJogo({ horas_estimadas: 10, horas_jogadas: 15 })), 0);
    igual(tempoRestante(criarJogo()), null);
});

teste("Sorteio", "diasNaFila conta dias inteiros e nunca fica negativo", () => {
    igual(diasNaFila(criarJogo({ criado_em: diasAtras(10) }), AGORA), 10);
    igual(diasNaFila(criarJogo({ criado_em: diasAtras(10.5) }), AGORA), 10);
    igual(diasNaFila(criarJogo({ criado_em: diasAtras(-3) }), AGORA), 0);
});

teste("Sorteio", "o peso cresce com o tempo na fila e para em 365 dias", () => {
    proximo(calcularPeso(criarJogo({ criado_em: diasAtras(0) }), AGORA), 1);
    proximo(calcularPeso(criarJogo({ criado_em: diasAtras(70) }), AGORA), 11);
    proximo(calcularPeso(criarJogo({ criado_em: diasAtras(1000) }), AGORA), 1 + 365 / 7);
});

teste("Sorteio", "só entram jogos da fila, e sem limite de tempo todos os da fila entram", () => {
    const jogos = [
        criarJogo({ titulo: "Curto", horas_estimadas: 3 }),
        criarJogo({ titulo: "SemEstimativa" }),
        criarJogo({ titulo: "Jogando", status: "jogando", horas_estimadas: 2 }),
        criarJogo({ titulo: "Zerado", status: "zerado", horas_estimadas: 2 })
    ];
    const { candidatos, semEstimativa } = selecionarElegiveis(jogos, { horas: null, genero: "" });
    igual(titulos(candidatos), ["Curto", "SemEstimativa"]);
    igual(semEstimativa, 0);
});

teste("Sorteio", "o limite de tempo usa o tempo restante e conta os jogos sem estimativa", () => {
    const jogos = [
        criarJogo({ titulo: "Curto", horas_estimadas: 3 }),
        criarJogo({ titulo: "Longo", horas_estimadas: 40 }),
        criarJogo({ titulo: "Quase", horas_estimadas: 12, horas_jogadas: 9 }),
        criarJogo({ titulo: "SemEstimativa" })
    ];
    const { candidatos, semEstimativa } = selecionarElegiveis(jogos, { horas: 5, genero: "" });
    igual(titulos(candidatos), ["Curto", "Quase"]);
    igual(semEstimativa, 1);
});

teste("Sorteio", "o limite é inclusivo: tempo restante igual ao limite entra", () => {
    const jogos = [criarJogo({ titulo: "Exato", horas_estimadas: 5 }), criarJogo({ titulo: "Passou", horas_estimadas: 5.5 })];
    igual(titulos(selecionarElegiveis(jogos, { horas: 5, genero: "" }).candidatos), ["Exato"]);
});

teste("Sorteio", "o filtro de gênero funciona junto com o de tempo", () => {
    const jogos = [
        criarJogo({ titulo: "Puzzle curto", horas_estimadas: 3, genero: "Puzzle" }),
        criarJogo({ titulo: "RPG longo", horas_estimadas: 40, genero: "RPG" }),
        criarJogo({ titulo: "RPG quase", horas_estimadas: 12, horas_jogadas: 9, genero: "RPG" }),
        criarJogo({ titulo: "RPG sem estimativa", genero: "RPG" })
    ];
    const { candidatos, semEstimativa } = selecionarElegiveis(jogos, { horas: 5, genero: "rpg" });
    igual(titulos(candidatos), ["RPG quase"]);
    igual(semEstimativa, 1);
});

teste("Sorteio", "nenhum candidato devolve lista vazia", () => {
    const jogos = [criarJogo({ horas_estimadas: 30 })];
    igual(selecionarElegiveis(jogos, { horas: 2, genero: "" }).candidatos, []);
    igual(sortear([], AGORA), null);
});

teste("Sorteio", "a roleta respeita os pesos nos extremos", () => {
    const novo = criarJogo({ titulo: "Novo" });
    const velho = criarJogo({ titulo: "Velho", criado_em: diasAtras(70) });
    const candidatos = [novo, velho];
    igual(sortear(candidatos, AGORA, () => 0).titulo, "Novo");
    igual(sortear(candidatos, AGORA, () => 0.05).titulo, "Novo");
    igual(sortear(candidatos, AGORA, () => 0.1).titulo, "Velho");
    igual(sortear(candidatos, AGORA, () => 0.999999).titulo, "Velho");
});

teste("Sorteio", "em 10.000 sorteios o jogo mais antigo sai cerca de 92% das vezes", () => {
    const novo = criarJogo({ titulo: "Novo" });
    const velho = criarJogo({ titulo: "Velho", criado_em: diasAtras(70) });
    const aleatorio = criarAleatorio(2026);
    const total = 10000;
    let saidasDoVelho = 0;

    for (let i = 0; i < total; i++) {
        if (sortear([novo, velho], AGORA, aleatorio) === velho) saidasDoVelho += 1;
    }

    const proporcao = saidasDoVelho / total;
    verdadeiro(proporcao > 0.89 && proporcao < 0.94, "proporção do jogo antigo foi " + proporcao);
});

teste("Sorteio", "chanceDe: as chances somam 100% e batem com os pesos", () => {
    const novo = criarJogo({ titulo: "Novo" });
    const velho = criarJogo({ titulo: "Velho", criado_em: diasAtras(70) });
    const candidatos = [novo, velho];
    proximo(chanceDe(velho, candidatos, AGORA), 11 / 12);
    proximo(chanceDe(novo, candidatos, AGORA) + chanceDe(velho, candidatos, AGORA), 1);
    igual(chanceDe(novo, [], AGORA), 0);
});

teste("Estatísticas", "formatarNumero usa vírgula e remove casas desnecessárias", () => {
    igual(formatarNumero(4.5), "4,5");
    igual(formatarNumero(506), "506");
    igual(formatarNumero(12.04), "12");
    igual(formatarNumero(3.14159), "3,1");
});

teste("Estatísticas", "calcularResumo soma status, nota média e horas", () => {
    const jogos = [
        criarJogo({ status: "zerado", nota: 5, horas_jogadas: 10, horas_estimadas: 8 }),
        criarJogo({ status: "zerado", nota: 4, horas_jogadas: 20, horas_estimadas: 15 }),
        criarJogo({ status: "jogando", horas_jogadas: "5", horas_estimadas: 10 }),
        criarJogo({ status: "fila", horas_jogadas: 2, horas_estimadas: 8 }),
        criarJogo({ status: "fila" })
    ];
    const resumo = calcularResumo(jogos);
    igual(resumo.total, 5);
    igual(resumo.porStatus, { fila: 2, jogando: 1, zerado: 2 });
    igual(resumo.notaMedia, 4.5);
    igual(resumo.avaliados, 2);
    igual(resumo.horasJogadas, 37);
    igual(resumo.horasRestantesFila, 6);
    igual(resumo.filaSemEstimativa, 1);
});

teste("Estatísticas", "calcularResumo com lista vazia não quebra", () => {
    const resumo = calcularResumo([]);
    igual(resumo.total, 0);
    igual(resumo.notaMedia, null);
    igual(resumo.horasJogadas, 0);
    igual(resumo.porStatus, { fila: 0, jogando: 0, zerado: 0 });
});

teste("Estatísticas", "contarGeneros conta cada gênero, junta variações e informa jogos sem gênero", () => {
    const jogos = [
        criarJogo({ genero: "RPG, Ação" }),
        criarJogo({ genero: "Ação" }),
        criarJogo({ genero: "rpg" }),
        criarJogo()
    ];
    const { itens, semGenero } = contarGeneros(jogos);
    igual(itens.map((item) => item.nome), ["Ação", "RPG"]);
    igual(itens.map((item) => item.total), [2, 2]);
    igual(semGenero, 1);
});

teste("Estatísticas", "contarGeneros junta 'Ação' e 'Acao' no mesmo gênero", () => {
    const { itens } = contarGeneros([criarJogo({ genero: "Ação" }), criarJogo({ genero: "Acao" })]);
    igual(itens.length, 1);
    igual(itens[0].total, 2);
});

function renderizar() {
    const area = document.getElementById("resultados");
    const resumo = document.getElementById("resumo");
    const aprovados = resultados.filter((resultado) => resultado.ok).length;

    resumo.textContent = aprovados + " de " + resultados.length + " testes passaram.";
    resumo.className = aprovados === resultados.length ? "resumo ok" : "resumo erro";

    let grupoAtual = null;
    resultados.forEach((resultado) => {
        if (resultado.grupo !== grupoAtual) {
            grupoAtual = resultado.grupo;
            const titulo = document.createElement("h2");
            titulo.textContent = grupoAtual;
            area.appendChild(titulo);
        }

        const linha = document.createElement("p");
        linha.className = resultado.ok ? "linha ok" : "linha erro";
        const marca = resultado.ok ? "✔ " : "✘ ";
        linha.textContent = marca + resultado.nome + (resultado.ok ? "" : " — " + resultado.mensagem);
        area.appendChild(linha);
    });
}

renderizar();