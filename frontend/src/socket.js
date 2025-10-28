import { io } from "socket.io-client";
import { useEffect, useRef } from "react";

const socket = io("https://tree.tabors.site/", {
  withCredentials: true,
  autoConnect: false,
});

let currentKey = null;
let hasConnected = false;

export function useSocket(root, username) {
  const prevKey = useRef(null);

  useEffect(() => {
    if (!root?._id || !username) return;

    const key = `${root._id}:${username}`;

    if (!hasConnected) {
      socket.connect();
      hasConnected = true;
    }

    if (currentKey !== key) {
      console.log(`Registering socket for ${key}`);
      socket.emit("register", { rootId: root._id, username });
      currentKey = key;
      prevKey.current = key;
    }

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
      hasConnected = false;
    };

    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("disconnect", handleDisconnect);
    };
  }, [root?._id, username]);

  return socket;
}
