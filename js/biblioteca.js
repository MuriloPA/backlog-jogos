import { obterSessao, sair } from "./auth.js";
import { listarJogos, adicionarJogo, atualizarJogo, excluirJogo } from "./jogos.js";
import { criarCard } from "./ui.js";
import { mostrarToast } from "./toast.js";
import { GENEROS } from "./generos.js";
import { PLATAFORMAS } from "./plataformas.js";
import { criarSeletorChips } from "./chips.js";
import { separarLista, normalizar, filtrarJogos, ordenarJogos, listarOpcoes } from "./filtros.js";
import { descreverErro } from "./erros.js";
import { confirmar } from "./confirmar.js";

const LIMITE_TITULO = 120;
const LIMITE_URL = 500;
const LIMITE_OPINIAO = 500;
const LIMITE_HORAS = 10000;

const lista = document.getElementById("lista-jogos");
const carregando = document.getElementById("carregando");
const erroCarregar = document.getElementById("erro-carregar");
const textoErro = document.getElementById("texto-erro");
const botaoRecarregar = document.getElementById("btn-recarregar");
const vazio = document.getElementById("vazio");
const semResultados = document.getElementById("sem-resultados");
const contador = document.getElementById("contador");
const painelFiltros = document.getElementById("painel-filtros");
const campoBusca = document.getElementById("busca");
const filtroStatus = document.getElementById("filtro-status");
const filtroPlataforma = document.getElementById("filtro-plataforma");
const filtroGenero = document.getElementById("filtro-genero");
const seletorOrdenacao = document.getElementById("ordenacao");
const botaoLimpar = document.getElementById("btn-limpar");
const form = document.getElementById("form-jogo");
const painel = document.getElementById("painel-form");
const resumo = document.getElementById("resumo-form");
const botaoSalvar = document.getElementById("btn-salvar");
const botaoCancelar = document.getElementById("btn-cancelar");

const seletorGeneros = criarSeletorChips(document.getElementById("generos"), "genero", GENEROS);
const seletorPlataformas = criarSeletorChips(document.getElementById("plataformas"), "plataforma", PLATAFORMAS);

let idEmEdicao = null;
let jogosCarregados = [];
let jaCarregou = false;

function urlValida(texto) {
    try {
        const url = new URL(texto);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (erro) {
        return false;
    }
}

function ligarCampoOutro(campo, botao, seletor) {
    function adicionar() {
        const erro = seletor.adicionar(campo.value);
        if (erro) {
            mostrarToast(erro, true);
            return;
        }
        campo.value = "";
    }

    botao.addEventListener("click", adicionar);
    campo.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            adicionar();
        }
    });
}

function lerFormulario() {
    const dados = new FormData(form);
    const texto = (nome) => (dados.get(nome) || "").toString().trim();

    const titulo = texto("titulo").replace(/\s+/g, " ");
    if (!titulo) {
        return { erro: "Informe o título do jogo." };
    }
    if (titulo.length > LIMITE_TITULO) {
        return { erro: "O título deve ter no máximo " + LIMITE_TITULO + " caracteres." };
    }

    const capa = texto("capa_url");
    if (capa && capa.length > LIMITE_URL) {
        return { erro: "O link da capa é longo demais (máximo de " + LIMITE_URL + " caracteres)." };
    }
    if (capa && !urlValida(capa)) {
        return { erro: "O link da capa não é válido. Use um endereço que comece com http:// ou https://." };
    }

    const horasJogadas = texto("horas_jogadas") === "" ? 0 : Number(texto("horas_jogadas"));
    if (Number.isNaN(horasJogadas) || horasJogadas < 0) {
        return { erro: "As horas jogadas devem ser 0 ou mais." };
    }
    if (horasJogadas > LIMITE_HORAS) {
        return { erro: "As horas jogadas devem ser no máximo " + LIMITE_HORAS + "." };
    }

    const horasEstimadas = texto("horas_estimadas") === "" ? null : Number(texto("horas_estimadas"));
    if (horasEstimadas !== null && (Number.isNaN(horasEstimadas) || horasEstimadas <= 0)) {
        return { erro: "As horas estimadas devem ser maiores que 0." };
    }
    if (horasEstimadas !== null && horasEstimadas > LIMITE_HORAS) {
        return { erro: "As horas estimadas devem ser no máximo " + LIMITE_HORAS + "." };
    }

    const nota = texto("nota") === "" ? null : Number(texto("nota"));
    if (nota !== null && (!Number.isInteger(nota) || nota < 1 || nota > 5)) {
        return { erro: "A nota deve ser um número de 1 a 5." };
    }

    const opiniao = texto("opiniao");
    if (opiniao.length > LIMITE_OPINIAO) {
        return { erro: "A opinião deve ter no máximo " + LIMITE_OPINIAO + " caracteres." };
    }

    const generos = dados.getAll("genero");
    const plataformas = dados.getAll("plataforma");

    return {
        jogo: {
            titulo: titulo,
            plataforma: plataformas.length > 0 ? plataformas.join(", ") : null,
            genero: generos.length > 0 ? generos.join(", ") : null,
            capa_url: capa || null,
            status: texto("status"),
            nota: nota,
            horas_jogadas: horasJogadas,
            horas_estimadas: horasEstimadas,
            opiniao: opiniao || null
        }
    };
}

