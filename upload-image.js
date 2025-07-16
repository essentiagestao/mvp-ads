require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;

if (!accessToken || !adAccountId) {
  console.error('❌ Verifique se o .env tem as variáveis: FACEBOOK_ACCESS_TOKEN e FACEBOOK_AD_ACCOUNT_ID');
  process.exit(1);
}

const imagePath = './Imagem.jpeg'; // seu arquivo está com esse nome

const form = new FormData();
form.append('access_token', accessToken);
form.append('ad_account_id', `act_${adAccountId}`);
form.append('file', fs.createReadStream(imagePath));
form.append('name', 'Imagem de Teste via API');

axios.post(`https://graph.facebook.com/v19.0/act_${adAccountId}/adimages`, form, {
  headers: form.getHeaders()
})
.then(response => {
  console.log('✅ Imagem enviada com sucesso!');
  console.log(response.data);
})
.catch(error => {
  console.error('❌ Erro ao enviar imagem:');
  console.dir(error.response?.data || error.message, { depth: null });
});
