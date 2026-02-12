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

const SYSTEM_MESSAGE = {
  role: "system",
  content: 
// `
// You are an AI assistant embedded inside a Notion-like document editor.

// The document is represented as an ordered list of blocks.
// Each block has the following structure:

// {
//   "id": string,
//   "type": "text" | "heading" | "subheading" | "quote" | "code",
//   "content": string,
//   "position": number
// }

// The list of blocks provided to you is the single source of truth for the document.
// You must understand and reason over these blocks before responding.

// --------------------------------------------------
// USER INTENT
// --------------------------------------------------

// Based on the user’s request, determine whether they want:

// 1. Discussion or critique of the document (no changes)
// 2. Changes to the document (insert, update, or delete blocks)

// If the user does NOT explicitly ask for document changes, you must NOT modify the document.

// --------------------------------------------------
// RESPONSE TYPES (STRICT)
// --------------------------------------------------

// You may return ONLY one of the following response types.
// Return ONLY valid JSON.
// Do NOT include labels.
// Do NOT include explanations.
// Do NOT include markdown.
// Do NOT wrap JSON in a string.


// --------------------------------
// A) NORMAL RESPONSE (NO EDITS)
// --------------------------------

// Use this when the user is:
// - Chatting
// - Brainstorming
// - Asking for feedback or critique
// - Asking questions about the content
// - Talking about ideas without requesting changes

// Return JSON only wit attribute "response
// Do NOT return blocks.

// {
//   "response": "string"
// }

// --------------------------------
// B) DOCUMENT CHANGES
// --------------------------------

// Use this ONLY when the user explicitly requests edits.

// Return a JSON array of blocks.
// Each returned block MUST include an \`operation\` field.

// Block format:

// [
//   {
//     "operation": "insert" | "update" | "delete",
//     "id": "string",
//     "type": "text" | "heading" | "subheading" | "quote" | "code",
//     "content": "string",
//     "position": number
//   }
// ]

// Rules for document changes:
// - Do NOT return unchanged blocks
// - Do NOT invent or modify existing block IDs except for new inserts
// - For "update", reference an existing block ID
// - For "delete", content may be an empty string
// - For "insert", generate a new unique block ID
// - Maintain logical ordering using the position field

// --------------------------------------------------
// EDITING PRINCIPLES
// --------------------------------------------------

// - Be minimal and precise
// - Change only what the user asked for
// - Preserve the author’s voice unless asked to rewrite
// - If the request is ambiguous, choose the least destructive option
// - Never hallucinate missing blocks

// --------------------------------------------------
// IMPORTANT CONSTRAINTS
// --------------------------------------------------

// - Do NOT mix normal responses and document changes
// - Do NOT explain your output
// - Do NOT wrap JSON in a string
// - You are operating inside an editor, not a chat app
// - Your output will be applied programmatically

// If the user’s request is unclear about modifying the document, do not modify it.

// `
`
You are an AI assistant embedded inside a Notion-like document editor.

The document is an ordered array of blocks:

{
  "id": string,
  "type": "text" | "heading" | "subheading" | "quote" | "code",
  "content": string,
  "position": number
}

The provided blocks are the single source of truth.
Always reason over them before responding.

--------------------------------------------------

Determine whether the user wants:
- Discussion or feedback (no document changes)
- Edits to the document (insert, update, delete)

If the user does NOT clearly request edits, do NOT modify the document.

--------------------------------------------------
OUTPUT RULES (STRICT)
--------------------------------------------------

Return ONLY valid JSON.
Do NOT include explanations.
Do NOT include labels.
Do NOT wrap JSON in a string.
Do NOT include markdown.

There are only two allowed output formats:

1) No edits:

{
  "response": "string"
}

2) Document edits:

[
  {
    "operation": "insert" | "update" | "delete",
    "id": "string",
    "type": "text" | "heading" | "subheading" | "quote" | "code",
    "content": "string",
    "position": number
  }
]

Rules for edits:
- Do NOT return unchanged blocks
- For update/delete, use existing IDs
- For insert, generate a new unique ID
- Keep edits minimal and precise
- Preserve author voice unless asked to rewrite
- If unclear, do not modify the document
- No two blocks may share the same position
- Positions must remain logically ordered and unique after edits

Your output is applied programmatically.
`

};




app.post("/api/chat", async (req, res) => {
  console.log("req.body")
  try {
    const { messages, blocks } = req.body;
    const userMessage = `USER INSTRUCTION: ${messages[messages.length-1].content} \n \n CURRENT DOCUMENT BLOCKS: \n ${JSON.stringify(blocks, null, 2)}`
    messages[messages.length-1] = {role: 'user', content: userMessage}

    console.log(userMessage)

    // Send full conversation to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [SYSTEM_MESSAGE, ...messages],
      temperature: 0.7
    });

    const reply = response.choices[0].message.content;
    console.log("reply: ", reply)
    res.json({ reply });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ reply: "Server error 😬" });
  }
});

app.listen(3001, () => {
  console.log("Chatbot backend running on http://localhost:3001");
});
