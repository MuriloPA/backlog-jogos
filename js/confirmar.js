function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
}

export function confirmar({ titulo, mensagem, textoConfirmar = "Confirmar", textoCancelar = "Cancelar", perigo = false }) {
    return new Promise((resolve) => {
        const dialogo = document.createElement("dialog");
        dialogo.className = perigo ? "dialogo dialogo-perigo" : "dialogo";

        if (typeof dialogo.showModal !== "function") {
            resolve(window.confirm(titulo + "\n" + mensagem));
            return;
        }

        const caixa = criarElemento("div", "dialogo-caixa");
        const icone = criarElemento("div", "dialogo-icone", perigo ? "!" : "?");
        icone.setAttribute("aria-hidden", "true");

        const idTitulo = "dialogo-titulo";
        const textoTitulo = criarElemento("h2", "dialogo-titulo", titulo);
        textoTitulo.id = idTitulo;
        dialogo.setAttribute("aria-labelledby", idTitulo);

        const textoMensagem = criarElemento("p", "dialogo-mensagem", mensagem);

        const botoes = criarElemento("div", "dialogo-botoes");
        const botaoCancelar = criarElemento("button", "btn-secundario", textoCancelar);
        botaoCancelar.type = "button";
        const botaoConfirmar = criarElemento(
            "button",
            perigo ? "btn-principal btn-confirmar-perigo" : "btn-principal",
            textoConfirmar
        );
        botaoConfirmar.type = "button";

        botoes.append(botaoCancelar, botaoConfirmar);
        caixa.append(icone, textoTitulo, textoMensagem, botoes);
        dialogo.appendChild(caixa);

        let resultado = false;

        function fechar(valor) {
            resultado = valor;
            dialogo.close();
        }

        botaoConfirmar.addEventListener("click", () => fechar(true));
        botaoCancelar.addEventListener("click", () => fechar(false));
        dialogo.addEventListener("click", (evento) => {
            if (evento.target === dialogo) fechar(false);
        });
        dialogo.addEventListener("close", () => {
            dialogo.remove();
            resolve(resultado);
        });

        document.body.appendChild(dialogo);
        dialogo.showModal();
        botaoCancelar.focus();
    });
}