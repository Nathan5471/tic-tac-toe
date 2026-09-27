import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-primary-a3">
      <div className="w-64 p-6 flex flex-col bg-primary-a2 rounded-lg">
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
        />
        <button className="mt-4 p-2 bg-primary-a1 text-primary-a4 font-bold rounded-lg">
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
