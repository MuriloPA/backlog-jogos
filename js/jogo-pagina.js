import { obterSessao, sair } from "./auth.js";
import { obterJogo } from "./jogos.js";
import { criarDetalhe } from "./ui.js";
import { mostrarToast } from "./toast.js";

const area = document.getElementById("detalhe");
const naoEncontrado = document.getElementById("nao-encontrado");

function lerId() {
    const bruto = new URLSearchParams(window.location.search).get("id");
    const id = Number(bruto);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function carregar() {
    const id = lerId();
    if (id === null) {
        naoEncontrado.hidden = false;
        return;
    }

    const { data, error } = await obterJogo(id);
    if (error) {
        mostrarToast("Não foi possível carregar o jogo.", true);
        return;
    }
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

    await carregar();
}

iniciar();