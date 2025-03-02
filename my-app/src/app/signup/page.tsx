"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");

  const handleSignup = async () => {
    if (!firstName || !lastName || !phoneNum) {
      alert("All fields are required!");
      return;
    }

    const API_URL = "http://localhost:8000";

    try {
      const response = await fetch(`${API_URL}/signup`, {
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
        localStorage.setItem("userId", result.id);
        alert("Signup successful!");
        router.push("/start-trip");
      } else {
        alert(`Signup failed: ${result.detail}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred while signing up.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
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
          onClick={handleSignup}
          className="w-full p-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignUp;