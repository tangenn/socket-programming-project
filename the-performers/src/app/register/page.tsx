import RegisterCard from "@/components/RegisterCard";
import Link from "next/link";

export default function RegisterPage() {

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col">
         

      <main className="flex flex-col flex-grow items-center">
        <RegisterCard />

        <Link
        href="/login"
        className="mt-6 font-semibold hover:opacity-70 transition"
      >
        Already have an account? Click here.
      </Link>
      </main>
    </div>
  );
}