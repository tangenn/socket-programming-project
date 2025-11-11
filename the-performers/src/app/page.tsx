import ConnectionStatus from "./components/ConnectionStatus"; // Import the component
import Link from "next/link";
export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>My Socket App</h1>
      
      {/* Add your new component here */}
      <ConnectionStatus />
      <div className="mt-2">
        <Link href="/chat" className="bg-amber-100 hover:bg-amber-200 cursor-pointer p-2 px-4 rounded-full">Enter Chat Room</Link>
      </div>
    </main>
  );
}