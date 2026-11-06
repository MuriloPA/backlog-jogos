import { obterSessao, sair } from "./auth.js";
import { obterJogo } from "./jogos.js";
import { criarDetalhe } from "./ui.js";
import { descreverErro } from "./erros.js";

const area = document.getElementById("detalhe");
const naoEncontrado = document.getElementById("nao-encontrado");
const carregando = document.getElementById("carregando");
const erroCarregar = document.getElementById("erro-carregar");
const textoErro = document.getElementById("texto-erro");
const botaoRecarregar = document.getElementById("btn-recarregar");

function lerId() {
    const bruto = new URLSearchParams(window.location.search).get("id");
    const id = Number(bruto);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function carregar() {
    const id = lerId();
    if (id === null) {
        carregando.hidden = true;
        naoEncontrado.hidden = false;
        return;
    }

    const { data, error } = await obterJogo(id);
    carregando.hidden = true;

    if (error) {
        textoErro.textContent = descreverErro(error, "Não foi possível carregar o jogo.");
        erroCarregar.hidden = false;
        return;
    }

    erroCarregar.hidden = true;

    if (!data) {
        naoEncontrado.hidden = false;
        return;
    }

    document.title = data.titulo + " - PlayLog";
    area.replaceChildren(criarDetalhe(data));
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