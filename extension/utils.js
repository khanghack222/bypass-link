// Extension utility helpers for Bypass Shortlink Việt Nam Pro 2.2.0
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
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    chrome.storage.local.set({ 
      history, 
      logsCount: (data.logsCount || 0) + 1 
    });
  });
}

function pushRealtimeLog(message, type = 'info') {
  const time = new Date().toLocaleTimeString('vi-VN');
  chrome.storage.local.get({ runningLogs: [] }, (data) => {
    const logs = data.runningLogs || [];
    logs.push({ text: `[${time}] ${message}`, type, timestamp: Date.now() });
    if (logs.length > 100) logs.shift();
    chrome.storage.local.set({ runningLogs: logs });
  });
}

function isExtensionEnabled(callback) {
  chrome.storage.local.get({ enabled: true }, (data) => {
    callback(data.enabled !== false);
  });
}

function removeAccents(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}
