require('dotenv').config();
const axios = require('axios');

(async () => {
  try {
    const { FACEBOOK_ACCESS_TOKEN } = process.env;
    const url = 'https://graph.facebook.com/v19.0/me/adaccounts';
    const params = {
      fields: 'name,id,account_status',
      access_token: FACEBOOK_ACCESS_TOKEN
    };

    const { data } = await axios.get(url, { params });

    console.log('\n📋 CONTAS DE ANÚNCIOS DISPONÍVEIS:\n');

    data.data.forEach(acc => {
      console.log(`📢 Nome: ${acc.name}`);
      console.log(`🆔 ID: ${acc.id}`);
      console.log(`📌 Status: ${acc.account_status}\n`);
    });
  } catch (err) {
    console.error('❌ Erro:', err.response?.data || err.message);
  }
})();
