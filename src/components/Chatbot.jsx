import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [...messages, userMessage]
            })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);
    } catch (err) {
        console.log(err)
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Something went wrong 😬" }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container} className="bg-slate-500">
      <div style={styles.chat}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background:
                m.role === "user" ? "#DCF8C6" : "#eee"
            }}
          >
            {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputRow} className="bg-slate-600">
        <input
          style={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="text-white"
        />
        <button style={styles.button} onClick={sendMessage}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: 350,
    height: 500,
    border: "3px solid #004075",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    fontFamily: "sans-serif"
  },
  chat: {
    flex: 1,
    padding: 10,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  message: {
    maxWidth: "75%",
    padding: "8px 12px",
    borderRadius: 16
  },
  inputRow: {
    display: "flex",
    padding: 8,
    borderTop: "1px solid #ddd"
  },
  input: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    border: "1px solid #ccc"
  },
  button: {
    marginLeft: 8,
    padding: "8px 12px",
    borderRadius: 4,
    border: "none",
    background: "#4f46e5",
    color: "white",
    cursor: "pointer"
  }
};
