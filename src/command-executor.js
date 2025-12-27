// command-executor.js
const { exec, spawn } = require('child_process');
const docker = require('dockerode');

class SecureCommandExecutor {
    constructor() {
        this.allowedCommands = new Set([
            'npm', 'npx', 'yarn', 'node',
            'git', 'nx', 'ng', 'docker',
            'cd', 'ls', 'cat', 'echo'
        ]);
        
        this.docker = new docker();
        this.timeout = 30000; // 30 segundos máximo por comando
    }
    
    async executeInSandbox(command, args, projectPath) {
        // Ejecutar en contenedor Docker para aislamiento
        const container = await this.docker.createContainer({
            Image: 'node:18',
            Cmd: ['sh', '-c', `${command} ${args.join(' ')}`],
            WorkingDir: '/app',
            HostConfig: {
                Binds: [`${projectPath}:/app`],
                Memory: '512m',
                CpuShares: 512
            }
        });
        
        await container.start();
        const logs = await container.logs({ stdout: true, stderr: true });
        await container.stop();
        await container.remove();
        
        return logs.toString();
    }
    
    async executeDirect(command, args, cwd) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, {
                cwd,
                shell: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            let output = '';
            let error = '';
            
            process.stdout.on('data', (data) => {
                output += data.toString();
                this.emitLog(data.toString());
            });
            
            process.stderr.on('data', (data) => {
                error += data.toString();
                this.emitLog(`ERROR: ${data.toString()}`);
            });
            
            process.on('close', (code) => {
                resolve({
                    success: code === 0,
                    output,
                    error,
                    exitCode: code
                });
            });
            
            // Timeout
            setTimeout(() => {
                process.kill();
                reject(new Error('Command timeout'));
            }, this.timeout);
        });
    }
}