import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const apiUrl = import.meta.env.VITE_TREE_API_URL;
  const rootURL = import.meta.env.VITE_ROOT_URL;

  useEffect(() => {

    const token = Cookies.get("token");

    if (!token) {

      // No token -> redirect to root domain (login page)
      if (rootURL) window.location.href = rootURL;
      return;
    }

    // Verify token with backend
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
    setIsLoggedIn(false);

    if (rootURL) window.location.href = rootURL;
  };

  /*if (!isLoggedIn) {
    if (rootURL) window.location.href = rootURL;
  }*/

  return (
    <div className="app-container">
      <header>
        <h1>Welcome, {username} 🎉</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <main>
        <p>This is start of Be!</p>
      </main>
    </div>
  );
}

export default App;
