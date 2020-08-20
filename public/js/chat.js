const socket = io()

// Elements (putting $ is a conventin for DOM elements)
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.getElementById('sendLocation')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// autoscroll function
const autoscroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    // height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

   // visible height
   const visibleHeight = $messages.offsetHeight

   // height  of messages container
   const containerHeight = $messages.scrollHeight

   // How far have I scrolled?
   const scrollOffset = $messages.scrollTop + visibleHeight

   console.log('containerHeight: ', containerHeight)
   console.log('newMessageHeight: ', newMessageHeight)
   console.log('scrollOffset: ', scrollOffset)
   // if we were already at bottom before the newest message
   if (containerHeight - newMessageHeight <= scrollOffset) {
       // push us to the bottom
       $messages.scrollTop = $messages.scrollHeight
   }
}

// receiving message from server
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// receiving location message from server
socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationMessageTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// getting room details
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html
})

// send message to other users
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // disable submit button
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        // enable submit button
        $messageFormButton.removeAttribute('disabled')

        // clear form input and refocus after sending text
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error) {
            return console.log(error)
        }
        console.log('Message Delivered.')
    })
})

// send location to all users
$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    // disable the button
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            // re-enable the button
            $locationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

// sending join information to server
socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})