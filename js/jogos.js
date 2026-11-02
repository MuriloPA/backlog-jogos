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