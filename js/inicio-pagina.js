import { obterSessao, sair } from "./auth.js";
import { listarJogos } from "./jogos.js";
import { calcularResumo, formatarNumero } from "./stats.js";
import { criarIndicador } from "./graficos.js";
import { criarCardMini } from "./ui.js";
import { descreverErro } from "./erros.js";
import { diasNaFila, tempoRestante } from "./sorteio.js";
import { saudacao, emAndamento, proximoDaFila, recentes, melhoresNotas } from "./destaques.js";

const LIMITE_LISTA = 6;

const carregando = document.getElementById("carregando");
const erroCarregar = document.getElementById("erro-carregar");
const textoErro = document.getElementById("texto-erro");
const botaoRecarregar = document.getElementById("btn-recarregar");
const vazio = document.getElementById("vazio-inicio");
const painel = document.getElementById("painel-inicio");
const areaIndicadores = document.getElementById("indicadores-inicio");
const secaoAndamento = document.getElementById("sec-andamento");
const listaAndamento = document.getElementById("lista-andamento");
const secaoProximo = document.getElementById("sec-proximo");
const areaProximo = document.getElementById("area-proximo");
const secaoRecentes = document.getElementById("sec-recentes");
const listaRecentes = document.getElementById("lista-recentes");
const secaoMelhores = document.getElementById("sec-melhores");
const listaMelhores = document.getElementById("lista-melhores");

const inteiro = (valor) => String(Math.round(valor));

function textoDias(jogo) {
    const dias = diasNaFila(jogo);
    if (dias === 0) return "Adicionado hoje";
    return "Na fila há " + dias + (dias === 1 ? " dia" : " dias");
}

function renderizarIndicadores(resumo) {
    const percentual = Math.round((resumo.porStatus.zerado / resumo.total) * 100);

    areaIndicadores.replaceChildren(
        criarIndicador("Jogos na biblioteca", String(resumo.total), resumo.porStatus.fila + " na fila", {
            alvo: resumo.total,
            formatar: inteiro
        }),
        criarIndicador(
            "Jogando agora",
            String(resumo.porStatus.jogando),
            resumo.porStatus.jogando === 0 ? "Nenhum em andamento" : "Continue de onde parou",
            { alvo: resumo.porStatus.jogando, formatar: inteiro }
        ),
        criarIndicador("Jogos zerados", String(resumo.porStatus.zerado), percentual + "% da biblioteca", {
            alvo: resumo.porStatus.zerado,
            formatar: inteiro
        }),
        criarIndicador("Horas jogadas", formatarNumero(resumo.horasJogadas) + " h", "Somando todos os jogos", {
            alvo: resumo.horasJogadas,
            formatar: (valor) => formatarNumero(valor) + " h"
        })
    );
}

function preencherLista(secao, area, jogos, opcoes) {
    secao.hidden = jogos.length === 0;
    area.replaceChildren(...jogos.map((jogo) => criarCardMini(jogo, opcoes)));
}

function renderizarProximo(jogos) {
    const jogo = proximoDaFila(jogos);
    secaoProximo.hidden = jogo === null;
    if (jogo === null) {
        areaProximo.replaceChildren();
        return;
    }

    const restante = tempoRestante(jogo);
    const partes = [textoDias(jogo)];
    if (restante !== null) partes.push("cerca de " + formatarNumero(restante) + " h para zerar");

    const card = criarCardMini(jogo, { detalhe: partes.join(" · ") });
    card.classList.add("destaque-fila");
    areaProximo.replaceChildren(card);
}

function renderizar(jogos) {
    renderizarIndicadores(calcularResumo(jogos));
    preencherLista(secaoAndamento, listaAndamento, emAndamento(jogos, LIMITE_LISTA), { mostrarProgresso: true });
    renderizarProximo(jogos);
    preencherLista(secaoRecentes, listaRecentes, recentes(jogos, LIMITE_LISTA), {});
    preencherLista(secaoMelhores, listaMelhores, melhoresNotas(jogos, LIMITE_LISTA), { mostrarNota: true });
}

async function carregar() {
    const { data, error } = await listarJogos();
    carregando.hidden = true;

    if (error) {
        textoErro.textContent = descreverErro(error, "Não foi possível carregar seus jogos.");
        erroCarregar.hidden = false;
        return;
    }

    erroCarregar.hidden = true;

    if (data.length === 0) {
        painel.hidden = true;
        vazio.hidden = false;
        return;
    }

    vazio.hidden = true;
    painel.hidden = false;
    renderizar(data);
}

async function iniciar() {
    const sessao = await obterSessao();
    if (!sessao) {
        window.location.href = "index.html";
        return;
    }

    const email = sessao.user.email;
    document.getElementById("usuario").textContent = email;
    document.getElementById("saudacao").textContent = saudacao(new Date().getHours()) + ", " + email.split("@")[0];

    document.getElementById("btn-sair").addEventListener("click", async () => {
        await sair();
        window.location.href = "index.html";
    });

    botaoRecarregar.addEventListener("click", async () => {
        erroCarregar.hidden = true;
        carregando.hidden = false;
        await carregar();
    });

    await carregar();
}

iniciar();