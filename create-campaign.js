require('dotenv').config();
const axios = require('axios');

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns`;

const campaignData = {
  name: "Campanha de Teste via API",
  objective: "OUTCOME_AWARENESS",
  status: "PAUSED",
  special_ad_categories: [],
  access_token: accessToken
};

axios.post(url, campaignData)
  .then(response => {
    console.log("✅ Campanha criada com sucesso:");
    console.log(response.data);
  })
  .catch(error => {
    console.error("❌ Erro ao criar campanha:");
    console.dir(error.response?.data || error.message, { depth: null });
  });
