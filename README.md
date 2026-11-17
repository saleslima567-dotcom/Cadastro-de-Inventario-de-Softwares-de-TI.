# Inventário de Softwares de TI

Aplicação web simples para organizar um inventário de softwares. Permite registrar nome, versão, tipo de licença, data de renovação e e-mail do responsável; consultar a lista e identificar licenças vencidas ou próximas da renovação.

## Como usar

1. Baixe ou clone o repositório.
2. Abra `index.html` no navegador.
3. Entre em **Cadastro** para registrar um software.
4. Abra **Softwares** para consultar a lista e, se necessário, excluir um item.

Não é necessário instalar dependências nem iniciar um servidor.

## Como a situação é calculada

- **Vencida:** a data de renovação já passou.
- **Perto do vencimento:** a renovação ocorre hoje ou nos próximos 30 dias.
- **Ativa:** faltam mais de 30 dias para a renovação.

## Armazenamento e limitações

Os registros ficam no `localStorage` do navegador e do dispositivo usados. Eles não são enviados para um servidor, compartilhados com outras pessoas ou sincronizados entre dispositivos. Limpar os dados do navegador pode apagá-los; não há recurso de backup ou exportação.

O projeto não tem banco de dados, servidor, autenticação de usuários ou envio de mensagens. A página `login.html` explica essa limitação; ela não recebe nem valida senhas. Use dados demonstrativos, sem informações confidenciais.

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
