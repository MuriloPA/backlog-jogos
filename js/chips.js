export function criarSeletorChips(container, nomeCampo, opcoesPadrao) {
    function encontrar(nome) {
        const alvo = nome.toLowerCase();
        return Array.from(container.querySelectorAll("input"))
            .find((input) => input.value.toLowerCase() === alvo);
    }

    function criar(nome, marcado) {
        const rotulo = document.createElement("label");
        rotulo.className = "chip";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = nomeCampo;
        input.value = nome;
        input.checked = marcado;

        const texto = document.createElement("span");
        texto.textContent = nome;

        rotulo.append(input, texto);
        container.appendChild(rotulo);
    }

    function renderizar(selecionados = []) {
        container.replaceChildren();
        const marcados = selecionados.map((item) => item.toLowerCase());

        opcoesPadrao.forEach((opcao) => {
            criar(opcao, marcados.includes(opcao.toLowerCase()));
        });

        selecionados.forEach((item) => {
            if (!encontrar(item)) criar(item, true);
        });
    }

    function adicionar(nome) {
        const limpo = nome.trim();
        if (!limpo) return null;

        if (limpo.includes(",")) {
            return "Não use vírgula no nome.";
        }

        const existente = encontrar(limpo);
        if (existente) {
            existente.checked = true;
        } else {
            criar(limpo, true);
        }
        return null;
    }

    return { renderizar, adicionar };
}