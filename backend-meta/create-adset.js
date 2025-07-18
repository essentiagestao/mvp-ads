require('dotenv').config();
const axios = require('axios');

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const adAccountId = `act_${process.env.FACEBOOK_AD_ACCOUNT_ID}`;
const campaignId = process.env.FACEBOOK_CAMPAIGN_ID;

if (!accessToken || !adAccountId || !campaignId) {
  console.error('❌ Verifique se todas as variáveis estão definidas no .env');
  process.exit(1);
}

const url = `https://graph.facebook.com/v19.0/${adAccountId}/adsets`;

const payload = {
  name: 'Conjunto de Teste via API',
  campaign_id: campaignId,
  daily_budget: 1000, // R$10 em centavos
  billing_event: 'IMPRESSIONS',
  optimization_goal: 'REACH',
  bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  targeting: {
    geo_locations: {
      countries: ['BR']
    },
    age_min: 18,
    age_max: 65
  },
  status: 'PAUSED',
  start_time: new Date(Date.now() + 3600000).toISOString() // inicia em 1h
};

axios.post(url, payload, {
  params: { access_token: accessToken }
})
.then(res => {
  console.log('✅ Conjunto criado com sucesso!');
  console.log(res.data);
})
.catch(err => {
  console.error('❌ Erro ao criar conjunto:');
  console.dir(err.response?.data || err.message, { depth: null });
});
