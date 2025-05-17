// backend/middleware/socketMiddleware.js

export function setupSocketAuth(io) {
  // For now, just a dummy function, no special auth
  io.use((socket, next) => {
    // Add real auth here if you want later
    next();
  });
}
