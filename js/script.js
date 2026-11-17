document.addEventListener("DOMContentLoaded", () => {
    inicializarMenu();
    inicializarCadastro();
    inicializarTabela();
});

function inicializarMenu() {
    const botao = document.getElementById("menuBtn");
    const links = document.getElementById("main-nav");
    if (!botao || !links) return;

    const fecharMenu = () => {
        links.classList.remove("active");
        botao.setAttribute("aria-expanded", "false");
        botao.setAttribute("aria-label", "Abrir menu");
    };

    botao.addEventListener("click", () => {
        const aberto = botao.getAttribute("aria-expanded") === "true";
        botao.setAttribute("aria-expanded", String(!aberto));
        botao.setAttribute("aria-label", aberto ? "Abrir menu" : "Fechar menu");
        links.classList.toggle("active", !aberto);
    });

    links.addEventListener("click", event => {
        if (event.target.closest("a")) fecharMenu();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") fecharMenu();
    });
}

function inicializarCadastro() {
    const form = document.getElementById("cadastroForm");
    if (!form) return;

    const campoData = document.getElementById("renovacao");
    const hoje = new Date();
    campoData.min = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

    form.addEventListener("submit", event => {
        event.preventDefault();
        const software = {
            nome: document.getElementById("software").value.trim(),
            versao: document.getElementById("versao").value.trim(),
            licenca: document.getElementById("licenca").value,
            renovacao: campoData.value,
            responsavel: document.getElementById("emailResponsavel").value.trim()
        };
        const status = document.getElementById("cadastroStatus");

        if (!form.reportValidity()) return;
        if (!parseDataLocal(software.renovacao)) {
            status.textContent = "Informe uma data de renovação válida.";
            return;
        }

        try {
            if (!salvarSoftware(software)) {
                status.textContent = "Esse software e versão já estão cadastrados.";
                return;
            }
            status.textContent = "Software cadastrado.";
            form.reset();
            campoData.min = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
            carregarInventario();
        } catch (error) {
            console.error("Não foi possível salvar o inventário.", error);
            status.textContent = "Não foi possível salvar neste navegador. Confira o espaço disponível.";
        }
    });
}

function lerInventario() {
    try {
        const dados = JSON.parse(localStorage.getItem("inventario") || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch (error) {
        console.error("Os dados salvos do inventário não puderam ser lidos.", error);
        return [];
    }
}

function salvarSoftware(software) {
    const lista = lerInventario();
    const chaveNome = software.nome.toLocaleLowerCase("pt-BR");
    const duplicado = lista.some(item =>
        String(item.nome || "").trim().toLocaleLowerCase("pt-BR") === chaveNome &&
        String(item.versao || "").trim().toLocaleLowerCase("pt-BR") === software.versao.toLocaleLowerCase("pt-BR")
    );
    if (duplicado) return false;

    lista.push(software);
    localStorage.setItem("inventario", JSON.stringify(lista));
    return true;
}

function inicializarTabela() {
    const tbody = document.getElementById("softwareList");
    if (!tbody) return;

    tbody.addEventListener("click", event => {
        if (!(event.target instanceof Element)) return;
        const botao = event.target.closest("button.btn-excluir");
        if (!botao) return;
        excluirSoftware(Number(botao.dataset.index));
    });

    carregarInventario();
}

function carregarInventario() {
    const tbody = document.getElementById("softwareList");
    if (!tbody) return;

    const dados = lerInventario();
    const avisoVazio = document.getElementById("inventarioVazio");
    if (avisoVazio) avisoVazio.hidden = dados.length > 0;
    tbody.replaceChildren();

    dados.forEach((software, index) => {
        const renovacao = parseDataLocal(software.renovacao);
        const diferenca = renovacao ? diasAte(renovacao) : null;
        const status = diferenca === null ? "Data inválida" : diferenca < 0 ? "Vencida" : diferenca <= 30 ? "Perto do vencimento" : "Ativa";
        const classe = diferenca === null || diferenca < 0 ? "status-vencida" : diferenca <= 30 ? "status-alerta" : "status-ok";
        const linha = document.createElement("tr");

        [software.nome, software.versao, software.licenca, renovacao ? formatarData(renovacao) : "—"].forEach(valor => {
            const celula = document.createElement("td");
            celula.textContent = String(valor ?? "");
            linha.append(celula);
        });

        const celulaStatus = document.createElement("td");
        const selo = document.createElement("span");
        selo.className = classe;
        selo.textContent = status;
        celulaStatus.append(selo);
        linha.append(celulaStatus);

        const celulaAcao = document.createElement("td");
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "btn-excluir";
        botao.dataset.index = String(index);
        botao.textContent = "Excluir";
        botao.setAttribute("aria-label", `Excluir ${String(software.nome || "software")}`);
        celulaAcao.append(botao);
        linha.append(celulaAcao);
        tbody.append(linha);
    });
}

function excluirSoftware(index) {
    const lista = lerInventario();
    if (!Number.isInteger(index) || index < 0 || index >= lista.length) return;
    if (!window.confirm(`Excluir ${lista[index].nome || "este software"} do inventário?`)) return;

    lista.splice(index, 1);
    localStorage.setItem("inventario", JSON.stringify(lista));
    carregarInventario();
}

function parseDataLocal(dataStr) {
    if (typeof dataStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) return null;
    const [ano, mes, dia] = dataStr.split("-").map(Number);
    const data = new Date(ano, mes - 1, dia);
    if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;
    return data;
}

function diasAte(data) {
    const hoje = new Date();
    const dataUTC = Date.UTC(data.getFullYear(), data.getMonth(), data.getDate());
    const hojeUTC = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    return Math.round((dataUTC - hojeUTC) / 86400000);
}

function formatarData(data) {
    return new Intl.DateTimeFormat("pt-BR").format(data);
}
