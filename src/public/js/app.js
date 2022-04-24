const socket = io();

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

const room = document.getElementById("room");

room.hidden = true;

let roomName = "";

const sendMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.append(li);
};

const showRoom = () => {
  room.hidden = false;
  welcome.hidden = true;
  const roomForm = room.querySelector("form");
  showRoomName(roomName, 1);
  roomForm.addEventListener("submit", handleMessageSubmit);
};

const showRoomList = (rooms) => {
  const ul = welcome.querySelector("ul");
  ul.innerHTML = "";
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    ul.append(li);
  });
};

const showRoomName = (roomName, countUser) => {
  const h3 = room.querySelector("h3");
  const roomForm = room.querySelector("form");
  h3.innerText = `Room ${roomName} current Users => (${countUser})`;
};

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const roomForm = room.querySelector("form");
  const input = roomForm.querySelector("input");
  const value = input.value;
  socket.emit("new_message", value, roomName, () => {
    sendMessage(`You: ${value}`);
  });
  input.value = "";
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  roomName = welcomeForm.querySelector("#roomName").value;
  const input = welcomeForm.querySelector("#nickname");
  // event name, value, callback
  socket.emit("enter_room", roomName, input.value, showRoom);

  input.value = "";
};

welcomeForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, countUser) => {
  sendMessage(`${user} joined !`);
  showRoomName(roomName, countUser);
});

socket.on("new_message", (message, user) => {
  sendMessage(`${user}: ${message}`);
});

socket.on("bye", (user, countUser) => {
  sendMessage(`${user} left !`);
  showRoomName(roomName, countUser);
});

socket.on("room_change", (rooms) => {
  console.log(rooms);
  showRoomList(rooms);
});
