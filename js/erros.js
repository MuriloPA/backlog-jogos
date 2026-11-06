export const MENSAGEM_SEM_CONEXAO = "Sem conexão com a internet. Verifique e tente novamente.";

export function ehErroDeRede(erro) {
    const mensagem = ((erro && erro.message) || "").toLowerCase();
    return navigator.onLine === false
        || mensagem.includes("failed to fetch")
        || mensagem.includes("networkerror")
        || mensagem.includes("network request failed")
        || mensagem.includes("load failed");
}

export function descreverErro(erro, padrao) {
    if (ehErroDeRede(erro)) return MENSAGEM_SEM_CONEXAO;

    const mensagem = ((erro && erro.message) || "").toLowerCase();
    if (mensagem.includes("jwt") || (erro && erro.status === 401)) {
        return "Sua sessão expirou. Entre novamente.";
    }
    return padrao;
}