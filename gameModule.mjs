export const rooms = new Map();

export class Player {
    constructor(id, name, posx, posy){
        this.Id = id
        this.Name = name
        this.Width = 50
        this.Height = 50
        this.posX = posx
        this.posY = posy
        this.Keys = {
            w: false,
            a: false,
            s: false,
            d: false
        }
        this.speed = 3
        this.Room = ""
    }
    verificarLimites(dirX, dirY, room) {
        if (this.posX <= 0 && dirX < 0) {
            this.PosX = 0
            dirX = 0
        }
        if (this.posX + this.Width >= room && dirX > 0) {
            this.PosX = room.Width - this.Width
            dirX = 0
        }
        if (this.posY <= 0 && dirY < 0) {
            this.PosY = 0
            dirY = 0
        }
        if (this.posY + this.Height >= room && dirY > 0) {
            this.PosY = room.Height - this.Height
            dirY = 0
        }
    }
    PlayerMovement(room){
    
        let dirX = this.Keys.d - this.Keys.a;
        let dirY = this.Keys.s - this.Keys.w;
        let speed = this.speed;

        this.verificarLimites(dirX, dirY, room);
    
        if (dirX && dirY) {
            speed /= Math.SQRT2;
        }
    
        this.posX += dirX * speed;
        this.posY += dirY * speed;
    }
    Update(room){
        if(this.Room) this.PlayerMovement(room);
    }
}

class room{
    constructor(width, height){
        this.Width = width
        this.Height = height
        this.Players = []
    }
}

export function createRoom(name) {
    if (!name || typeof name !== 'string') {
        throw new Error("Nome da sala inválido. Deve ser uma string não vazia.");
    }

    if (rooms.has(name)) {
        throw new Error("Nome da sala já existe. Escolha um nome diferente.");
    }

    const newRoom = new room(600, 400);
    rooms.set(name, newRoom);

    return newRoom;
}
export function getRoom(name) {
    return rooms.get(name) || null;
}
export function removePlayerFromRoom(roomname, playerToRemove) {
    const room = getRoom(roomname);

    if (!room) {
        throw new Error("Sala não encontrada");
    }

    const playerIndex = room.Players.indexOf(playerToRemove);

    if (playerIndex !== -1) {
        room.Players.splice(playerIndex, 1);
        return true;
    } else {
        return false;
    }
}

