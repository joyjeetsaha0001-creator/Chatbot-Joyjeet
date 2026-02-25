import User from "../models/user.model.js";
import Bot from "../models/bot.model.js";
import axios from "axios";

export const Message = async (req, res) => {
    try {
        const text = req.body.text;
        
        if (!text?.trim()) {
            return res.status(400).json({ error: "Text cannot be empty" })
        }
        
        const user = await User.create({
            sender: "user",
            text
        })
        
        const normalizedText = text.toLowerCase().trim();

        const botResponse = await axios.post("https://router.huggingface.co",{
            inputs:normalizedText,
            parameters:{max_new_tokens:200}
        },
        {
           headers:{
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json"
           } 
        });

        if (!botResponse.choices || !botResponse.choices[0]) {
            return res.status(500).json({ error: "Empty response from AI" });
        }

        const bot = await Bot.create({
            sender: "bot",
            text: botResponse.choices[0].message.content
        })
        return res.status(200).json({
            userMessage: user.text,
            botMessage: bot.text
        })
    }
    catch (error) {
        console.error("Error in message controller:", error.message);
        console.error("Full error:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
}