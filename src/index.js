const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {getUser, removeUser, getUsersInRoom, addUser} = require('./utils/users')

const app = express()
const server = http.createServer(app) // this would have happened automatically by express if we didn't do it.
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket Connection')

    // when a user joins
    socket.on('join', (options, callback) => {
        // adding user to data
        const {error, user} = addUser({
            id: socket.id,
            ...options
        })

        // if not able to add user
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        // new user connect event
        socket.emit('message', generateMessage('admin', 'Welcome!'))
        socket.to(user.room).broadcast.emit('message', generateMessage('admin', `${user.username} has joined.`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    // getting messages from clients
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    // disconnection event
    socket.on('disconnect', () => {
        // removing the user from data
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    // getting location from client
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
})

server.listen(port, () => {
    console.log("server is up!")
})