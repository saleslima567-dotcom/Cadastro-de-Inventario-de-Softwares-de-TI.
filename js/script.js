document.addEventListener("DOMContentLoaded", () => {
    toggleMenu();
    inicializarCadastro();
    carregarInventario();
});

/* MENU MOBILE */
function toggleMenu() {
    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("main-nav");
    if (!menuBtn || !navLinks) return;
    menuBtn.addEventListener("click", () => navLinks.classList.toggle("active"));
}

/* CADASTRO DE SOFTWARES */
function inicializarCadastro() {
    const form = document.getElementById("cadastroForm");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        const software = {
            nome: document.getElementById("software").value.trim(),
            versao: document.getElementById("versao").value.trim(),
            licenca: document.getElementById("licenca").value,
            renovacao: document.getElementById("renovacao").value,
            responsavel: document.getElementById("emailResponsavel").value.trim()
        };

        const senha = document.getElementById("senhaCadastro").value;
        const confirmar = document.getElementById("confirmarSenha").value;

        if (!software.nome || !software.versao || !software.licenca || !software.renovacao || !software.responsavel) {
            return alert("Preencha todos os campos obrigatórios!");
        }

        if (senha !== confirmar) return alert("As senhas não coincidem.");

        salvarSoftware(software);
        alert("Software cadastrado com sucesso!");
        form.reset();
        carregarInventario();
    });
}

/* SALVAR SOFTWARE NO LOCALSTORAGE */
function salvarSoftware(software) {
    const lista = JSON.parse(localStorage.getItem("inventario")) || [];
    const duplicado = lista.some(s => s.nome === software.nome && s.versao === software.versao);
    if (duplicado) return alert("Software já cadastrado.");
    lista.push(software);
    localStorage.setItem("inventario", JSON.stringify(lista));
}

/* CARREGAR INVENTÁRIO NA TABELA */
function carregarInventario() {
    const tbody = document.getElementById("softwareList");
    if (!tbody) return;

    const dados = JSON.parse(localStorage.getItem("inventario")) || [];
    const hoje = new Date();

    tbody.innerHTML = dados.map((s, index) => {
        const diffDias = Math.floor((new Date(s.renovacao) - hoje) / (1000 * 60 * 60 * 24));
        const status = diffDias < 0 ? "Vencida" : diffDias <= 30 ? "Perto do vencimento" : "Ativa";
        const statusClass = diffDias < 0 ? "status-vencida" : diffDias <= 30 ? "status-alerta" : "status-ok";

        return `
            <tr>
                <td>${s.nome}</td>
                <td>${s.versao}</td>
                <td>${s.licenca}</td>
                <td>${formatarData(s.renovacao)}</td>
                <td><span class="${statusClass}">${status}</span></td>
                <td><button class="btn-excluir" data-index="${index}">Excluir</button></td>
            </tr>
        `;
    }).join("");
}

/* EXCLUIR SOFTWARE */
function excluirSoftware(index) {
    const lista = JSON.parse(localStorage.getItem("inventario")) || [];
    lista.splice(index, 1);
    localStorage.setItem("inventario", JSON.stringify(lista));
    carregarInventario();
}

/* EVENT DELEGATION PARA BOTÃO EXCLUIR */
document.getElementById("softwareList").addEventListener("click", e => {
    if (e.target.classList.contains("btn-excluir")) {
        const index = e.target.dataset.index;
        excluirSoftware(index);
    }
});

/* FORMATAÇÃO DE DATA */
function formatarData(dataStr) {
    const data = new Date(dataStr);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}
