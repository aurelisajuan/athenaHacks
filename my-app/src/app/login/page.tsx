"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [isClient, setIsClient] = useState(false); // Prevents SSR mismatches

  // Fix hydration issue
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async () => {
    if (!firstName || !lastName || !phoneNum) {
      alert("All fields are required!");
      return;
    }

    const API_URL = "https://95fd-207-151-52-106.ngrok-free.app";

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone_num: phoneNum,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("userId", result.user.id);
        }
        alert("Login successful!");
        router.push("/start-trip");
      } else {
        alert(`Login failed: ${result.detail}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred while logging in.");
    }
  };

  if (!isClient) {
    return null; // Prevents SSR mismatches
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-2 mb-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 mb-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNum}
          onChange={(e) => setPhoneNum(e.target.value)}
          className="w-full p-2 mb-4 border rounded-md"
        />
        <button
          onClick={handleLogin}
          className="w-full p-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
