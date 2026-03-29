// Intercept all global fetch calls to inject the Authorization header
// This ensures that the auto-generated api-client-react hooks have the auth token.

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const [resource, config] = args;
  const token = localStorage.getItem("edubridge_token");

  if (token) {
    if (config && config.headers) {
      const headers = new Headers(config.headers);
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
    } else if (config) {
      config.headers = { Authorization: `Bearer ${token}` };
    } else if (resource instanceof Request) {
      resource.headers.set("Authorization", `Bearer ${token}`);
    } else {
      args[1] = { headers: { Authorization: `Bearer ${token}` } };
    }
  }

  return originalFetch(...args);
};

export {};
