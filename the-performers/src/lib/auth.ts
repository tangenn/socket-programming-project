// Utility functions for managing authentication cookies

export function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// Helper to set authentication
export function setAuth(username: string) {
  setCookie('username', username, 7); // Cookie expires in 7 days
}

// Helper to clear authentication
export function clearAuth() {
  deleteCookie('username');
}

// Note: Use socket.emit('getMe') and listen to 'me' event instead of these functions
// These are kept for backward compatibility but will be replaced by socket-based auth

// Helper to check if user is authenticated - DEPRECATED
// Use socket.emit('getMe') instead
export function isAuthenticated(): boolean {
  return false; // Placeholder - use getMe socket event
}

// Helper to get current username - DEPRECATED
// Use socket.emit('getMe') and listen for 'me' event instead
export function getUsername(): string | null {
  return null; // Placeholder - use getMe socket event
}

