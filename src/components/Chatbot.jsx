import { useState, useRef, useEffect } from "react";

export default function Chatbot({blocks, setBlocks}) {
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

      // `
      // { 
      //   "mode": "brainstorm", 
      //   "ideas": [ 
      //     "Include a strong objective statement that highlights your career goals and skills.", 
      //     "List your work experience in reverse chronological order, emphasizing achievements.", 
      //     "Highlight relevant skills such as technical proficiencies, languages, and soft skills.", 
      //     "Add sections for education, certifications, and professional development.", 
      //     "Consider using bullet points for clarity and ease of reading.", 
      //     "Incorporate quantifiable metrics to demonstrate your impact in previous roles.", 
      //     "Tailor your resume for each job application to align with the job description." 
      //   ] 
      // }
      // `

      // `
      // { 
      //   "mode": "insert", 
      //   "operations": [ 
      //     { 
      //       "action": "insert", 
      //       "block": { "id": "block-1", "type": "heading", "content": "Resume Tips", "position": 1 } 
      //     }, 
      //     { 
      //       "action": "insert", 
      //       "block": { "id": "block-2", "type": "text", "content": "Include a strong objective statement that highlights your career goals and skills.", "position": 2 } 
      //     }, 
      //     { 
      //       "action": "insert", 
      //       "block": { "id": "block-3", "type": "text", "content": "List your work experience in reverse chronological order, emphasizing achievements.", "position": 3 } 
      //     }, 
      //     { 
      //       "action": "insert", 
      //       "block": { "id": "block-4", "type": "text", "content": "Highlight relevant skills such as technical proficiencies, languages, and soft skills.", "position": 4 } 
      //     }, 
      //     { 
      //       "action": "insert", 
      //       "block": { "id": "block-5", "type": "text", "content": "Add sections for education, certifications, and professional development.", "position": 5 } 
      //     }, 
      //     { 
      //       "action": "insert", 
      //       "block": { "id": "block-6", "type": "text", "content": "Consider using bullet points for clarity and ease of reading.", "position": 6 } 
      //     }, 
      //     { 
      //       "action": "insert", 
      //       "block": { "id": "block-7", "type": "text", "content": "Incorporate quantifiable metrics to demonstrate your impact in previous roles.", "position": 7 } 
      //     }, 
      //     { 
      //       "action": "insert", 
      //       "block": { "id": "block-8", "type": "text", "content": "Tailor your resume for each job application to align with the job description.", "position": 8 } 
      //     } 
      //   ] 
      // }
      // `

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
        setBlocks(prev => [...prev, ...rep]);
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
    <div style={styles.container} className="bg-slate-500 min-h-96">
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
