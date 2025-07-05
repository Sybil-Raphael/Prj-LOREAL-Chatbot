/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// System prompt for the chatbot
const systemPrompt = "You are a helpful assistant for L’Oréal. Only answer questions related to L’Oréal products, skincare, haircare, beauty routines, and recommendations. If a user asks about anything unrelated to L’Oréal or beauty, politely refuse and explain you can only help with L’Oréal products, routines, and beauty-related topics. Remember details from earlier in the conversation, like the user's name and previous questions, to provide helpful, context-aware answers.";

// Store the conversation history as an array of messages
const conversation = [
  { role: "system", content: systemPrompt }
];

// Set initial message
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you with L’Oréal products or routines today?</div>`;

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user's message
  const message = userInput.value.trim();
  if (!message) return;

  // Add user's message to conversation history
  conversation.push({ role: "user", content: message });

  // Show user's message in chat
  chatWindow.innerHTML += `<div class="msg user">${message}</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to bottom

  // Clear input
  userInput.value = "";

  // Show loading message
  chatWindow.innerHTML += `<div class="msg ai">...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Call OpenAI API using fetch
    const response = await fetch("https://loreal-chatbot.sybilraphael4.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${openAPIKey}` // openAPIKey from secrets.js
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: conversation,
        max_tokens: 300
      })
    });

    // Parse the response
    const data = await response.json();

    // Remove loading message
    const msgs = chatWindow.querySelectorAll(".msg.ai");
    if (msgs.length > 0) {
      msgs[msgs.length - 1].remove();
    }

    // Get AI reply and show it
    const aiReply = data.choices && data.choices[0] && data.choices[0].message.content
      ? data.choices[0].message.content
      : "Sorry, I couldn't get a response. Please try again.";

    // Add AI reply to conversation history
    conversation.push({ role: "assistant", content: aiReply });

    chatWindow.innerHTML += `<div class="msg ai">${aiReply}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    // Remove loading message
    const msgs = chatWindow.querySelectorAll(".msg.ai");
    if (msgs.length > 0) {
      msgs[msgs.length - 1].remove();
    }
    // Show error message
    chatWindow.innerHTML += `<div class="msg ai">Sorry, there was a problem connecting to the assistant.</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
