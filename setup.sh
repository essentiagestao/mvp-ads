#!/bin/bash

echo "🔧 Descompactando node_modules.tar.gz..."
if [ -f node_modules.tar.gz ]; then
  tar -xzf node_modules.tar.gz
  echo "✅ node_modules descompactado com sucesso."
else
  echo "⚠️ Arquivo node_modules.tar.gz não encontrado."
  exit 1
fi

echo "🚀 Iniciando ambiente de desenvolvimento com Vite..."
npm run dev
