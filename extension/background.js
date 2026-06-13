// Background script (Service Worker) for Bypass Shortlink Việt Nam Pro
importScripts('utils.js');

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;

  const url = details.url;
  const domain = getDomainName(url);

  isExtensionEnabled((enabled) => {
    if (!enabled) return;

    const isInGroup1 = BYPASS_DOMAINS_GROUP1.some(d => domain === d || domain.endsWith('.' + d));
    if (isInGroup1) {
      resolveGroup1Redirect(url, details.tabId);
    }
  });
});

function resolveGroup1Redirect(shortUrl, tabId) {
  pushRealtimeLog(`Đang sniff HTTP Redirect cho nhóm 1: ${getDomainName(shortUrl)}`, 'info');
  chrome.storage.local.set({ statusMessage: "Đang giải mã link nhóm 1..." });

  fetch(shortUrl, {
    method: 'GET',
    redirect: 'manual'
  })
  .then(response => {
    const location = response.headers.get('location');
    if (location) {
      finalizeBypass(shortUrl, location, tabId, "HTTP Redirect Sniffing");
    } else {
      return response.text().then(html => {
        const metaMatch = html.match(/meta\s+http-equiv=["']refresh["']\s+content=["']\d+;\s*url=(.*?)["']/i);
        if (metaMatch && metaMatch[1]) {
          const dest = metaMatch[1].trim().replace(/['"]/g, "");
          finalizeBypass(shortUrl, dest, tabId, "Meta HTML Refresh Sniffing");
        } else {
          const jsMatch = html.match(/window\.location(?:\.href)?\s*=\s*["'](.*?)["']/i) || html.match(/location\s*=\s*["'](.*?)["']/i);
          if (jsMatch && jsMatch[1]) {
            finalizeBypass(shortUrl, jsMatch[1], tabId, "JS Location Sniffing");
          } else {
            pushRealtimeLog(`Không tìm thấy redirect HTTP cho ${getDomainName(shortUrl)}, hãy kiểm tra DOM nhé.`, 'warn');
          }
        }
      });
    }
  })
  .catch(err => {
    pushRealtimeLog(`Lỗi kết bối sniffing: ${err.message}`, 'error');
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

  logBypass(shortUrl, resolvedUrl, method);
  pushRealtimeLog(`Bypass thành công [${method}]: ${getDomainName(shortUrl)} ➔ ${getDomainName(resolvedUrl)}`, 'success');
  
  chrome.tabs.update(tabId, { url: resolvedUrl }, () => {
    chrome.storage.local.set({ statusMessage: `Bypass thành công! -> ${getDomainName(resolvedUrl)}` });
  });
}

// Lắng nghe tín hiệu từ Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "logBypassSuccess") {
    const tabId = sender.tab ? sender.tab.id : null;
    logBypass(request.shortUrl, request.targetUrl, request.method);
    pushRealtimeLog(`Vượt qua link thành công qua Content Script: ${getDomainName(request.targetUrl)}`, 'success');
    if (tabId) {
      chrome.tabs.update(tabId, { url: request.targetUrl });
    }
    sendResponse({ success: true });
  } else if (request.action === "openGoogleSearch") {
    // Mở Google Search để tìm và vượt link tự động
    pushRealtimeLog(`Mở tab Google Search tự động cho từ khóa: ${request.keyword}`, 'info');
    chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(request.keyword)}` });
    sendResponse({ success: true });
  } else if (request.action === "logFromContent") {
    pushRealtimeLog(request.message, request.logType || 'info');
    sendResponse({ success: true });
  }
  return true;
});
