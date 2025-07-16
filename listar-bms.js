require('dotenv').config();
const axios = require('axios');

(async () => {
  try {
    const { FACEBOOK_ACCESS_TOKEN } = process.env;

    const url = 'https://graph.facebook.com/v19.0/me/businesses';
    const params = {
      access_token: FACEBOOK_ACCESS_TOKEN,
      fields: 'name,id'
    };

    const { data } = await axios.get(url, { params });

    console.log('\n🏢 GERENCIADORES DE NEGÓCIOS (Business Managers):\n');
    data.data.forEach((bm, i) => {
      console.log(`#${i + 1}`);
      console.log(`📛 Nome: ${bm.name}`);
      console.log(`🆔 ID: ${bm.id}\n`);
    });
  } catch (err) {
    console.error('❌ Erro ao buscar BMs:', err.response?.data || err.message);
  }
})();
