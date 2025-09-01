// ✅ Student-style, simple JS
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

// Your Apps Script Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzmBoCl_73fKFm_ORhRucQYjLGKJaEwFsowxZWHrOrNWzBaHJfdLNe05JzUbj5rYPDWQA/exec";

// Function to send question to Apps Script
async function sendQuestion(question) {
  addMessage("You", question);

  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    addMessage("Bot", data.answer);
  } catch (err) {
    addMessage("Bot", "⚠️ Error connecting to server.");
    console.error(err);
  }
}

// Function to display messages
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Event listener
chatSend.addEventListener("click", () => {
  const question = chatInput.value.trim();
  if (!question) return;
  sendQuestion(question);
  chatInput.value = "";
});

// Optional: press Enter to send
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    chatSend.click();
  }
});

// Load demo notices (can later fetch from Google Sheet)
const notices = ["Welcome to IFHE Campus Assistant!", "Next Club meeting: Friday 5 PM", "Deadline for BBA event registration: 10 Sep"];
const noticesUl = document.getElementById("notices");
noticesUl.innerHTML = "";
notices.forEach(n => {
  const li = document.createElement("li");
  li.textContent = n;
  noticesUl.appendChild(li);
});
