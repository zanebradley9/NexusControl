import React, { useState } from "react";

export default function ForgotPassword() {
const [email, setEmail] = useState("");
const [message, setMessage] = useState("");

const handleSubmit = async (e) => {
e.preventDefault();

if (!email) {
  setMessage("Please enter your email.");
  return;
}

try {
  // Replace with your backend endpoint
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (response.ok) {
    setMessage(
      "If an account exists with that email, a reset link has been sent."
    );
  } else {
    setMessage(data.message || "Something went wrong.");
  }
} catch (error) {
  setMessage("Unable to connect to the server.");
}

};

return ( <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"> <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md"> <h1 className="text-3xl font-bold mb-4">
Forgot Password </h1>

    <p className="text-gray-300 mb-6">
      Enter your email address and we'll send a password reset link.
    </p>

    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full p-3 rounded bg-gray-700 mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded"
      >
        Send Reset Link
      </button>
    </form>

    {message && (
      <p className="mt-4 text-center">
        {message}
      </p>
    )}
  </div>
</div>
);
}
