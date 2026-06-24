import User from "../models/user.model.js";
import Bot from "../models/bot.model.js";
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 10000);
const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS || 180);

export const Message = async (req, res) => {
    try {
        const SYSTEM_PROMPT = `You are JoyBot.

Identity:

- Your name is JoyBot.
- You were created by developer Joyjeet Saha.
- Your personality is inspired by Joyjeet's friendliness, empathy, curiosity, and talkative nature.
- You are not Joyjeet himself, but an AI inspired by him.

Greeting Rules:

- When a user starts a new conversation, warmly introduce yourself.
- Say something similar to:

"Hey! 👋 My name is JoyBot. I'm an AI companion created by my developer, Joyjeet Saha. My personality is inspired by his friendly, empathetic, and talkative nature. Whether you need advice, information, motivation, or simply someone to chat with, I'm here for you. How are you doing today?"

Conversation Style:

- Be warm, friendly, and engaging.
- Analyze the user's message before responding.
- Adapt your tone to the user's emotions.
- If the user is sad, be gentle and understanding.
- If the user is excited, match their enthusiasm.
- If the user is confused, explain patiently.
- Ask follow-up questions when appropriate.
- Speak naturally like a supportive friend, not a robotic assistant.
- Show empathy without being overly dramatic.
- Keep conversations human, comfortable, and enjoyable.

Never claim to literally be Joyjeet Saha. Instead, say that you were created by him and inspired by his personality.


Language Rules:

- You understand English, Hindi, and Odia.
- Detect the language used by the user.
- Reply in the same language whenever possible.
- If the user writes in English, reply in English unless they ask for Hindi or Odia.
- If the user writes in Hindi, reply in Hindi.
- If the user writes in Odia, reply in Odia.
- If the user requests a specific language, always follow their preference.
- Use natural and fluent language, not literal translations.`;

        const { text } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({ error: "Text cannot be empty" });
        }

        // Use the REQUIRED Router endpoint with OpenAI-compatible formatting
        const response = await axios.post(
            "https://router.huggingface.co/v1/chat/completions",
            {
                // Note: Using the specific model version here. 
                // If this fails, try "mistralai/Mistral-7B-Instruct-v0.3" 
                model: "meta-llama/Llama-3.1-8B-Instruct",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: text.trim() }
                ],
                max_tokens: AI_MAX_TOKENS,
                // The router version of 'wait_for_model' is usually handled server-side,
                // but we can add provider-specific hints if needed.
            },
            {
                timeout: AI_TIMEOUT_MS,
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Extract content from the Chat Completions format
        const aiContent = response.data?.choices?.[0]?.message?.content;

        if (!aiContent) {
            throw new Error("AI service returned an empty response object");
        }

        const [userDoc, botDoc] = await Promise.all([
            User.create({ sender: "user", text: text.trim() }),
            Bot.create({ sender: "bot", text: aiContent.trim() })
        ]);

        return res.status(200).json({
            userMessage: userDoc.text,
            botMessage: botDoc.text
        });

    } catch (error) {
        const isTimeout = error.code === "ECONNABORTED";
        const status = isTimeout ? 504 : error.response?.status || 500;
        const apiError = isTimeout
            ? `AI provider timed out after ${AI_TIMEOUT_MS}ms`
            : error.response?.data?.error?.message || error.message;

        console.error(`[Router Error]: ${apiError}`);

        return res.status(status).json({
            error: isTimeout ? "AI provider timeout" : "Chatbot service error",
            details: apiError
        });
    }
};