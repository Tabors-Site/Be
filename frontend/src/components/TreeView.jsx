import { useEffect, useState } from "react";
import { useSocket } from "../socket.js";

function TreeView({ root, username }) {
    const [tree, setTree] = useState(null);
    const [nodes, setNodes] = useState({});
    const socket = useSocket(root, username);

    useEffect(() => {
        if (!root?._id || !username) return;

        const handleTree = (data) => {
            console.log("🌲 Received tree resource:", data);
            try {
                const parsed = JSON.parse(data.text);
                setTree(parsed);
            } catch (e) {
                console.warn("Could not parse tree JSON:", e);
            }
        };

        const handleNode = (data) => {
            console.log("🌿 Received node resource:", data);
            try {
                const parsed = JSON.parse(data.text);
                setNodes((prev) => ({ ...prev, [data.uri]: parsed }));
            } catch (e) {
                console.warn("Could not parse node JSON:", e);
            }
        };

        socket.on("treeResource", handleTree);
        socket.on("nodeResource", handleNode);

        return () => {
            socket.off("treeResource", handleTree);
            socket.off("nodeResource", handleNode);
        };
    }, [socket, root?._id, username]);

    return (
        <div
            style={{
                background: "#e0e0e0ff",
                color: "#060606ff",
                borderRadius: "12px",
                padding: "1em",
                marginTop: "4em",
                marginBottom: "4em",
                maxHeight: "400px",
                overflowY: "auto",
                overflowX: "hidden",
                textAlign: "left",
                boxSizing: "border-box",
                maxWidth: "600px",
            }}
        >
            <h3>Tree Builder View</h3>
            <hr
                style={{
                    border: "none",
                    borderTop: "1px dashed #888",
                    margin: "0.5em 0 1em 0",
                }}
            />
            <h4>Branch</h4>

            {!tree ? (
                <p style={{ opacity: 0.6 }}>None - analyzing from root</p>
            ) : (
                <pre
                    style={{
                        background: "#000000ff",
                        color: "#ffffffff",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #eee",
                        fontFamily: "monospace",
                        fontSize: "0.9em",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                        overflowX: "auto",
                    }}
                >
                    {JSON.stringify(tree, null, 2)}
                </pre>
            )}

            {Object.keys(nodes).length > 0 && (
                <>
                    <h4>Nodes</h4>
                    {Object.entries(nodes).map(([uri, data]) => (
                        <div
                            key={uri}
                            style={{
                                background: "#f4f4f4",
                                padding: "0.5em",
                                marginTop: "0.5em",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                            }}
                        >
                            <strong>{uri}</strong>
                            <pre
                                style={{
                                    background: "#000000ff",
                                    color: "#ffffffff",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #eee",
                                    fontFamily: "monospace",
                                    fontSize: "0.9em",
                                    whiteSpace: "pre-wrap",
                                    wordWrap: "break-word",
                                    overflowX: "auto",
                                }}
                            >
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default TreeView;
