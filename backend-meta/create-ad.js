const fetch = global.fetch || require('node-fetch');

const { VITE_AD_ACCOUNT_ID, VITE_ACCESS_TOKEN } = process.env;
const META_GRAPH_API_URL = 'https://graph.facebook.com/v23.0';

module.exports = async function createAd(adSetId, message, file) {
  const form = new FormData();
  form.append('access_token', VITE_ACCESS_TOKEN);
  form.append('adset_id', adSetId);
  form.append('name', 'Anuncio');
  form.append('message', message);
  if (file) form.append('source', file);
  const res = await fetch(`${META_GRAPH_API_URL}/${VITE_AD_ACCOUNT_ID}/ads`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Erro ao criar anuncio');
  const json = await res.json();
  return json.id;
};
