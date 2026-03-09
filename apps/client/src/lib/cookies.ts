/**
 * Cookie utility functions
 * Helper functions to read and manage browser cookies
 */

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }

  return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * Check if a cookie exists
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

/**
 * Extract access token from httpOnly cookie and move to localStorage
 * Then delete the cookie (keeps refresh token cookie)
 *
 * Used when server sends both tokens as httpOnly cookies
 * and we want access token in localStorage for easy API access
 */
export const extractAndMoveAccessToken = (): string | null => {
  const accessToken = getCookie("accessToken");

  if (accessToken) {
    // Move to localStorage
    localStorage.setItem("accessToken", accessToken);
    // Delete the cookie
    deleteCookie("accessToken");
  }

  return accessToken;
};
