require('dotenv').config();
const axios = require('axios');

(async () => {
  try {
    const { FACEBOOK_ACCESS_TOKEN } = process.env;

    // Passo 1: buscar os Business Managers
    const bmRes = await axios.get('https://graph.facebook.com/v19.0/me/businesses', {
      params: {
        access_token: FACEBOOK_ACCESS_TOKEN,
        fields: 'name,id'
      }
    });

    const bms = bmRes.data.data;

    if (bms.length === 0) {
      console.log('⚠️ Nenhum Gerenciador de Negócios encontrado.');
      return;
    }

    for (const bm of bms) {
      console.log(`\n🏢 BM: ${bm.name}`);
      console.log(`🆔 ID: ${bm.id}`);

      // Passo 2: buscar as contas de anúncio vinculadas a esse BM
      try {
        const adAccountsRes = await axios.get(`https://graph.facebook.com/v19.0/${bm.id}/owned_ad_accounts`, {
          params: {
            access_token: FACEBOOK_ACCESS_TOKEN,
            fields: 'name,id,account_status'
          }
        });

        const contas = adAccountsRes.data.data;

        if (contas.length === 0) {
          console.log('   ❌ Nenhuma conta de anúncio vinculada.');
        } else {
          contas.forEach((conta, i) => {
            console.log(`   🔹 #${i + 1} - ${conta.name}`);
            console.log(`      🆔 ID: ${conta.id}`);
            console.log(`      📌 Status: ${conta.account_status}\n`);
          });
        }
      } catch (err) {
        console.log(`   ⚠️ Erro ao buscar contas de anúncio: ${err.response?.data?.error?.message || err.message}`);
      }
    }
  } catch (err) {
    console.error('❌ Erro ao buscar BMs:', err.response?.data || err.message);
  }
})();
