require('dotenv').config();
const axios = require('axios');

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!accessToken || !adAccountId) {
  console.error("❌ As variáveis de ambiente não foram carregadas corretamente.");
  console.log({ accessToken, adAccountId });
  process.exit(1);
}

(async () => {
  try {
    const response = await axios.get(`https://graph.facebook.com/v18.0/act_${adAccountId}/campaigns`, {
      params: {
        access_token: accessToken,
      },
    });

    console.log("✅ Campanhas encontradas:");
    console.dir(response.data, { depth: null });

  } catch (error) {
    console.error("❌ Erro ao buscar campanhas:");
    if (error.response) {
      console.dir(error.response.data, { depth: null });
    } else {
      console.error(error.message);
    }
  }
})();
