const NS = "http://www.w3.org/2000/svg";
const RAIO = 40;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

function criarElementoSvg(tag, atributos) {
    const elemento = document.createElementNS(NS, tag);
    Object.entries(atributos).forEach(([nome, valor]) => {
        elemento.setAttribute(nome, valor);
    });
    return elemento;
}

export function criarIndicador(rotulo, valor, detalhe) {
    const cartao = criarElemento("article", "indicador");
    cartao.appendChild(criarElemento("p", "indicador-rotulo", rotulo));
    cartao.appendChild(criarElemento("p", "indicador-valor", valor));
    cartao.appendChild(criarElemento("p", "indicador-detalhe", detalhe));
    return cartao;
}

export function criarRosca(itens) {
    const total = itens.reduce((soma, item) => soma + item.valor, 0);
    const container = criarElemento("div", "rosca");

    const svg = criarElementoSvg("svg", {
        viewBox: "0 0 100 100",
        class: "rosca-svg",
        role: "img",
        "aria-label": "Gráfico de jogos por status"
    });

    svg.appendChild(criarElementoSvg("circle", {
        cx: "50",
        cy: "50",
        r: String(RAIO),
        class: "rosca-fundo"
    }));

    let acumulado = 0;
    itens.forEach((item) => {
        if (item.valor === 0) return;

        const comprimento = (item.valor / total) * CIRCUNFERENCIA;
        svg.appendChild(criarElementoSvg("circle", {
            cx: "50",
            cy: "50",
            r: String(RAIO),
            class: "rosca-arco arco-" + item.chave,
            "stroke-dasharray": comprimento + " " + (CIRCUNFERENCIA - comprimento),
            "stroke-dashoffset": String(-acumulado),
            transform: "rotate(-90 50 50)"
        }));
        acumulado += comprimento;
    });

    const numero = criarElementoSvg("text", { x: "50", y: "54", class: "rosca-total" });
    numero.textContent = String(total);
    svg.appendChild(numero);

    const legendaCentro = criarElementoSvg("text", { x: "50", y: "64", class: "rosca-subtitulo" });
    legendaCentro.textContent = total === 1 ? "jogo" : "jogos";
    svg.appendChild(legendaCentro);

    const legenda = criarElemento("ul", "legenda");
    itens.forEach((item) => {
        const linha = criarElemento("li");
        linha.appendChild(criarElemento("span", "ponto ponto-" + item.chave));

        const percentual = total > 0 ? Math.round((item.valor / total) * 100) : 0;
        linha.appendChild(
            criarElemento("span", "legenda-texto", item.rotulo + ": " + item.valor + " (" + percentual + "%)")
        );
        legenda.appendChild(linha);
    });

    container.append(svg, legenda);
    return container;
}

export function criarBarras(itens) {
    const lista = criarElemento("ul", "barras");
    if (itens.length === 0) return lista;

    const maximo = Math.max(...itens.map((item) => item.valor));

    itens.forEach((item) => {
        const linha = criarElemento("li", "barra-linha");
        const rotulo = criarElemento("span", "barra-rotulo", item.rotulo);
        rotulo.title = item.rotulo;

        const trilho = criarElemento("div", "barra-trilho");
        const preenchimento = criarElemento("div", "barra-preenchimento");
        preenchimento.style.width = (item.valor / maximo) * 100 + "%";
        trilho.appendChild(preenchimento);

        const valor = criarElemento("span", "barra-valor", String(item.valor));

        linha.append(rotulo, trilho, valor);
        lista.appendChild(linha);
    });

    return lista;
}