import RegisterCard from "@/components/RegisterCard";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 bg-[url('/backgrounds/background_Dramatic.jpg')] bg-cover bg-center bg-fixed" />
      <div className="absolute inset-0 bg-black/40" />

      <main className="relative z-10 flex flex-col flex-grow items-center justify-center px-4 py-10">
        <RegisterCard />

        <Link href="/login" className="cursor-pointer px-5 py-2
              bg-red-200 text-black font-bold
              rounded-xl
              border-4 border-black
              shadow-[4px_4px_0px_#000]
              hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000]
            active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]
            transition-all
            ">
          Already have an account? Click here.
        </Link>
      </main>
    </div>
  );
}