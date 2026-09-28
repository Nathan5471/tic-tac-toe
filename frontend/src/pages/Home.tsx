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
  name: string;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED";
  player1Id: string;
  player2Id: string;
}

interface Game {
  id: string;
  name: string;
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED";
  player1: { id: string; username: string };
  player2: { id: string; username: string };
  board?: string[][];
}

function Home() {
  const [state, setState] = useState<
    | "connecting"
    | "connected"
    | "creatingGame"
    | "waitingForGame"
    | "playing"
    | "completed"
  >("connecting");
  const [user, setUser] = useState<null | User>(null);
  const [userJoinedGames, setUserJoinedGames] = useState<GameOption[]>([]);
  const [availableGames, setAvailableGames] = useState<GameOption[]>([]);
  const [newGameName, setNewGameName] = useState("");
  const [currentGame, setCurrentGame] = useState<null | Game>(null);
  const matchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(window.location.origin, { withCredentials: true });
    socketRef.current = socket;

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

    socket.on("joinedGame", (game: Game) => {
      console.log("Game seems to be joined:", game);
      setCurrentGame(game);
      setState("playing");
    });

    socket.emit("getMatches");
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

  const handleCreateGame = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!socketRef) return;
    socketRef.current.emit("createMatch", newGameName);
    setNewGameName("");
  };

  if (state === "connecting") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-primary-a3">
        <h1>Connecting...</h1>
      </div>
    );
  }

  if (state === "connected") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-primary-a3">
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
        <button
          onClick={() => setState("creatingGame")}
          className="absolute top-4 right-4 bg-primary-a2 text-primary-a4 font-bold p-2 rounded-lg hover:bg-primary-a1"
        >
          Create Game
        </button>
      </div>
    );
  }

  if (state === "creatingGame") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-primary-a3 text-primary-a4">
        <form
          onSubmit={handleCreateGame}
          className="flex flex-col bg-primary-a2 p-4 rounded-lg"
        >
          <h2 className="text-3xl font-bold text-center">Create Game</h2>
          <label htmlFor="gameName" className="text-2xl mt-2">
            Game Name
          </label>
          <input
            type="text"
            id="gameName"
            name="gameName"
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
            className="text-lg mt-1 p-2 rounded-lg bg-primary-a1"
            required
          />
          <button
            type="submit"
            className="bg-primary-a1 text-primary-a3 font-bold p-2 mt-2 rounded-lg hover:bg-primary-a0"
          >
            Create
          </button>
        </form>
      </div>
    );
  }
}

export default Home;
