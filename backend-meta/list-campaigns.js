require('dotenv').config();
const axios = require('axios');

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!accessToken || !adAccountId) {
  console.error("❌ Variáveis de ambiente faltando");
  process.exit(1);
}

const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns?fields=id,name,status&access_token=${accessToken}`;

axios.get(url)
  .then(res => {
    console.log("✅ Campanhas disponíveis:");
    console.dir(res.data, { depth: null });
  })
  .catch(err => {
    console.error("❌ Erro ao buscar campanhas:");
    console.dir(err.response?.data || err.message, { depth: null });
  });
