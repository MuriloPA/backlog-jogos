import { obterSessao, sair } from "./auth.js";
import { listarJogos, adicionarJogo, atualizarJogo, excluirJogo } from "./jogos.js";
import { criarCard } from "./ui.js";
import { mostrarToast } from "./toast.js";
import { GENEROS } from "./generos.js";

const lista = document.getElementById("lista-jogos");
const vazio = document.getElementById("vazio");
const form = document.getElementById("form-jogo");
const painel = document.getElementById("painel-form");
const resumo = document.getElementById("resumo-form");
const botaoSalvar = document.getElementById("btn-salvar");
const botaoCancelar = document.getElementById("btn-cancelar");
const containerGeneros = document.getElementById("generos");
const campoGeneroOutro = document.getElementById("genero-outro");
const botaoGeneroOutro = document.getElementById("btn-genero-outro");

let idEmEdicao = null;

function separarGeneros(texto) {
    return (texto || "")
        .split(",")
        .map((genero) => genero.trim())
        .filter(Boolean);
}

function encontrarChip(nome) {
    const alvo = nome.toLowerCase();
    return Array.from(containerGeneros.querySelectorAll('input[name="genero"]'))
        .find((input) => input.value.toLowerCase() === alvo);
}

function criarChip(nome, marcado) {
    const rotulo = document.createElement("label");
    rotulo.className = "chip";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "genero";
    input.value = nome;
    input.checked = marcado;

    const texto = document.createElement("span");
    texto.textContent = nome;

    rotulo.append(input, texto);
    containerGeneros.appendChild(rotulo);
}

function renderizarChips(selecionados) {
    containerGeneros.replaceChildren();
    const marcados = selecionados.map((genero) => genero.toLowerCase());

    GENEROS.forEach((genero) => {
        criarChip(genero, marcados.includes(genero.toLowerCase()));
    });

    selecionados.forEach((genero) => {
        if (!encontrarChip(genero)) criarChip(genero, true);
    });
}

function adicionarGeneroPersonalizado() {
    const nome = campoGeneroOutro.value.trim();
    if (!nome) return;

    if (nome.includes(",")) {
        mostrarToast("O gênero não pode ter vírgula.", true);
        return;
    }

    const existente = encontrarChip(nome);
    if (existente) {
        existente.checked = true;
    } else {
        criarChip(nome, true);
    }
    campoGeneroOutro.value = "";
}

function lerFormulario() {
    const dados = new FormData(form);
    const texto = (nome) => (dados.get(nome) || "").toString().trim();

    const titulo = texto("titulo");
    if (!titulo) {
        return { erro: "Informe o título do jogo." };
    }

    const capa = texto("capa_url");
    if (capa && !/^https?:\/\//i.test(capa)) {
        return { erro: "O link da capa deve começar com http:// ou https://." };
    }

    const horasJogadas = texto("horas_jogadas") === "" ? 0 : Number(texto("horas_jogadas"));
    if (Number.isNaN(horasJogadas) || horasJogadas < 0) {
        return { erro: "As horas jogadas devem ser 0 ou mais." };
    }

    const horasEstimadas = texto("horas_estimadas") === "" ? null : Number(texto("horas_estimadas"));
    if (horasEstimadas !== null && (Number.isNaN(horasEstimadas) || horasEstimadas <= 0)) {
        return { erro: "As horas estimadas devem ser maiores que 0." };
    }

    const nota = texto("nota") === "" ? null : Number(texto("nota"));
    const generos = dados.getAll("genero");

    return {
        jogo: {
            titulo: titulo,
            plataforma: texto("plataforma") || null,
            genero: generos.length > 0 ? generos.join(", ") : null,
            capa_url: capa || null,
            status: texto("status"),
            nota: nota,
            horas_jogadas: horasJogadas,
            horas_estimadas: horasEstimadas,
            opiniao: texto("opiniao") || null
        }
    };
}

function entrarModoEdicao(jogo) {
    idEmEdicao = jogo.id;

    form.elements["titulo"].value = jogo.titulo;
    form.elements["plataforma"].value = jogo.plataforma || "";
    form.elements["capa_url"].value = jogo.capa_url || "";
    form.elements["status"].value = jogo.status;
    form.elements["nota"].value = jogo.nota === null ? "" : String(jogo.nota);
    form.elements["horas_jogadas"].value = jogo.horas_jogadas;
    form.elements["horas_estimadas"].value = jogo.horas_estimadas === null ? "" : jogo.horas_estimadas;
    form.elements["opiniao"].value = jogo.opiniao || "";
    renderizarChips(separarGeneros(jogo.genero));

    resumo.textContent = "Editar jogo";
    botaoSalvar.textContent = "Atualizar jogo";
    botaoCancelar.hidden = false;
    painel.open = true;
    painel.scrollIntoView({ behavior: "smooth" });
}

function sairModoEdicao() {
    idEmEdicao = null;
    form.reset();
    renderizarChips([]);
    resumo.textContent = "Adicionar jogo";
    botaoSalvar.textContent = "Salvar jogo";
    botaoCancelar.hidden = true;
}

async function aoExcluir(jogo) {
    const confirmou = window.confirm('Excluir "' + jogo.titulo + '"? Esta ação não pode ser desfeita.');
    if (!confirmou) return;

    const { error } = await excluirJogo(jogo.id);
    if (error) {
        mostrarToast("Não foi possível excluir o jogo.", true);
        return;
    }

    if (idEmEdicao === jogo.id) sairModoEdicao();
    mostrarToast("Jogo excluído.");
    await carregarJogos();
}

async function carregarJogos() {
    const { data, error } = await listarJogos();
    if (error) {
        mostrarToast("Não foi possível carregar seus jogos.", true);
        return;
    }
    const acoes = { aoEditar: entrarModoEdicao, aoExcluir: aoExcluir };
    lista.replaceChildren(...data.map((jogo) => criarCard(jogo, acoes)));
    vazio.hidden = data.length > 0;
}

async function iniciar() {
    const sessao = await obterSessao();
    if (!sessao) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("usuario").textContent = sessao.user.email;
    renderizarChips([]);

    document.getElementById("btn-sair").addEventListener("click", async () => {
        await sair();
        window.location.href = "index.html";
    });

    botaoCancelar.addEventListener("click", sairModoEdicao);

    botaoGeneroOutro.addEventListener("click", adicionarGeneroPersonalizado);
    campoGeneroOutro.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            adicionarGeneroPersonalizado();
        }
    });

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const resultado = lerFormulario();
        if (resultado.erro) {
            mostrarToast(resultado.erro, true);
            return;
        }

        const emEdicao = idEmEdicao !== null;

        botaoSalvar.disabled = true;
        const { error } = emEdicao
            ? await atualizarJogo(idEmEdicao, resultado.jogo)
            : await adicionarJogo(resultado.jogo);
        botaoSalvar.disabled = false;

        if (error) {
            const acao = emEdicao ? "atualizar" : "salvar";
            mostrarToast("Não foi possível " + acao + " o jogo. Tente novamente.", true);
            return;
        }

        sairModoEdicao();
        mostrarToast(emEdicao ? "Jogo atualizado." : "Jogo adicionado.");
        await carregarJogos();
    });

    await carregarJogos();
}

iniciar();