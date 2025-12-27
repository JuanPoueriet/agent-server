// security.js
class SecurityManager {
    constructor() {
        this.blockedCommands = ['rm -rf', 'format c:', ':(){:|:&};:'];
        this.allowedFileExtensions = ['.js', '.ts', '.json', '.html', '.css'];
        this.maxFileSize = 1024 * 1024; // 1MB
    }
    
    validateCommand(command) {
        // Validar que no sea un comando peligroso
        for (const blocked of this.blockedCommands) {
            if (command.includes(blocked)) {
                throw new Error(`Comando bloqueado por seguridad: ${blocked}`);
            }
        }
        
        // Validar formato
        if (command.length > 1000) {
            throw new Error('Comando demasiado largo');
        }
        
        return true;
    }
    
    validateFileOperation(filePath, content) {
        // Validar extensión de archivo
        const ext = path.extname(filePath);
        if (!this.allowedFileExtensions.includes(ext)) {
            throw new Error(`Extensión de archivo no permitida: ${ext}`);
        }
        
        // Validar tamaño
        if (content && content.length > this.maxFileSize) {
            throw new Error('Archivo demasiado grande');
        }
        
        // Validar path traversal
        if (filePath.includes('../') || filePath.includes('..\\')) {
            throw new Error('Path traversal detectado');
        }
        
        return true;
    }
}