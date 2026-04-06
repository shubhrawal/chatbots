import { useState, useRef } from "react";
import "./App.css";

function App() {
  // Generate a unique session ID when the component mounts (new session each time app loads)
  const [sessionId] = useState(() => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersonality] = useState(
    () => process.env.REACT_APP_PERSONALITY || 'personCentered'
  );
  const [crisisLocked, setCrisisLocked] = useState(false);


  const chatBoxRef = useRef(null);
  const streamingIntervalRef = useRef(null);
  const streamingIdRef = useRef(null);

  // utility to scroll chat to bottom
  function scrollToBottom() {
    try {
      const el = chatBoxRef.current;
      if (el) {
        // smooth scroll so incoming text is visible during streaming
        el.scrollTop = el.scrollHeight;
      }
    } catch (e) {
      // ignore
    }
  }

  // Streams text into a bot message at the given message index
  function streamBotResponse(fullText) {
    // clear any previous streaming interval
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }

    // create a stable id for this bot message so we can update it safely
    const msgId = `bot-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    streamingIdRef.current = msgId;

    // append an empty bot message with the id
    setMessages((prev) => {
      const next = [...prev, { from: 'bot', text: '', id: msgId }];
      return next;
    });

    let charIndex = 0;
    setIsTyping(true);

    streamingIntervalRef.current = setInterval(() => {
      charIndex += 1;
      setMessages((prev) => {
        // find the message by id and update it
        const copy = [...prev];
        const idx = copy.findIndex(m => m.id === msgId);
        if (idx >= 0) {
          copy[idx] = { ...copy[idx], text: fullText.slice(0, charIndex) };
        }
        return copy;
      });
      scrollToBottom();

      if (charIndex >= fullText.length) {
        if (streamingIntervalRef.current) {
          clearInterval(streamingIntervalRef.current);
          streamingIntervalRef.current = null;
        }
        streamingIdRef.current = null;
        setIsTyping(false);
      }
    }, 18); // 18ms per char ≈ ~55 chars/sec, adjust for desired speed
  }

  const CRISIS_MESSAGE = "I'm not able to continue this conversation without first sharing something important. What you've shared may require immediate attention. Please contact the 988 Suicide and Crisis Lifeline by calling or texting 988, reach out to a licensed mental health professional, or go to your nearest emergency room if you are in immediate danger. Do not continue this conversation as a substitute for seeking real support.";

  async function sendMessage() {
    if (input === "" || crisisLocked) return;

    const userMessage = input;

    // show user message
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

  try {
      // send message to backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          message: userMessage,
          personality: selectedPersonality,
        }),
      });

      if (!response.ok) {
        // Try to get error details from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if response contains an error
      if (data.error) {
        throw new Error(data.details || data.error || "An error occurred");
      }

      // Lock chat permanently if crisis message was returned
      if (data.response === CRISIS_MESSAGE) {
        setCrisisLocked(true);
      }

      // Stream bot reply (character-by-character)
      streamBotResponse(data.response || "");
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Show more specific error message to user
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: errorMessage },
      ]);
      setIsTyping(false);
    }
  }

  return (
    <div className="App">
      <div className="chat-container">
        <h2>Simple Chatbot</h2>

        <div className="chat-box" ref={chatBoxRef}>
          {/* personality label */}
          <div className="personality-label">
            {selectedPersonality.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
          </div>

          {/* messages area */}
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.from}`}>
                <strong>{m.from}:</strong>&nbsp;
                <span className={m.from === 'bot' && isTyping && m.id && streamingIdRef.current === m.id ? 'bot-typing-cursor' : ''}>{m.text}</span>
              </div>
            ))}
          </div>

        </div>

        <div className="input-bar">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={crisisLocked ? "This conversation has ended. Please seek support." : "Type here..."}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            disabled={crisisLocked}
          />
          <button onClick={sendMessage} disabled={crisisLocked}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;

