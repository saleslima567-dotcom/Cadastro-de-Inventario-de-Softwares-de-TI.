# Inventário de Softwares de TI

Aplicação web para organizar um inventário de softwares e acompanhar informações importantes, como nome, versão, tipo de licença, data de renovação e e-mail do responsável. Também permite consultar os registros e identificar licenças vencidas ou próximas da renovação.

## Acesse a aplicação

<p align="center">
  <a href="https://cadastro-de-inventario-de-softwares-de-ti.lokokaua567.workers.dev/">
    <img src="https://img.shields.io/badge/ACESSAR%20APLICA%C3%87%C3%83O-Online-2ea44f?style=for-the-badge" alt="Acessar aplicação online" />
  </a>
</p>

**Aplicação publicada:**  
https://cadastro-de-inventario-de-softwares-de-ti.lokokaua567.workers.dev/

Você pode utilizar a versão hospedada diretamente pelo navegador, sem precisar baixar os arquivos ou iniciar um servidor local.

## Funcionalidades

- Cadastro de softwares com nome, versão, licença, data de renovação e e-mail do responsável.
- Consulta dos softwares cadastrados.
- Exclusão de registros.
- Identificação do estado das licenças: ativa, próxima do vencimento ou vencida.
- Interface web com páginas de início, cadastro, listagem e informações do projeto.

## Como usar

### Pela versão online

1. [Acesse a aplicação hospedada](https://cadastro-de-inventario-de-softwares-de-ti.lokokaua567.workers.dev/).
2. Entre na seção **Cadastro** para registrar um software.
3. Abra **Softwares** para consultar os registros e, se necessário, excluir um item.

### Executando localmente

1. Baixe ou clone este repositório.
2. Abra o arquivo `index.html` no navegador.
3. Utilize as páginas de cadastro e listagem.

Não é necessário instalar dependências nem iniciar um servidor para executar a versão local.

## Como a situação é calculada

- **Vencida:** a data de renovação já passou.
- **Perto do vencimento:** a renovação ocorre hoje ou nos próximos 30 dias.
- **Ativa:** faltam mais de 30 dias para a renovação.

## Armazenamento e limitações

Os registros ficam no `localStorage` do navegador e do dispositivo utilizados. Eles não são enviados para um servidor, compartilhados com outras pessoas ou sincronizados entre dispositivos. Por isso, os dados salvos na versão online permanecem associados ao navegador/dispositivo em que foram cadastrados. Limpar os dados do navegador pode apagá-los; não há recurso de backup ou exportação.

O projeto não tem banco de dados, servidor de aplicação, autenticação de usuários ou envio de mensagens. A página `login.html` explica essa limitação; ela não recebe nem valida senhas. Utilize apenas dados demonstrativos, sem informações confidenciais.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Web Storage API (`localStorage`)

## Arquivos principais

```text
index.html       Página inicial
sobre.html       Objetivo e funcionamento
cadastro.html    Formulário para novos registros
softwares.html   Lista e situação das licenças
login.html       Aviso sobre autenticação não implementada
css/style.css    Estilos
js/script.js     Menu, cadastro, armazenamento e lista
imagens/         Recursos visuais
```

---

Desenvolvido por [Paulo Kauã Sales](https://github.com/saleslima567-dotcom).

[Ver repositório no GitHub](https://github.com/saleslima567-dotcom/Cadastro-de-Inventario-de-Softwares-de-TI.)
