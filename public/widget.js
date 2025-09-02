;(() => {
  // Prevent multiple initializations
  if (window.AIChatbot && window.AIChatbot.initialized) {
    return
  }

  const LOGO_URL =
    "https://sparrowsoftech.com/sspl/assets/img/sspl.png"

  const AIChatbot = {
    initialized: false,
    config: null,
    isOpen: false,
    messages: [], // Stores the entire chat history (text and buttons)
    currentLanguage: null, // 'english' or 'marathi'
    currentMenuLevel: "language_select", // 'language_select', 'main_menu', 'submenu', 'free_text'
    currentMenuContext: null, // Stores the selected main menu for submenu display

    // Define the menu structure directly in the widget for simplicity
    MENU_STRUCTURE : {
      english: {
        welcome: "Hi, Welcome to Sparrow Softech Chatbot. How can I assist you?",
        other_option: "💬Other (Ask a question)",
        menus: [
          {
            label: "ℹ️ About Us",
            query: "About Us"
            // submenus: [
            //   { label: "📋Overview", query: "Overview" },
            //   { label: "🕰️History", query: "History" },
            //   { label: "🎯Mission & Vision", query: "Mission & Vision" },
            //   { label: "🖼️Gallery", query: "Gallery" },
            //   { label: "🏢Organisational Hierarchy", query: "Organisational Hierarchy" },
            //   { label: "🏆Awards & Recognition", query: "Awards & Recognition" },
            //   { label: "🤔Why Choose Us", query: "Why Choose Us" }
            //]
          },
          {
            label: "🤝Services",
            query: "Services",
            // submenus: [
            //   { label: "🚪Door to Door Survey & Assessment", query: "Door to Door Survey & Assessment" },
            //   { label: "🏛️Municipal Revenue Augmentation Services", query: "Municipal Revenue Augmentation Services" },
            //   { label: "🗺️Drone Survey With GIS‑Mapping", query: "Drone Survey With GIS‑Mapping" },
            //   { label: "💼Business Process Outsourcing", query: "Business Process Outsourcing" },
            //   { label: "🔧Manpower Outsourcing", query: "Manpower Outsourcing" },
            //   { label: "📍GIS Based Geo‑Tagging", query: "GIS Based Geo‑Tagging" },
            //   { label: "💾Scanning & Digitalization", query: "Scanning & Digitalization" },
            //   { label: "🧠AI Based Technology", query: "AI Based Technology" },
            //   { label: "🛠️Mobile Application", query: "Mobile Application" },
            //   { label: "🌍Financial Inclusion", query: "Financial Inclusion" }
            // ]
          },
          {
            label: " 📦Products",
            query: "Products",
            // submenus: [
            //   { label: "🏛️E‑Municipal", query: "E‑Municipal" },
            //   { label: "🖥️E‑Office", query: "E‑Office" },
            //   { label: "🌐Land Allotment", query: "Land Allotment" },
            //   { label: "🏥Hospital Information Management System", query: "Hospital Information Management System" },
            //   { label: "🏭Industrial Area Management System", query: "Industrial Area Management System" },
            //   { label: "⚖️Legal Metrology", query: "Legal Metrology" }
            // ]
          },
          // {
          //   label: "📘 Technical Information",
          //   query: "Technical Information",
            // submenus: [
            //   { label: "🛠️Technical Overview", query: "Technical Overview" },
            //   { label: "🧱Tech Stack", query: "Tech Stack" },
            //   { label: "🚚Our delivery process", query: "Our delivery process" }
            // ]
          //},
          {
            label: " 📞Contact Us",
            query: "Contact Us",
            // submenus: [
            //   { label: "📞Reach Us", query: "Reach Us" },
            //   { label: "🏢Regional Offices", query: "Regional Offices" },
            //   { label: "🌍Overseas Presence", query: "Overseas Presence" },
            //   { label: "📦Others", query: "Others" }
            // ]
          }
        ]
      }
    },


    init: function (config) {
      if (this.initialized) return

      this.config = config
      this.initialized = true
      this.createWidget()
      this.attachEventListeners()
      this.resetChat() // Start with welcome message and language selection
    },

    createWidget: function () {
      // Create widget container
      const widgetContainer = document.createElement("div")
      widgetContainer.id = "ai-chatbot-widget"
      widgetContainer.innerHTML = `
        <style>
          #ai-chatbot-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            font-family: ${this.config.theme.fontFamily};
          }

          #ai-chatbot-greeting-curve {
              position: absolute;
              bottom: 17px;
              right: -54px;
              width: 180px;
              height: 100px;
              pointer-events: none;
          }

          #ai-chatbot-greeting-curve svg {
            width: 100%;
            height: 100%;
          }

          #ai-chatbot-greeting-curve text {
            fill: #00a8e8;
            font-size: 18px;
            font-weight: bold;
            font-family: 'Comic Sans MS', cursive, sans-serif;
          }

          .wave-emoji {
            position: absolute;
            left: 8px;
            bottom: 23px;
            font-size: 22px;
            animation: wave 1.2s infinite;
          }

          @keyframes wave {
            0% { transform: rotate(0.0deg); }
            10% { transform: rotate(14.0deg); }
            20% { transform: rotate(-8.0deg); }
            30% { transform: rotate(14.0deg); }
            40% { transform: rotate(-4.0deg); }
            50% { transform: rotate(10.0deg); }
            60% { transform: rotate(0.0deg); }
            100% { transform: rotate(0.0deg); }
          }

          
          #ai-chatbot-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #2a3864;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }
          
          #ai-chatbot-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          }
          
          #ai-chatbot-button svg {
            width: 24px;
            height: 24px;
            fill: white;
          }
          
          #ai-chatbot-window {
            position: absolute;
            bottom: 62px;
            right: 0;
            width: 300px;
            height: 380px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            display: none;
            flex-direction: column;
            overflow: hidden;
          }
          
          #ai-chatbot-header {
            height:12px;
            background: #2a3864;
            color: white;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          #ai-chatbot-header h3 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            display: flex; /* Added for logo alignment */
            align-items: center; /* Added for logo alignment */
            gap: 8px; /* Added for spacing between logo and text */
            color: white;
          }

          .ai-chatbot-header-logo {
            height: 24px; /* Adjust as needed */
            width: auto;
          }
          
          #ai-chatbot-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          #ai-chatbot-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .ai-chatbot-message {
            max-width: 80%;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
          }
          
          .ai-chatbot-message.user {
            background: #2a3864;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
            font-size: 13px
          }
          
          .ai-chatbot-message.bot {
            align-self: flex-start;
            background-color: #f8fafc;
            color: #1e293b;
            border: 1px solid #e2e8f0;
            padding: 12px 16px;
            border-radius: 12px;
            line-height: 1.6;
            font-size: 11.5px;
          }

          .ai-chatbot-message.bot strong {
            font-weight: 600;
            color: #0f172a;
            display: block;
            margin-bottom: 6px;
          }

          .ai-chatbot-message.bot a {
            color: #3b82f6;
            text-decoration: underline;
          }

          
          .ai-chatbot-message.typing {
            background: #f1f5f9;
            color: #64748b;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            display: flex; /* Added for logo alignment */
            align-items: center; /* Added for logo alignment */
            gap: 8px; /* Added for spacing between logo and text */
          }

          .ai-chatbot-typing-logo {
            height: 20px; /* Adjust as needed */
            width: auto;
          }

          // .ai-chatbot-welcome-logo-container {
          //   display: flex;
          //   justify-content: center;
          //   align-items: center;
            
          //   flex-grow: 1; /* Allows it to take available space */
          // }
          .ai-chatbot-welcome-logo-container
            {

                display: block;
                //min-height: 130px;
                margin: auto;
            }


          // .ai-chatbot-welcome-logo {
          //   max-width: 60%; /* Adjust size as needed */
          //   max-height: 60%;
          //   object-fit: contain;
          // }
          .ai-chatbot-welcome-logo {
            object-fit: contain;
           // max-height: 75%;
           width:100px;
           height:100px;

        }
          
          #ai-chatbot-input-container {
            padding: 16px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 8px;
          }
          
          #ai-chatbot-input {
            flex: 1;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 13px;
            outline: none;
            resize: none;
            font-family: inherit;
            height:40px;
            scrollbar-width: none;
          }
          
          #ai-chatbot-input:focus {
            border-color: ${this.config.theme.primaryColor};
          }
          
          #ai-chatbot-send {
            background: #2a3864;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s;
          }
          
          #ai-chatbot-send:disabled {
            opacity: 0.8;
            cursor: not-allowed;
          }
          
          #ai-chatbot-send svg {
            width: 16px;
            height: 16px;
            fill: white;
          }

          .ai-chatbot-buttons-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 12px;
            width: 100%;
          }


          .ai-chatbot-button-option {
            background: #e2e8f0;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 15px;
            font-size: 14px;
            cursor: pointer;
            text-align: left;
            width: 100%;
            transition: background 0.2s, border-color 0.2s;
          }

          .ai-chatbot-button-option:hover {
            background: #d1d5db;
            border-color: #94a3b8;
          }
          
          @media (max-width: 480px) {
            #ai-chatbot-window {
              width: calc(100vw - 40px);
              height: calc(100vh - 100px);
              bottom: 62px;
              right: 20px;
            }
          }
        </style>
        <!-- Curved Text and Emoji Bubble -->
        <div id="ai-chatbot-greeting-curve">
          <span class="wave-emoji">👋</span>
          <svg viewBox="0 0 300 100">
            <defs>
              <path id="curvePath" d="M 50 80 Q 150 0 250 80" />
            </defs>
            <text width="100%">
              <textPath href="#curvePath" startOffset="50%" text-anchor="middle">
                How can we assist?
              </textPath>
            </text>
          </svg>
        </div>


        <button id="ai-chatbot-button" title="Open Chat">
          <img src="https://sparrowsoftech.com/sspl/assets/img/sspl.png" alt="Open Chat" style="height: 45px;">
        </button>

        
        <div id="ai-chatbot-window">
          <div id="ai-chatbot-header">
            <h3><img src="${LOGO_URL}" alt="SSPL Logo" class="ai-chatbot-header-logo" /> Sparrow Softech Assistant</h3>
            <button id="ai-chatbot-close">&times;</button>
          </div>
          <div id="ai-chatbot-messages">
            </div>
          <div id="ai-chatbot-input-container">
            <textarea id="ai-chatbot-input" placeholder="Type your message..."></textarea>
            <button id="ai-chatbot-send" disabled>
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      `

      document.body.appendChild(widgetContainer)
        setTimeout(() => {
          const greeting = document.getElementById("ai-chatbot-greeting");
          if (greeting) greeting.style.opacity = 1;

          // Hide after 3 seconds
        setTimeout(() => {
            if (greeting) greeting.style.opacity = 0;
          }, 8000);
        }, 500);
    },



    attachEventListeners: function () {
      const button = document.getElementById("ai-chatbot-button")
      const closeBtn = document.getElementById("ai-chatbot-close")
      const input = document.getElementById("ai-chatbot-input")
      const sendBtn = document.getElementById("ai-chatbot-send")

      button.addEventListener("click", () => this.toggleWidget())
      closeBtn.addEventListener("click", () => this.closeWidget())

      input.addEventListener("input", () => {
        sendBtn.disabled = !input.value.trim()
        this.autoResize(input)
      })

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          this.sendMessage()
        }
      })

      sendBtn.addEventListener("click", () => this.sendMessage())
    },

    toggleWidget: function () {
      const windowElement = document.getElementById("ai-chatbot-window")
      if (this.isOpen) {
        this.closeWidget()
      } else {
        windowElement.style.display = "flex"
        this.isOpen = true
        this.renderMessages() // Render all stored messages
        document.getElementById("ai-chatbot-input").focus()
        this.updateInputState() // Ensure input state is correct on open
      }
    },

    closeWidget: function () {
      const windowElement = document.getElementById("ai-chatbot-window")
      windowElement.style.display = "none"
      this.isOpen = false
    },

    autoResize: (textarea) => {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px"
    },

    linkify: (text) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g
      return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
      })
    },

    // Renders all messages from the this.messages array to the DOM
    renderMessages: function () {
      const messagesContainer = document.getElementById("ai-chatbot-messages")
      messagesContainer.innerHTML = "" // Clear current DOM messages before re-rendering

      this.messages.forEach((msg) => {
        if (msg.type === "text") {
          const messageDiv = document.createElement("div")
          messageDiv.classList.add("ai-chatbot-message", msg.isUser ? "user" : "bot")
          // messageDiv.innerHTML = this.linkify(msg.content)
          //   .replace(/\n\n/g, "<br><br>")
          //   .replace(/\n/g, "<br>")
          //   .replace(/(?:^|\n)- (.*?)(?=\n|$)/g, "<br>&bull; $1")
          messageDiv.innerHTML = this.linkify(msg.content)
          .replace(/^#+ (.*$)/gim, '<strong>$1</strong>') // # Heading
          .replace(/\n\n/g, "<br><br>")                   // Double line break
          .replace(/\n/g, "<br>")                         // Single line break
          .replace(/(?:^|\n)- (.*?)(?=\n|$)/g, "<br>&bull; $1")  // Bullet points
          .replace(/(?:^|\n)[0-9]+\. (.*?)(?=\n|$)/g, "<br>&#x25B6; $1") // Numbered

          messagesContainer.appendChild(messageDiv)
        } else if (msg.type === "buttons") {
          this.appendButtonsToDOM(msg.buttons)
        } else if (msg.type === "welcome_logo") {
          const logoContainer = document.createElement("div")
          logoContainer.className = "ai-chatbot-welcome-logo-container"
          logoContainer.innerHTML = `<img src="${LOGO_URL}" alt="Welcome Logo" class="ai-chatbot-welcome-logo" />`
          messagesContainer.appendChild(logoContainer)
        }
      })
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    },

    // Adds a single message to the history and re-renders
    addMessageToHistory: function (content, isUser = false, type = "text") {
      this.messages.push({ type: type, content: content, isUser: isUser })
      if (this.isOpen) {
        // Only re-render if widget is open
        this.renderMessages()
      }
    },

    // Adds a set of buttons to the history and re-renders
    addButtonsToHistory: function (buttons) {
      this.messages.push({ type: "buttons", buttons: buttons })
      if (this.isOpen) {
        // Only re-render if widget is open
        this.renderMessages()
      }
    },

    // Appends buttons to the DOM (used by renderMessages)
    appendButtonsToDOM: function (buttons) {
      const messagesContainer = document.getElementById("ai-chatbot-messages")
      const buttonsContainer = document.createElement("div")
      buttonsContainer.className = "ai-chatbot-buttons-container"

      buttons.forEach((btn) => {
        const buttonElement = document.createElement("button")
        buttonElement.className = "ai-chatbot-button-option"
        buttonElement.textContent = btn.label
        buttonElement.dataset.action = btn.action // 'language', 'menu', 'submenu', 'other'
        buttonElement.dataset.value = btn.value // 'english', 'marathi', or query string
        buttonElement.dataset.menu = btn.menu || "" // For submenu context

        buttonElement.addEventListener("click", () => this.handleButtonClick(buttonElement))
        buttonsContainer.appendChild(buttonElement)
      })
      messagesContainer.appendChild(buttonsContainer)
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    },

    updateInputState: function () {
      const input = document.getElementById("ai-chatbot-input")
      const sendBtn = document.getElementById("ai-chatbot-send")
      if (this.currentMenuLevel === "free_text") {
        input.disabled = false
        sendBtn.disabled = !input.value.trim()
        input.focus()
      } else {
        input.disabled = true
        sendBtn.disabled = true
      }
    },

    // resetChat: function () {
    //   this.messages = [] // Clear all history
    //   this.currentLanguage = null
    //   this.currentMenuLevel = "language_select"
    //   this.currentMenuContext = null

    //   // Add prominent logo
    //   this.addMessageToHistory(null, false, "welcome_logo")

    //   // Add welcome message
    //   this.addMessageToHistory(
    //     "Hi, Welcome to Sparrow Softech Pvt Ltd, How can I help you?\n\n",
    //   )
    //   // Add language selection buttons
    //   this.addButtonsToHistory([
    //     { label: "English", action: "language", value: "english" },
    //   ])
    //   this.updateInputState()
    // },


    resetChat: function () {
      this.messages = [] // Clear all history
      this.currentLanguage = "english"
      this.currentMenuLevel = "main_menu"
      this.currentMenuContext = null

      // Add prominent logo
      this.addMessageToHistory(null, false, "welcome_logo")

      // Add welcome message
      this.addMessageToHistory(
        "Hi, Welcome to Sparrow Softech Pvt Ltd, How can I help you?\n\n"
      )

      this.displayMainMenu()
      this.updateInputState()
    },

    handleButtonClick: async function (buttonElement) {
      const action = buttonElement.dataset.action
      const value = buttonElement.dataset.value
      const menuContext = buttonElement.dataset.menu
      const label = buttonElement.textContent

      this.addMessageToHistory(label, true) // Show user's selection

      // Logic for handling button clicks
      if (action === "language") {
        this.currentLanguage = value
        this.currentMenuLevel = "main_menu"
        const welcomeMessage = this.MENU_STRUCTURE[this.currentLanguage].welcome
        this.addMessageToHistory(welcomeMessage)
        this.displayMainMenu()
      } else if (action === "menu") {
        // this.currentMenuLevel = "submenu"
        // this.currentMenuContext = this.MENU_STRUCTURE[this.currentLanguage].menus.find((m) => m.query === value)
        // this.addMessageToHistory(
        //   this.currentLanguage === "marathi" ? "उप-श्रेणी निवडा:" : "Please choose a sub-category:",
        // )
        // this.displaySubMenu()

        this.currentMenuLevel = "free_text" // After selecting submenu, allow free text
        this.addMessageToHistory(
          this.currentLanguage === "marathi"
            ? "माहिती मिळवण्यासाठी कृपया प्रतीक्षा करा..."
            : "Please wait while I fetch the information...",
        )
        this.updateInputState()
        await this.sendMessage(value, true)
      } else if (action === "submenu") {
        this.currentMenuLevel = "free_text" // After selecting submenu, allow free text
        this.addMessageToHistory(
          this.currentLanguage === "marathi"
            ? "माहिती मिळवण्यासाठी कृपया प्रतीक्षा करा..."
            : "Please wait while I fetch the information...",
        )
        this.updateInputState()
        await this.sendMessage(value, true) // Send the submenu query to AI
      } else if (action === "other") {
        this.currentMenuLevel = "free_text"
        this.addMessageToHistory(
          this.currentLanguage === "marathi" ? "कृपया तुमचा प्रश्न टाइप करा." : "Please type your question.",
        )
        this.updateInputState()
      } else if (action === "back_to_main") {
        this.currentMenuLevel = "main_menu"
        this.currentMenuContext = null
        this.addMessageToHistory(this.currentLanguage === "marathi" ? "मुख्य मेनूवर परत." : "Back to main menu.")
        this.displayMainMenu()
      } else if (action === "start_over") {
        this.resetChat()
      }
    },

    displayMainMenu: function () {
      const currentLangConfig = this.MENU_STRUCTURE[this.currentLanguage]
      const buttons = currentLangConfig.menus.map((menu) => ({
        label: menu.label,
        action: "menu",
        value: menu.query,
      }))
      buttons.push({ label: currentLangConfig.other_option, action: "other", value: "other" })
      this.addButtonsToHistory(buttons)
      this.updateInputState()
    },

    displaySubMenu: function () {
      if (!this.currentMenuContext) return
      const currentLangConfig = this.MENU_STRUCTURE[this.currentLanguage]
      const buttons = this.currentMenuContext.submenus.map((submenu) => ({
        label: submenu.label,
        action: "submenu",
        value: submenu.query,
      }))
      buttons.push({ label: currentLangConfig.other_option, action: "other", value: "other" })
      buttons.push({
        label: this.currentLanguage === "marathi" ? "मागे" : "Back",
        action: "back_to_main",
        value: "back",
      })
      this.addButtonsToHistory(buttons)
      this.updateInputState()
    },

    sendMessage: async function (message = null, isMenuItem = false) {
      const input = document.getElementById("ai-chatbot-input")
      const sendBtn = document.getElementById("ai-chatbot-send")
      const messageToSend = message || input.value.trim()

      if (!messageToSend) return

      if (!isMenuItem) {
        // Only add user message to history if it's not a button click
        this.addMessageToHistory(messageToSend, true)
      }

      // Clear input and disable send button
      input.value = ""
      sendBtn.disabled = true
      this.autoResize(input)

      // Show typing indicator with logo
      const messagesContainer = document.getElementById("ai-chatbot-messages")
      const typingMessageDiv = document.createElement("div")
      typingMessageDiv.classList.add("ai-chatbot-message", "bot", "typing")
      typingMessageDiv.innerHTML = `<img src="${LOGO_URL}" alt="Typing" class="ai-chatbot-typing-logo" /> <span class="dot-flashing"></span> Bot is typing...`
      messagesContainer.appendChild(typingMessageDiv)
      messagesContainer.scrollTop = messagesContainer.scrollHeight

      try {
        const response = await fetch(this.config.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: messageToSend, language: this.currentLanguage }), // Pass language
        })

        const data = await response.json()

        // Remove typing indicator
        typingMessageDiv.remove()

        // Add bot response to history
        this.addMessageToHistory(data.response || "Sorry, I could not process your request.")

        // After AI response, offer to go back to main menu or start over
        this.addButtonsToHistory([
          {
            label: this.currentLanguage === "marathi" ? "पुन्हा सुरू करा" : "Start Over",
            action: "start_over",
            value: "start_over",
          },
          {
            label: this.currentLanguage === "marathi" ? "मुख्य मेनू" : "Main Menu",
            action: "back_to_main",
            value: "back_to_main",
          },
        ])
      } catch (error) {
        console.error("Chat error:", error)
        typingMessageDiv.remove()
        this.addMessageToHistory("Sorry, I'm having trouble connecting. Please try again.")
      } finally {
        this.updateInputState() // Re-enable input if free_text, or keep disabled if menu
      }
    },
  }

  // Expose to global scope
  window.AIChatbot = AIChatbot
})()
