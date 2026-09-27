import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../utils/AuthAPIHandler";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    <div className="w-screen h-screen flex items-center justify-center bg-primary-a3">
      <form
        onSubmit={handleLogin}
        className="w-64 p-6 flex flex-col bg-primary-a2 rounded-lg"
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
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
