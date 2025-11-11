import React from "react";
import LoginCard from "@/components/LoginCard";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-300 flex flex-col">
         

      <main className="flex flex-col flex-grow items-center">
        <LoginCard />

        <Link
        href="/register"
        className="mt-6 font-semibold hover:opacity-70 transition"
      >
        Don't have an account? Click here.
      </Link>
      </main>
    </div>
  );
}
