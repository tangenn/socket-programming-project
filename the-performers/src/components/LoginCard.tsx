"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { socket } from '@/socket';
import { setAuth } from '@/lib/auth';

export default function LoginCard() {
  // State for the input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State for server error messages
  const [errorMessage, setErrorMessage] = useState('');

  // Get the Next.js router for redirection
  const router = useRouter();

  // This effect sets up the socket listeners
  useEffect(() => {
    // Make sure the socket is connected (if not auto-connecting)
    // If socket.ts has autoConnect: true, you can remove this.
    socket.connect();

    console.log('Socket connection status:', socket.connected);

    // Listen for connection events
    const onConnect = () => {
      console.log('Socket connected!', socket.id);
    };

    const onDisconnect = () => {
      console.log('Socket disconnected!');
    };

    const onConnectError = (error: any) => {
      console.error('Socket connection error:', error);
      setErrorMessage('Unable to connect to server. Please try again.');
    };

    // Listen for the 'login_success' event
    const onLoginSuccess = (data: { username: string }) => {
      console.log('Login successful:', data.username);
      // Store username in cookie
      setAuth(data.username);
      // On success, clear errors and redirect
      setErrorMessage('');
      router.push('/'); // Redirect to your chat or dashboard page
    };

    // Listen for the 'login_error' event
    const onLoginError = (data: { message: string }) => {
      console.log('Login error:', data.message);
      // On error, display the message from the server
      setErrorMessage(data.message);
    };

    // Add the listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('login_success', onLoginSuccess);
    socket.on('login_error', onLoginError);

    // --- Cleanup function ---
    // This runs when the component unmounts
    return () => {
      // Remove listeners to prevent memory leaks
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('login_success', onLoginSuccess);
      socket.off('login_error', onLoginError);
    };
  }, [router]); // Add router to the dependency array

  // --- Event Handler ---
  // This function is called when the form is submitted
  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission (which reloads the page)
    event.preventDefault();

    // Reset any previous error messages
    setErrorMessage('');

    // Basic client-side validation
    if (!username || !password) {
      setErrorMessage('Username and password are required');
      return;
    }

    console.log('Attempting login...', { username, socket_connected: socket.connected });

    // Emit the 'login' event to the server
    // This matches your backend: @sio.event async def login(sid,data):
    socket.emit('login', {
      username: username,
      password: password,
    });
    
    console.log('Login event emitted');
  };
  
  return (
    <div className="w-full flex justify-center items-center py-20">
      {/* Use a <form> tag and its onSubmit handler */}
      <form
        onSubmit={handleLogin}
        className="bg-gray-200/60 backdrop-blur-sm rounded-3xl shadow-md p-10 w-full max-w-md flex flex-col items-center"
      >
        <h1 className="text-3xl font-semibold mb-8">Welcome Back</h1>

        {/* --- Display Server Error Message --- */}
        {errorMessage && (
          <div className="w-full p-3 mb-4 rounded-md text-red-700 bg-red-100 border border-red-300 text-center">
            {errorMessage}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 rounded-md bg-white text-black shadow-sm focus:outline-none"
          // Controlled component: value is from state
          value={username}
          // onChange updates the state
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-md bg-white text-black shadow-sm focus:outline-none"
          // Controlled component: value is from state
          value={password}
          // onChange updates the state
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Set button type to "submit" to trigger the form's onSubmit */}
        <button
          type="submit"
          className="cursor-pointer w-full py-2 rounded-md bg-white font-semibold shadow-sm hover:bg-gray-100 transition"
        >
          SIGN IN
        </button>
      </form>
    </div>
      
  );
}
