import { obterSessao, sair } from "./auth.js";
import { listarJogos, adicionarJogo } from "./jogos.js";
import { criarCard } from "./ui.js";

const lista = document.getElementById("lista-jogos");
const vazio = document.getElementById("vazio");
const form = document.getElementById("form-jogo");
const botaoSalvar = document.getElementById("btn-salvar");
const mensagemForm = document.getElementById("mensagem-form");
const mensagemLista = document.getElementById("mensagem-lista");

function mostrarMensagem(elemento, texto, ehErro) {
    elemento.textContent = texto;
    elemento.className = ehErro ? "mensagem erro" : "mensagem ok";
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

    return {
        jogo: {
            titulo: titulo,
            plataforma: texto("plataforma") || null,
            genero: texto("genero") || null,
            capa_url: capa || null,
            status: texto("status"),
            nota: nota,
            horas_jogadas: horasJogadas,
            horas_estimadas: horasEstimadas,
            opiniao: texto("opiniao") || null
        }
    };
}

async function carregarJogos() {
    const { data, error } = await listarJogos();
    if (error) {
        mostrarMensagem(mensagemLista, "Não foi possível carregar seus jogos.", true);
        return;
    }
    mensagemLista.textContent = "";
    lista.replaceChildren(...data.map(criarCard));
    vazio.hidden = data.length > 0;
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

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const resultado = lerFormulario();
        if (resultado.erro) {
            mostrarMensagem(mensagemForm, resultado.erro, true);
            return;
        }

        botaoSalvar.disabled = true;
        const { error } = await adicionarJogo(resultado.jogo);
        botaoSalvar.disabled = false;

        if (error) {
            mostrarMensagem(mensagemForm, "Não foi possível salvar o jogo. Tente novamente.", true);
            return;
        }

        form.reset();
        mostrarMensagem(mensagemForm, "Jogo adicionado.", false);
        await carregarJogos();
    });

    await carregarJogos();
}

iniciar();