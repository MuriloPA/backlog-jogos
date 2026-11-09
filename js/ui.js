import { separarLista } from "./filtros.js";

const ROTULOS_STATUS = {
    fila: "Na fila",
    jogando: "Jogando",
    zerado: "Zerado"
};

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

function criarLink(texto, classe, endereco) {
    const link = criarElemento("a", classe, texto);
    link.href = endereco;
    return link;
}

function urlDetalhe(jogo) {
    return "jogo.html?id=" + jogo.id;
}

function calcularMatiz(titulo) {
    let valor = 0;
    for (const letra of titulo) {
        valor = (valor * 31 + letra.codePointAt(0)) % 1000003;
    }
    return 200 + (valor % 160);
}

function primeiraLetra(titulo) {
    const letras = Array.from(titulo.trim());
    return letras.length > 0 ? letras[0].toUpperCase() : "?";
}

function criarCapaPadrao(jogo) {
    const capa = criarElemento("div", "capa capa-vazia");
    capa.setAttribute("role", "img");
    capa.setAttribute("aria-label", "Capa de " + jogo.titulo);

    const matiz = calcularMatiz(jogo.titulo);
    capa.style.background =
        "linear-gradient(160deg, hsl(" + matiz + ", 70%, 46%), hsl(" + matiz + ", 60%, 16%))";

    capa.appendChild(criarElemento("span", "capa-inicial", primeiraLetra(jogo.titulo)));
    return capa;
}

function criarImagemCapa(jogo) {
    if (!jogo.capa_url) return criarCapaPadrao(jogo);

    const capa = document.createElement("img");
    capa.className = "capa";
    capa.alt = "Capa de " + jogo.titulo;
    capa.src = jogo.capa_url;
    capa.addEventListener("error", () => {
        capa.replaceWith(criarCapaPadrao(jogo));
    }, { once: true });
    return capa;
}

function formatarHoras(valor) {
    return String(Number(valor)).replace(".", ",") + " h";
}

function formatarData(valor) {
    return new Date(valor).toLocaleDateString("pt-BR");
}

function criarEstrelas(nota) {
    const estrelas = criarElemento("span", "estrelas");
    estrelas.setAttribute("role", "img");
    estrelas.setAttribute("aria-label", "Nota " + nota + " de 5");
    estrelas.appendChild(criarElemento("span", "estrela-cheia", "★".repeat(nota)));
    estrelas.appendChild(criarElemento("span", "estrela-vazia", "★".repeat(5 - nota)));
    return estrelas;
}

function criarTags(texto, classeExtra) {
    const itens = separarLista(texto);
    if (itens.length === 0) return null;

    const lista = criarElemento("div", "tags");
    itens.forEach((item) => {
        lista.appendChild(criarElemento("span", "tag " + classeExtra, item));
    });
    return lista;
}

function criarInfo(rotulo, valor) {
    const bloco = criarElemento("div", "info");
    bloco.appendChild(criarElemento("span", "info-rotulo", rotulo));

    if (typeof valor === "string") {
        bloco.appendChild(criarElemento("span", "info-valor", valor));
    } else {
        bloco.appendChild(valor);
    }
    return bloco;
}

export function criarCard(jogo, acoes) {
    const card = criarElemento("article", "card");

    const linkCapa = criarElemento("a", "card-link");
    linkCapa.href = urlDetalhe(jogo);
    linkCapa.appendChild(criarImagemCapa(jogo));

    const areaCapa = criarElemento("div", "card-capa");
    areaCapa.appendChild(linkCapa);
    areaCapa.appendChild(
        criarElemento("span", "badge badge-capa status-" + jogo.status, ROTULOS_STATUS[jogo.status])
    );

    const corpo = criarElemento("div", "card-corpo");

    const titulo = criarElemento("h3", "card-titulo");
    titulo.appendChild(criarLink(jogo.titulo, "", urlDetalhe(jogo)));
    corpo.appendChild(titulo);

    const detalhes = [jogo.plataforma, jogo.genero].filter(Boolean).join(" · ");
    if (detalhes) {
        corpo.appendChild(criarElemento("p", "card-meta", detalhes));
    }

    if (jogo.nota) {
        const bloco = criarElemento("p", "card-nota");
        bloco.appendChild(criarEstrelas(jogo.nota));
        corpo.appendChild(bloco);
    } else {
        corpo.appendChild(criarElemento("p", "card-meta", "Sem nota"));
    }

    const progresso = criarElemento("div", "card-progresso");
    if (jogo.horas_estimadas) {
        const jogadas = Number(jogo.horas_jogadas);
        const estimadas = Number(jogo.horas_estimadas);
        const percentual = Math.min(100, Math.round((jogadas / estimadas) * 100));

        progresso.appendChild(
            criarElemento("p", "card-meta", formatarHoras(jogadas) + " de " + formatarHoras(estimadas))
        );

        const trilho = criarElemento("div", "barra-trilho");
        const preenchimento = criarElemento("div", "barra-preenchimento");
        preenchimento.style.width = percentual + "%";
        trilho.appendChild(preenchimento);
        progresso.appendChild(trilho);
    } else {
        progresso.appendChild(
            criarElemento("p", "card-meta", formatarHoras(jogo.horas_jogadas) + " jogadas")
        );
    }
    corpo.appendChild(progresso);

    const rodape = criarElemento("div", "card-acoes");
    rodape.appendChild(
        criarBotao("Editar", "btn-secundario btn-pequeno", () => acoes.aoEditar(jogo))
    );
    rodape.appendChild(
        criarBotao("Excluir", "btn-secundario btn-pequeno btn-perigo", () => acoes.aoExcluir(jogo))
    );

    card.appendChild(areaCapa);
    card.appendChild(corpo);
    card.appendChild(rodape);
    return card;
}

