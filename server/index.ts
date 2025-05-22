import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initDatabase } from './db/init';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Initialize database before starting server
    await initDatabase();

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    const hosts = ["localhost", "127.0.0.1"];
    let serverStarted = false;

    for (const host of hosts) {
      try {
        await new Promise<void>((resolve, reject) => {
          server.listen({
            port,
            host,
          }, () => {
            serverStarted = true;
            log(`Server started successfully on ${host}:${port}`);
            resolve();
          }).on('error', (err) => {
            log(`Failed to start server on ${host}:${port} - ${err.message}`);
            reject(err);
          });
        });
        break; // If successful, exit the loop
      } catch (err) {
        if (hosts.indexOf(host) === hosts.length - 1 && !serverStarted) {
          log('Failed to start server on all available hosts');
          process.exit(1);
        }
        // Continue to next host if current fails
        continue;
      }
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
