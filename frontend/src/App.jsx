import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./App.css";
import RootSelection from "./components/RootSelection.jsx";
import RootView from "./components/RootView.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userId, setUserid] = useState("");

  const [selectedRoot, setSelectedRoot] = useState(() => {
    try {
      const cookieValue = Cookies.get("rootSelected");
      return cookieValue ? JSON.parse(cookieValue) : null;
    } catch {
      return null;
    }
  });

  const apiUrl = import.meta.env.VITE_TREE_API_URL;
  const rootURL = import.meta.env.VITE_ROOT_URL;

  // Check login
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      if (rootURL) window.location.href = rootURL;
      return;
    }

    fetch(`${apiUrl}/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then((data) => {
        Cookies.set("username", data.username, { expires: 7 });
        Cookies.set("userId", data.userId, { expires: 7 });
        Cookies.set("loggedIn", true, { expires: 7 });

        setIsLoggedIn(true);
        setUsername(data.username);
        setUserid(data.userId)
      })
      .catch(() => {
        if (rootURL) window.location.href = rootURL;
      });
  }, []);

  const handleLogout = () => {
    Cookies.remove("username");
    Cookies.remove("userId");
    Cookies.remove("loggedIn");
    Cookies.remove("token");
    Cookies.remove("rootSelected");
    setIsLoggedIn(false);
    setSelectedRoot(null);
    if (rootURL) window.location.href = rootURL;
  };

  const handleRootSelect = (rootSelected) => {
    Cookies.set("rootSelected", JSON.stringify(rootSelected), { expires: 7 });
    setSelectedRoot(rootSelected);
  };

  if (!isLoggedIn) {
    return <p>Checking login...</p>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <button className="logout-button" onClick={handleLogout}>
          Back to home
        </button>
      </header>
      <main>
        {!selectedRoot ? (
          <RootSelection onSelectRoot={handleRootSelect} />
        ) : (
          <RootView
            root={selectedRoot}
            username={username}
            userId={userId}
            onBack={() => {
              Cookies.remove("rootSelected");
              setSelectedRoot(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
