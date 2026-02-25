import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { useRef } from "react";

const Bot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4002/bot/v1/message", {
        text: input,
      });
      console.log("Response from bot:", res.data);
      if (res.status === 200) {
        setMessages([
          ...messages,
          { text: res.data.userMessage, sender: "user" },
          { text: res.data.botMessage, sender: "bot" },
        ]);
      }
    } catch (error) {
      //console.error("Error sending message:", error);
      const errorMessage = error.response?.data?.details || "Failed to get response from bot";
      alert("Error: " + errorMessage);
    }
    setInput("");
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d0d] text-white">
      {/*Header*/}
      <header className="fixed top-0 left-0 w-full border-b border-gray-800 bg-[#0d0d0d] z-10">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <h1 className="text-lg font-bold">Chatbot</h1>
          <FaUserCircle size={30} className="cursor-pointer" />
        </div>
      </header>

      {/*Chat area*/}
      <main className="flex-1 overflow-y-auto pt-20 pb-24 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 flex flex-col space-y-3">
          {messages.length === 0 ? (
            //centered welcome message
            <div className="text-center text-gray-400 text-lg">
              Hi I'm{" "}
              <span className="text-green-500 font-semibold">ChatBot</span>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-2 rounded-xl max-w-[75%] ${msg.sender === "user" ? "bg-blue-600 text-white self-end" : "bg-gray-800 text-gray-100 self-start"}`}
                >
                  {msg.text}
                </div>
              ))}

              {loading && (
                <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-xl max-w-[60%] self-start">
                  Bot is typing...
                </div>
              )}
              <div ref={messageEndRef} />
            </>
          )}
        </div>
      </main>

      {/*Input area and footer*/}
      <footer className="fixed bottom-0 left-0 w-full border-t border-gray-800 bg-[#0d0d0d] z-10">
        <div className="max-w-4xl mx-auto flex justify-center px-4 py-3">
          <div className="w-full flex bg-gray-900 rounded-full px-4 py-2 shadow-lg">
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-2"
              placeholder="Ask ChatBot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded-full text-white font-medium transition-colors disabled:opacity-50"
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Bot;
