import { io } from "socket.io-client";
import { useEffect } from "react";

const socket = io("https://tree.tabors.site/", {
  withCredentials: true,
  autoConnect: false,
});

const registeredPairs = new Set();

export function useSocket(root, username) {
  useEffect(() => {
    if (!root?._id || !username) return;

    const key = `${root._id}:${username}`;

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      if (!registeredPairs.has(key)) {
        socket.emit("register", { rootId: root._id, username });
        registeredPairs.add(key);
        console.log("Registered socket for", key);
      } else {
        console.log("Socket already registered for", key);
      }
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
      registeredPairs.delete(key);
      console.log(registeredPairs);
    };
  }, [root?._id, username]);

  return socket;
}
