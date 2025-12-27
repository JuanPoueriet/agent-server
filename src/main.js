// main.js - Punto de entrada
async function main() {
    const server = new AgentExecutionServer();
    const agent = new DeepSeekAgent(process.env.DEEPSEEK_API_KEY);
    const projectId = 'project-001';
    
    console.log('🚀 Iniciando agente autónomo...');
    
    // Ciclo principal del agente
    while (true) {
        try {
            // 1. Obtener estado actual
            const state = await server.getProjectState(projectId);
            
            // 2. El agente decide la siguiente acción
            const action = await agent.decideNextAction(state);
            
            // 3. Validar seguridad
            server.security.validateAction(action);
            
            // 4. Ejecutar acción
            const result = await server.executeAction(action, projectId);
            
            // 5. Actualizar estado
            await server.updateProjectState(projectId, result);
            
            // 6. Verificar si debemos detenernos
            if (await server.monitor.shouldStopAgent()) {
                console.log('✅ Proyecto completado al 100%');
                break;
            }
            
            // 7. Pequeña pausa entre acciones
            await sleep(2000);
            
        } catch (error) {
            console.error('❌ Error en ciclo del agente:', error);
            // Solicitar intervención humana si hay error crítico
            await server.requestHumanHelp(error);
            break;
        }
    }
}