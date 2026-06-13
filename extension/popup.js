document.addEventListener('DOMContentLoaded', () => {
  const powerToggle = document.getElementById('power-toggle');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const historyContainer = document.getElementById('history-container');
  const bypassCounter = document.getElementById('bypass-counter');
  const realtimeLog = document.getElementById('realtime-log');
  const bypassCurrentBtn = document.getElementById('bypass-current-btn');

  // Load ban đầu
  chrome.storage.local.get({ enabled: true, history: [], runningLogs: [] }, (data) => {
    powerToggle.checked = data.enabled !== false;
    renderHistory(data.history || []);
    renderLogs(data.runningLogs || []);
  });

  // Lắng nghe thay đổi của bộ nhớ cục bộ real-time
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.history) {
        renderHistory(changes.history.newValue || []);
      }
      if (changes.runningLogs) {
        renderLogs(changes.runningLogs.newValue || []);
      }
    }
  });

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

      pushRealtimeLog(`Yêu cầu cưỡng chế quét trang: ${activeUrl}`, 'info');
      chrome.runtime.sendMessage({
        action: "forceBypassTab",
        url: activeUrl,
        tabId: activeTab.id
      });
    });
  });

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm("Xóa lịch sử và dọn dẹp bộ nhớ đệm log?")) {
      chrome.storage.local.set({ history: [], runningLogs: [], retrievedCode: null, searchKeyword: null, searchTargetDomain: null }, () => {
        renderHistory([]);
        realtimeLog.innerHTML = `<div class="log-item type-info">[00:00:00] Đã xóa toàn bộ log hoạt động.</div>`;
      });
    }
  });

  function renderLogs(logs) {
    if (logs.length === 0) return;
    let html = '';
    logs.slice(-30).forEach(item => { // Hiển thị 30 dòng log mới nhất
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
