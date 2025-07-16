#!/usr/bin/env bash
set -e                        # para o script se qualquer passo falhar
set -o pipefail

# ─────────────────────────────────────────────────────────────
# Configurações iniciais
# (1) GARANTA que .env já contenha APENAS:
#   FACEBOOK_ACCESS_TOKEN e FACEBOOK_AD_ACCOUNT_ID
# (2) Que exista a imagem ./imagem.jpeg
# ─────────────────────────────────────────────────────────────

echo "▶️  Carregando variáveis…"
source .env

# Função auxiliar para inserir/atualizar chave-valor no .env
function env_put () {
  key="$1"; value="$2"
  if grep -q "^${key}=" .env; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" .env
  else
    echo "${key}=${value}" >> .env
  fi
}

# ── 1. Criar campanha ───────────────────────────────────────
echo "🚀 Criando campanha…"
campaign_json=$(node - <<'NODE'
  require('dotenv').config();
  const axios = require('axios');

  (async () => {
    const { FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID } = process.env;
    const url = `https://graph.facebook.com/v19.0/act_${FACEBOOK_AD_ACCOUNT_ID}/campaigns`;
    const payload = { name: 'Campanha Bash', objective: 'LINK_CLICKS', status: 'PAUSED' };
    const { data } = await axios.post(url, payload, { params: { access_token: FACEBOOK_ACCESS_TOKEN } });
    console.log(JSON.stringify(data));
  })();
NODE
)

campaign_id=$(echo "$campaign_json" | jq -r '.id')
echo "✅ Campanha: $campaign_id"
env_put FACEBOOK_CAMPAIGN_ID "$campaign_id"

# ── 2. Criar Ad Set ──────────────────────────────────────────
echo "🚀 Criando ad set…"
adset_json=$(node - <<'NODE'
  require('dotenv').config();
  const axios = require('axios');

  (async () => {
    const { FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID, FACEBOOK_CAMPAIGN_ID } = process.env;
    const url = `https://graph.facebook.com/v19.0/act_${FACEBOOK_AD_ACCOUNT_ID}/adsets`;
    const payload = {
      name: 'AdSet Bash',
      campaign_id: FACEBOOK_CAMPAIGN_ID,
      daily_budget: 1000,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      start_time: new Date(Date.now() + 60000).toISOString(),
      end_time: new Date(Date.now() + 86400000).toISOString(),
      status: 'PAUSED',
      targeting: { geo_locations: { countries: ['BR'] }, age_min: 18, age_max: 65 }
    };
    const { data } = await axios.post(url, payload, { params: { access_token: FACEBOOK_ACCESS_TOKEN } });
    console.log(JSON.stringify(data));
  })();
NODE
)

adset_id=$(echo "$adset_json" | jq -r '.id')
echo "✅ AdSet: $adset_id"
env_put FACEBOOK_ADSET_ID "$adset_id"

# ── 3. Fazer upload da imagem ───────────────────────────────
echo "🚀 Subindo imagem…"
image_json=$(node - <<'NODE'
  require('dotenv').config();
  const fs = require('fs');
  const axios = require('axios');
  const FormData = require('form-data');

  (async () => {
    const { FACEBOOK_ACCESS_TOKEN, FACEBOOK_AD_ACCOUNT_ID } = process.env;
    const form = new FormData();
    form.append('access_token', FACEBOOK_ACCESS_TOKEN);
    form.append('filename', 'imagem.jpeg');
    form.append('file', fs.createReadStream('./imagem.jpeg'));
    const url = `https://graph.facebook.com/v19.0/act_${FACEBOOK_AD_ACCOUNT_ID}/adimages`;
    const { data } = await axios.post(url, form, { headers: form.getHeaders() });
    console.log(JSON.stringify(data));
  })();
NODE
)

image_hash=$(echo "$image_json" | jq -r '.images["imagem.jpeg"].hash')
echo "✅ Image hash: $image_hash"
env_put FACEBOOK_IMAGE_HASH "$image_hash"

# ── 4. CRIAR o anúncio ──────────────────────────────────────
echo "🚀 Criando anúncio…"
ad_json=$(node - <<'NODE'
  require('dotenv').config();
  const axios = require('axios');

  (async () => {
    const {
      FACEBOOK_ACCESS_TOKEN,
      FACEBOOK_AD_ACCOUNT_ID,
      FACEBOOK_ADSET_ID,
      FACEBOOK_PAGE_ID,
      FACEBOOK_IMAGE_HASH
    } = process.env;

    const url = `https://graph.facebook.com/v19.0/act_${FACEBOOK_AD_ACCOUNT_ID}/ads`;
    const payload = {
      name: 'Anúncio Bash',
      adset_id: FACEBOOK_ADSET_ID,
      creative: {
        object_story_spec: {
          page_id: FACEBOOK_PAGE_ID,
          link_data: {
            message: 'Teste automático via script!',
            link: 'https://www.exemplo.com',
            image_hash: FACEBOOK_IMAGE_HASH
          }
        }
      },
      status: 'PAUSED'
    };

    const { data } = await axios.post(url, payload, { params: { access_token: FACEBOOK_ACCESS_TOKEN } });
    console.log(JSON.stringify(data));
  })();
NODE
)

ad_id=$(echo "$ad_json" | jq -r '.id')
echo "🎉 Anúncio criado: $ad_id"
env_put FACEBOOK_AD_ID "$ad_id"

echo -e "\n✨ Fluxo completo! IDs salvos no .env:"
cat .env | grep FACEBOOK_
