#!/bin/bash
# setup.sh

# 1. Clonar repositorio
git clone https://github.com/tu-usuario/agent-server.git
cd agent-server

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu API key de DeepSeek

# 4. Iniciar servidor
docker-compose up -d

# 5. Iniciar agente en un proyecto específico
curl -X POST http://localhost:3000/api/agent/start \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "mi-proyecto",
    "repoUrl": "https://github.com/tu-usuario/mi-proyecto.git",
    "specifications": "Crear una API REST con Node.js y Express"
  }'