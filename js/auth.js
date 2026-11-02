import { supabase } from "./supabase.js";

// Cria uma conta nova
export async function cadastrar(email, senha) {
    return await supabase.auth.signUp({ email: email, password: senha });
}

// Entra com e-mail e senha
export async function entrar(email, senha) {
    return await supabase.auth.signInWithPassword({ email: email, password: senha });
}

// Encerra a sessão
export async function sair() {
    await supabase.auth.signOut();
}

// Devolve a sessão atual (ou null se não houver ninguém logado)
export async function obterSessao() {
    const { data } = await supabase.auth.getSession();
    return data.session;
}

// Troca mensagens técnicas em inglês por mensagens claras em português
export function traduzirErro(erro) {
    const msg = (erro.message || "").toLowerCase();
    if (msg.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
    if (msg.includes("already registered")) return "Este e-mail já está cadastrado.";
    if (msg.includes("password")) return "A senha deve ter pelo menos 6 caracteres.";
    if (msg.includes("invalid") && msg.includes("email")) return "E-mail inválido.";
    return "Algo deu errado. Tente novamente.";
}