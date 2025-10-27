import { useEffect, useState } from "react";
import { useSocket } from "../socket.js";

function ToolCallView({ root, username }) {
    const [messages, setMessages] = useState([]);
    const socket = useSocket(root, username);

    useEffect(() => {
        if (!root?._id || !username) return;

        const handleToolCall = (data) => {
            console.log("🧰 Received toolCall:", data);
            setMessages((prev) => [...prev, data]);
        };

        socket.on("toolCall", handleToolCall);
        return () => socket.off("toolCall", handleToolCall);
    }, [socket, root?._id, username]);

    return (
        <div
            style={{
                background: "#e0e0e0ff",
                color: "#060606ff",
                borderRadius: "12px",
                padding: "1em",
                marginTop: "3em",
                maxHeight: "300px",
                maxWidth: "600px",

                overflowY: "auto",
                textAlign: "left",
                boxSizing: "border-box",
            }}
        >
            <h3>Tree Builder Actions</h3>
            <hr
                style={{
                    border: "none",
                    borderTop: "1px dashed #888",
                    margin: "0.5em 0 1em 0",
                }}
            />
            {messages.length === 0 ? (
                <p style={{ opacity: 0.6 }}>None yet...</p>
            ) : (
                messages.map((m, i) => (
                    <div
                        key={i}
                        style={{
                            padding: "0.5em 0",
                            borderBottom: "1px solid #ccc",
                        }}
                    >
                        <div
                            style={{
                                fontWeight: "bold",
                                marginBottom: "0.3em",
                                color: "#333",
                            }}
                        >
                            #{i + 1}
                        </div>

                        <pre
                            style={{
                                margin: 0,
                                background: "#000000ff",
                                color: "#ffffffff",
                                borderRadius: "6px",
                                padding: "6px 8px",
                                border: "1px solid #eee",
                                fontFamily: "monospace",
                                fontSize: "0.9em",
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                            }}
                        >
                            {JSON.stringify(m, null, 2)}
                        </pre>
                    </div>
                ))
            )}
        </div>
    );
}

export default ToolCallView;
