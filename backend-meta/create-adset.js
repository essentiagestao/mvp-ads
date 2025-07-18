const fetch = global.fetch || require('node-fetch');

const { VITE_AD_ACCOUNT_ID, VITE_ACCESS_TOKEN } = process.env;
const META_GRAPH_API_URL = 'https://graph.facebook.com/v23.0';

module.exports = async function createAdSet(campaignId, audienceId, budget) {
  const body = new URLSearchParams();
  body.append('access_token', VITE_ACCESS_TOKEN);
  body.append('campaign_id', campaignId);
  if (budget.type === 'DAILY') {
    body.append('daily_budget', budget.value.toString());
  } else {
    body.append('lifetime_budget', budget.value.toString());
  }
  body.append('targeting', JSON.stringify({ custom_audiences: [{ id: audienceId }] }));
  const res = await fetch(`${META_GRAPH_API_URL}/${VITE_AD_ACCOUNT_ID}/adsets`, {
    method: 'POST',
    body,
  });
  if (!res.ok) throw new Error('Erro ao criar conjunto de anúncios');
  const json = await res.json();
  return json.id;
};
