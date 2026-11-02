function obterContainer() {
    let container = document.getElementById("toasts");
    if (!container) {
        container = document.createElement("div");
        container.id = "toasts";
        container.setAttribute("role", "status");
        container.setAttribute("aria-live", "polite");
        document.body.appendChild(container);
    }
    return container;
}

export function mostrarToast(texto, ehErro = false) {
    const toast = document.createElement("div");
    toast.className = ehErro ? "toast toast-erro" : "toast toast-ok";
    toast.textContent = texto;
    obterContainer().appendChild(toast);

    const duracao = ehErro ? 4500 : 2500;
    setTimeout(() => {
        toast.classList.add("saindo");
        setTimeout(() => toast.remove(), 300);
    }, duracao);
}