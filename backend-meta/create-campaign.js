const fetch = global.fetch || require('node-fetch');

const { VITE_AD_ACCOUNT_ID, VITE_ACCESS_TOKEN } = process.env;
const META_GRAPH_API_URL = 'https://graph.facebook.com/v23.0';

module.exports = async function createCampaign(name, objective) {
  const body = new URLSearchParams();
  body.append('access_token', VITE_ACCESS_TOKEN);
  body.append('name', name);
  body.append('objective', objective);
  body.append('status', 'PAUSED');
  const res = await fetch(`${META_GRAPH_API_URL}/${VITE_AD_ACCOUNT_ID}/campaigns`, {
    method: 'POST',
    body,
  });
  if (!res.ok) throw new Error('Erro ao criar campanha');
  const json = await res.json();
  return json.id;
};
