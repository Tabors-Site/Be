import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./RootSelection.css"

function RootSelection({ onSelectRoot }) {
    const [roots, setRoots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [creating, setCreating] = useState(false);
    const [newRootName, setNewRootName] = useState("");
    const [showInput, setShowInput] = useState(false);

    const token = Cookies.get("token");
    const apiUrl = import.meta.env.VITE_TREE_API_URL;


    const fetchRootNodes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiUrl}/get-root-nodes`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            const data = await response.json();

            if (response.ok && Array.isArray(data.roots)) {
                setRoots(data.roots);
            } else {
                setErrorMessage(data?.message || "Failed to fetch root nodes");
            }
        } catch (err) {
            setErrorMessage(`Error fetching roots: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRootNodes();
    }, [apiUrl, token]);

    // create new root
    const handleAddRoot = async () => {
        if (!token) {
            setErrorMessage("No JWT token found!");
            return;
        }
        if (!newRootName.trim()) {
            setErrorMessage("Root name cannot be empty");
            return;
        }

        try {
            setCreating(true);
            const response = await fetch(`${apiUrl}/add-node`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    parentId: null,
                    name: newRootName,
                    schedule: "",
                    reeffectTime: "",
                    isRoot: true,
                }),
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || "Failed to create root");
            }

            setNewRootName("");
            setShowInput(false);
            await fetchRootNodes();
            // optional: immediately select it
            // onSelectRoot(data.newNode?._id);
        } catch (err) {
            setErrorMessage(`Error creating root: ${err.message}`);
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <p>Loading roots...</p>;
    if (errorMessage) return <p style={{ color: "red" }}>{errorMessage}</p>;

    return (
        <div className="intro-container">
            <h2>Select a Root</h2>
            <ul>
                {roots.map((root) => (
                    <li key={root._id}>
                        <button onClick={() => onSelectRoot(root._id)}>
                            {root.name || `Root ${root._id}`}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Plus button or input form */}
            <div style={{ marginTop: "1rem" }}>
                {!showInput ? (
                    <button
                        onClick={() => setShowInput(true)}
                        style={{
                            backgroundColor: "green",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                            fontSize: "20px",
                            cursor: "pointer",
                        }}
                    >
                        +
                    </button>
                ) : (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <input
                            type="text"
                            value={newRootName}
                            onChange={(e) => setNewRootName(e.target.value)}
                            placeholder="Enter root name"
                            style={{ padding: "0.3rem", flex: 1 }}
                        />
                        <button
                            onClick={handleAddRoot}
                            disabled={creating}
                            style={{
                                backgroundColor: "green",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "0.3rem 0.6rem",
                                cursor: "pointer",
                            }}
                        >
                            ✔
                        </button>
                        <button
                            onClick={() => {
                                setShowInput(false);
                                setNewRootName("");
                            }}
                            style={{
                                backgroundColor: "red",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "0.3rem 0.6rem",
                                cursor: "pointer",
                            }}
                        >
                            ✖
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RootSelection;
