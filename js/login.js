import { cadastrar, entrar, obterSessao, traduzirErro } from "./auth.js";

const form = document.getElementById("form-login");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const botaoCriar = document.getElementById("btn-criar");
const mensagem = document.getElementById("mensagem");

// Mostra uma mensagem na tela (erro ou aviso)
function mostrarMensagem(texto, ehErro) {
    mensagem.textContent = texto;
    mensagem.className = ehErro ? "mensagem erro" : "mensagem ok";
}

// Confere os campos antes de chamar o Supabase
function camposValidos() {
    if (!campoEmail.value.trim() || !campoSenha.value) {
        mostrarMensagem("Preencha e-mail e senha.", true);
        return false;
    }
    if (campoSenha.value.length < 6) {
        mostrarMensagem("A senha deve ter pelo menos 6 caracteres.", true);
        return false;
    }
    return true;
}

// Se já estiver logado, vai direto para a biblioteca
obterSessao().then((sessao) => {
    if (sessao) window.location.href = "biblioteca.html";
});

// Botão "Entrar" (envio do formulário)
form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!camposValidos()) return;

    const { error } = await entrar(campoEmail.value.trim(), campoSenha.value);
    if (error) {
        mostrarMensagem(traduzirErro(error), true);
        return;
    }
    window.location.href = "biblioteca.html";
});

// Botão "Criar conta"
botaoCriar.addEventListener("click", async () => {
    if (!camposValidos()) return;

    const { data, error } = await cadastrar(campoEmail.value.trim(), campoSenha.value);
    if (error) {
        mostrarMensagem(traduzirErro(error), true);
        return;
    }
    // Sem sessão significa que o Supabase ainda exige confirmação por e-mail
    if (!data.session) {
        mostrarMensagem("Conta criada. Confirme o e-mail para entrar.", false);
        return;
    }
    window.location.href = "biblioteca.html";
});