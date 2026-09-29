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
  currentTurn: number;
  winner: number;
  board?: {
    slot1: "EMPTY" | "X" | "O";
    slot2: "EMPTY" | "X" | "O";
    slot3: "EMPTY" | "X" | "O";
    slot4: "EMPTY" | "X" | "O";
    slot5: "EMPTY" | "X" | "O";
    slot6: "EMPTY" | "X" | "O";
    slot7: "EMPTY" | "X" | "O";
    slot8: "EMPTY" | "X" | "O";
    slot9: "EMPTY" | "X" | "O";
  };
}

function Home() {
  const [state, setState] = useState<
    "connecting" | "connected" | "creatingGame" | "waitingForGame" | "playing"
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

    socket.on("startedGame", (game: Game) => {
      setCurrentGame(game);
    });

    socket.on("updatedGame", (game: Game) => {
      setCurrentGame(game);
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

  const handleJoinGame = (
    e: React.MouseEvent<HTMLButtonElement>,
    gameId: string,
  ) => {
    e.preventDefault();
    if (!socketRef.current) return;
    socketRef.current.emit("joinMatch", gameId);
  };

  const handleStartGame = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!socketRef.current || !currentGame) return;
    socketRef.current.emit("startMatch", currentGame.id);
  };

  const handleMakeMove = (
    e: React.MouseEvent<HTMLButtonElement>,
    slot: number,
  ) => {
    e.preventDefault();
    if (!socketRef.current || !currentGame) return;
    socketRef.current.emit("makeMove", { gameId: currentGame.id, slot });
  };

  const handleGoToHome = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setState("connected");
    setCurrentGame(null);
    setAvailableGames([]);
    setUserJoinedGames([]);
    socketRef.current.emit("getMatches");
    matchIntervalRef.current = setInterval(() => {
      socketRef.current.emit("getMatches");
    }, 1000);
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
          <h1 className="text-4xl font-bold mb-4">
            Welcome, {user?.username}!
          </h1>
          {userJoinedGames.length > 0 && (
            <div className="flex flex-col bg-primary-a2 p-4 rounded-lg">
              <h2 className="text-2xl font-bold">
                You've already joined some games!
              </h2>
              <div className="grid grid-cols-5 gap-4 mt-2">
                {userJoinedGames.map((game) => (
                  <div key={game.id} className="bg-primary-a1 p-2 rounded-lg ">
                    <p className="text-lg font-bold">{game.name}</p>
                    <button
                      className="bg-primary-a0 p-2 rounded-lg text-primary-a3 font-bold hover:scale-105"
                      onClick={(e) => handleJoinGame(e, game.id)}
                    >
                      Join Game
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {availableGames.length > 0 && (
            <div className="flex flex-col bg-primary-a2 p-4 rounded-lg">
              <h2 className="text-2xl font-bold">Available Games</h2>
              <div className="grid grid-cols-5 gap-4 mt-2">
                {availableGames.map((game) => (
                  <div key={game.id} className="bg-primary-a1 p-2 rounded-lg ">
                    <p className="text-lg font-bold">{game.name}</p>
                    <button
                      className="bg-primary-a0 p-2 rounded-lg text-primary-a3 font-bold hover:scale-105"
                      onClick={(e) => handleJoinGame(e, game.id)}
                    >
                      Join Game
                    </button>
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

  if (state === "playing" && currentGame) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-primary-a3 text-primary-a4">
        {currentGame.status === "WAITING" && (
          <div className="bg-primary-a2 p-4 rounded-lg w-64">
            <h2 className="text-3xl font-bold text-center">
              {currentGame.name}
            </h2>
            <p className="text-lg font-bold">Current Players</p>
            {currentGame.player1 && (
              <p>Player1: {currentGame.player1.username}</p>
            )}
            {currentGame.player2 && (
              <p>Player2: {currentGame.player2.username}</p>
            )}
            {currentGame.player1 && currentGame.player2 ? (
              <button
                className="bg-primary-a1 text-primary-a3 font-bold p-2 mt-2 rounded-lg hover:bg-primary-a0"
                onClick={handleStartGame}
              >
                Start Game
              </button>
            ) : (
              <p className="mt-2">Waiting for players...</p>
            )}
          </div>
        )}
        {currentGame.status === "IN_PROGRESS" && (
          <div className="bg-primary-a2 p-4 rounded-lg w-lg h-92">
            <h2 className="text-3xl font-bold text-center">
              {currentGame.name} - {currentGame.player1.username} vs{" "}
              {currentGame.player2?.username}
            </h2>
            <p className="text-xl mt-1 text-center">
              {currentGame.currentTurn === 1
                ? `${currentGame.player1.username}'s turn`
                : `${currentGame.player2?.username}'s turn`}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 h-3/4">
              {currentGame.board && (
                <>
                  <button
                    className="flex w-36 h-18 items-center justify-center bg-primary-a1"
                    onClick={(e) => handleMakeMove(e, 1)}
                    disabled={
                      currentGame.board.slot1 !== "EMPTY" ||
                      (currentGame.currentTurn === 1
                        ? currentGame.player1.id !== user!.id
                        : currentGame.player2?.id !== user!.id)
                    }
                  >
                    {currentGame.board.slot1 === "X" && "X"}
                    {currentGame.board.slot1 === "O" && "O"}
                  </button>
                  <button
                    className="flex w-36 h-18 items-center justify-center bg-primary-a1"
                    onClick={(e) => handleMakeMove(e, 2)}
                    disabled={
                      currentGame.board.slot2 !== "EMPTY" ||
                      (currentGame.currentTurn === 1
                        ? currentGame.player1.id !== user!.id
                        : currentGame.player2?.id !== user!.id)
                    }
                  >
                    {currentGame.board.slot2 === "X" && "X"}
                    {currentGame.board.slot2 === "O" && "O"}
                  </button>
                  <button
                    className="flex w-36 h-18 items-center justify-center bg-primary-a1"
                    onClick={(e) => handleMakeMove(e, 3)}
                    disabled={
                      currentGame.board.slot3 !== "EMPTY" ||
                      (currentGame.currentTurn === 1
                        ? currentGame.player1.id !== user!.id
                        : currentGame.player2?.id !== user!.id)
                    }
                  >
                    {currentGame.board.slot3 === "X" && "X"}
                    {currentGame.board.slot3 === "O" && "O"}
                  </button>
                  <button
                    className="flex w-36 h-18 items-center justify-center bg-primary-a1"
                    onClick={(e) => handleMakeMove(e, 4)}
                    disabled={
                      currentGame.board.slot4 !== "EMPTY" ||
                      (currentGame.currentTurn === 1
                        ? currentGame.player1.id !== user!.id
                        : currentGame.player2?.id !== user!.id)
                    }
                  >
                    {currentGame.board.slot4 === "X" && "X"}
                    {currentGame.board.slot4 === "O" && "O"}
                  </button>
                  <button
                    className="flex w-36 h-18 items-center justify-center bg-primary-a1"
                    onClick={(e) => handleMakeMove(e, 5)}
                    disabled={
                      currentGame.board.slot5 !== "EMPTY" ||
                      (currentGame.currentTurn === 1
                        ? currentGame.player1.id !== user!.id
                        : currentGame.player2?.id !== user!.id)
                    }
                  >
                    {currentGame.board.slot5 === "X" && "X"}
                    {currentGame.board.slot5 === "O" && "O"}
                  </button>
                  <button
                    className="flex w-36 h-18 items-center justify-center bg-primary-a1"
                    onClick={(e) => handleMakeMove(e, 6)}
                    disabled={
                      currentGame.board.slot6 !== "EMPTY" ||
                      (currentGame.currentTurn === 1
                        ? currentGame.player1.id !== user!.id
                        : currentGame.player2?.id !== user!.id)
                    }
                  >
                    {currentGame.board.slot6 === "X" && "X"}
                    {currentGame.board.slot6 === "O" && "O"}
                  </button>
                  <button
                    className="flex w-36 h-18 items-center justify-center bg-primary-a1"
                    onClick={(e) => handleMakeMove(e, 7)}
                    disabled={
                      currentGame.board.slot7 !== "EMPTY" ||
                      (currentGame.currentTurn === 1
                        ? currentGame.player1.id !== user!.id
                        : currentGame.player2?.id !== user!.id)
                    }
                  >
                    {currentGame.board.slot7 === "X" && "X"}
                    {currentGame.board.slot7 === "O" && "O"}
                  </button>
                  <button
                    className="flex w-36 h-18 items-center justify-center bg-primary-a1"
                    onClick={(e) => handleMakeMove(e, 8)}
                    disabled={
                      currentGame.board.slot8 !== "EMPTY" ||
                      (currentGame.currentTurn === 1
                        ? currentGame.player1.id !== user!.id
                        : currentGame.player2?.id !== user!.id)
                    }
                  >
                    {currentGame.board.slot8 === "X" && "X"}
                    {currentGame.board.slot8 === "O" && "O"}
                  </button>
                  <button
                    className="flex w-36 h-18 items-center justify-center bg-primary-a1"
                    onClick={(e) => handleMakeMove(e, 9)}
                    disabled={
                      currentGame.board.slot9 !== "EMPTY" ||
                      (currentGame.currentTurn === 1
                        ? currentGame.player1.id !== user!.id
                        : currentGame.player2?.id !== user!.id)
                    }
                  >
                    {currentGame.board.slot9 === "X" && "X"}
                    {currentGame.board.slot9 === "O" && "O"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {currentGame.status === "COMPLETED" && (
          <div className="flex flex-col p-4 items-center justify-center bg-primary-a2 rounded-lg">
            {currentGame.winner === 0 && (
              <h3 className="text-xl font-bold">It's a draw!</h3>
            )}
            {currentGame.winner === 1 &&
              (currentGame.player1.id === user!.id ? (
                <h3 className="text-xl font-bold">You won!</h3>
              ) : (
                <h3 className="text-xl font-bold">You lost :(</h3>
              ))}
            {currentGame.winner === 2 &&
              (currentGame.player2?.id === user!.id ? (
                <h3 className="text-xl font-bold">You won!</h3>
              ) : (
                <h3 className="text-xl font-bold">You lost :(</h3>
              ))}
            <button
              className="p-2 mt-2 rounded-lg bg-primary-a1 hover:bg-primary-a0 text-primary-a3 font-bold"
              onClick={handleGoToHome}
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default Home;
