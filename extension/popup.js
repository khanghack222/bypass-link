// Popup controller for Bypass Shortlink Việt Nam

document.addEventListener('DOMContentLoaded', () => {
  const powerToggle = document.getElementById('power-toggle');
  const statusBanner = document.getElementById('status-banner');
  const statusText = document.getElementById('status-text');
  const bullet = statusBanner.querySelector('.bullet');
  const bypassCurrentBtn = document.getElementById('bypass-current-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const historyContainer = document.getElementById('history-container');
  const bypassCounter = document.getElementById('bypass-counter');

  // Load active power toggle state
  chrome.storage.local.get({ enabled: true, history: [], statusMessage: null }, (data) => {
    powerToggle.checked = data.enabled !== false;
    updateStatusUI(data.enabled !== false, data.statusMessage);
    renderHistory(data.history || []);
  });

  // Observe active storage state modifications
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.history) {
        renderHistory(changes.history.newValue || []);
      }
      if (changes.statusMessage) {
        const isEnabled = powerToggle.checked;
        updateStatusUI(isEnabled, changes.statusMessage.newValue);
      }
    }
  });

  // Power Toggle handler
  powerToggle.addEventListener('change', () => {
    const isEnabled = powerToggle.checked;
    chrome.storage.local.set({ enabled: isEnabled });
    updateStatusUI(isEnabled, null);
  });

  // Force bypass current page
  bypassCurrentBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) return;
      const activeTab = tabs[0];
      const activeUrl = activeTab.url;

      if (!activeUrl || (!activeUrl.startsWith('http://') && !activeUrl.startsWith('https://'))) {
        alert("Bypass chỉ có hiệu lực trên các liên kết web (http/https).");
        return;
      }

      // Temporarily mark status
      updateStatusUI(true, "Đang cưỡng chế giải mã trang này...");

      // Call background.js to resolve direct redirect
      chrome.runtime.sendMessage({
        action: "forceBypassTab",
        url: activeUrl,
        tabId: activeTab.id
      }, (response) => {
        if (response && response.success) {
          console.log("[Popup] Triggered force bypass successfully.");
        } else {
          // If message failed (e.g. background worker idle or script context error), we check manually if we can parse or offer a custom tip
          setTimeout(() => {
            updateStatusUI(true, "Đang theo dõi redirection...");
          }, 1000);
        }
      });
    });
  });

  // Clear history logs
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
      if (customMessage) {
        statusText.textContent = customMessage;
      } else {
        statusText.textContent = "Đang bảo vệ (Bộ lọc bật)";
      }
    } else {
      statusBanner.classList.add('disabled');
      bullet.classList.add('inactive');
      statusText.textContent = "Bảo vệ đang tắt";
    }
  }

  function renderHistory(history) {
    bypassCounter.textContent = history.length;
    
    if (history.length === 0) {
      historyContainer.innerHTML = `
        <div class="empty-state">
          Chưa bypass link nào. Khi bạng duy chuyển qua shortlink, link gốc sẽ tự động xuất hiện ở đây!
        </div>`;
      return;
    }

    let html = '';
    history.forEach((item) => {
      const shortDomain = getDomainName(item.shortUrl);
      const targetDomain = getDomainName(item.targetUrl);
      
      html += `
        <div class="history-item">
          <div class="history-header">
            <span class="domain-badge" title="${item.shortUrl}">${shortDomain} ➜ ${targetDomain || 'Link gốc'}</span>
            <span class="time-stamp">${item.timestamp || ''}</span>
          </div>
          <div class="url-line">
            <a href="${item.targetUrl}" target="_blank" title="Mở link gốc: ${item.targetUrl}" style="color: #3b82f6; text-decoration: none;">
              ${item.targetUrl}
            </a>
          </div>
          <div class="method-tag">${item.method || 'Bypass tự động'}</div>
        </div>
      `;
    });
    
    historyContainer.innerHTML = html;
  }
});
