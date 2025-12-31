const socket = io(`${window.location.protocol}//${window.location.hostname}:3000`);
socket.emit("join", USER_ID);

let currentUser = null;
const usersList = {}; // store user id -> name

// Load all users
async function loadUsers() {
  const res = await fetch("/chat/users");
  const users = await res.json();
  const usersDiv = document.getElementById("users");
  usersDiv.innerHTML = "";
  users.forEach(u => {
    usersList[u.id] = u.name;
    const div = document.createElement("div");
    div.className = "user";
    div.dataset.id = u.id;
    div.innerText = u.name;
    div.onclick = () => selectUser(u.id, u.name);
    usersDiv.appendChild(div);
  });
}

// Select user
function selectUser(id, name) {
  currentUser = id;
  document.getElementById("chatWith").innerText = name;
  loadMessages();
}

// Load messages
async function loadMessages() {
  if (!currentUser) return;
  const res = await fetch(`/chat/fetch?with=${currentUser}`);
  const messages = await res.json();
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = "";
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.sender_id === USER_ID ? "msg right" : "msg left";
    div.innerText = msg.sender_id === USER_ID 
        ? msg.message + (msg.seen ? " ✓✓" : " ✓") 
        : msg.message;
    chatBox.appendChild(div);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send message
function sendMessage() {
  const input = document.getElementById("msg");
  const message = input.value.trim();
  if (!message) return;
  if (!currentUser) return alert("Select a user first!");

  socket.emit("sendMessage", {
    sender_id: USER_ID,
    receiver_id: currentUser,
    message
  });
  input.value = "";
}

// Typing indicator
document.getElementById("msg").addEventListener("input", () => {
  if (!currentUser) return;
  socket.emit("typing", { sender_id: USER_ID, receiver_id: currentUser });
});

// Receive new message
socket.on("newMessage", (msg) => {
  if (msg.sender_id === currentUser || msg.sender_id === USER_ID) {
    const chatBox = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.className = msg.sender_id === USER_ID ? "msg right" : "msg left";
    div.innerText = msg.sender_id === USER_ID 
        ? msg.message + (msg.seen ? " ✓✓" : " ✓") 
        : msg.message;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

// Show typing
socket.on("typing", (senderId) => {
  if (senderId === currentUser) {
    const chatWith = document.getElementById("chatWith");
    chatWith.innerText = "Typing...";
    setTimeout(() => {
      chatWith.innerText = usersList[currentUser];
    }, 1000);
  }
});

// Online/offline update
socket.on("updateUsers", (onlineIds) => {
  document.querySelectorAll(".user").forEach(div => {
    const id = div.dataset.id;
    if (onlineIds.includes(id)) div.classList.add("online");
    else div.classList.remove("online");
  });
});

loadUsers();
