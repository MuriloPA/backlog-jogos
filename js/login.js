import { cadastrar, entrar, obterSessao, traduzirErro } from "./auth.js";

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAMANHO_MINIMO_SENHA = 6;

const form = document.getElementById("form-login");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const botaoEntrar = form.querySelector('button[type="submit"]');
const botaoCriar = document.getElementById("btn-criar");
const mensagem = document.getElementById("mensagem");

function mostrarMensagem(texto, ehErro) {
    mensagem.textContent = texto;
    mensagem.className = ehErro ? "mensagem erro" : "mensagem ok";
}

function definirOcupado(ocupado) {
    botaoEntrar.disabled = ocupado;
    botaoCriar.disabled = ocupado;
}

function camposValidos(exigirTamanhoDaSenha) {
    const email = campoEmail.value.trim();

    if (!email || !campoSenha.value) {
        mostrarMensagem("Preencha e-mail e senha.", true);
        return false;
    }
    if (!PADRAO_EMAIL.test(email)) {
        mostrarMensagem("Informe um e-mail válido.", true);
        return false;
    }
    if (exigirTamanhoDaSenha && campoSenha.value.length < TAMANHO_MINIMO_SENHA) {
        mostrarMensagem("A senha deve ter pelo menos 6 caracteres.", true);
        return false;
    }
    return true;
}

obterSessao().then((sessao) => {
    if (sessao) window.location.href = "biblioteca.html";
});

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!camposValidos(false)) return;

    definirOcupado(true);
    mostrarMensagem("Entrando...", false);

    const { error } = await entrar(campoEmail.value.trim(), campoSenha.value);
    if (error) {
        definirOcupado(false);
        mostrarMensagem(traduzirErro(error), true);
        return;
    }
    window.location.href = "biblioteca.html";
});

botaoCriar.addEventListener("click", async () => {
    if (!camposValidos(true)) return;

    definirOcupado(true);
    mostrarMensagem("Criando conta...", false);

    const { data, error } = await cadastrar(campoEmail.value.trim(), campoSenha.value);
    if (error) {
        definirOcupado(false);
        mostrarMensagem(traduzirErro(error), true);
        return;
    }

    if (!data.session) {
        definirOcupado(false);
        mostrarMensagem("Conta criada. Confirme o e-mail para entrar.", false);
        return;
    }
    window.location.href = "biblioteca.html";
});