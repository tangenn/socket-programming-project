// This is a Server Component. It just sets up the page.
import Link from "next/link";
import ChatInterface from "../components/ChatInterface"; // Import our new component

export default function ChatPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <Link
        href="/"
        className="bg-lime-100 hover:bg-lime-200 cursor-pointer p-2  px-3 rounded-full"
      >
        Back to Home
      </Link>
      <div className="flex flex-col gap-2 m-5">
        <h1 className="text-2xl font-black">Chat Room</h1>

        {/* This is where all the interactive logic lives.
        Next.js will load the Server Component (this file) first,
        then load the Client Component (ChatInterface) inside it.
      */}
        <ChatInterface />
      </div>
    </main>
  );
}
