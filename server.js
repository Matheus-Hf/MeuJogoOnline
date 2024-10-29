const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid');

let Player, createRoom, getRoom, removePlayerFromRoom, newroom = null

async function carregarModulo() {
    const modulo = await import('./gameModule.mjs');
    Player = modulo.Player;
    createRoom = modulo.createRoom;
    getRoom = modulo.getRoom;
    removePlayerFromRoom = modulo.removePlayerFromRoom;
    newroom = createRoom;
    newroom('lobby');
}

carregarModulo()

const wss = new WebSocket.Server({ port: 8080 });

let connectPlayers = []

wss.on('connection', (ws) => {
    const clientId = uuidv4();

    let currentPlayer = null;

    ws.on('message', async (message) => {
        const data = JSON.parse(message)

        if (data.type === 'connection') {
            console.log('Novo player conectado!');

            try {
                const player = new Player(clientId, 'gost', Math.floor(Math.random() * 60), Math.floor(Math.random() * 30));
                currentPlayer = { 'id': clientId, player };

                connectPlayers.push({ id: clientId, user: currentPlayer });

                ws.send(JSON.stringify({ type: 'connectionSucces', clientId }));

            } catch {
                ws.send(JSON.stringify({ type: 'erro', message: 'Erro ao conectar' }));
            }
        }

        if (data.type === 'insideroom') {
            if (!data.roomname) {
                ws.send(JSON.stringify({ type: 'erro', message: 'Nome da sala não fornecido!' }));
                return;
            }
        
            const roomname = data.roomname;
            const room = getRoom(roomname);
        
            if (room) {
                if (!room.Players.includes(currentPlayer)) {
                    currentPlayer.player.Room = roomname;
                    room.Players.push(currentPlayer);
                    console.log('Player entrou!');
                    
                } else {
                    ws.send(JSON.stringify({ type: 'erro', message: 'Jogador já está na sala!' }));
                }
            } else {
                ws.send(JSON.stringify({ type: 'erro', message: 'Sala Não Encontrada!' }));
            }
        }

        if (data.type === 'removeroomplayer') {
            const roomname = currentPlayer.player.Room;
            const playerToRemove = currentPlayer.id;
        
            try {
                const removed = removePlayerFromRoom(roomname, playerToRemove);
                if (removed) {
                    currentPlayer.player.Room = null;
                    ws.send(JSON.stringify({ type: 'sucesso', message: 'Jogador removido com sucesso.' }));
                } else {
                    ws.send(JSON.stringify({ type: 'erro', message: 'Jogador não encontrado na sala.' }));
                }
            } catch (error) {
                ws.send(JSON.stringify({ type: 'erro', message: error.message }));
            }
        }

        if (data.type === 'detectedkeys') {
            const { key, state } = data;
            const keys = currentPlayer.player.Keys;

            try {
                if (key in keys) {
                    keys[key] = state === 'down';
                }
            } catch {
                ws.send(JSON.stringify({ type: 'erro', message: 'Erro na detecção das keys' }));
            }
        }

    })

    ws.on('close', () => {
        if (currentPlayer) {
            // Suponha que você tenha uma função para remover o jogador

            try {
                const removed = removePlayerFromRoom(currentPlayer.player.Room, currentPlayer);
                if (removed) {
                    console.log(`Jogador ${currentPlayer} removido da sala ${roomname}`);
                }
            } catch (error) {
                console.error(`Erro ao remover jogador: ${error.message}`);
            }
            
            // Remove o usuário desconectado da lista
            connectPlayers = connectPlayers.filter(p => p.id.toString() !== currentPlayer.id.toString());
        }

    })
})

function Update() {
    for (const { user } of connectPlayers) {
        if(user){
            const room = getRoom(user.player.Room);
            user.player.Update(room);
        }
    }

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'update', connectPlayers }));
        }
    });
}

setInterval(() => {
    Update();
}, 10)

setInterval(() => {
    console.log(getRoom('lobby'));
},5000)

console.log('Servidor WebSocket está rodando na porta 8080');
