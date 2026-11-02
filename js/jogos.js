import { supabase } from "./supabase.js";

export async function listarJogos() {
    return await supabase
        .from("jogos")
        .select("*")
        .order("criado_em", { ascending: false });
}

export async function adicionarJogo(jogo) {
    return await supabase.from("jogos").insert(jogo);
}

export async function atualizarJogo(id, jogo) {
    return await supabase.from("jogos").update(jogo).eq("id", id);
}

export async function excluirJogo(id) {
    return await supabase.from("jogos").delete().eq("id", id);
}