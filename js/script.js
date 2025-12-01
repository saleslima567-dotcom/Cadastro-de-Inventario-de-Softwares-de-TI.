/* ================================
   MENU MOBILE PADRONIZADO
================================ */
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("main-nav");

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    inicializarCadastro();
    carregarInventario();
});

/* ================================
   FORMULÁRIO DE CADASTRO
================================ */
function inicializarCadastro() {
    const form = document.getElementById("cadastroForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nome = document.getElementById("software").value.trim();
        const versao = document.getElementById("versao").value.trim();
        const licenca = document.getElementById("licenca").value;
        const renovacao = document.getElementById("renovacao").value;
        const responsavel = document.getElementById("emailResponsavel").value.trim();
        const senha = document.getElementById("senhaCadastro").value;
        const repetir = document.getElementById("confirmarSenha").value;

        if (senha !== repetir) {
            alert("As senhas não coincidem.");
            return;
        }

        const software = {
            nome,
            versao,
            licenca,
            renovacao,
            responsavel
        };

        const lista = JSON.parse(localStorage.getItem("inventario")) || [];
        lista.push(software);

        localStorage.setItem("inventario", JSON.stringify(lista));

        alert("Software cadastrado com sucesso!");
        form.reset();
    });
}

/* ================================
   EXCLUIR SOFTWARE
================================ */
function excluirSoftware(index) {
    const lista = JSON.parse(localStorage.getItem("inventario")) || [];
    lista.splice(index, 1);
    localStorage.setItem("inventario", JSON.stringify(lista));
    carregarInventario();
}

/* ================================
   CARREGAR INVENTÁRIO NA TABELA
================================ */
function carregarInventario() {
    const tabela = document.getElementById("tabelaInventario");
    if (!tabela) return;

    const tbody = tabela.querySelector("tbody");
    tbody.innerHTML = "";

    const dados = JSON.parse(localStorage.getItem("inventario")) || [];
    const hoje = new Date();

    dados.forEach((s, index) => {
        const dataRenov = new Date(s.renovacao);
        const diffDias = Math.floor((dataRenov - hoje) / (1000 * 60 * 60 * 24));

        let status = "";
        if (diffDias < 0) {
            status = `<span class="status-vencida">Vencida</span>`;
        } else if (diffDias <= 30) {
            status = `<span class="status-alerta">Perto do vencimento</span>`;
        } else {
            status = `<span class="status-ok">Ativa</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>${s.nome}</td>
                <td>${s.versao}</td>
                <td>${s.licenca}</td>
                <td>${s.renovacao}</td>
                <td>${s.responsavel}</td>
                <td>${status}</td>
                <td>
                    <button class="btn-excluir" data-index="${index}">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });

     ativarBotoesExcluir();
}

/* ================================
   ATIVAR BOTÕES EXCLUIR
================================ */
function ativarBotoesExcluir() {
    document.querySelectorAll(".btn-excluir").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = btn.getAttribute("data-index");
            excluirSoftware(index);
        });
    });
}
