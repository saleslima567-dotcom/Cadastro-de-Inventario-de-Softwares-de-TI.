# Inventário de Softwares de TI

Aplicação web para **cadastrar, organizar e acompanhar softwares e licenças de TI**, com contas individuais, indicadores de vencimento e dados persistidos na nuvem.

O projeto utiliza **HTML, CSS e JavaScript puro** no frontend, uma API REST em **Cloudflare Workers** e **Cloudflare D1 (SQLite)** como banco de dados. Não utiliza React nem outro framework de interface.

**[Acessar o sistema online](https://cadastro-de-inventario-de-softwares-de-ti.lokokaua567.workers.dev/)** · [Ver o código no GitHub](https://github.com/saleslima567-dotcom/Cadastro-de-Inventario-de-Softwares-de-TI.)

## O que o sistema faz

### Contas e inventário
- Cadastro de conta com nome, e-mail e senha; login e logout.
- Sessões por cookie seguro, com validade de sete dias.
- Inventário **separado por usuário**: cada pessoa consulta e administra somente seus próprios registros.
- **CRUD completo**: cadastrar, consultar, editar e excluir softwares.
- Campos por registro: nome do software, versão, tipo de licença, data de renovação (quando aplicável) e e-mail do responsável.
- Tipos de licença: **Trial**, **Anual** e **Vitalícia**. A licença vitalícia não requer data de renovação.
- Prevenção de cadastro duplicado da mesma combinação de nome e versão dentro da conta.

### Painel de gerenciamento
- Dashboard com indicadores calculados a partir dos registros do usuário.
- Status de licença:
  - **Vencida:** a data de renovação já passou.
  - **A vencer:** renovação prevista para hoje ou para os próximos 30 dias.
  - **Ativa:** renovação em mais de 30 dias.
  - **Vitalícia:** licença sem necessidade de renovação.
- Lista de próximas renovações, para licenças a vencer em até 30 dias.
- Busca por nome, versão ou responsável; filtros por status e ordenação por nome ou renovação.
- Exportação da lista para **CSV** e download de uma cópia em **JSON**.
- Tema claro/escuro e interface responsiva com menu lateral, tabela e formulário modal.

> **Importante:** os avisos de renovação aparecem **dentro do sistema**. A versão atual **não envia e-mails, mensagens ou notificações automáticas**. O arquivo JSON é um backup para download; ainda não existe uma função de restauração desse arquivo para o D1.

## Como usar

1. Abra o [site publicado](https://cadastro-de-inventario-de-softwares-de-ti.lokokaua567.workers.dev/).
2. Se ainda não tem conta, clique em **Criar conta**, informe nome, e-mail e uma senha de pelo menos 12 caracteres.
3. Faça login e utilize **+ Novo software** para registrar uma licença.
4. Acompanhe os indicadores, filtre a lista ou use os botões **Editar** e **Excluir**.
5. Use **Exportar CSV** ou **Backup JSON** para obter uma cópia dos seus registros.

O cadastro e a consulta dependem da API e do D1. **Abrir o HTML isoladamente pelo explorador de arquivos não substitui o serviço online.**

## Tecnologias

| Camada | Tecnologias | Responsabilidade |
| --- | --- | --- |
| Interface | HTML5, CSS3 e JavaScript (sem frameworks) | Telas, formulários, filtros e dashboard |
| API | JavaScript em Cloudflare Workers | Autenticação, validações e operações de inventário |
| Banco de dados | Cloudflare D1 (SQLite) | Contas, sessões e softwares |
| Hospedagem | Cloudflare Workers + Static Assets | Publicação da interface e API no mesmo domínio |
| Código e automação | GitHub, GitHub Actions e Wrangler | Versionamento, testes e deploy |

### Arquitetura

```text
Navegador
  ├── HTML / CSS / JavaScript (public/)
  │      ├── Login e cadastro
  │      ├── Dashboard e inventário
  │      └── Chamadas fetch('/api/...')
  │
  └── Cloudflare Workers (worker/api.mjs)
         ├── Serve os arquivos estáticos via binding ASSETS
         ├── Processa requisições /api/*
         ├── Verifica sessões e permissões
         └── Consulta o banco Cloudflare D1 (binding DB)
                ├── users
                ├── sessions
                └── softwares
```

Os dados do inventário ficam armazenados no **D1**, não no `localStorage`. O armazenamento local é utilizado apenas para a preferência de tema e, opcionalmente, para **ler registros antigos** na migração.

### Modelo de dados

| Tabela | Finalidade |
| --- | --- |
| `users` | Identificação de contas, e-mail e hash da senha |
| `sessions` | Hash do token de sessão, conta associada e expiração |
| `softwares` | Software, versão, licença, renovação, responsável e usuário proprietário |

A estrutura SQL inicial e os índices estão em [`migrations/0001_initial.sql`](migrations/0001_initial.sql).

## API REST

As rotas da API utilizam JSON. As operações de inventário exigem uma sessão autenticada.

| Método | Rota | Operação |
| --- | --- | --- |
| `GET` | `/api/health` | Verifica conectividade com o banco |
| `POST` | `/api/auth/register` | Cria uma conta |
| `POST` | `/api/auth/login` | Autentica e inicia uma sessão |
| `POST` | `/api/auth/logout` | Encerra a sessão |
| `GET` | `/api/me` | Retorna o usuário autenticado |
| `GET` | `/api/softwares` | Lista softwares da conta |
| `POST` | `/api/softwares` | Cadastra um software |
| `PUT` | `/api/softwares/:id` | Atualiza um software da conta |
| `DELETE` | `/api/softwares/:id` | Exclui um software da conta |

As requisições de alteração devem vir da **mesma origem** da aplicação, conforme validação implementada no Worker.

## Estrutura do repositório

```text
.
├── public/
│   ├── index.html           # Nova interface publicada
│   ├── style.css            # Estilos e responsividade
│   └── app.js               # Login, dashboard e integração com a API
├── worker/
│   └── api.mjs              # API REST e autenticação
├── migrations/
│   └── 0001_initial.sql     # Tabelas, restrições e índices D1
├── tests/
│   └── api.test.mjs         # Testes automatizados de API/SQL
├── .github/workflows/
│   └── ci.yml               # Verificações do GitHub Actions
├── wrangler.jsonc           # Worker, Static Assets, D1 e previews
├── README.md
├── index.html               # Versão anterior, preservada
├── cadastro.html            # Versão anterior, preservada
├── softwares.html           # Versão anterior, preservada
├── login.html               # Versão anterior, preservada
├── sobre.html               # Versão anterior, preservada
├── css/                     # Estilos anteriores
└── js/                      # JavaScript anterior
```

A versão **efetivamente publicada** utiliza os arquivos de `public/` e `worker/`. Os HTML/CSS/JS antigos permanecem no repositório como histórico do projeto, mas não são parte do diretório de assets do deploy atual.

## Testes e validação

Para executar as verificações automatizadas, utilize **Node.js 22 ou superior**:

```bash
node --check worker/api.mjs
node --check public/app.js
node --experimental-sqlite --test tests/api.test.mjs
```

Os testes exercitam validações de dados, cadastro e login, restrição do inventário por usuário, cadastro duplicado, operações CRUD, logout e componentes esperados do HTML. O SQL é executado em SQLite em memória durante os testes, simulando a interface de acesso do D1.

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda em `push` para `main` e em Pull Requests destinados à `main`. Ele também verifica a montagem do Worker com:

```bash
npx --yes wrangler@4.168.0 deploy --dry-run --outdir .wrangler-check
```

O `--dry-run` **não publica** o site. Os testes automatizados não substituem uma verificação completa da experiência do usuário no navegador de produção.

## Publicação na Cloudflare

O Worker já está conectado ao repositório do GitHub pelo **Cloudflare Workers Builds**. O fluxo configurado é:

1. Alterações são registradas no GitHub.
2. O GitHub Actions verifica o código.
3. O código integrado à branch `main` é enviado ao processo de build/deploy da Cloudflare.
4. A Cloudflare utiliza [`wrangler.jsonc`](wrangler.jsonc) para definir o Worker, os arquivos estáticos e o banco D1.

Os Pull Requests podem receber **deploys de preview**. A configuração utiliza bancos separados:

- `inventario-db`: dados de **produção**.
- `inventario-preview-db`: dados de **preview e testes**.

A migração inicial foi aplicada aos dois bancos. Alterações futuras no esquema exigem aplicação controlada das novas migrações; o mero commit do arquivo SQL não altera automaticamente as tabelas existentes.

## Segurança implementada

- Senhas com **PBKDF2-SHA-256** e sal aleatório.
- Tokens de sessão gerados aleatoriamente e armazenados no banco como **hash SHA-256**.
- Cookies com `HttpOnly`, `Secure`, `SameSite=Strict` e expiração de sete dias.
- Consultas SQL parametrizadas e acesso aos registros limitado pelo `user_id`.
- Validação de campos e datas na API.
- Restrições SQL contra duplicidade e dados inconsistentes.
- Uso de `textContent` na renderização de dados do inventário.

Essas medidas são uma **base de segurança**, não uma certificação de que o projeto esteja pronto para ambientes corporativos ou para armazenar informações sensíveis.

## Migração do inventário antigo

A versão inicial guardava os softwares no `localStorage` do navegador. A versão atual utiliza D1, mas oferece o botão **Importar registros antigos** para tentar transferir os dados legados.

- É necessário estar **logado**.
- Os dados antigos precisam existir **no mesmo navegador e na mesma origem (domínio)** do site atual.
- O usuário confirma a importação; registros duplicados ou inválidos podem ser rejeitados.
- Os dados antigos **não são apagados** automaticamente.
- Registros armazenados em outro endereço ou dispositivo não são acessíveis diretamente pelo importador.

## Limitações e próximas melhorias

O projeto está publicado como aplicação demonstrativa funcional, mas ainda **não** oferece:

- Recuperação de senha e verificação de e-mail.
- Rate limiting para tentativas de login e cadastro.
- Envio automático de alertas por e-mail ou outros canais.
- Restaurar arquivos de backup JSON pelo painel.
- Relatórios em PDF ou gráficos avançados.
- Trilhas de auditoria, perfis administrativos ou permissões de equipe.
- Política de backups automatizados e retenção de dados.
- Cobertura completa de testes de ponta a ponta no site publicado.

Esses itens fazem parte de possíveis evoluções; **não devem ser confundidos com funcionalidades já entregues**.

---

**Desenvolvido por [Paulo Kauã Sales](https://github.com/saleslima567-dotcom).**

[Repositório](https://github.com/saleslima567-dotcom/Cadastro-de-Inventario-de-Softwares-de-TI.) · [Aplicação online](https://cadastro-de-inventario-de-softwares-de-ti.lokokaua567.workers.dev/)
