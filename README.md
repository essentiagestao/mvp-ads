# mvp-ads
Plataforma de Ads

## Desenvolvimento

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Copie `.env.local.example` para `.env.local` e informe suas credenciais da API. O Vite usa seu próprio sistema de variáveis de ambiente, portanto utilize as chaves abaixo:
   ```bash
   cp .env.local.example .env.local
   # edite o arquivo gerado, preenchendo VITE_AD_ACCOUNT_ID e VITE_ACCESS_TOKEN
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O Vite executará em `http://localhost:5173`. Em ambientes remotos como
   Codespaces, o arquivo `vite.config.ts` já define `server.host` para permitir
   acesso externo.

4. Execute os testes automatizados:
   ```bash
   npm run test
   ```

5. Gere a versão de produção:
   ```bash
   npm run build
   ```

O projeto utiliza o Vite com `public/index.html` como ponto de entrada.
Os módulos que interagem com a API da Meta foram movidos para `backend-meta/` e
são simulados no ambiente do Codex por `src/mocks/handlers.ts`.

As variáveis de ambiente declaradas em `.env.local` ficam disponíveis no código
através de `import.meta.env`.

## Variáveis de ambiente

- `VITE_AD_ACCOUNT_ID`: ID da conta de anúncios.
- `VITE_ACCESS_TOKEN`: token de acesso da Meta API.
