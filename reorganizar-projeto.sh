#!/bin/bash

# Cria as pastas se ainda não existirem
mkdir -p backend-meta
mkdir -p src/components/Campaign
mkdir -p src/pages
mkdir -p src/assets
mkdir -p __legacy

# Move arquivos da API da Meta para backend-meta
mv create-ad.js backend-meta/ 2>/dev/null
mv create-adset.js backend-meta/ 2>/dev/null
mv create-campaign.js backend-meta/ 2>/dev/null
mv upload-image.js backend-meta/ 2>/dev/null
mv test-facebook-api.js backend-meta/ 2>/dev/null
mv list-campaigns.js backend-meta/ 2>/dev/null
mv listar-bms.js backend-meta/ 2>/dev/null
mv listar-bms-com-contas.js backend-meta/ 2>/dev/null
mv listar-contas.js backend-meta/ 2>/dev/null
mv listar-paginas.js backend-meta/ 2>/dev/null

# Move imagem para assets, se existir
mv Imagem.jpeg src/assets/ 2>/dev/null

# Move CampaignWizard, CampaignObjective e os componentes novos para o lugar certo (se já existirem)
mv CampaignWizard.jsx src/components/Campaign/ 2>/dev/null
mv CampaignObjective.tsx src/components/Campaign/ 2>/dev/null

# Move arquivos antigos e intermediários para __legacy para revisão posterior
mv src/components/Campaign/CampaignEditor.tsx __legacy/ 2>/dev/null
mv src/components/Campaign/Reports.tsx __legacy/ 2>/dev/null
mv src/components/Campaign/BudgetEditor.tsx __legacy/ 2>/dev/null
mv src/components/Campaign/MediaLibraryWithUpload.tsx __legacy/ 2>/dev/null
mv src/components/Campaign/UploadModal.tsx __legacy/ 2>/dev/null
mv src/components/Campaign/UploadQueue.tsx __legacy/ 2>/dev/null
mv src/components/Campaign/MediaItem.tsx __legacy/ 2>/dev/null

echo "\n✅ Estrutura reorganizada com sucesso. Nenhum arquivo foi apagado.\nTodos os arquivos antigos estão em /__legacy para revisão."

# Mostra estrutura final
find . -type d -maxdepth 2
