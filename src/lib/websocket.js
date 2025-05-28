import { WebSocketServer } from 'ws';
import { createServer } from 'http';

export function createWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', async (message) => {
      try {
        // Parse the incoming message
        const data = JSON.parse(message);
        
        // Handle the message (you can customize this part)
        console.log('Received detection:', data);
        
        // Send acknowledgment
        ws.send(JSON.stringify({ status: 'received' }));
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({ error: 'Failed to process message' }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return wss;
} 