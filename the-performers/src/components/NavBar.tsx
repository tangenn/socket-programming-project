import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
      <h1 className="text-3xl font-black">PRF</h1>

      <div className="flex items-center gap-6 font-semibold">
        <Link href="/" className="hover:opacity-70 transition">Home</Link>
        <Link href="/about" className="hover:opacity-70 transition">About</Link>
        <Link href="/login" className="hover:opacity-70 transition">Login</Link>
      </div>
    </nav>
  );
}