export function criarResultadoSorteio(jogo, dados, aoComecar) {
    const cartao = criarElemento("article", "resultado-card");

    const corpo = criarElemento("div", "resultado-corpo");
    corpo.appendChild(criarElemento("p", "resultado-rotulo", "O jogo da vez é"));
    corpo.appendChild(criarElemento("h3", "resultado-titulo", jogo.titulo));

    const detalhes = [jogo.plataforma, jogo.genero].filter(Boolean).join(" · ");
    if (detalhes) {
        corpo.appendChild(criarElemento("p", "card-meta", detalhes));
    }

    const tempo = dados.restante === null
        ? "Sem horas estimadas para zerar"
        : "Cerca de " + formatarHoras(dados.restante) + " para zerar";
    corpo.appendChild(criarElemento("p", "card-meta", tempo));

    const naFila = dados.dias === 0
        ? "Adicionado hoje"
        : dados.dias + (dados.dias === 1 ? " dia na fila" : " dias na fila");
    corpo.appendChild(criarElemento("p", "card-meta", naFila));

    const chance = Math.round(dados.chance * 100);
    corpo.appendChild(criarElemento("p", "card-meta", "Chance neste sorteio: " + chance + "%"));

    corpo.appendChild(criarBotao("Começar a jogar", "btn-principal", aoComecar));

    cartao.appendChild(criarImagemCapa(jogo));
    cartao.appendChild(corpo);
    return cartao;
}

export function criarDetalhe(jogo) {
    const artigo = criarElemento("article", "detalhe");
    artigo.appendChild(criarImagemCapa(jogo));

    const corpo = criarElemento("div", "detalhe-corpo");
    corpo.appendChild(criarElemento("h2", "detalhe-titulo", jogo.titulo));

    const plataformas = criarTags(jogo.plataforma, "tag-plataforma");
    if (plataformas) corpo.appendChild(plataformas);

    const generos = criarTags(jogo.genero, "tag-genero");
    if (generos) corpo.appendChild(generos);

    const infos = criarElemento("div", "infos");
    infos.appendChild(
        criarInfo("Status", criarElemento("span", "badge status-" + jogo.status, ROTULOS_STATUS[jogo.status]))
    );

    const notaDetalhe = criarElemento("span", "info-valor");
    if (jogo.nota) {
        notaDetalhe.append(criarEstrelas(jogo.nota), " " + jogo.nota + "/5");
    } else {
        notaDetalhe.textContent = "Sem nota";
    }
    infos.appendChild(criarInfo("Nota", notaDetalhe));

    infos.appendChild(criarInfo("Horas jogadas", formatarHoras(jogo.horas_jogadas)));
    infos.appendChild(
        criarInfo("Horas para zerar", jogo.horas_estimadas === null ? "Não informado" : formatarHoras(jogo.horas_estimadas))
    );
    infos.appendChild(criarInfo("Adicionado em", formatarData(jogo.criado_em)));
    corpo.appendChild(infos);

    if (jogo.horas_estimadas !== null) {
        const percentual = Math.min(
            100,
            Math.round((Number(jogo.horas_jogadas) / Number(jogo.horas_estimadas)) * 100)
        );

        const progresso = criarElemento("div", "progresso");
        progresso.appendChild(criarElemento("p", "progresso-texto", "Progresso: " + percentual + "%"));

        const trilho = criarElemento("div", "barra-trilho");
        const preenchimento = criarElemento("div", "barra-preenchimento");
        preenchimento.style.width = percentual + "%";
        trilho.appendChild(preenchimento);
        progresso.appendChild(trilho);
        corpo.appendChild(progresso);
    }

    const opiniao = criarElemento("div", "detalhe-secao");
    opiniao.appendChild(criarElemento("h3", "detalhe-secao-titulo", "Opinião"));
    opiniao.appendChild(
        jogo.opiniao
            ? criarElemento("p", "detalhe-opiniao", jogo.opiniao)
            : criarElemento("p", "detalhe-opiniao opiniao-vazia", "Você ainda não escreveu uma opinião sobre este jogo.")
    );
    corpo.appendChild(opiniao);

    const acoes = criarElemento("div", "linha-botoes");
    acoes.appendChild(criarLink("Editar jogo", "btn-principal", "biblioteca.html?editar=" + jogo.id));
    acoes.appendChild(criarLink("Voltar à biblioteca", "btn-secundario", "biblioteca.html"));
    corpo.appendChild(acoes);

    artigo.appendChild(corpo);
    return artigo;
}