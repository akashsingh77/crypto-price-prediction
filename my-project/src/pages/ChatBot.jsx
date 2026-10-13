import axios from "axios";
import React, { useState } from "react";

function ChatBot() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const handleSend = () => {
    if (message.toLowerCase().includes("bitcoin")) {
      setReply("📈 Bitcoin is expected to rise. Recommendation: BUY");
    } else if (message.toLowerCase().includes("ethereum")) {
      setReply("📊 Ethereum looks stable. Recommendation: HOLD");
    } else if (message.toLowerCase().includes("dogecoin")) {
      setReply("⚠️ Dogecoin is risky. Recommendation: SELL");
    } else {
      setReply("Please ask about Bitcoin, Ethereum, or Dogecoin.");
    }

    setMessage("");
  };

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", padding: "20px" }}>
      <h2>🤖 Crypto AI ChatBot</h2>

      <input
        type="text"
        placeholder="Ask: Should I buy Bitcoin?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "20px",
        }}
      />

      <button
        onClick={handleSend}
        style={{
          marginTop: "15px",
          padding: "10px 25px",
          cursor: "pointer",
        }}
      >
        Send
      </button>

      {reply && (
        <div
          style={{
            marginTop: "25px",
            padding: "15px",
            background: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <strong>Bot:</strong> {reply}
        </div>
      )}
    </div>
  );
}

export default ChatBot;