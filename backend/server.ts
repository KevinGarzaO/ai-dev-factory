import express from 'express';
import cors from 'cors';
import { runAgent } from './agent.js'; 

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para SSE
app.post('/api/run', (req, res) => {
    const { task } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write('data: ' + JSON.stringify({ msg: 'Sistema del Servidor inicializado. Conexión SSE OK.', type: 'sys' }) + '\n\n');

    const onEvent = (msg: string, type: 'agent' | 'sys' | 'user' | 'done') => {
        const payload = JSON.stringify({ msg, type });
        res.write(`data: ${payload}\n\n`);
        if (type === 'done') {
            res.end(); // Stop SSE stream gracefully
        }
    };

    // Lanzamos el Agente sin bloquear
    runAgent(task, onEvent).catch(err => {
        onEvent(`System Crash: ${err.message}`, 'sys');
        onEvent('Finished', 'done');
    });
});

app.listen(3000, () => {
    console.log('🚀 API Backend Server is running on http://localhost:3000');
});