function tituloJaExiste(titulo) {
    const alvo = normalizar(titulo);
    return jogosCarregados.some((jogo) => jogo.id !== idEmEdicao && normalizar(jogo.titulo) === alvo);
}

function entrarModoEdicao(jogo) {
    idEmEdicao = jogo.id;

    form.elements["titulo"].value = jogo.titulo;
    form.elements["capa_url"].value = jogo.capa_url || "";
    form.elements["status"].value = jogo.status;
    form.elements["nota"].value = jogo.nota === null ? "" : String(jogo.nota);
    form.elements["horas_jogadas"].value = jogo.horas_jogadas;
    form.elements["horas_estimadas"].value = jogo.horas_estimadas === null ? "" : jogo.horas_estimadas;
    form.elements["opiniao"].value = jogo.opiniao || "";
    seletorGeneros.renderizar(separarLista(jogo.genero));
    seletorPlataformas.renderizar(separarLista(jogo.plataforma));

    resumo.textContent = "Editar jogo";
    botaoSalvar.textContent = "Atualizar jogo";
    botaoCancelar.hidden = false;
    painel.open = true;
    painel.scrollIntoView({ behavior: "smooth" });
}

function sairModoEdicao() {
    idEmEdicao = null;
    form.reset();
    seletorGeneros.renderizar([]);
    seletorPlataformas.renderizar([]);
    resumo.textContent = "Adicionar jogo";
    botaoSalvar.textContent = "Salvar jogo";
    botaoCancelar.hidden = true;
}

function abrirEdicaoPelaUrl() {
    const bruto = new URLSearchParams(window.location.search).get("editar");
    if (bruto === null) return;

    window.history.replaceState(null, "", window.location.pathname);

    const id = Number(bruto);
    const jogo = jogosCarregados.find((item) => item.id === id);
    if (!jogo) {
        mostrarToast("Jogo não encontrado.", true);
        return;
    }
    entrarModoEdicao(jogo);
}

function preencherSelect(select, opcoes, rotuloTodos) {
    const atual = select.value;
    select.replaceChildren();

    const todos = document.createElement("option");
    todos.value = "";
    todos.textContent = rotuloTodos;
    select.appendChild(todos);

    opcoes.forEach((opcao) => {
        const elemento = document.createElement("option");
        elemento.value = opcao;
        elemento.textContent = opcao;
        select.appendChild(elemento);
    });

    select.value = opcoes.includes(atual) ? atual : "";
}

function atualizarOpcoesFiltros() {
    const plataformas = listarOpcoes(jogosCarregados, (jogo) => separarLista(jogo.plataforma));
    const generos = listarOpcoes(jogosCarregados, (jogo) => separarLista(jogo.genero));
    preencherSelect(filtroPlataforma, plataformas, "Todas as plataformas");
    preencherSelect(filtroGenero, generos, "Todos os gêneros");
}

