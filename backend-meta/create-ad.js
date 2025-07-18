require('dotenv').config();
const axios = require('axios');

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const adAccountId = `act_${process.env.FACEBOOK_AD_ACCOUNT_ID}`;
const adSetId = process.env.FACEBOOK_ADSET_ID;
const pageId = process.env.FACEBOOK_PAGE_ID;
const imageHash = process.env.FACEBOOK_IMAGE_HASH;

if (!accessToken || !adAccountId || !adSetId || !pageId || !imageHash) {
  console.error('❌ Verifique se todas as variáveis estão definidas no .env');
  process.exit(1);
}

const url = `https://graph.facebook.com/v19.0/${adAccountId}/ads`;

const payload = {
  name: 'Anúncio Teste via API',
  adset_id: adSetId,
  status: 'PAUSED',
  creative: {
    object_story_spec: {
      page_id: pageId,
      link_data: {
        image_hash: imageHash,
        link: 'https://www.exemplo.com',
        message: '🔴 Anúncio criado via API na Sandbox!'
      }
    }
  }
};

axios.post(url, payload, {
  params: { access_token: accessToken }
})
.then(res => {
  console.log('✅ Anúncio criado com sucesso!');
  console.log(res.data);
})
.catch(err => {
  console.error('❌ Erro ao criar anúncio:');
  console.dir(err.response?.data || err.message, { depth: null });
});
