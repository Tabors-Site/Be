import { io } from "socket.io-client";
import { useEffect } from "react";

export const socket = io("https://tree.tabors.site/", {
  withCredentials: true,
  autoConnect: false,
});

export function useSocket(root, username) {
  useEffect(() => {
    if (!root?._id || !username) return;

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      socket.emit("register", { rootId: root._id, username });
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
    };
  }, [root?._id, username]);

  return socket;
}
