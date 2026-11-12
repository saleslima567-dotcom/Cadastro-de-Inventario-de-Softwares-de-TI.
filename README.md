# Cadastro de Inventário de Softwares de TI

Aplicação web de interface simples para cadastrar e acompanhar softwares usados em um inventário de TI. O projeto é feito com HTML, CSS e JavaScript no navegador.

## Funcionalidades

- Navegação entre as páginas Início, Sobre, Cadastro, Softwares e Contato.
- Cadastro de software com nome, versão, tipo de licença, data de renovação e e-mail do responsável.
- Listagem dos softwares cadastrados com cálculo de situação da licença:
  - **Ativa**: renovação em mais de 30 dias.
  - **Perto do vencimento**: renovação nos próximos 30 dias.
  - **Vencida**: data de renovação já passou.
- Exclusão de registros da lista.
- Armazenamento dos registros no `localStorage` do navegador.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Web Storage API (`localStorage`)

## Como executar

1. Baixe ou clone este repositório.
2. Abra o arquivo `index.html` em um navegador.

Não há etapa de instalação de dependências nem servidor de aplicação configurado no projeto.

## Estrutura

```text
.
├── index.html       # Página inicial
├── sobre.html       # Informações sobre o sistema
├── cadastro.html    # Formulário de cadastro de software
├── softwares.html   # Tabela do inventário
├── login.html       # Tela visual de login
├── contato.html     # Página de contato
├── css/
│   └── style.css    # Estilos da aplicação
├── js/
│   └── script.js    # Cadastro, armazenamento e listagem
└── imagens/         # Recursos de imagem
```

## Limitações

- Os dados ficam somente no navegador e no dispositivo em que foram cadastrados. Limpar os dados do navegador pode removê-los.
- Não há banco de dados nem sincronização entre usuários ou dispositivos.
- As telas de login e senha são apenas parte da interface; o projeto não implementa autenticação real. Não use senhas reais.
- O projeto não configura um servidor ou API de backend.
