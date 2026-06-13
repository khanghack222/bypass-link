import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY || "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";
let isOpenRouter = false;

if (apiKey) {
  if (apiKey.startsWith("sk-or-")) {
    isOpenRouter = true;
    console.log("[OpenRouter] API key detected. Using OpenRouter endpoint as default engine.");
  } else {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("[Gemini] SDK initialized successfully with key.");
    } catch (err) {
      console.error("[Gemini] Failed to initialize GoogleGenAI:", err);
    }
  }
} else {
  console.log("[Gemini] No GEMINI_API_KEY found in process.env. Using Heuristic NLP fallback as default engine.");
}

// Local NLP Heuristics fallback engine (Option C / Resilient architecture)
function runHeuristicAnalysis(htmlContent: string) {
  const text = (htmlContent || "").toLowerCase();
  
  // Look for keywords
  let searchKeyword = "five 88";
  const kwMatch = htmlContent.match(/từ khóa.*?:?\s*["'«“]?([a-zA-Z0-9\sđđáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]+)["'»”]?/i) || 
                  htmlContent.match(/search\s*keyword.*?:?\s*["']?([a-zA-Z0-9\s]+)["']?/i) ||
                  htmlContent.match(/nhập từ khóa\s*["'«“]?([a-zA-Z0-9\sđđáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]+)["'»”]?/i) ||
                  htmlContent.match(/từ khóa tìm kiếm.*?:?\s*["'«“]?([a-zA-Z0-9\sđđáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]+)["'»”]?/i);
                  
  if (kwMatch && kwMatch[1]) {
    searchKeyword = kwMatch[1].trim();
  } else {
    // regex pattern matching Vietnamese text words
    const keywordRegex = /(?:từ khóa|tìm kiếm|google search|nhập)\s*[:-]?\s*["']?([a-zA-Z0-9\sđđáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]{3,24})["']?/gi;
    const match = keywordRegex.exec(htmlContent);
    if (match && match[1]) {
      searchKeyword = match[1].trim();
    }
  }

  // Look for target domain hint
  let targetDomainHint = "afq.com";
  const domMatch = htmlContent.match(/(?:truy cập|click vào trang|trang chủ|site|domain|tên miền|website).*?:?\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/i) ||
                   htmlContent.match(/domain\s*target\s*[:-]?\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/i);
  if (domMatch && domMatch[1]) {
    targetDomainHint = domMatch[1].trim().replace('www.', '');
  } else {
    const commonDomains = ["cakhiatv9.com", "cakhiatv.com", "xoilac.tv", "vebo.tv", "five88", "123link", "trafficvn", "asg.com", "afq.com"];
    for (const d of commonDomains) {
      if (text.includes(d)) {
        targetDomainHint = d;
        break;
      }
    }
  }

  // Look for button text
  let buttonText = "LÀM LẤY MẪN";
  const btnMatch = htmlContent.match(/(?:click nút|ấn nút|nút lấy mã|tìm nút|chữ).*?["'«“]?([a-zA-Z0-9\sđđáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]+)["'»”]?/i);
  if (btnMatch && btnMatch[1]) {
    buttonText = btnMatch[1].trim();
  } else if (text.includes("lam lay man") || text.includes("làm lấy mẫn") || text.includes("làm lày mẫn")) {
    buttonText = "LÀM LẤY MẪN";
  } else if (text.includes("lấy mã") || text.includes("get code")) {
    buttonText = "LẤY MÃ NGAY";
  }

  // Page number & wait time
  let expectedPageNumber = 2;
  const pageMatch = htmlContent.match(/(?:trang|page)\s*(?:số)?\s*(\d+)/i);
  if (pageMatch && pageMatch[1]) {
    expectedPageNumber = parseInt(pageMatch[1]) || 2;
  }
  
  let waitTime = 59;
  const waitMatch = htmlContent.match(/(\d+)\s*(?:giây|s|second)/i);
  if (waitMatch && waitMatch[1]) {
    waitTime = parseInt(waitMatch[1]) || 59;
  }

  return {
    searchKeyword,
    targetDomainHint,
    buttonText,
    expectedPageNumber,
    waitTime,
    actionType: "GOOGLE_SEARCH_THEN_WAIT",
    confidence: 0.72,
    explanation: "Được phân tích thành công bằng bộ lọc Heuristic NLP v3.0 tích hợp cục bộ trên Server.",
    source: "Local Heuristic NLP v3.0"
  };
}

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

  // API 1.5: Light AI analysis of shortlink text / HTML structure (new in 3.0.0 PRO)
  app.post("/api/gemini/analyze", async (req, res) => {
    const { html, url } = req.body;
    
    if (!html || typeof html !== "string") {
      res.status(400).json({ error: "Yêu cầu cung cấp nội dung HTML hoặc văn bản trang." });
      return;
    }

    console.log(`[AI Analyzer] Received request to analyze content (Length: ${html.length} chars). URL: ${url || "unknown"}`);
    
    // Check if we can use OpenRouter or Gemini SDK
    if (isOpenRouter && apiKey) {
      try {
        console.log("[OpenRouter] Calling OpenRouter endpoint with model google/gemini-2.5-flash...");
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://ai.studio/build",
            "X-Title": "Bypass Shortlink Pro"
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: "You are a cybersecurity expert and expert DOM scraper for a Vietnamese browser extension link-unblocker. " +
                  "Your job is to read the provided text or HTML content from a Vietnamese shortlink verification page " +
                  "and automatically extract metadata instruction keywords. You must output a JSON object containing EXACTLY these keys: " +
                  "searchKeyword, targetDomainHint, expectedPageNumber, buttonText, waitTime, actionType, confidence, explanation. " +
                  "Return strictly JSON and nothing else."
              },
              {
                role: "user",
                content: `Analyze the following webpage content carefully:\n\n${html.slice(0, 15000)}`
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        const resData: any = await response.json();
        if (resData.error) {
          throw new Error(resData.error.message || JSON.stringify(resData.error));
        }

        const rawText = resData.choices[0].message.content;
        const parsed = JSON.parse(rawText.trim());
        res.json({
          success: true,
          ...parsed,
          source: "OpenRouter (Gemini 2.5 Flash)"
        });
        return;
      } catch (orError: any) {
        console.warn("[AI Analyzer] OpenRouter API failed or returned error, falling back to heuristics:", orError);
      }
    } else if (ai) {
      try {
        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            searchKeyword: {
              type: Type.STRING,
              description: "The Google Search keyword instructed on the shortlink page (e.g., 'five 88', 'tải game', 'cakhiatv').",
            },
            targetDomainHint: {
              type: Type.STRING,
              description: "The specific website target domain name or hint (e.g., 'afq.com' or 'cakhiatv9.com').",
            },
            buttonText: {
              type: Type.STRING,
              description: "The exact or nearest text of the button to click for code generation (e.g., 'LÀM LẤY MẪN', 'LẤY MÃ').",
            },
            expectedPageNumber: {
              type: Type.INTEGER,
              description: "Expected google search results page number to browse, default to 2.",
            },
            waitTime: {
              type: Type.INTEGER,
              description: "Amount of countdown wait time in seconds defined in the instructions, default to 59 or 60.",
            },
            actionType: {
              type: Type.STRING,
              description: "Detected interaction pathway. MUST be one of: 'GOOGLE_SEARCH_THEN_WAIT', 'DIRECT_CLICK_AND_WAIT', or 'UNSUPPORTED'.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence level between 0.0 and 1.0.",
            },
            explanation: {
              type: Type.STRING,
              description: "A friendly 1-2 sentence explanation in Vietnamese detailing why this decision was made.",
            }
          },
          required: [
            "searchKeyword",
            "targetDomainHint",
            "buttonText",
            "expectedPageNumber",
            "waitTime",
            "actionType",
            "confidence",
            "explanation"
          ]
        };

        const systemInstruction = 
          "You are a cybersecurity expert and expert DOM scraper for a Vietnamese browser extension link-unblocker. " +
          "Your job is to read the provided text or HTML content from a Vietnamese shortlink verification page, " +
          "and automatically extract metadata instruction keywords. Often, these pages prompt users with instructions " +
          "like 'Bước 1: Lên google tìm từ khóa cakhiatv', 'Bước 2: Tìm trang web cakhiatv9.com', 'Bước 3: Click lấy mã LÀM LẤY MẪN'. " +
          "You must correctly identify: " +
          "1. 'searchKeyword' (the raw keyword to put into google search). " +
          "2. 'targetDomainHint' (the domain of the target blog website). " +
          "3. 'buttonText' (the exact text that label the unblocking button inside the target site, e.g., 'LÀM LẤY MẪN' or 'CLICK LẤY MÃ'). " +
          "If the content doesn't specify a page, default expectedPageNumber to 2. If it doesn't specify a wait time, default waitTime to 59. " +
          "Return your response strictly conforming to the requested JSON formats.";

        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Analyze the following webpage content carefully:\n\n${html.slice(0, 15000)}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.1,
          }
        });

        const jsonText = result.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText.trim());
          res.json({
            success: true,
            ...parsed,
            source: "Gemini AI 3.5"
          });
          return;
        }
      } catch (gemError: any) {
        console.warn("[AI Analyzer] Gemini API failed or returned error, falling back to heuristics:", gemError);
      }
    }

    // Fallback to Heuristic engine if Gemini is disabled or crashed
    const fallbackVal = runHeuristicAnalysis(html);
    res.json({
      success: true,
      ...fallbackVal
    });
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
