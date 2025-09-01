// Chatbot
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzmBoCl_73fKFm_ORhRucQYjLGKJaEwFsowxZWHrOrNWzBaHJfdLNe05JzUbj5rYPDWQA/exec";

function addMessage(sender, text) {
  if (!chatBox) return;
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

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
  } catch {
    addMessage("Bot", "⚠️ Error connecting to server.");
  }
}

if (chatSend) {
  chatSend.addEventListener("click", () => {
    const question = chatInput.value.trim();
    if (!question) return;
    sendQuestion(question);
    chatInput.value = "";
  });

  chatInput.addEventListener("keypress", e => {
    if (e.key === "Enter") chatSend.click();
  });
}

// Event Form Submission
const eventForm = document.getElementById("event-form");
if (eventForm) {
  eventForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(eventForm);
    const data = Object.fromEntries(formData.entries());
    // Call Apps Script to register event (you can create a doPost endpoint for it)
    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "event_registration", data })
      });
      const result = await res.json();
      document.getElementById("event-msg").textContent = "✅ Registered successfully!";
      eventForm.reset();
    } catch {
      document.getElementById("event-msg").textContent = "⚠ Error registering.";
    }
  });
}

// Notices - Demo
const noticesUl = document.getElementById("notices");
if (noticesUl) {
  const notices = ["Welcome to IFHE Campus Assistant!", "Club Meeting: Friday 5 PM", "BBA Event Registration: 10 Sep"];
  noticesUl.innerHTML = "";
  notices.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    noticesUl.appendChild(li);
  });
}
