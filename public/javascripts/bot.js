document.addEventListener("DOMContentLoaded", function() {
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
  
    // Function to add message to the chat
    function addMessage(message, sender) {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      messageDiv.classList.add(sender);
      messageDiv.textContent = message;
      chatMessages.appendChild(messageDiv);
    }
  
    // Function to handle user input
    function handleUserInput() {
      const userMessage = userInput.value.trim();
      if (userMessage !== "") {
        addMessage(userMessage, "user");
        // Call function to process user input and generate bot response
        const botResponse = generateBotResponse(userMessage);
        addMessage(botResponse, "bot");
        // Clear user input field
        userInput.value = "";
      }
    }
  
    // Function to generate bot response based on user input
    function generateBotResponse(userMessage) {
        // Define an array of greetings
        const greetings = ["hello", "hi", "hey", "howdy"];
      
        // Define an array of keywords related to different types of products
        const productTypes = ["wand", "potion", "spell book", "crystal", "tarot card", "amulet", "incense", "candle"];
      
        // Check if any of the greetings are present in the user's message
        if (greetings.some(keyword => userMessage.toLowerCase().includes(keyword))) {
          return "Hello! How can I assist you today?";
        } else if (userMessage.toLowerCase().includes("product")) {
          return "Sure, what type of product are you looking for?";
        } else if (productTypes.some(keyword => userMessage.toLowerCase().includes(keyword))) {
          return "Great choice! We have a variety of magical " + userMessage.toLowerCase() + "s available. What specific details are you looking for?";
        } else {
          return "I'm sorry, I didn't understand that. Please try again.";
        }
      }
  
    // Event listener for send button click
    sendBtn.addEventListener("click", handleUserInput);
  
    // Event listener for Enter key press in input field
    userInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        handleUserInput();
      }
    });
  
  });