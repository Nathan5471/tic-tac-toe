import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

interface User {
  id: string;
  username: string;
  games1: any[];
  games2: any[];
}

function Home() {
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState<null | User>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(window.location.origin, { withCredentials: true });

    socket.on("connected", (user) => {
      setConnected(true);
      setUser(user);
    });

    socket.on("connect_error", (error) => {
      console.log("Connection error:", error);
      navigate("/login");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-primary-a3">
      {connected ? (
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold">Welcome, {user?.username}!</h1>
        </div>
      ) : (
        <h1>Connecting...</h1>
      )}
    </div>
  );
}

export default Home;
