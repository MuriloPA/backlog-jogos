const DURACAO = 900;
const SUAVIZACAO = "cubic-bezier(0.2, 0.8, 0.2, 1)";

export function reduzirMovimento() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function animarNumero(elemento, alvo, formatar, atraso = 0) {
    elemento.textContent = formatar(alvo);
    if (reduzirMovimento() || !Number.isFinite(alvo) || alvo <= 0) return;

    elemento.textContent = formatar(0);
    let inicio = null;

    function passo(agora) {
        if (inicio === null) inicio = agora;
        const progresso = Math.min(1, Math.max(0, (agora - inicio - atraso) / DURACAO));
        const suave = 1 - Math.pow(1 - progresso, 3);
        elemento.textContent = formatar(alvo * suave);

        if (progresso < 1) {
            requestAnimationFrame(passo);
        } else {
            elemento.textContent = formatar(alvo);
        }
    }

    requestAnimationFrame(passo);
}

export function animarElemento(elemento, quadros, atraso = 0) {
    if (reduzirMovimento() || typeof elemento.animate !== "function") return;

    elemento.animate(quadros, {
        duration: DURACAO,
        delay: atraso,
        easing: SUAVIZACAO,
        fill: "backwards"
    });
}