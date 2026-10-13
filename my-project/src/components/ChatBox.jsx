import { useState } from "react";
import axios from "axios";

function ChatBot() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {
    const res = await axios.post(
      "http://localhost:5000/api/chatbot",
      {
        message,
      }
    );

    setReply(res.data.reply);
  };

  return (
    <div>
      <h2>Crypto AI ChatBot</h2>

      <input
        type="text"
        placeholder="Ask about Bitcoin..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <h3>{reply}</h3>
    </div>
  );
}

export default ChatBot;