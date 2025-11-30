// Menu mobile: adiciona toggles para cada botão (cada página tem um botão diferente por id)
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("main-nav");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});


// habilita todos os botões de menu existentes
document.addEventListener('DOMContentLoaded', () => {
  setupMenuToggle('menuBtn', 'main-nav');
  setupMenuToggle('menuBtn2', 'main-nav-2');
  setupMenuToggle('menuBtn3', 'main-nav-3');
  setupMenuToggle('menuBtn4', 'main-nav-4');
  setupMenuToggle('menuBtn5', 'main-nav-5');

  // Cadastro: verifica se as senhas coincidem
  const cadastro = document.getElementById('cadastroForm');
  if (cadastro) {
    cadastro.addEventListener('submit', function(e){
      const senha = document.getElementById('senhaCadastro').value;
      const repetir = document.getElementById('confirmarSenha').value;
      if (senha !== repetir) {
        e.preventDefault();
        alert('As senhas não coincidem. Verifique e tente novamente.');
        document.getElementById('senhaCadastro').focus();
        return;
      }

      alert('Cadastro enviado (simulação).');
      cadastro.reset();
      e.preventDefault();
    });
  }
});

// FORMULÁRIO DE CADASTRO
const cadastro = document.getElementById('cadastroForm');

if (cadastro) {
  cadastro.addEventListener('submit', function(e){
    e.preventDefault();

    const senha = document.getElementById('senhaCadastro').value;
    const repetir = document.getElementById('confirmarSenha').value;

    if (senha !== repetir) {
      alert('As senhas não coincidem.');
      return;
    }

    const software = {
      nome: document.getElementById('software').value,
      versao: document.getElementById('versao').value,
      licenca: document.getElementById('licenca').value,
      renovacao: document.getElementById('renovacao').value,
      responsavel: document.getElementById('emailResponsavel').value
    };

    const lista = JSON.parse(localStorage.getItem('inventario')) || [];
    lista.push(software);
    localStorage.setItem('inventario', JSON.stringify(lista));

    alert('Software cadastrado com sucesso!');
    cadastro.reset();
  });
}



// FUNÇÃO DE EXCLUIR
function excluirSoftware(index) {
  const lista = JSON.parse(localStorage.getItem('inventario')) || [];
  lista.splice(index, 1);
  localStorage.setItem('inventario', JSON.stringify(lista));
  carregarInventario(); // atualiza a tabela após excluir
}



// FUNÇÃO PARA CARREGAR INVENTÁRIO
function carregarInventario() {
  const tabela = document.getElementById('tabelaInventario');
  if (!tabela) return;

  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = "";

  const dados = JSON.parse(localStorage.getItem('inventario')) || [];
  const hoje = new Date();

  dados.forEach((s, index) => {
    const dataRenov = new Date(s.renovacao);
    const diffDias = Math.floor((dataRenov - hoje) / (1000 * 60 * 60 * 24));

    let status = '';
    if (diffDias < 0) status = `<span class="status-vencida">Vencida</span>`;
    else if (diffDias <= 30) status = `<span class="status-alerta">Perto do vencimento</span>`;
    else status = `<span class="status-ok">Ativa</span>`;

    tbody.innerHTML += `
      <tr>
        <td>${s.nome}</td>
        <td>${s.versao}</td>
        <td>${s.licenca}</td>
        <td>${s.renovacao}</td>
        <td>${s.responsavel}</td>
        <td>${status}</td>

        <td>
          <button class="btn-excluir" data-index="${index}">Excluir</button>
        </td>
      </tr>
    `;
  });
}


// EVENTO DOS BOTÕES DE EXCLUSÃO
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-excluir")) {
    const index = e.target.getAttribute("data-index");
    excluirSoftware(index);
  }
});


// CARREGAR INVENTÁRIO AUTOMATICAMENTE NA PÁGINA
carregarInventario();