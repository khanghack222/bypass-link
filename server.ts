import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing and URL utility parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API 1: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API 2: CORS-safe redirect proxy sniffer for Group 1 testing
  app.get("/api/bypass-proxy", async (req, res) => {
    const urlStr = req.query.url as string;
    if (!urlStr) {
       res.status(400).json({ error: "Tham số URL không hợp lệ." });
       return;
    }

    try {
      let currentUrl = urlStr;
      if (!currentUrl.startsWith("http://") && !currentUrl.startsWith("https://")) {
        currentUrl = "https://" + currentUrl;
      }

      const chain: string[] = [currentUrl];
      let finalUrl = currentUrl;
      let methodUsed = "Direct Access";

      // Follow up to 5 redirect hops to prevent loops
      for (let hop = 0; hop < 5; hop++) {
        console.log(`[Proxy] Hop ${hop}: Fetching ${currentUrl}`);
        const response = await fetch(currentUrl, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          redirect: "manual" // Intercept manual redirects
        });

        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get("location");
          if (location) {
            let nextUrl = location;
            // Solve relative location urls
            if (nextUrl.startsWith("/")) {
              const origin = new URL(currentUrl).origin;
              nextUrl = origin + nextUrl;
            } else if (!nextUrl.startsWith("http")) {
              const origin = new URL(currentUrl).origin;
              nextUrl = origin + "/" + nextUrl;
            }

            chain.push(nextUrl);
            currentUrl = nextUrl;
            finalUrl = nextUrl;
            methodUsed = `HTTP Status Redirect (${response.status})`;
            continue;
          }
        }

        // If not a status redirect, inspect HTML text for Meta refresh
        const html = await response.text();
        const metaMatch = html.match(/meta\s+http-equiv=["']refresh["']\s+content=["']\d+;\s*url=(.*?)["']/i);
        if (metaMatch && metaMatch[1]) {
          let dest = metaMatch[1].trim().replace(/['"]/g, "");
          if (dest.startsWith("/")) {
            dest = new URL(currentUrl).origin + dest;
          }
          chain.push(dest);
          finalUrl = dest;
          methodUsed = "Meta HTML Refresh Sniffing";
          break;
        }

        // Search for window.location scripts
        const jsMatch = html.match(/window\.location(?:\.href)?\s*=\s*["'](.*?)["']/i) || html.match(/location\s*=\s*["'](.*?)["']/i);
        if (jsMatch && jsMatch[1]) {
          let dest = jsMatch[1].trim();
          if (dest.startsWith("/")) {
            dest = new URL(currentUrl).origin + dest;
          }
          chain.push(dest);
          finalUrl = dest;
          methodUsed = "JS Location Prompt Sniffing";
          break;
        }

        // No more redirects detected on this hop
        break;
      }

      res.json({
        success: true,
        shortUrl: urlStr,
        finalUrl: finalUrl,
        chain: chain,
        method: methodUsed,
        host: new URL(finalUrl).hostname
      });

    } catch (err: any) {
      console.error("[Proxy Error]", err);
      res.status(500).json({ 
        success: false, 
        error: `Không thể kết nối đến máy chủ. Chi tiết: ${err.message}` 
      });
    }
  });

  // Enable dynamic Vite development server middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Running in DEVELOPMENT mode. Mounting Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Running in PRODUCTION mode. Serving client files from dist/");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve fallback index.html for React SPA
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Bypass Shortlink running on port ${PORT}`);
  });
}

startServer();