function renderizarLista() {
    const criterios = {
        busca: campoBusca.value,
        status: filtroStatus.value,
        plataforma: filtroPlataforma.value,
        genero: filtroGenero.value
    };

    const filtrados = ordenarJogos(filtrarJogos(jogosCarregados, criterios), seletorOrdenacao.value);
    const acoes = { aoEditar: entrarModoEdicao, aoExcluir: aoExcluir };
    const total = jogosCarregados.length;

    lista.replaceChildren(...filtrados.map((jogo) => criarCard(jogo, acoes)));

    painelFiltros.hidden = total === 0;
    vazio.hidden = total > 0;
    semResultados.hidden = !(total > 0 && filtrados.length === 0);
    contador.textContent = total === 0
        ? ""
        : filtrados.length + " de " + total + (total === 1 ? " jogo" : " jogos");
}

function limparFiltros() {
    campoBusca.value = "";
    filtroStatus.value = "";
    filtroPlataforma.value = "";
    filtroGenero.value = "";
    seletorOrdenacao.value = "recentes";
    renderizarLista();
}

async function aoExcluir(jogo) {
    const confirmou = await confirmar({
        titulo: "Excluir jogo?",
        mensagem: '"' + jogo.titulo + '" será removido da sua biblioteca. Esta ação não pode ser desfeita.',
        textoConfirmar: "Excluir",
        perigo: true
    });
    if (!confirmou) return;

    const { error } = await excluirJogo(jogo.id);
    if (error) {
        mostrarToast(descreverErro(error, "Não foi possível excluir o jogo."), true);
        return;
    }

    if (idEmEdicao === jogo.id) sairModoEdicao();
    mostrarToast("Jogo excluído.");
    await carregarJogos();
}

async function carregarJogos() {
    const { data, error } = await listarJogos();
    carregando.hidden = true;

    if (error) {
        const mensagem = descreverErro(error, "Não foi possível carregar seus jogos.");
        if (jaCarregou) {
            mostrarToast(mensagem, true);
            return;
        }
        textoErro.textContent = mensagem;
        erroCarregar.hidden = false;
        return;
    }

    jaCarregou = true;
    erroCarregar.hidden = true;
    jogosCarregados = data;
    atualizarOpcoesFiltros();
    renderizarLista();
}

async function iniciar() {
    const sessao = await obterSessao();
    if (!sessao) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("usuario").textContent = sessao.user.email;
    seletorGeneros.renderizar([]);
    seletorPlataformas.renderizar([]);

    document.getElementById("btn-sair").addEventListener("click", async () => {
        await sair();
        window.location.href = "index.html";
    });

    botaoCancelar.addEventListener("click", sairModoEdicao);

    botaoRecarregar.addEventListener("click", async () => {
        erroCarregar.hidden = true;
        carregando.hidden = false;
        await carregarJogos();
        if (jaCarregou) abrirEdicaoPelaUrl();
    });

    ligarCampoOutro(
        document.getElementById("genero-outro"),
        document.getElementById("btn-genero-outro"),
        seletorGeneros
    );
    ligarCampoOutro(
        document.getElementById("plataforma-outro"),
        document.getElementById("btn-plataforma-outro"),
        seletorPlataformas
    );

    campoBusca.addEventListener("input", renderizarLista);
    filtroStatus.addEventListener("change", renderizarLista);
    filtroPlataforma.addEventListener("change", renderizarLista);
    filtroGenero.addEventListener("change", renderizarLista);
    seletorOrdenacao.addEventListener("change", renderizarLista);
    botaoLimpar.addEventListener("click", limparFiltros);

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const resultado = lerFormulario();
        if (resultado.erro) {
            mostrarToast(resultado.erro, true);
            return;
        }

        if (tituloJaExiste(resultado.jogo.titulo)) {
            mostrarToast('Você já tem "' + resultado.jogo.titulo + '" na biblioteca.', true);
            return;
        }

        const emEdicao = idEmEdicao !== null;

        botaoSalvar.disabled = true;
        const { error } = emEdicao
            ? await atualizarJogo(idEmEdicao, resultado.jogo)
            : await adicionarJogo(resultado.jogo);
        botaoSalvar.disabled = false;

        if (error) {
            const padrao = "Não foi possível " + (emEdicao ? "atualizar" : "salvar") + " o jogo. Tente novamente.";
            mostrarToast(descreverErro(error, padrao), true);
            return;
        }

        sairModoEdicao();
        mostrarToast(emEdicao ? "Jogo atualizado." : "Jogo adicionado.");
        await carregarJogos();
    });

    await carregarJogos();
    if (jaCarregou) abrirEdicaoPelaUrl();
}

iniciar();