import React from "react";

export default function RegisterCard() {
  return (
    <div className="w-full flex justify-center items-center py-20">
      <div className="bg-gray-200/60 backdrop-blur-sm rounded-3xl shadow-md p-10 w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-semibold mb-8">Create Account</h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 rounded-md bg-white text-black shadow-sm focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-md bg-white text-black shadow-sm focus:outline-none"
        />

        <button className="w-full py-2 rounded-md bg-white font-semibold shadow-sm hover:bg-gray-100 transition">
          SIGN UP
        </button>
      </div>
    </div>
  );
}
