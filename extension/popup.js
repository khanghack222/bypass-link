document.addEventListener('DOMContentLoaded', () => {
  const powerToggle = document.getElementById('power-toggle');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const historyContainer = document.getElementById('history-container');
  const bypassCounter = document.getElementById('bypass-counter');
  const realtimeLog = document.getElementById('realtime-log');
  const bypassCurrentBtn = document.getElementById('bypass-current-btn');

  // New configuration elements (V2.2.0)
  const scanKeywordInput = document.getElementById('scan-keyword');
  const scanTargetDomainInput = document.getElementById('scan-target-domain');
  const scanPageInput = document.getElementById('scan-page');
  const scanButtonTextInput = document.getElementById('scan-button-text');
  const scanWaitTimeInput = document.getElementById('scan-wait-time');
  const startScanBtn = document.getElementById('start-scan-btn');
  const stopScanBtn = document.getElementById('stop-scan-btn');
  const statusBadge = document.getElementById('status-badge');

  // Load state and inputs on popup startup
  chrome.storage.local.get({
    enabled: true,
    history: [],
    runningLogs: [],
    scanKeyword: "five 88",
    scanTargetDomain: "afq.com",
    scanPage: 2,
    scanButtonText: "LÀM LẤY MẪN",
    scanWaitTime: 59,
    scanActive: false
  }, (data) => {
    powerToggle.checked = data.enabled !== false;
    
    // Fill configuration inputs
    scanKeywordInput.value = data.scanKeyword;
    scanTargetDomainInput.value = data.scanTargetDomain;
    scanPageInput.value = data.scanPage;
    scanButtonTextInput.value = data.scanButtonText;
    scanWaitTimeInput.value = data.scanWaitTime;

    // Set engine scanning controls
    updateScannerUI(data.scanActive);

    renderHistory(data.history || []);
    renderLogs(data.runningLogs || []);
  });

  // Track any live configuration modifications and persist them
  const inputsToSave = [
    { el: scanKeywordInput, key: 'scanKeyword' },
    { el: scanTargetDomainInput, key: 'scanTargetDomain' },
    { el: scanPageInput, key: 'scanPage', isNum: true },
    { el: scanButtonTextInput, key: 'scanButtonText' },
    { el: scanWaitTimeInput, key: 'scanWaitTime', isNum: true }
  ];

  inputsToSave.forEach(item => {
    item.el.addEventListener('input', () => {
      const val = item.isNum ? parseInt(item.el.value) || 1 : item.el.value;
      const patch = {};
      patch[item.key] = val;
      chrome.storage.local.set(patch);
    });
  });

  // Action listeners for Scan controllers
  startScanBtn.addEventListener('click', () => {
    const config = {
      scanKeyword: scanKeywordInput.value || "five 88",
      scanTargetDomain: scanTargetDomainInput.value || "afq.com",
      scanPage: parseInt(scanPageInput.value) || 2,
      scanButtonText: scanButtonTextInput.value || "LÀM LẤY MẪN",
      scanWaitTime: parseInt(scanWaitTimeInput.value) || 59,
      scanActive: true,
      awaitingBlogCode: false
    };

    chrome.storage.local.set(config, () => {
      chrome.runtime.sendMessage({ action: "startAutoScan" });
    });
  });

  stopScanBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "stopAutoScan" });
  });

  // Dynamic storage updates sync
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.history) {
        renderHistory(changes.history.newValue || []);
      }
      if (changes.runningLogs) {
        renderLogs(changes.runningLogs.newValue || []);
      }
      if (changes.scanActive) {
        updateScannerUI(changes.scanActive.newValue);
      }
    }
  });

  function updateScannerUI(isActive) {
    if (isActive) {
      statusBadge.textContent = "Đang quét...";
      statusBadge.className = "badge-scanning";
      
      startScanBtn.disabled = true;
      stopScanBtn.disabled = false;

      // Lock inputs during active scanning sequence
      scanKeywordInput.disabled = true;
      scanTargetDomainInput.disabled = true;
      scanPageInput.disabled = true;
      scanButtonTextInput.disabled = true;
      scanWaitTimeInput.disabled = true;
    } else {
      statusBadge.textContent = "Đang chờ...";
      statusBadge.className = "badge-idle";

      startScanBtn.disabled = false;
      stopScanBtn.disabled = true;

      // Free inputs
      scanKeywordInput.disabled = false;
      scanTargetDomainInput.disabled = false;
      scanPageInput.disabled = false;
      scanButtonTextInput.disabled = false;
      scanWaitTimeInput.disabled = false;
    }
  }

  powerToggle.addEventListener('change', () => {
    const isEnabled = powerToggle.checked;
    chrome.storage.local.set({ enabled: isEnabled });
    pushRealtimeLog(isEnabled ? "Bật bộ lọc bảo vệ bypass tự động." : "Tắt bộ lọc bypass.", isEnabled ? 'success' : 'warn');
  });

  bypassCurrentBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) return;
      const activeTab = tabs[0];
      const activeUrl = activeTab.url;

      if (!activeUrl || (!activeUrl.startsWith('http://') && !activeUrl.startsWith('https://'))) {
        alert("Bypass chỉ hoạt động trên các liên kết HTTP/HTTPS!");
        return;
      }

      chrome.runtime.sendMessage({
        action: "forceBypassTab",
        url: activeUrl,
        tabId: activeTab.id
      });
    });
  });

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm("Xóa lịch sử và dọn dẹp bộ nhớ đệm log?")) {
      chrome.storage.local.set({ 
        history: [], 
        runningLogs: [], 
        retrievedCode: null, 
        searchKeyword: null, 
        searchTargetDomain: null,
        scanActive: false
      }, () => {
        renderHistory([]);
        realtimeLog.innerHTML = `<div class="log-item type-info">[00:00:00] Đã xóa toàn bộ log hoạt động.</div>`;
      });
    }
  });

  function renderLogs(logs) {
    if (logs.length === 0) return;
    let html = '';
    logs.slice(-35).forEach(item => { // Hiển thị 35 dòng log mới nhất
      html += `<div class="log-item type-${item.type || 'info'}">${item.text}</div>`;
    });
    realtimeLog.innerHTML = html;
    realtimeLog.scrollTop = realtimeLog.scrollHeight; // Auto scroll xuống bottom
  }

  function renderHistory(history) {
    bypassCounter.textContent = history.length;
    if (history.length === 0) {
      historyContainer.innerHTML = `<div class="empty-state">Chưa vượt link nào trong phiên này.</div>`;
      return;
    }

    let html = '';
    history.forEach((item) => {
      const shortDomain = getDomainName(item.shortUrl);
      const targetDomain = getDomainName(item.targetUrl);
      html += `
        <div class="history-item">
          <div class="history-header">
            <span class="domain-badge">${shortDomain} ➜ ${targetDomain || 'Link đích'}</span>
            <span class="time-stamp">${item.timestamp || ''}</span>
          </div>
          <div class="url-line">
            <a href="${item.targetUrl}" target="_blank" style="color: #3b82f6; text-decoration: none;">${item.targetUrl}</a>
          </div>
          <div class="method-tag">${item.method || 'Mã tự động'}</div>
        </div>`;
    });
    historyContainer.innerHTML = html;
  }
});
