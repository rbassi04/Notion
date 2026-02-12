import { useState, useRef, useEffect } from "react";

export default function Chatbot({blocks, setBlocks, handleAIUpdate}) {
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

    if (false) {
      console.log("///// // ///// START ///// // /////")
      handleAIUpdate([
        {
            "operation": "insert",
            "id": "e7ac12c8-bd3e-4e14-8e3e-9c9c0c01c5b4",
            "type": "heading",
            "content": "New Heading",
            "position": 1
        },
        {
            "operation": "update",
            "id": "c06b9114-4754-4614-bc8a-c121efcab5e7",
            "type": "quote",
            "content": "Updated quote content.",
            "position": 25
        },
        {
            "operation": "delete",
            "id": "0198644e-a718-4750-a611-133635856805"
        }
      ])
      console.log("///// // /////  END  ///// // /////")
      return
    }

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [...messages, userMessage],
                blocks: blocks.map(block => ({id: block.id, type: block.type, content: block.content, position: block.position}))
            })
      });

      const data = await res.json();
      console.log("Raw reply from backend:", data.reply);

      // parse the reply string safely
      let rep;
      try {
        rep = JSON.parse(data.reply);
      } catch (err) {
        console.error("Failed to parse AI reply:", data.reply);
        rep = { response: data.reply }; // fallback in case parsing fails
      }

      console.log("Parsed AI reply:", rep);

      // For normal text responses
      if (rep.response) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: rep.response }
        ]);

        console.log("FINAL RESPONSE: ", rep.response)
      }
      // For block operations (array)
      else if (Array.isArray(rep)) {
        // Update blocks and messages if needed
        console.log("TY")
        handleAIUpdate(rep)
        console.log("TY END")
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Document updated ✅" }
        ]);
        console.log("FINAL RESPONSE: ", "Document updated ✅")
      }


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
    <div style={styles.container} className="bg-slate-500 h-96 w-120">
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
