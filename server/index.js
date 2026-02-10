import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
dotenv.config();

const app = express();

// CORS for frontend running on a different localhost port
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3001"], // React ports
  credentials: true
}));

app.use(express.json());

// OpenAI setup (v4)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


app.post("/api/chat", async (req, res) => {
  console.log("req.body")
  try {
    const { messages } = req.body;

    // Send full conversation to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7
    });

    console.log("RES: ", response)

    const reply = response.choices[0].message.content;

    res.json({ reply });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ reply: "Server error 😬" });
  }
});

app.listen(3001, () => {
  console.log("Chatbot backend running on http://localhost:3001");
});
