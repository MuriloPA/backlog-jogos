const ROTULOS_STATUS = {
    fila: "Na fila",
    jogando: "Jogando",
    zerado: "Zerado"
};

const CAPA_PADRAO = "assets/capa-padrao.svg";

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function criarBotao(texto, classe, aoClicar) {
    const botao = criarElemento("button", classe, texto);
    botao.type = "button";
    botao.addEventListener("click", aoClicar);
    return botao;
}

export function criarCard(jogo, acoes) {
    const card = criarElemento("article", "card");

    const capa = document.createElement("img");
    capa.className = "capa";
    capa.alt = "Capa de " + jogo.titulo;
    capa.src = jogo.capa_url || CAPA_PADRAO;
    capa.addEventListener("error", () => {
        capa.src = CAPA_PADRAO;
    }, { once: true });

    const corpo = criarElemento("div", "card-corpo");
    corpo.appendChild(criarElemento("h3", "card-titulo", jogo.titulo));

    const detalhes = [jogo.plataforma, jogo.genero].filter(Boolean).join(" · ");
    if (detalhes) {
        corpo.appendChild(criarElemento("p", "card-meta", detalhes));
    }

    corpo.appendChild(
        criarElemento("span", "badge status-" + jogo.status, ROTULOS_STATUS[jogo.status])
    );

    const nota = jogo.nota ? "★ " + jogo.nota + "/5" : "Sem nota";
    corpo.appendChild(criarElemento("p", "card-meta", nota));

    const horas = jogo.horas_estimadas
        ? jogo.horas_jogadas + " h de " + jogo.horas_estimadas + " h"
        : jogo.horas_jogadas + " h jogadas";
    corpo.appendChild(criarElemento("p", "card-meta", horas));

    const rodape = criarElemento("div", "card-acoes");
    rodape.appendChild(
        criarBotao("Editar", "btn-secundario btn-pequeno", () => acoes.aoEditar(jogo))
    );
    rodape.appendChild(
        criarBotao("Excluir", "btn-secundario btn-pequeno btn-perigo", () => acoes.aoExcluir(jogo))
    );

    card.appendChild(capa);
    card.appendChild(corpo);
    card.appendChild(rodape);
    return card;
}