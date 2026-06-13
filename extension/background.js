// Background script (Service Worker) for Bypass Shortlink Việt Nam Pro 2.2.0
importScripts('utils.js');

// On startup, load/verify default configurations to avoid empty inputs
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({
    enabled: true,
    scanKeyword: "five 88",
    scanPage: 2,
    scanTargetDomain: "afq.com",
    scanButtonText: "LÀM LẤY MẪN",
    scanWaitTime: 59,
    scanActive: false,
    history: [],
    runningLogs: []
  }, (data) => {
    chrome.storage.local.set(data);
    pushRealtimeLog("Bypass Shortlink Pro 2.2.0 Engine installed successfully.", "success");
  });
});

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
    pushRealtimeLog(`Lỗi kết nối sniffing: ${err.message}`, 'error');
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

// Lắng nghe tín hiệu từ Content Script và Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "logBypassSuccess") {
    const tabId = sender.tab ? sender.tab.id : null;
    logBypass(request.shortUrl, request.targetUrl, request.method);
    pushRealtimeLog(`Vượt qua link thành công: ${getDomainName(request.targetUrl)}`, 'success');
    if (tabId) {
      chrome.tabs.update(tabId, { url: request.targetUrl });
    }
    sendResponse({ success: true });
  } else if (request.action === "openGoogleSearch") {
    pushRealtimeLog(`Mở tab Google Search tự động cho từ khóa: ${request.keyword}`, 'info');
    chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(request.keyword)}` });
    sendResponse({ success: true });
  } else if (request.action === "logFromContent") {
    pushRealtimeLog(request.message, request.logType || 'info');
    sendResponse({ success: true });
  } else if (request.action === "forceBypassTab") {
    pushRealtimeLog(`Yêu cầu cưỡng chế quét trang: ${request.url}`, 'info');
    resolveGroup1Redirect(request.url, request.tabId);
    sendResponse({ success: true });
  } else if (request.action === "startAutoScan") {
    chrome.storage.local.get({
      scanKeyword: "five 88",
      scanPage: 2
    }, (data) => {
      pushRealtimeLog(`Bắt đầu chuỗi quét tự động cho từ khóa: "${data.scanKeyword}" (Hỗ trợ quét qua trang ${data.scanPage})`, 'success');
      
      // Khởi chạy tìm kiếm Google ở trang 1
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(data.scanKeyword)}`;
      chrome.tabs.create({ url: googleUrl }, (tab) => {
        chrome.storage.local.set({
          scanActive: true,
          awaitingBlogCode: false,
          currentGoogleTabId: tab.id
        });
      });
    });
    sendResponse({ success: true });
  } else if (request.action === "stopAutoScan") {
    chrome.storage.local.set({ scanActive: false, awaitingBlogCode: false });
    pushRealtimeLog("Đã dừng tiến trình quét tự động.", "warn");
    sendResponse({ success: true });
  }
  return true;
});
