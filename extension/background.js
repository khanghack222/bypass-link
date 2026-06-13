// Background script (Service Worker) for Bypass Shortlink Việt Nam
importScripts('utils.js');

// Listener for automatic redirect check (Group 1 domains)
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only intercept main frame navigations
  if (details.frameId !== 0) return;

  const url = details.url;
  const domain = getDomainName(url);

  isExtensionEnabled((enabled) => {
    if (!enabled) return;

    // Check if it's in Group 1
    const isInGroup1 = BYPASS_DOMAINS_GROUP1.some(d => domain === d || domain.endsWith('.' + d));
    if (isInGroup1) {
      console.log(`[Bypass Shortlink] Intercepted Group 1 domain: ${domain}, checking redirect...`);
      resolveGroup1Redirect(url, details.tabId);
    }
  });
});

// Follow headers for simple redirects (Group 1)
function resolveGroup1Redirect(shortUrl, tabId) {
  // Update popup state that a bypass is in progress
  chrome.storage.local.set({ statusMessage: "Đang giải mã link rút gọn nhóm 1..." });

  fetch(shortUrl, {
    method: 'GET',
    redirect: 'manual'  // Prevent browser environment from auto-following the redirect completely
  })
  .then(response => {
    // Check if redirect headers exist
    const location = response.headers.get('location');
    if (location) {
      console.log(`[Bypass Shortlink] Found location header: ${location}`);
      finalizeBypass(shortUrl, location, tabId, "HTTP Redirect Sniffing");
    } else {
      // Some simple shorteners use HTML meta or JS redirect, let's read the body
      return response.text().then(html => {
        // Search for meta refresh
        const metaMatch = html.match(/meta\s+http-equiv=["']refresh["']\s+content=["']\d+;\s*url=(.*?)["']/i);
        if (metaMatch && metaMatch[1]) {
          const dest = metaMatch[1].trim().replace(/['"]/g, "");
          finalizeBypass(shortUrl, dest, tabId, "Meta HTML Refresh Sniffing");
        } else {
          // Search for absolute/relative location scripts
          const jsMatch = html.match(/window\.location(?:\.href)?\s*=\s*["'](.*?)["']/i) || html.match(/location\s*=\s*["'](.*?)["']/i);
          if (jsMatch && jsMatch[1]) {
            finalizeBypass(shortUrl, jsMatch[1], tabId, "JS Location Sniffing");
          } else {
            // Default check: if not redirected and we fetched successfully, let's just allow browser loading but attempt to extract
            chrome.storage.local.set({ statusMessage: "Không tìm thấy redirect HTTP trực tiếp, kiểm tra DOM..." });
          }
        }
      });
    }
  })
  .catch(err => {
    console.error("[Bypass Shortlink] Error sniffing Group 1 URL: ", err);
    chrome.storage.local.set({ statusMessage: "Lỗi kết nối khi giải mã link." });
  });
}

function finalizeBypass(shortUrl, targetUrl, tabId, method) {
  let resolvedUrl = targetUrl;
  if (resolvedUrl.startsWith('//')) {
    resolvedUrl = 'https:' + resolvedUrl;
  } else if (resolvedUrl.startsWith('/')) {
    try {
      const origin = new URL(shortUrl).origin;
      resolvedUrl = origin + resolvedUrl;
    } catch(e) {}
  }

  // Prevent circular infinite redirects
  if (getDomainName(resolvedUrl) === getDomainName(shortUrl)) {
    console.log("[Bypass Shortlink] Self-redirect detected. Halting auto-redirection.");
    chrome.storage.local.set({ statusMessage: "Gặp chuyển hướng lặp, vui lòng nhấp thủ công hoặc bỏ qua." });
    return;
  }

  console.log(`[Bypass Shortlink] Decoded successfully via ${method}: ${resolvedUrl}`);
  logBypass(shortUrl, resolvedUrl, method);
  
  // Navigate the tab to the parsed target URL
  chrome.tabs.update(tabId, { url: resolvedUrl }, () => {
    chrome.storage.local.set({ statusMessage: `Bypass thành công! -> ${getDomainName(resolvedUrl)}` });
  });
}

// IPC listener for messages from content script
chrome.runtime.onMessage.addMessageListener((request, sender, sendResponse) => {
  if (request.action === "logBypassSuccess") {
    const tabId = sender.tab ? sender.tab.id : null;
    logBypass(request.shortUrl, request.targetUrl, request.method);
    if (tabId) {
      chrome.tabs.update(tabId, { url: request.targetUrl });
    }
    sendResponse({ success: true });
  } else if (request.action === "forceBypassTab") {
    const tabId = request.tabId;
    const url = request.url;
    resolveGroup1Redirect(url, tabId);
    sendResponse({ success: true });
  }
  return true;
});
