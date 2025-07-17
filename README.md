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

O projeto utiliza a pasta `src` como raiz do Vite. Certifique-se de que o arquivo
`index.html` permanece dentro de `src`.

As variáveis de ambiente declaradas em `.env.local` ficam disponíveis no código
através de `import.meta.env`.
