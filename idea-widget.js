(function() {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzmBoCl_73fKFm_ORhRucQYjLGKJaEwFsowxZWHrOrNWzBaHJfdLNe05JzUbj5rYPDWQA/exec";

  // Create Idea Widget HTML
  const widget = document.createElement("div");
  widget.id = "idea-widget";
  widget.innerHTML = `
    <div id="idea-widget-header">
      <span>Share Your Idea</span>
      <span id="idea-widget-toggle">&#x2715;</span>
    </div>
    <div id="idea-widget-body">
      <form id="idea-form">
        <label>
          Your Idea:
          <textarea name="idea" rows="4" placeholder="Write your idea here..." required></textarea>
        </label>
        <label>
          Your Email (required):
          <input type="email" name="email" placeholder="Enter your email" required>
        </label>
        <label>
          <input type="checkbox" name="anonymous" value="true"> Share anonymously
        </label>
        <button type="submit">Submit Idea</button>
      </form>
      <p id="idea-msg"></p>
    </div>
  `;
  document.body.appendChild(widget);

  const body = widget.querySelector("#idea-widget-body");
  const toggle = widget.querySelector("#idea-widget-toggle");
  const form = widget.querySelector("#idea-form");
  const msg = widget.querySelector("#idea-msg");

  // Show widget with smooth animation
  setTimeout(() => widget.classList.add("show"), 200);

  // Toggle widget minimize
  toggle.addEventListener("click", () => {
    if (body.style.display === "none") {
      body.style.display = "flex";
      toggle.innerHTML = "&#x2715;";
    } else {
      body.style.display = "none";
      toggle.innerHTML = "&#x25B2;"; // arrow up
    }
  });

  // Submit Idea
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    // If anonymous, hide name/email from display (backend still receives email)
    if (data.anonymous === "true") {
      data.idea_sender = "Anonymous";
    } else {
      data.idea_sender = data.email;
    }

    // Send to Apps Script (you can create a new doPost endpoint for idea submission)
    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "share_idea", data })
      });
      const result = await res.json();
      msg.textContent = "✅ Your idea has been submitted!";
      form.reset();
    } catch {
      msg.textContent = "⚠ Error submitting idea. Try again!";
    }
  });
})();
