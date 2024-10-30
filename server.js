const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid');

let Player, createRoom, getRoom, removePlayerFromRoom, rooms = null

async function carregarModulo() {
    const modulo = await import('./gameModule.mjs');
    Player = modulo.Player;
    rooms = modulo.rooms;
    createRoom = modulo.createRoom;
    getRoom = modulo.getRoom;
    removePlayerFromRoom = modulo.removePlayerFromRoom;
    createRoom('lobby');
    createRoom('lobby2');

    setInterval(() => {
        Update();
    },10)
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
                const player = new Player(clientId, 'gost', 40, 40);
                currentPlayer = { ws, 'id': clientId, player };

                connectPlayers.push({ id: clientId, user: currentPlayer, ws });

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
            
            const playerrRoom = currentPlayer.player.Room;
            const roomname = data.roomname;
            const room = getRoom(roomname);
        
            if (room) {
                if (!room.Players.includes(currentPlayer)) {
                    if(playerrRoom)removePlayerDaRoom(currentPlayer, ws);
                    
                    currentPlayer.player.Room = roomname;
                    room.Players.push(currentPlayer);
                } else {
                    ws.send(JSON.stringify({ type: 'erro', message: 'Jogador já está na sala!' }));
                }
            } else {
                ws.send(JSON.stringify({ type: 'erro', message: 'Sala Não Encontrada!' }));
            }
        }

        if (data.type === 'removeroomplayer') {
            removePlayerDaRoom(currentPlayer, ws);
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

function removePlayerDaRoom(player, ws){
    if(player.player.Room){
        try {
            const removed = removePlayerFromRoom(player.player.Room, player);
            if (removed) {
                player.player.Room = null;
                player.player.posX = 0;
                player.player.posY = 0;
                ws.send(JSON.stringify({ type: 'sucesso', message: 'Jogador removido com sucesso.' }));
            } else {
                ws.send(JSON.stringify({ type: 'erro', message: 'Jogador não encontrado na sala.' }));
            }
        } catch (error) {
            ws.send(JSON.stringify({ type: 'erro', message: error.message }));
        }
    }
}

function Update() {
    for (const room of rooms) {
        const Players = []
        const roomName = room[0]
        const roomPlayers = room[1].Players
        
        for(const player of roomPlayers){
            Players.push(player.player);
        }

        for(const player of roomPlayers){
            player.player.Update(room);            
            player.ws.send(JSON.stringify({ type: 'update', Players: Players }));
        }
    }
}

console.log('Servidor WebSocket está rodando na porta 8080');
