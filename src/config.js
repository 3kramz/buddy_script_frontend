// Base URL for API requests. Automatically switches based on whether the app is running locally.
export const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://your-remote-server-url.com/api'; // Replace with a real remote URL when deployed
