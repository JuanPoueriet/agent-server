// monitor.js
class ProjectMonitor {
    constructor(projectId) {
        this.projectId = projectId;
        this.metrics = {
            filesCreated: 0,
            commandsExecuted: 0,
            testsPassed: 0,
            errors: 0,
            startTime: Date.now()
        };
        this.logStream = fs.createWriteStream(`logs/${projectId}.log`);
    }
    
    calculateCompletionPercentage() {
        // Lógica para calcular completitud basada en:
        // 1. Archivos creados vs esperados
        // 2. Tests pasando
        // 3. Dependencias instaladas
        // 4. Funcionalidades implementadas
        
        const checklist = this.getProjectChecklist();
        const completed = checklist.filter(item => item.completed).length;
        return (completed / checklist.length) * 100;
    }
    
    async shouldStopAgent() {
        const percentage = this.calculateCompletionPercentage();
        const hasErrors = this.metrics.errors > 10;
        const isStuck = this.isAgentStuck();
        
        return percentage >= 100 || hasErrors || isStuck;
    }
}