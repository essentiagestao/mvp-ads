const fetch = global.fetch || require('node-fetch');

const { VITE_AD_ACCOUNT_ID, VITE_ACCESS_TOKEN } = process.env;
const META_GRAPH_API_URL = 'https://graph.facebook.com/v23.0';

module.exports = async function uploadImage(name, buffer) {
  const blob = new Blob([buffer]);
  const form = new FormData();
  form.append('access_token', VITE_ACCESS_TOKEN);
  form.append('name', name);
  form.append('bytes', blob);
  const res = await fetch(`${META_GRAPH_API_URL}/${VITE_AD_ACCOUNT_ID}/adimages`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Falha ao enviar imagem');
  return res.json();
};
