window.onload = () => {

    const socket = new WebSocket('ws://localhost:8080')

    const canvas = document.getElementById('myCanvas')
    const ctx = canvas.getContext('2d')
    const btnEntrar = document.getElementById('BntEntar')
    const btnSair = document.getElementById('BntSair')
    let roomname

    canvas.width = 600
    canvas.height = 400

    let clientId = null
    let Players = []

    socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ type: 'connection' }))
    })
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'connectionSucces') {
            clientId = data.clientId
        } else if (data.type === 'erro') {
            console.log(data.message)
            
        } else if(data.type === 'sucesso') { 
            console.log(data.message)
            Players = null
            update()
        } else if (data.type === 'update') {
            Players = data.Players
            update()
        }
    })
    
    document.addEventListener('keydown', event => {
        socket.send(JSON.stringify({ type: 'detectedkeys', key: event.key, state: 'down' }))
    })
    document.addEventListener('keyup', event => {
        socket.send(JSON.stringify({ type: 'detectedkeys', key: event.key, state: 'up' }))
    })
    btnEntrar.addEventListener('click', () => {
        roomname = document.getElementById('roomname').value
        socket.send(JSON.stringify({ type: 'insideroom', roomname }))
    })
    btnSair.addEventListener('click', () => {
        socket.send(JSON.stringify({ type: 'removeroomplayer' }))
    })

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if(Players){
            const player = Players.filter(p => p.Id === clientId)[0]
            
            let cor = ''
    
            for (let i = 0; i < Players.length; i++) {
                if (Players[i].id !== clientId) {
                    cor = 'red'
                    X = 20
                    Y = 20
                    drawPlayer(cor, Players[i])
                }
            }
    
            drawPlayer('blue', player)
        }
    }

    function drawPlayer(cor, player) {
        const Cor = cor
        const Player = player
        const X = player.posX
        const Y = player.posY
        ctx.fillStyle = Cor
        ctx.fillRect(X, Y, Player.Width, Player.Height)
    }
}