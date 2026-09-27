import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, getMe } from "../utils/AuthAPIHandler";
import { IoEye, IoEyeOff } from "react-icons/io5";

function Login() {
  const [loggedInUser, setLoggedInUser] = useState<null | { username: string }>(
    null,
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
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
        onSubmit={handleLogin}
        className="w-84 p-6 flex flex-col bg-primary-a2 rounded-lg"
      >
        <h1 className="text-2xl font-bold text-primary-a4">Login</h1>
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
        <div className="mt-2 flex flex-row bg-primary-a1 text-primary-a4 rounded-lg">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Enter your password"
            className="p-2 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="p-2 ml-auto"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>
        {error && <p className="mt-2 text-red-500">{error}</p>}
        <button
          type="submit"
          className="mt-4 p-2 bg-primary-a1 text-primary-a4 font-bold rounded-lg"
        >
          Login
        </button>
        <p className="mt-4 text-primary-a4">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
