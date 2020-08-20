const users = []

// add users
const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and Room are required"
    }
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  // Validate username duplicacy
  if (existingUser) {
    return {
      error: "username already exists."
    }
  }

  // adding the user to the room
  const user = {
    id,
    username,
    room
  }

  users.push(user)

  return {user}
}

// remove users
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)
  if (index != -1) {
    return users.splice(index, 1)[0]
  } 
}

// get user
const getUser = (id) => {
  const index = users.findIndex((user) => user.id === id)
  if (index != -1) {
    return users[index]
  }
  return undefined
}

// get users in room
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase()
  usersInRoom = users.filter((user) => {
    return user.room === room
  })

  return usersInRoom
}

module.exports = {
  getUser,
  getUsersInRoom,
  addUser,
  removeUser
}