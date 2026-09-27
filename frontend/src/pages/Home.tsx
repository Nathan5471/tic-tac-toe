import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

interface User {
  id: string;
  username: string;
  games1: any[];
  games2: any[];
}

interface GameOption {
  id: string;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED";
  player1Id: string;
  player2Id: string;
}

function Home() {
  const [state, setState] = useState<
    "connecting" | "connected" | "waitingForGame" | "playing" | "completed"
  >("connecting");
  const [user, setUser] = useState<null | User>(null);
  const [userJoinedGames, setUserJoinedGames] = useState<GameOption[]>([]);
  const [availableGames, setAvailableGames] = useState<GameOption[]>([]);
  const matchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(window.location.origin, { withCredentials: true });

    socket.on("connected", (user) => {
      setState("connected");
      setUser(user);
    });

    socket.on("connect_error", (error) => {
      console.log("Connection error:", error);
      navigate("/login");
    });

    socket.on("upcomingGames", (matches: GameOption[]) => {
      setAvailableGames(matches);
    });

    socket.on("ongoingMatches", (matches: GameOption[]) => {
      setUserJoinedGames(matches);
    });

    matchIntervalRef.current = setInterval(() => {
      socket.emit("getMatches");
    }, 1000);

    return () => {
      if (matchIntervalRef.current !== null) {
        clearInterval(matchIntervalRef.current);
      }
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-primary-a3">
      {state === "connected" && (
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold">Welcome, {user?.username}!</h1>
          {userJoinedGames.length > 0 && (
            <div className="flex flex-col bg-primary-a2">
              <h2 className="text-2xl font-bold">
                You've already joined some games!
              </h2>
              <div className="grid gap-4">
                {userJoinedGames.map((game) => (
                  <div key={game.id}>
                    <button className="bg-primary-a1">Join Game</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {availableGames.length > 0 && (
            <div className="flex flex-col bg-primary-a2">
              <h2 className="text-2xl font-bold">Available Games</h2>
              <div className="grid gap-4">
                {availableGames.map((game) => (
                  <div key={game.id}>
                    <button className="bg-primary-a1">Join Game</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {state === "connecting" && <h1>Connecting...</h1>}
    </div>
  );
}

export default Home;
