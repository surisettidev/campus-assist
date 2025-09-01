// saas-widget.js
(function () {
  // Replace with your Apps Script web app URL (already set to your URL)
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzmBoCl_73fKFm_ORhRucQYjLGKJaEwFsowxZWHrOrNWzBaHJfdLNe05JzUbj5rYPDWQA/exec";

  // Create widget container
  const widget = document.createElement("div");
  widget.id = "saas-widget";
  widget.innerHTML = `
    <div id="saas-widget-header">
      <div class="title">
        <div class="logo">IF</div>
        <div>
          <div style="font-size:13px">IF HE Assist</div>
          <div style="font-size:11px; color:rgba(255,255,255,0.9)">Campus Assistant</div>
        </div>
      </div>
      <div class="controls">
        <button id="saas-widget-minimize" title="Minimize" style="background:transparent;border:none;color:rgba(255,255,255,0.95);font-weight:700">—</button>
      </div>
    </div>

    <div id="saas-widget-tabs">
      <button id="tab-chat" class="active">Chat</button>
      <button id="tab-idea">Share Idea</button>
      <button id="tab-notify">Notifications</button>
    </div>

    <div id="saas-widget-body">
      <!-- Chat -->
      <div id="chat-tab" class="fade-in">
        <div id="saas-widget-messages"></div>
        <div class="input-row">
          <input id="saas-widget-input" placeholder="Ask about events, clubs, schedules..." />
          <button id="saas-widget-send">Send</button>
        </div>
      </div>

      <!-- Idea -->
      <div id="idea-tab" style="display:none;">
        <form id="idea-form">
          <label>Your Idea <span class="form-note">(public: can be anonymous)</span></label>
          <textarea name="idea" rows="4" required placeholder="Describe your idea..."></textarea>

          <label>Email (required)</label>
          <input name="email" type="email" required placeholder="your@college.edu">

          <label style="font-weight:600;"><input name="anonymous" type="checkbox" value="true" /> Share anonymously (public shows 'Anonymous')</label>
          <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
            <button type="submit" class="btn" style="background:var(--primary);border-radius:8px;padding:8px 12px;color:#fff;border:none">Submit Idea</button>
            <div id="idea-status" style="color:green;font-weight:600"></div>
          </div>
          <div style="margin-top:8px;color:var(--muted);font-size:13px;">Emails are required for admin follow-up. If you tick 'Share anonymously' the public will see 'Anonymous'. Only admins can view the email in Sheets.</div>
        </form>
      </div>

      <!-- Notifications -->
      <div id="notify-tab" style="display:none;">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:700">Email Notifications</div>
              <div style="font-size:13px;color:var(--muted)">Receive event reminders & updates via email</div>
            </div>
            <label class="switch" title="Toggle notifications">
              <input id="notify-toggle" type="checkbox" />
              <span class="track"><span class="thumb"></span></span>
            </label>
          </div>

          <div style="margin-top:12px;">
            <label style="font-weight:700">Your Email</label>
            <input id="notify-email" type="email" placeholder="your@college.edu" style="padding:10px;border-radius:8px;border:1px solid rgba(15,23,42,0.06);width:100%" />
            <div style="display:flex;gap:8px;margin-top:10px">
              <button id="notify-save" class="btn" style="background:var(--primary);border-radius:8px;padding:8px 12px;color:#fff;border:none">Save</button>
              <div id="notify-msg" style="align-self:center;color:green;font-weight:600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(widget);

  // show with animation
  setTimeout(() => widget.classList.add("show"), 180);

  // Helper - query
  const $ = (sel, root = document) => root.querySelector(sel);

  // Elements
  const tabChat = $("#tab-chat");
  const tabIdea = $("#tab-idea");
  const tabNotify = $("#tab-notify");
  const chatTab = $("#chat-tab");
  const ideaTab = $("#idea-tab");
  const notifyTab = $("#notify-tab");
  const minimize = $("#saas-widget-minimize");

  // Toggle minimize
  minimize.addEventListener("click", () => {
    if (widget.style.height === "56px") {
      widget.style.height = "";
      widget.style.width = ""; // restore
      minimize.textContent = "—";
    } else {
      widget.style.height = "56px";
      widget.style.width = "160px";
      minimize.textContent = "▴";
    }
  });

  // Tab switching
  function showTab(tab) {
    [tabChat, tabIdea, tabNotify].forEach(t => t.classList.remove("active"));
    [chatTab, ideaTab, notifyTab].forEach(x => (x.style.display = "none"));

    if (tab === "chat") {
      tabChat.classList.add("active");
      chatTab.style.display = "block";
    } else if (tab === "idea") {
      tabIdea.classList.add("active");
      ideaTab.style.display = "block";
    } else {
      tabNotify.classList.add("active");
      notifyTab.style.display = "block";
    }
  }

  tabChat.addEventListener("click", () => showTab("chat"));
  tabIdea.addEventListener("click", () => showTab("idea"));
  tabNotify.addEventListener("click", () => showTab("notify"));

  // -------------------------
  // CHAT FUNCTIONALITY
  const messagesBox = $("#saas-widget-messages");
  const input = $("#saas-widget-input");
  const sendBtn = $("#saas-widget-send");

  function appendMessage(kind, text) {
    const el = document.createElement("div");
    el.className = `msg ${kind}`;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = text;
    el.appendChild(bubble);
    messagesBox.appendChild(el);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  async function sendQuestion(q) {
    appendMessage("user", escapeHtml(q));
    // quick typing indicator
    const loader = document.createElement("div");
    loader.className = "msg bot";
    loader.innerHTML = `<div class="bubble">Typing…</div>`;
    messagesBox.appendChild(loader);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, source: "widget" })
      });
      const data = await res.json();
      loader.remove();
      appendMessage("bot", data.answer || "⚠️ No response from server.");
    } catch (err) {
      loader.remove();
      appendMessage("bot", "⚠️ Error connecting to server.");
      console.error("chat error", err);
    }
  }

  sendBtn.addEventListener("click", () => {
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    sendQuestion(q);
  });
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  // -------------------------
  // IDEA FORM
  const ideaForm = $("#idea-form");
  const ideaStatus = $("#idea-status");
  ideaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    ideaStatus.textContent = "";
    const fd = new FormData(ideaForm);
    const payload = { type: "share_idea", data: Object.fromEntries(fd.entries()) };

    // ensure email required (client validation)
    if (!payload.data.email) {
      ideaStatus.style.color = "red";
      ideaStatus.textContent = "Email is required.";
      return;
    }
    // anonymize flag handled by backend; still send email
    try {
      ideaStatus.style.color = "green";
      ideaStatus.textContent = "Sending…";
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const js = await res.json();
      ideaStatus.style.color = "green";
      ideaStatus.textContent = "✅ Idea submitted. Thanks!";
      ideaForm.reset();
    } catch (err) {
      ideaStatus.style.color = "red";
      ideaStatus.textContent = "⚠ Error submitting idea.";
      console.error("idea submit error", err);
    }
  });

  // -------------------------
  // NOTIFICATIONS PREFS
  const notifyToggle = $("#notify-toggle");
  const notifyEmail = $("#notify-email");
  const notifySave = $("#notify-save");
  const notifyMsg = $("#notify-msg");

  // Save notification preference (POST to Apps Script)
  notifySave.addEventListener("click", async () => {
    const email = notifyEmail.value.trim();
    const enabled = notifyToggle.checked;
    notifyMsg.textContent = "";
    if (!email) {
      notifyMsg.style.color = "red";
      notifyMsg.textContent = "Email required";
      return;
    }
    try {
      notifyMsg.style.color = "green";
      notifyMsg.textContent = "Saving…";
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "notification_pref", data: { email, enabled } })
      });
      await res.json();
      notifyMsg.style.color = "green";
      notifyMsg.textContent = enabled ? "✅ Notifications enabled" : "✅ Notifications disabled";
    } catch (err) {
      notifyMsg.style.color = "red";
      notifyMsg.textContent = "⚠ Save failed";
      console.error("notify save", err);
    }
  });

  // -------------------------
  // UTILS
  function escapeHtml(s) {
    if (!s) return s;
    return s.replace(/[&<>"']/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]; });
  }

})();
