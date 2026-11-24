# Inventário de Softwares de TI

Aplicação de inventário de licenças de software, construída com **HTML, CSS e JavaScript puro** e publicada no **Cloudflare Workers**, usando **Cloudflare D1 (SQLite)**.

**Site:** https://cadastro-de-inventario-de-softwares-de-ti.lokokaua567.workers.dev/

## Funcionalidades
- Cadastro, login e saída com sessões por cookie seguro.
- Inventários privados por usuário, salvos no banco D1.
- Cadastro, listagem, edição e exclusão de softwares.
- Licenças Trial, Anual e Vitalícia; a vitalícia não exige data.
- Indicadores de licenças ativas, vencidas ou prestes a vencer em 30 dias.
- Pesquisa, filtros e ordenação.
- Exportação CSV e backup JSON.
- Importação opcional dos dados antigos armazenados no mesmo navegador e domínio, sem apagá-los.
- Tema claro ou escuro e interface responsiva.

## Tecnologias e estrutura
```text
public/            Interface HTML, CSS e JavaScript
worker/api.mjs     API REST em JavaScript nativo do Cloudflare Workers
migrations/        Estrutura SQL do banco D1
tests/             Testes usando SQLite em memória do Node.js
wrangler.jsonc     Deploy, assets e bindings do Cloudflare
.github/workflows  Validação automática via GitHub Actions
```

O frontend e a API são publicados no **mesmo domínio**. O navegador não acessa o D1 diretamente.

## Testes locais
Node.js 22+:
```bash
node --check worker/api.mjs
node --check public/app.js
node --experimental-sqlite --test tests/api.test.mjs
```
O GitHub Actions executa os testes e verifica a montagem do Worker via `wrangler deploy --dry-run`. A Cloudflare possui conexão GitHub própria e publica a branch `main`; Pull Requests recebem previews isolados.

## Bancos de dados
- **Produção:** `inventario-db`.
- **Preview:** `inventario-preview-db`.
- O esquema inicial `migrations/0001_initial.sql` já foi aplicado nos dois bancos.

Antes de uma nova migração, valide-a primeiro no banco de Preview.

## Segurança e limitações
Senhas são derivadas com PBKDF2 e sal aleatório. Tokens de sessão são guardados no banco apenas como hashes; cookies usam HttpOnly, Secure e SameSite=Strict. As operações de escrita exigem mesma origem, e as consultas isolam os registros de cada conta.

Este é um projeto demonstrativo. Uso corporativo exigiria proteções adicionais, como rate limiting, recuperação de acesso, auditoria, política de privacidade e backups periódicos do D1.

O importador lê o inventário antigo do `localStorage` **na mesma origem**. Dados antigos armazenados em outro domínio ou navegador não ficam automaticamente acessíveis. A importação nunca remove os registros locais originais.

## Código anterior preservado
Os arquivos HTML, CSS e JavaScript antigos permanecem na raiz para referência histórica. A aplicação nova publicada utiliza os arquivos de `public/`.

Desenvolvido por [Paulo Kauã Sales](https://github.com/saleslima567-dotcom).
