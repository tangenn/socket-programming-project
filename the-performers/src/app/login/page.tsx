import React from "react";
import LoginCard from "@/components/LoginCard";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-300 flex flex-col">

      {/* Background */}
      <div className="absolute inset-0 bg-[url('/backgrounds/background_Dramatic.jpg')] bg-cover bg-center bg-fixed" />

      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      <main className="relative z-10 flex flex-col items-center justify-center gap-4 pt-20 px-6">
        <LoginCard />

        <Link
        href="/register"
        className="px-5 py-2
              bg-red-200 text-black font-bold
              rounded-xl
              border-4 border-black
              shadow-[4px_4px_0px_#000]
              hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]
            active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]
            transition-all
            "
      >
        Don't have an account? Click here.
      </Link>
      </main>
    </div>
  );
}
