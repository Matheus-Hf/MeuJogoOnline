window.onload = () => {

    const socket = new WebSocket('ws://localhost:8080')

    const canvas = document.getElementById('myCanvas')
    const ctx = canvas.getContext('2d')

    canvas.width = 600
    canvas.height = 400

    let clientId = null
    let connectPlayers = []

    socket.addEventListener('open', () => {
        socket.send(JSON.stringify({ type: 'connection' }))
    })
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data)

        if (data.type === 'connectionSucces') {
            clientId = data.clientId
        } else if (data.type === 'erro') {
            alert(data.message)

        } else if (data.type === 'update') {
            currentPlayer = data.currentPlayer
            connectPlayers = data.connectPlayers
            update()
        }
    })

    function update() {
        const player = connectPlayers.filter(p => p.id === clientId)[0].user.player
        let cor = ''
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.font = '20px Sans_Serif'
        for (let i = 0; i < connectPlayers.length; i++) {
            if (connectPlayers[i].id !== clientId) {
                cor = 'red'
                X = 20
                Y = 20
                drawPlayer(cor, connectPlayers[i].user.player)
            }
        }

        drawPlayer('blue', player)
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