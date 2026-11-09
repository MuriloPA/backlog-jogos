import { obterSessao, sair } from "./auth.js";
import { listarJogos } from "./jogos.js";
import {
    calcularResumo,
    contarGeneros,
    contarPlataformas,
    contarNotas,
    horasPorGenero,
    maisJogados,
    formatarNumero
} from "./stats.js";
import { criarIndicador, criarRosca, criarBarras } from "./graficos.js";
import { descreverErro } from "./erros.js";

const LIMITE_GENEROS = 8;
const LIMITE_PLATAFORMAS = 8;
const LIMITE_HORAS = 8;
const LIMITE_JOGADOS = 6;

const painel = document.getElementById("painel-stats");
const vazio = document.getElementById("vazio-stats");
const carregando = document.getElementById("carregando");
const erroCarregar = document.getElementById("erro-carregar");
const textoErro = document.getElementById("texto-erro");
const botaoRecarregar = document.getElementById("btn-recarregar");
const areaIndicadores = document.getElementById("indicadores");
const areaStatus = document.getElementById("grafico-status");
const areaGeneros = document.getElementById("grafico-generos");
const areaNotas = document.getElementById("grafico-notas");
const areaPlataformas = document.getElementById("grafico-plataformas");
const areaHorasGenero = document.getElementById("grafico-horas-genero");
const areaMaisJogados = document.getElementById("grafico-mais-jogados");

function plural(quantidade, singular, pluralTexto) {
    return quantidade + " " + (quantidade === 1 ? singular : pluralTexto);
}

function criarNota(texto) {
    const nota = document.createElement("p");
    nota.className = "nota-grafico";
    nota.textContent = texto;
    return nota;
}

function renderizarIndicadores(resumo) {
    const { total, porStatus } = resumo;
    const percentualZerados = Math.round((porStatus.zerado / total) * 100);

    const detalheNota = resumo.avaliados === 0
        ? "Nenhum jogo avaliado"
        : plural(resumo.avaliados, "jogo avaliado", "jogos avaliados");

    let detalheFila = "Tempo restante dos jogos na fila";
    if (porStatus.fila === 0) {
        detalheFila = "Sua fila está vazia";
    } else if (resumo.filaSemEstimativa > 0) {
        detalheFila = plural(resumo.filaSemEstimativa, "jogo sem estimativa fora da conta", "jogos sem estimativa fora da conta");
    }

    const inteiro = (valor) => String(Math.round(valor));
    const comUmaCasa = (valor) => formatarNumero(valor);

    areaIndicadores.replaceChildren(
        criarIndicador("Jogos na biblioteca", String(total), porStatus.fila + " na fila", {
            alvo: total,
            formatar: inteiro
        }),
        criarIndicador("Jogos zerados", String(porStatus.zerado), percentualZerados + "% da biblioteca", {
            alvo: porStatus.zerado,
            formatar: inteiro
        }),
        criarIndicador(
            "Nota média",
            resumo.notaMedia === null ? "—" : formatarNumero(resumo.notaMedia) + " / 5",
            detalheNota,
            resumo.notaMedia === null
                ? null
                : { alvo: resumo.notaMedia, formatar: (valor) => comUmaCasa(valor) + " / 5" }
        ),
        criarIndicador("Horas jogadas", formatarNumero(resumo.horasJogadas) + " h", "Somando todos os jogos", {
            alvo: resumo.horasJogadas,
            formatar: (valor) => comUmaCasa(valor) + " h"
        }),
        criarIndicador(
            "Horas para zerar a fila",
            formatarNumero(resumo.horasRestantesFila) + " h",
            detalheFila,
            { alvo: resumo.horasRestantesFila, formatar: (valor) => comUmaCasa(valor) + " h" }
        )
    );
}

function renderizarStatus(resumo) {
    const itens = [
        { rotulo: "Na fila", valor: resumo.porStatus.fila, chave: "fila" },
        { rotulo: "Jogando", valor: resumo.porStatus.jogando, chave: "jogando" },
        { rotulo: "Zerado", valor: resumo.porStatus.zerado, chave: "zerado" }
    ];
    areaStatus.replaceChildren(criarRosca(itens));
}

