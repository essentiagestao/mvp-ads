require('dotenv').config();
const axios = require('axios');

(async () => {
  const { FACEBOOK_ACCESS_TOKEN } = process.env;

  try {
    const res = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: {
        access_token: FACEBOOK_ACCESS_TOKEN,
        fields: 'id,name'
      }
    });

    const pages = res.data.data;
    if (!pages.length) return console.log("Nenhuma página encontrada.");

    console.log("\n📄 Páginas disponíveis:\n");
    pages.forEach((page, i) => {
      console.log(`🔹 #${i + 1} - ${page.name}\n   🆔 ID: ${page.id}\n`);
    });
  } catch (err) {
    console.error("Erro ao buscar páginas:", err.response?.data || err.message);
  }
})();
