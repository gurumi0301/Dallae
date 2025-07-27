import { createServer as createViteServer } from "vite";
import express from "express";
import path from "path";

export function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [express] ${message}`);
}

export async function setupVite(app, server) {
  if (process.env.NODE_ENV === "production") {
    console.log("Production mode: serving static files");
    serveStatic(app);
  } else {
    console.log("Development mode: setting up Vite middleware");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { server },
        host: '0.0.0.0',
        allowedHosts: [
          'localhost',
          '127.0.0.1', 
          '9ce38cc8-04fe-4b53-aa1e-da743819c71d-00-kg2tvtdiop6q.janeway.replit.dev',
          'all'
        ]
      },
      appType: "spa",
      root: path.resolve("client"),
    });

    app.use(vite.middlewares);
  }
}

export function serveStatic(app) {
  app.use("/", express.static(path.resolve("dist/public")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("dist/public/index.html"));
  });
}