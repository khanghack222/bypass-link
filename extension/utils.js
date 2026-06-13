// Extension utility helpers for Bypass Shortlink Việt Nam

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
    // Keep last 100 bypass items
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

// Global configuration status
function isExtensionEnabled(callback) {
  chrome.storage.local.get({ enabled: true }, (data) => {
    callback(data.enabled !== false);
  });
}
