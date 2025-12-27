// server.js - Servidor principal
const express = require('express');
const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class AgentExecutionServer {
    constructor() {
        this.app = express();
        this.activeProcesses = new Map();
        this.projectStates = new Map();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.setupAgent();
    }
    
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.text());
        // Configuración CORS y seguridad
    }
    
    setupRoutes() {
        // Endpoint para ejecutar comandos
        this.app.post('/api/execute', async (req, res) => {
            const { command, projectId, args } = req.body;
            const result = await this.executeCommand(command, args, projectId);
            res.json(result);
        });
        
        // Endpoint para leer logs
        this.app.get('/api/logs/:projectId', async (req, res) => {
            const logs = await this.getProjectLogs(req.params.projectId);
            res.json({ logs });
        });
        
        // Endpoint para estado del proyecto
        this.app.get('/api/project/:projectId/status', (req, res) => {
            const status = this.getProjectStatus(req.params.projectId);
            res.json(status);
        });
        
        // Endpoint para intervención humana
        this.app.post('/api/human-intervention', (req, res) => {
            this.requestHumanIntervention(req.body);
            res.json({ status: 'requested' });
        });
    }
    
    setupWebSocket() {
        const wss = new WebSocketServer({ port: 8080 });
        wss.on('connection', (ws) => {
            ws.on('message', (message) => {
                this.handleAgentMessage(JSON.parse(message), ws);
            });
        });
    }
}