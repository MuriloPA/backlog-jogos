const CAPA_PADRAO = "assets/capa-padrao.svg";
const QUADROS = 14;
const INTERVALO_INICIAL = 55;
const VARIACAO_INTERVALO = 200;
const PAUSA_FINAL = 400;

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function animacoesReduzidas() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function escolherAleatorio(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

function montarQuadros(candidatos, vencedor) {
    const quadros = [];

    for (let i = 0; i < QUADROS - 1; i++) {
        const anterior = quadros[i - 1];
        const ultimoAntesDoFim = i === QUADROS - 2;
        const opcoes = candidatos.filter((jogo) => {
            if (anterior && jogo.id === anterior.id) return false;
            if (ultimoAntesDoFim && jogo.id === vencedor.id) return false;
            return true;
        });
        quadros.push(escolherAleatorio(opcoes.length > 0 ? opcoes : candidatos));
    }

    quadros.push(vencedor);
    return quadros;
}

function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function girarRoleta(area, candidatos, vencedor) {
    if (animacoesReduzidas() || candidatos.length < 2) return;

    const capa = criarElemento("img", "capa");
    capa.alt = "";
    capa.addEventListener("error", () => {
        capa.src = CAPA_PADRAO;
    });

    const rotulo = criarElemento("p", "resultado-rotulo", "Sorteando...");
    const titulo = criarElemento("h3", "resultado-titulo");
    const detalhes = criarElemento("p", "card-meta");

    const corpo = criarElemento("div", "resultado-corpo");
    corpo.append(rotulo, titulo, detalhes);

    const cartao = criarElemento("article", "resultado-card roleta");
    cartao.setAttribute("aria-hidden", "true");
    cartao.append(capa, corpo);
    area.replaceChildren(cartao);

    const quadros = montarQuadros(candidatos, vencedor);

    for (let i = 0; i < quadros.length; i++) {
        const jogo = quadros[i];
        const progresso = i / (quadros.length - 1);
        const intervalo = INTERVALO_INICIAL + VARIACAO_INTERVALO * progresso * progresso;

        capa.src = jogo.capa_url || CAPA_PADRAO;
        titulo.textContent = jogo.titulo;
        detalhes.textContent = [jogo.plataforma, jogo.genero].filter(Boolean).join(" · ");

        capa.animate(
            [{ transform: "scale(1.06)", opacity: 0.7 }, { transform: "scale(1)", opacity: 1 }],
            { duration: Math.max(intervalo, 90), easing: "ease-out" }
        );
        titulo.animate(
            [{ transform: "translateY(8px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
            { duration: Math.max(intervalo, 90), easing: "ease-out" }
        );

        await esperar(i === quadros.length - 1 ? PAUSA_FINAL : intervalo);
    }
}