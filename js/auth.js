import { supabase } from "./supabase.js";
import { ehErroDeRede, MENSAGEM_SEM_CONEXAO } from "./erros.js";

export async function cadastrar(email, senha) {
    return await supabase.auth.signUp({ email: email, password: senha });
}

export async function entrar(email, senha) {
    return await supabase.auth.signInWithPassword({ email: email, password: senha });
}

export async function sair() {
    await supabase.auth.signOut();
}

export async function obterSessao() {
    const { data } = await supabase.auth.getSession();
    return data.session;
}

export function traduzirErro(erro) {
    if (ehErroDeRede(erro)) return MENSAGEM_SEM_CONEXAO;

    const msg = (erro.message || "").toLowerCase();
    if (msg.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
    if (msg.includes("already registered")) return "Este e-mail já está cadastrado.";
    if (msg.includes("rate limit") || msg.includes("security purposes")) {
        return "Muitas tentativas. Aguarde um instante e tente de novo.";
    }
    if (msg.includes("password")) return "A senha deve ter pelo menos 6 caracteres.";
    if (msg.includes("invalid") && msg.includes("email")) return "E-mail inválido.";
    return "Algo deu errado. Tente novamente.";
}