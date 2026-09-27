import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup, getMe } from "../utils/AuthAPIHandler";

function Signup() {
  const [loggedInUser, setLoggedInUser] = useState<null | { username: string }>(
    null,
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const user = await getMe();
        if (user) {
          setLoggedInUser(user);
        }
      } catch (error) {
        setLoggedInUser(null);
      }
    };
    checkLoggedIn();
  }, []);

  const handleSignup = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await signup(username, password);
      navigate("/");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "error" in error &&
        typeof error.error === "string"
          ? error.error
          : "An unknown error occurred";
      setError(message);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-primary-a3">
      {loggedInUser && (
        <div className="w-84 p-6 flex flex-col mb-4 bg-primary-a2 rounded-lg">
          <p>
            You're already logged in as{" "}
            <span className="font-bold">{loggedInUser.username}</span>
          </p>
          <Link
            to="/"
            className="bg-primary-a1 hover:bg-primary-a0 text-primary-a3 font-bold p-2 rounded-lg mt-4 text-center"
          >
            Go to Home
          </Link>
        </div>
      )}
      <form
        onSubmit={handleSignup}
        className="w-84 p-6 flex flex-col bg-primary-a2 rounded-lg"
      >
        <h1 className="text-2xl font-bold text-primary-a4">Sign Up</h1>
        <label htmlFor="username" className="mt-4 text-primary-a4">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="Enter your username"
          className="mt-2 p-2 bg-primary-a1 text-primary-a4 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="password" className="mt-4 text-primary-a4">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          className="mt-2 p-2 bg-primary-a1 text-primary-a4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="mt-2 text-red-500">{error}</p>}
        <button
          type="submit"
          className="mt-4 p-2 bg-primary-a1 text-primary-a4 font-bold rounded-lg"
        >
          Sign Up
        </button>
        <p className="mt-4 text-primary-a4">
          Already have an account?{" "}
          <Link to="/login" className="font-bold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
