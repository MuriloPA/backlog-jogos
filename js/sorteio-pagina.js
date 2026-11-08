import { obterSessao, sair } from "./auth.js";
import { listarJogos, atualizarJogo } from "./jogos.js";
import { criarResultadoSorteio } from "./ui.js";
import { mostrarToast } from "./toast.js";
import { separarLista, listarOpcoes } from "./filtros.js";
import { selecionarElegiveis, sortear, chanceDe, diasNaFila, tempoRestante } from "./sorteio.js";
import { descreverErro } from "./erros.js";
import { girarRoleta } from "./roleta.js";

const campoTempo = document.getElementById("tempo");
const campoGenero = document.getElementById("genero-sorteio");
const botaoSortear = document.getElementById("btn-sortear");
const resumo = document.getElementById("resumo-sorteio");
const areaResultado = document.getElementById("resultado");
const erroCarregar = document.getElementById("erro-carregar");
const textoErro = document.getElementById("texto-erro");
const botaoRecarregar = document.getElementById("btn-recarregar");

let jogosCarregados = [];
let ultimoSorteado = null;
let jaCarregou = false;
let sorteando = false;

function lerCriterios() {
    return {
        horas: campoTempo.value === "" ? null : Number(campoTempo.value),
        genero: campoGenero.value
    };
}

function criarOpcao(valor, texto) {
    const opcao = document.createElement("option");
    opcao.value = valor;
    opcao.textContent = texto;
    return opcao;
}

function atualizarGeneros() {
    const daFila = jogosCarregados.filter((jogo) => jogo.status === "fila");
    const generos = listarOpcoes(daFila, (jogo) => separarLista(jogo.genero));
    const atual = campoGenero.value;

    campoGenero.replaceChildren(criarOpcao("", "Qualquer gênero"));
    generos.forEach((genero) => campoGenero.appendChild(criarOpcao(genero, genero)));
    campoGenero.value = generos.includes(atual) ? atual : "";
}

function atualizarResumo() {
    const filaTotal = jogosCarregados.filter((jogo) => jogo.status === "fila").length;
    const { candidatos, semEstimativa } = selecionarElegiveis(jogosCarregados, lerCriterios());

    let texto;
    if (filaTotal === 0) {
        texto = 'Sua fila está vazia. Adicione jogos na biblioteca com o status "Na fila".';
    } else if (candidatos.length === 0) {
        texto = "Nenhum jogo da fila atende a esses critérios.";
    } else {
        const sufixo = candidatos.length === 1 ? " jogo pode sair" : " jogos podem sair";
        texto = candidatos.length + sufixo + " neste sorteio.";
    }

    if (semEstimativa > 0) {
        const fora = semEstimativa === 1 ? " jogo ficou de fora" : " jogos ficaram de fora";
        texto += " " + semEstimativa + fora + " por falta de horas estimadas.";
    }

    resumo.textContent = texto;
    botaoSortear.disabled = candidatos.length === 0;
}

function limparResultado() {
    areaResultado.replaceChildren();
    ultimoSorteado = null;
    botaoSortear.textContent = "Sortear";
}

function aoMudarCriterios() {
    limparResultado();
    atualizarResumo();
}

async function comecarAJogar(jogo) {
    const { error } = await atualizarJogo(jogo.id, { status: "jogando" });
    if (error) {
        mostrarToast(descreverErro(error, "Não foi possível atualizar o jogo."), true);
        return;
    }

    mostrarToast('"' + jogo.titulo + '" agora está em "Jogando".');
    limparResultado();
    await carregarJogos();
}

function definirSorteando(ativo) {
    sorteando = ativo;
    botaoSortear.disabled = ativo;
    campoTempo.disabled = ativo;
    campoGenero.disabled = ativo;
}

async function executarSorteio() {
    if (sorteando) return;

    const { candidatos } = selecionarElegiveis(jogosCarregados, lerCriterios());

    let grupo = candidatos;
    if (ultimoSorteado && grupo.length > 1) {
        grupo = grupo.filter((jogo) => jogo.id !== ultimoSorteado.id);
    }

    const agora = new Date();
    const jogo = sortear(grupo, agora);
    if (!jogo) return;

    ultimoSorteado = jogo;

    const dados = {
        dias: diasNaFila(jogo, agora),
        restante: tempoRestante(jogo),
        chance: chanceDe(jogo, grupo, agora)
    };

    definirSorteando(true);
    try {
        await girarRoleta(areaResultado, grupo, jogo);
    } finally {
        definirSorteando(false);
    }

    botaoSortear.textContent = "Sortear outro";
    areaResultado.replaceChildren(criarResultadoSorteio(jogo, dados, () => comecarAJogar(jogo)));
}

async function carregarJogos() {
    const { data, error } = await listarJogos();
    if (error) {
        const mensagem = descreverErro(error, "Não foi possível carregar seus jogos.");
        if (jaCarregou) {
            mostrarToast(mensagem, true);
            return;
        }
        resumo.textContent = "";
        textoErro.textContent = mensagem;
        erroCarregar.hidden = false;
        return;
    }

    jaCarregou = true;
    erroCarregar.hidden = true;
    jogosCarregados = data;
    atualizarGeneros();
    atualizarResumo();
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

    campoTempo.addEventListener("change", aoMudarCriterios);
    campoGenero.addEventListener("change", aoMudarCriterios);
    botaoSortear.addEventListener("click", executarSorteio);

    botaoRecarregar.addEventListener("click", async () => {
        erroCarregar.hidden = true;
        resumo.textContent = "Carregando seus jogos...";
        await carregarJogos();
    });

    await carregarJogos();
}

iniciar();