function renderizarGeneros(jogos) {
    const { itens, semGenero } = contarGeneros(jogos);

    if (itens.length === 0) {
        const aviso = document.createElement("p");
        aviso.className = "vazio";
        aviso.textContent = "Nenhum jogo tem gênero cadastrado.";
        areaGeneros.replaceChildren(aviso);
        return;
    }

    const principais = itens.slice(0, LIMITE_GENEROS).map((item) => ({
        rotulo: item.nome,
        valor: item.total
    }));

    const elementos = [criarBarras(principais)];

    if (itens.length > LIMITE_GENEROS) {
        elementos.push(criarNota("Mostrando os " + LIMITE_GENEROS + " gêneros mais frequentes, de " + itens.length + " no total."));
    }
    if (semGenero > 0) {
        elementos.push(criarNota(plural(semGenero, "jogo está sem gênero.", "jogos estão sem gênero.")));
    }
    elementos.push(criarNota("Um jogo com mais de um gênero conta em todos eles."));

    areaGeneros.replaceChildren(...elementos);
}

function criarAviso(texto) {
    const aviso = document.createElement("p");
    aviso.className = "vazio";
    aviso.textContent = texto;
    return aviso;
}

function renderizarNotas(jogos) {
    const itens = contarNotas(jogos);
    const avaliados = itens.reduce((soma, item) => soma + item.total, 0);

    if (avaliados === 0) {
        areaNotas.replaceChildren(criarAviso("Nenhum jogo foi avaliado ainda."));
        return;
    }

    const barras = itens.map((item) => ({
        rotulo: item.nota + (item.nota === 1 ? " estrela" : " estrelas"),
        valor: item.total
    }));
    areaNotas.replaceChildren(criarBarras(barras));
}

function renderizarPlataformas(jogos) {
    const { itens, semPlataforma } = contarPlataformas(jogos);

    if (itens.length === 0) {
        areaPlataformas.replaceChildren(criarAviso("Nenhum jogo tem plataforma cadastrada."));
        return;
    }

    const principais = itens.slice(0, LIMITE_PLATAFORMAS).map((item) => ({
        rotulo: item.nome,
        valor: item.total
    }));

    const elementos = [criarBarras(principais)];

    if (itens.length > LIMITE_PLATAFORMAS) {
        elementos.push(criarNota("Mostrando as " + LIMITE_PLATAFORMAS + " plataformas mais frequentes, de " + itens.length + " no total."));
    }
    if (semPlataforma > 0) {
        elementos.push(criarNota(plural(semPlataforma, "jogo está sem plataforma.", "jogos estão sem plataforma.")));
    }
    elementos.push(criarNota("Um jogo em mais de uma plataforma conta em todas elas."));

    areaPlataformas.replaceChildren(...elementos);
}

function renderizarHorasGenero(jogos) {
    const itens = horasPorGenero(jogos);

    if (itens.length === 0) {
        areaHorasGenero.replaceChildren(criarAviso("Ainda não há horas jogadas em jogos com gênero."));
        return;
    }

    const principais = itens.slice(0, LIMITE_HORAS).map((item) => ({
        rotulo: item.nome,
        valor: item.horas
    }));

    areaHorasGenero.replaceChildren(
        criarBarras(principais, { formatar: (valor) => formatarNumero(valor) + " h", larga: true }),
        criarNota("As horas de um jogo com mais de um gênero contam em todos eles.")
    );
}

function renderizarMaisJogados(jogos) {
    const itens = maisJogados(jogos, LIMITE_JOGADOS);

    if (itens.length === 0) {
        areaMaisJogados.replaceChildren(criarAviso("Nenhum jogo tem horas jogadas ainda."));
        return;
    }

    const barras = itens.map((jogo) => ({
        rotulo: jogo.titulo,
        valor: Number(jogo.horas_jogadas)
    }));

    areaMaisJogados.replaceChildren(
        criarBarras(barras, { formatar: (valor) => formatarNumero(valor) + " h", larga: true })
    );
}

async function carregar() {
    const { data, error } = await listarJogos();
    carregando.hidden = true;

    if (error) {
        textoErro.textContent = descreverErro(error, "Não foi possível carregar seus jogos.");
        erroCarregar.hidden = false;
        return;
    }

    erroCarregar.hidden = true;

    if (data.length === 0) {
        painel.hidden = true;
        vazio.hidden = false;
        return;
    }

    vazio.hidden = true;
    painel.hidden = false;

    const resumo = calcularResumo(data);
    renderizarIndicadores(resumo);
    renderizarStatus(resumo);
    renderizarGeneros(data);
    renderizarNotas(data);
    renderizarPlataformas(data);
    renderizarHorasGenero(data);
    renderizarMaisJogados(data);
}

async function iniciar() {
    const sessao = await obterSessao();
    if (!sessao) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("usuario").textContent = sessao.user.email;

    document.getElementById("btn-sair").addEventListener("click", async () => {
        await sair();
        window.location.href = "index.html";
    });

    botaoRecarregar.addEventListener("click", async () => {
        erroCarregar.hidden = true;
        carregando.hidden = false;
        await carregar();
    });

    await carregar();
}

iniciar();