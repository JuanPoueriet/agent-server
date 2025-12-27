// agent-orchestrator.js
const axios = require('axios');

class DeepSeekAgent {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.deepseek.com/v1';
        this.context = {
            projectState: {},
            recentActions: [],
            learnedPatterns: []
        };
    }
    
    async decideNextAction(projectState) {
        const prompt = this.buildDecisionPrompt(projectState);
        
        const response = await axios.post(`${this.baseURL}/chat/completions`, {
            model: "deepseek-coder",
            messages: [
                {
                    role: "system",
                    content: `Eres un agente de desarrollo autónomo. Tienes control total sobre el proyecto.
                    
                    Puedes:
                    1. Ejecutar cualquier comando necesario (npm, npx, git, etc.)
                    2. Escribir, modificar y eliminar archivos
                    3. Instalar dependencias
                    4. Ejecutar tests
                    5. Iniciar servidores de desarrollo
                    
                    Reglas:
                    - Siempre verifica que cada acción fue exitosa
                    - Si un comando falla, diagnostica y corrige
                    - Mantén un archivo de progreso
                    - Detente cuando el proyecto esté 100% completo
                    - Pide ayuda humana solo cuando sea estrictamente necesario`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.2,
            max_tokens: 2000
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        return this.parseAgentResponse(response.data.choices[0].message.content);
    }
    
    buildDecisionPrompt(projectState) {
        return `
        ESTADO ACTUAL DEL PROYECTO:
        ${JSON.stringify(projectState, null, 2)}
        
        ÚLTIMOS LOGS:
        ${projectState.recentLogs || 'No hay logs recientes'}
        
        PROBLEMAS CONOCIDOS:
        ${projectState.knownIssues || 'Ninguno'}
        
        PORCENTAJE DE COMPLETITUD: ${projectState.completionPercentage || 0}%
        
        ANALIZA Y DECIDE:
        1. ¿Cuál es el siguiente paso más importante?
        2. ¿Qué comando necesitas ejecutar?
        3. ¿Necesitas crear/modificar algún archivo?
        4. ¿Requieres intervención humana?
        
        Responde en formato JSON:
        {
            "actionType": "command|file_edit|human_help",
            "command": "npm install express",
            "files": [{"path": "src/index.js", "action": "create|edit", "content": "..."}],
            "reason": "Explicación de por qué esta acción es necesaria",
            "expectedOutcome": "Qué esperas lograr"
        }`;
    }
}