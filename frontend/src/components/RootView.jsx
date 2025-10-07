import { useState, useRef, useEffect } from "react";
import "./RootView.css";

function RootView({ rootId, onBack }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMessage = message;
        setMessage("");
        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setLoading(true);

        try {
            const res = await fetch("https://tree.tabors.site/api/AiResponse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rootId, message: userMessage }),
            });

            const data = await res.json();
            const aiText = data.output || data.answer || JSON.stringify(data, null, 2);

            setMessages(prev => [...prev, { role: "ai", text: aiText }]);
        } catch (err) {
            console.error("Error:", err);
            setMessages(prev => [...prev, { role: "ai", text: "⚠️ Failed to connect to server." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="root-container">
            <div className="header">
                <h2>Root Perspective</h2>
                <p>Currently selected root: {rootId}</p>
                <button onClick={onBack}>⬅ Back to Roots</button>
            </div>

            <div className="chat-area">
                {messages.map((m, i) => (
                    <div key={i} className={`msg ${m.role}`}>
                        <pre>{m.text}</pre>
                    </div>
                ))}
                {loading && <p className="msg ai">⏳ Loading...</p>}
                <div ref={chatEndRef} />
            </div>

            <div className="chat-input-bar">
                <textarea
                    className="chat-textarea"
                    rows={1}
                    placeholder="Ask anything"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                    }}
                />
                <button className="upload-button" onClick={handleSend}> <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon" > <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path> </svg> </button>
            </div>
        </div>
    );
}

export default RootView;
