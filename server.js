const { strict } = require('assert');
const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid');

let Player = null

async function carregarModulo() {
    const modulo = await import('./gameModule.mjs');
    Player = modulo.Player;
}

carregarModulo()

const wss = new WebSocket.Server({ port: 8080 });

let connectPlayers = []

wss.on('connection', (ws) => {
    const clientId = uuidv4();
    
    let currentPlayer = null;
    
    ws.on('message', async (message) => {
        const data = JSON.parse(message)
        
        if(data.type === 'connection'){
            console.log('Novo player conectado!');
            
            try{
                const player = new Player(clientId,'gost', Math.floor(Math.random() * 60), Math.floor(Math.random() * 30));
                currentPlayer = {'id': clientId ,player}
                
                connectPlayers.push({ id: clientId, user: currentPlayer });
                
                ws.send(JSON.stringify({ type: 'connectionSucces', clientId}));
                
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'update', connectPlayers, currentPlayer }));
                    }
                });
                
            } catch{
                ws.send(JSON.stringify({ type: 'erro', message: 'Erro ao conectar'}))
            }
        }
        if(data.type === 'movePlayer'){
            
            try{
                if(data. == '')
            }catch{
                ws.send(JSON.stringify({type: 'erro', message: 'Nao pode mover!'}))
            }
        }
    })

    ws.on('close', () => {
        console.log('Player desconectado!');
        
        // Remove o usuário desconectado da lista
        connectPlayers = connectPlayers.filter(p => p.id.toString() !== currentPlayer.id.toString())

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'update', connectPlayers }));
            }
          });
    })
})

function Update(){
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'update', connectPlayers }));
        }
      });
}

setInterval(() => {
    Update();
}, 60)

console.log('Servidor WebSocket está rodando na porta 8080');
