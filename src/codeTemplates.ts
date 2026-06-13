export const extensionFiles = {
  "manifest.json": `{
  "manifest_version": 3,
  "name": "Bypass Shortlink Việt Nam",
  "version": "1.0.0",
  "description": "Tự động phát hiện và chuyển hướng các link rút gọn phổ biến tại Việt Nam và Quốc tế về link gốc.",
  "permissions": [
    "storage",
    "webNavigation",
    "tabs",
    "activeTab"
  ],
  "host_permissions": [
    "*://*.bitly.com/*",
    "*://*.bitly.com.vn/*",
    "*://*.by.com.vn/*",
    "*://*.tinyurl.com/*",
    "*://*.tinyurl.com.vn/*",
    "*://*.new.tinyurl.com.vn/*",
    "*://*.rutgonlink.vn/*",
    "*://*.rut.vn/*",
    "*://*.go2.vn/*",
    "*://*.bom.so/*",
    "*://*.vnlink.top/*",
    "*://*.shorturl.at/*",
    "*://*.is.gd/*",
    "*://*.tiny.cc/*",
    "*://*.cutt.ly/*",
    "*://*.ow.ly/*",
    "*://*.rebrandly.com/*",
    "*://*.t.ly/*",
    "*://*.link1s.com/*",
    "*://*.link1s.me/*",
    "*://*.megaurl.in/*",
    "*://*.mmo1s.com/*",
    "*://*.nghienlink.com/*",
    "*://*.droplink.co/*",
    "*://*.123link.co/*",
    "*://*.linktot.net/*",
    "*://*.traffic68.com/*",
    "*://*.trafficvn.com/*",
    "*://*.link1m.com/*",
    "*://*.link5s.com/*",
    "*://*.ron.vn/*",
    "*://*.tinyvn.com/*",
    "*://*.adf.ly/*",
    "*://*.shrtfly.com/*",
    "*://*.clicksfly.com/*",
    "*://*.shrinkme.io/*",
    "*://*.shrinkearn.com/*",
    "*://*.exe.io/*",
    "*://*.exey.io/*",
    "*://*.mitly.us/*",
    "*://*.clk.sh/*",
    "*://*.cuty.io/*",
    "*://*.ouo.io/*",
    "*://*.ouo.press/*",
    "*://*.shorte.st/*",
    "*://*.linkvertise.com/*",
    "*://*.linkvertise.net/*",
    "*://*.fas.li/*",
    "*://*.adpaylink.com/*",
    "*://*.smoner.com/*",
    "*://*.vb.lk/*",
    "*://*.bioqr.top/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": [
        "*://*.link1s.com/*",
        "*://*.link1s.me/*",
        "*://*.megaurl.in/*",
        "*://*.mmo1s.com/*",
        "*://*.nghienlink.com/*",
        "*://*.droplink.co/*",
        "*://*.123link.co/*",
        "*://*.linktot.net/*",
        "*://*.traffic68.com/*",
        "*://*.trafficvn.com/*",
        "*://*.link1m.com/*",
        "*://*.link5s.com/*",
        "*://*.ron.vn/*",
        "*://*.tinyvn.com/*",
        "*://*.adf.ly/*",
        "*://*.shrtfly.com/*",
        "*://*.clicksfly.com/*",
        "*://*.shrinkme.io/*",
        "*://*.shrinkearn.com/*",
        "*://*.exe.io/*",
        "*://*.exey.io/*",
        "*://*.mitly.us/*",
        "*://*.clk.sh/*",
        "*://*.cuty.io/*",
        "*://*.ouo.io/*",
        "*://*.ouo.press/*",
        "*://*.shorte.st/*",
        "*://*.linkvertise.com/*",
        "*://*.linkvertise.net/*",
        "*://*.fas.li/*",
        "*://*.adpaylink.com/*",
        "*://*.smoner.com/*",
        "*://*.vb.lk/*",
        "*://*.bioqr.top/*"
      ],
      "js": [
        "utils.js",
        "content.js"
      ],
      "run_at": "document_end"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`,

  "utils.js": `// Extension utility helpers for Bypass Shortlink Việt Nam

const BYPASS_DOMAINS_GROUP1 = [
  "bitly.com", "bitly.com.vn", "by.com.vn", "tinyurl.com", "tinyurl.com.vn",
  "new.tinyurl.com.vn", "rutgonlink.vn", "rut.vn", "go2.vn", "bom.so", "vnlink.top",
  "shorturl.at", "is.gd", "tiny.cc", "cutt.ly", "ow.ly", "rebrandly.com", "t.ly"
];

const BYPASS_DOMAINS_GROUP2 = [
  "link1s.com", "link1s.me", "megaurl.in", "mmo1s.com", "nghienlink.com",
  "droplink.co", "123link.co", "linktot.net", "traffic68.com", "trafficvn.com",
  "link1m.com", "link5s.com", "ron.vn", "tinyvn.com",
  "adf.ly", "shrtfly.com", "clicksfly.com", "shrinkme.io", "shrinkearn.com",
  "exe.io", "exey.io", "mitly.us", "clk.sh", "cuty.io", "ouo.io", "ouo.press", "shorte.st",
  "linkvertise.com", "linkvertise.net", "fas.li", "adpaylink.com", "smoner.com",
  "vb.lk", "bioqr.top"
];

function getDomainName(urlStr) {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace('www.', '');
  } catch (e) {
    return "";
  }
}

function logBypass(shortUrl, targetUrl, method) {
  const timestamp = new Date().toLocaleString('vi-VN');
  chrome.storage.local.get({ history: [], logsCount: 0 }, (data) => {
    let history = data.history || [];
    history.unshift({
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      shortUrl,
      targetUrl,
      method,
      timestamp
    });
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    chrome.storage.local.set({ 
      history, 
      logsCount: (data.logsCount || 0) + 1 
    });
  });
}

function isExtensionEnabled(callback) {
  chrome.storage.local.get({ enabled: true }, (data) => {
    callback(data.enabled !== false);
  });
}`,

  "background.js": `// Background script (Service Worker) for Bypass Shortlink Việt Nam
importScripts('utils.js');

// Listener for automatic redirect check (Group 1 domains)
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
  chrome.storage.local.set({ statusMessage: "Đang giải mã link rút gọn nhóm 1..." });

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
        const metaMatch = html.match(/meta\\s+http-equiv=["']refresh["']\\s+content=["']\\d+;\\s*url=(.*?)["']/i);
        if (metaMatch && metaMatch[1]) {
          const dest = metaMatch[1].trim().replace(/['"]/g, "");
          finalizeBypass(shortUrl, dest, tabId, "Meta HTML Refresh Sniffing");
        } else {
          const jsMatch = html.match(/window\\.location(?:\\.href)?\\s*=\\s*["'](.*?)["']/i) || html.match(/location\\s*=\\s*["'](.*?)["']/i);
          if (jsMatch && jsMatch[1]) {
            finalizeBypass(shortUrl, jsMatch[1], tabId, "JS Location Sniffing");
          } else {
            chrome.storage.local.set({ statusMessage: "Không tìm thấy redirect HTTP, kiểm tra DOM..." });
          }
        }
      });
    }
  })
  .catch(err => {
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

  if (getDomainName(resolvedUrl) === getDomainName(shortUrl)) {
    chrome.storage.local.set({ statusMessage: "Gặp chuyển hướng lặp, vui lòng nhấp thủ công hoặc bỏ qua." });
    return;
  }

  logBypass(shortUrl, resolvedUrl, method);
  
  chrome.tabs.update(tabId, { url: resolvedUrl }, () => {
    chrome.storage.local.set({ statusMessage: \`Bypass thành công! -> \${getDomainName(resolvedUrl)}\` });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "logBypassSuccess") {
    const tabId = sender.tab ? sender.tab.id : null;
    logBypass(request.shortUrl, request.targetUrl, request.method);
    if (tabId) {
      chrome.tabs.update(tabId, { url: request.targetUrl });
    }
    sendResponse({ success: true });
  } else if (request.action === "forceBypassTab") {
    resolveGroup1Redirect(request.url, request.tabId);
    sendResponse({ success: true });
  }
  return true;
});`,

  "content.js": `// Content script for complex Group 2 shortlink sites
(function() {
  const currentUrl = window.location.href;
  const currentDomain = window.location.hostname.replace('www.', '');

  chrome.storage.local.get({ enabled: true }, (settings) => {
    if (!settings.enabled) return;
    initiateAutoBypass();
  });

  function initiateAutoBypass() {
    checkForCaptcha();
    const intervalId = setInterval(() => {
      domProcessingAutomation();
    }, 1000);
    setTimeout(() => { clearInterval(intervalId); }, 60000);
  }

  function checkForCaptcha() {
    const hasReCaptcha = document.querySelector('iframe[src*="recaptcha"]');
    const hasHCaptcha = document.querySelector('iframe[src*="hcaptcha"]') || document.querySelector('.h-captcha');
    const hasTurnstile = document.querySelector('iframe[src*="challenges.cloudflare.com"]');

    if (hasReCaptcha || hasHCaptcha || hasTurnstile) {
      chrome.storage.local.set({ 
        statusMessage: "Phát hiện Captcha! Bạn hãy tự giải Captcha trên trang để tiếp tục nhé." 
      });
    }
  }

  function domProcessingAutomation() {
    if (detectSpecialShortenerRedirects()) {
      return;
    }

    const triggerSelectors = [
      '#getlink', '#btn-getlink', '.btn-getlink', 
      '#go-link', '#gotolink', '#go-to-link',
      'a.get-link', 'button.get-link', 'a#btn-getlink',
      '#landing', '#continue', '.continue-btn',
      'a[href*="getlink"]', 'a[href*="gotolink"]'
    ];

    for (const selector of triggerSelectors) {
      const element = document.querySelector(selector);
      if (element && isVisible(element)) {
        const href = element.getAttribute('href');
        if (href && href !== '#' && href.startsWith('http') && !href.includes(currentDomain)) {
          triggerSuccessBypass(href, "Direct Button Sniffer");
          return;
        }
        element.click();
        return;
      }
    }

    const VietnameseTextKeywords = [
      "lấy link", "lay link", "tiếp tục", "tiep tuc", "nhấp vào đây để tiếp tục", 
      "click vào đây để tiếp tục", "mở liên kết", "nhấp vào đây", "xác minh"
    ];
    const EnglishTextKeywords = [
      "get link", "continue", "click here to continue", "skip ad", "skip", 
      "proceed", "destination", "verify"
    ];

    const allButtonsAndAnchors = document.querySelectorAll('a, button, div[role="button"], span');
    for (const elem of allButtonsAndAnchors) {
      const text = elem.textContent ? elem.textContent.trim().toLowerCase() : "";
      if (!text) continue;

      const isVietnameseMatch = VietnameseTextKeywords.some(keyword => text === keyword || text.includes(keyword));
      const isEnglishMatch = EnglishTextKeywords.some(keyword => text === keyword || text.includes(keyword));

      if ((isVietnameseMatch || isEnglishMatch) && isVisible(elem)) {
        if (elem.tagName === 'A') {
          const href = elem.getAttribute('href');
          if (href && href !== '#' && href.startsWith('http') && !href.includes(currentDomain)) {
            triggerSuccessBypass(href, "Text Keyword Redirection Sniffer");
            return;
          }
        }
        elem.click();
        return;
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
      if (value.length > 20 && (key === 'url' || key === 'link' || key === 'dest' || key === 'target')) {
        try {
          const decoded = atob(value);
          if (decoded.startsWith('http')) {
            triggerSuccessBypass(decoded, "URL Query Base64 Decoder");
            return;
          }
        } catch (e) {
          if (value.startsWith('http')) {
            triggerSuccessBypass(value, "URL Query Literal Redirector");
            return;
          }
        }
      }
    }
  }

  function detectSpecialShortenerRedirects() {
    if (currentDomain.includes('ouo.io') || currentDomain.includes('ouo.press')) {
      const form = document.querySelector('form#form-captcha');
      if (form) {
        form.submit();
        return true;
      }
      const goForm = document.querySelector('form[action*="go-to-link"]');
      if (goForm) {
        goForm.submit();
        return true;
      }
    }

    if (currentDomain.includes('linkvertise.com') || currentDomain.includes('linkvertise.net')) {
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const text = script.textContent || "";
        const match = text.match(/"targetUrl"\\s*:\\s*"([^"]+)"/);
        if (match && match[1]) {
          const target = match[1].replace(/\\\\/g, '');
          triggerSuccessBypass(target, "Linkvertise JSON sniffer");
          return true;
        }
      }
    }

    if (currentDomain.includes('adf.ly')) {
      const skipBtn = document.getElementById('skip_buutton') || document.querySelector('.skip');
      if (skipBtn) {
        skipBtn.click();
        return true;
      }
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent;
        if (content && content.includes('var ysmm =')) {
          const ysmmMatch = content.match(/var\\s+ysmm\\s*=\\s*['"](.*?)['"]/);
          if (ysmmMatch && ysmmMatch[1]) {
            const decoded = decodeAdflyYsmm(ysmmMatch[1]);
            if (decoded) {
              triggerSuccessBypass(decoded, "Adf.ly ysmm Decoder");
              return true;
            }
          }
        }
      }
    }

    if (currentDomain.includes('link1s') || currentDomain.includes('megaurl') || currentDomain.includes('link5s')) {
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const text = script.textContent || "";
        const m = text.match(/target_url\\s*=\\s*['"](.*?)['"]/);
        if (m && m[1]) {
          triggerSuccessBypass(m[1], "Domestic window.target_url variable");
          return true;
        }
      }
    }
    return false;
  }

  function decodeAdflyYsmm(ysmm) {
    let f = '', b = '';
    for (let i = 0; i < ysmm.length; i++) {
      if (i % 2 === 0) f += ysmm.charAt(i);
      else b = ysmm.charAt(i) + b;
    }
    ysmm = f + b;
    const r = ysmm.split('');
    for (let i = 0; i < r.length; i++) {
      if (!isNaN(r[i])) {
        for (let j = i + 1; j < r.length; j++) {
          if (!isNaN(r[j])) {
            const S = r[i] ^ r[j];
            if (S < 10) r[i] = S;
            i = j;
            break;
          }
        }
      }
    }
    ysmm = r.join('');
    ysmm = atob(ysmm);
    ysmm = ysmm.substring(ysmm.indexOf('http'));
    return ysmm;
  }

  function triggerSuccessBypass(target, method) {
    chrome.runtime.sendMessage({
      action: "logBypassSuccess",
      shortUrl: currentUrl,
      targetUrl: target,
      method: method
    });
  }

  function isVisible(el) {
    const style = window.getComputedStyle(el);
    return (style.opacity !== '0' && style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0);
  }
})();`,

  "popup.html": `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bypass Shortlink Việt Nam</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-area">
        <span class="icon-emoji">⚡</span>
        <div>
          <h2>Bypass Shortlink</h2>
          <span class="subtext">Phiên bản 1.0.0 (Việt Nam & Quốc tế)</span>
        </div>
      </div>
      <label class="switch">
        <input type="checkbox" id="power-toggle" checked>
        <span class="slider round"></span>
      </label>
    </div>

    <div class="status-banner" id="status-banner">
      <span class="bullet active"></span>
      <span class="status-text" id="status-text">Đang bảo vệ (Bộ lọc bật)</span>
    </div>

    <div class="actions">
      <button class="btn btn-primary" id="bypass-current-btn">
        <span>⚡</span> Bypass trang hiện tại
      </button>
      <button class="btn btn-secondary" id="clear-history-btn">
        Dọn lịch sử
      </button>
    </div>

    <div class="tab-section">
      <div class="tab-header">
        <span class="tab-title">Lịch sử Bypass gần đây</span>
        <span class="badge" id="bypass-counter">0</span>
      </div>
      <div class="history-list" id="history-container">
        <div class="empty-state">
          Chưa bypass link nào. Khi bạng duy chuyển qua shortlink, link gốc sẽ tự động xuất hiện ở đây!
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Hỗ trợ hơn 45+ trang shortlink phổ biến ở Việt Nam và quốc tế.</p>
      <p style="margin-top: 4px; font-weight: bold; color: #10b981;">Tự động, an toàn, bảo mật tuyệt đối.</p>
    </div>
  </div>
  <script src="utils.js"></script>
  <script src="popup.js"></script>
</body>
</html>`,

  "popup.css": `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  width: 340px;
  margin: 0;
  padding: 12px;
  background-color: #f3f4f6;
  color: #1f2937;
  font-size: 13px;
  box-sizing: border-box;
}
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 14px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}
.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-emoji { font-size: 24px; }
.header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
.subtext { font-size: 10px; color: #6b7280; }
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #d1d5db;
  transition: .3s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px; width: 16px;
  left: 4px; bottom: 4px;
  background-color: white;
  transition: .3s;
}
input:checked + .slider { background-color: #10b981; }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }

.status-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 8px 10px;
  margin: 12px 0;
}
.status-banner.disabled {
  background: #fef2f2;
  border: 1px solid #fecaca;
}
.bullet {
  height: 8px; width: 8px;
  border-radius: 50%;
  display: inline-block;
  background-color: #10b981;
}
.bullet.inactive { background-color: #ef4444; }
.status-text { font-weight: 600; color: #15803d; font-size: 11px; }
.status-banner.disabled .status-text { color: #b91c1c; }

.actions { display: flex; gap: 8px; margin-bottom: 12px; }
.btn {
  flex: 1; padding: 8px 12px;
  border: none; border-radius: 6px;
  font-weight: 600; font-size: 12px;
  cursor: pointer;
}
.btn-primary { background-color: #3b82f6; color: white; }
.btn-secondary { background-color: #e5e7eb; color: #4b5563; }
.tab-section { border-top: 1px solid #e5e7eb; padding-top: 10px; }
.tab-header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 8px;
}
.tab-title { font-weight: 600; color: #374151; font-size: 12px; }
.badge {
  background: #eff6ff; color: #1d4ed8;
  padding: 2px 8px; border-radius: 12px;
  font-weight: bold; font-size: 10px;
}
.history-list {
  max-height: 180px; overflow-y: auto;
  border: 1px solid #f3f4f6; border-radius: 8px;
  padding: 4px; background: #fafafa;
}
.empty-state {
  color: #9cb3c9; text-align: center;
  padding: 24px 8px; font-size: 11px;
}
.history-item {
  display: flex; flex-direction: column;
  padding: 6px 8px; border-bottom: 1px solid #f3f4f6; gap: 2px;
}
.history-header { display: flex; justify-content: space-between; }
.domain-badge { font-weight: bold; font-size: 10px; color: #2563eb; }
.time-stamp { font-size: 9px; color: #9ca3af; }
.url-line {
  white-space: nowrap; text-overflow: ellipsis;
  overflow: hidden; font-size: 11px;
}
.method-tag {
  font-size: 8px; background-color: #f3f4f6;
  color: #6b7280; align-self: flex-start;
  padding: 1px 4px; border-radius: 4px;
}
.footer {
  margin-top: 12px; padding-top: 10px;
  border-top: 1px solid #e5e7eb; text-align: center;
  font-size: 10px; color: #9ca3af;
}
.footer p { margin: 0; }`,

  "popup.js": `document.addEventListener('DOMContentLoaded', () => {
  const powerToggle = document.getElementById('power-toggle');
  const statusBanner = document.getElementById('status-banner');
  const statusText = document.getElementById('status-text');
  const bullet = statusBanner.querySelector('.bullet');
  const bypassCurrentBtn = document.getElementById('bypass-current-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const historyContainer = document.getElementById('history-container');
  const bypassCounter = document.getElementById('bypass-counter');

  chrome.storage.local.get({ enabled: true, history: [], statusMessage: null }, (data) => {
    powerToggle.checked = data.enabled !== false;
    updateStatusUI(data.enabled !== false, data.statusMessage);
    renderHistory(data.history || []);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.history) {
        renderHistory(changes.history.newValue || []);
      }
      if (changes.statusMessage) {
        updateStatusUI(powerToggle.checked, changes.statusMessage.newValue);
      }
    }
  });

  powerToggle.addEventListener('change', () => {
    const isEnabled = powerToggle.checked;
    chrome.storage.local.set({ enabled: isEnabled });
    updateStatusUI(isEnabled, null);
  });

  bypassCurrentBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) return;
      const activeTab = tabs[0];
      const activeUrl = activeTab.url;

      if (!activeUrl || (!activeUrl.startsWith('http://') && !activeUrl.startsWith('https://'))) {
        alert("Bypass chỉ có hiệu lực trên các liên kết web (http/https).");
        return;
      }

      updateStatusUI(true, "Đang cưỡng chế giải mã trang này...");

      chrome.runtime.sendMessage({
        action: "forceBypassTab",
        url: activeUrl,
        tabId: activeTab.id
      });
    });
  });

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử bypass không?")) {
      chrome.storage.local.set({ history: [], logsCount: 0 }, () => {
        renderHistory([]);
      });
    }
  });

  function updateStatusUI(enabled, customMessage) {
    if (enabled) {
      statusBanner.classList.remove('disabled');
      bullet.classList.remove('inactive');
      statusText.textContent = customMessage || "Đang bảo vệ (Bộ lọc bật)";
    } else {
      statusBanner.classList.add('disabled');
      bullet.classList.add('inactive');
      statusText.textContent = "Bảo vệ đang tắt";
    }
  }

  function renderHistory(history) {
    bypassCounter.textContent = history.length;
    if (history.length === 0) {
      historyContainer.innerHTML = \`<div class="empty-state">Chưa bypass link nào. Khi bạng duy chuyển qua shortlink, link gốc sẽ tự động xuất hiện ở đây!</div>\`;
      return;
    }

    let html = '';
    history.forEach((item) => {
      const shortDomain = getDomainName(item.shortUrl);
      const targetDomain = getDomainName(item.targetUrl);
      html += \`
        <div class="history-item">
          <div class="history-header">
            <span class="domain-badge">\${shortDomain} ➜ \${targetDomain || 'Link gốc'}</span>
            <span class="time-stamp">\${item.timestamp || ''}</span>
          </div>
          <div class="url-line">
            <a href="\${item.targetUrl}" target="_blank" style="color: #3b82f6; text-decoration: none;">\${item.targetUrl}</a>
          </div>
          <div class="method-tag">\${item.method || 'Bypass tự động'}</div>
        </div>\`;
    });
    historyContainer.innerHTML = html;
  }
});`
};
