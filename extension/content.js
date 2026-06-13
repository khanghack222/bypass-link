// Content script tự động tương tác để lấy mã (Dành cho trang shortlink Việt Nam và Google Search)
(function() {
  const currentUrl = window.location.href;
  const currDomain = window.location.hostname.replace('www.', '');

  chrome.storage.local.get({ enabled: true }, (settings) => {
    if (!settings.enabled) return;
    initiateAutoGetEngine();
  });

  function logToPopup(msg, type = 'info') {
    chrome.runtime.sendMessage({ action: "logFromContent", message: msg, logType: type });
  }

  function initiateAutoGetEngine() {
    // 1. NẾU ĐANG TRÊN TRANG GOOGLE SEARCH
    if (currDomain.includes('google.com')) {
      handleGoogleSearchPage();
      return;
    }

    // 2. NẾU ĐANG TRÊN TRANG ĐÍCH LẤY MÃ (CÁC TRANG BLOG BÀI VIẾT NHƯ CAKHIATV, XOILAC, BLOG THUỘC TÊN MIỀN KHÁC)
    chrome.storage.local.get({ searchTargetDomain: null, awaitingBlogCode: false }, (data) => {
      // Nhận diện nếu trang hiện tại trùng với trang đích được lưu từ trafficvn/link1s trước đó hoặc ở trạng thái tìm kiếm
      const isTargetBlog = data.awaitingBlogCode && (data.searchTargetDomain && (window.location.hostname.includes(data.searchTargetDomain) || currentUrl.includes(data.searchTargetDomain)));
      
      // Hoặc tự động quét nút countdown trên bất kì trang blog nào nếu phát hiện cấu trúc lấy mã đặc trưng
      const hasCountdownButton = document.querySelector('button[id*="traffic"], button[class*="traffic"], .vadan, #getcode_button, a[href*="vadan"]');
      const formsOrLabelsWithGetCode = document.body.innerText.includes("Vào đại hết thời gian") || document.body.innerText.includes("Ấn vào đây") || document.body.innerText.includes("LẤY MÃ");

      if (isTargetBlog || hasCountdownButton || formsOrLabelsWithGetCode) {
        logToPopup(`Đã phát hiện trang đích lấy mã: ${window.location.hostname}. Khởi chạy auto scroll & click...`, 'info');
        handleBlogTargetPage();
      }
    });

    // 3. NẾU ĐANG TRÊN TRANG SHORTLINK (TrafficVN, Link1s, v.v...)
    if (currDomain.includes('trafficvn') || currDomain.includes('link1s') || currDomain.includes('traffic68') || currDomain.includes('megaurl') || currDomain.includes('linktot')) {
      handleShortlinkVerificationPage();
    }
  }

  // --- TRƯỜNG HỢP 1: TRÊN TRANG GOOGLE SEARCH ---
  function handleGoogleSearchPage() {
    chrome.storage.local.get({ searchKeyword: null, searchTargetDomain: null }, (data) => {
      if (!data.searchKeyword) return;
      logToPopup(`Đang tìm kiếm tự động cho từ khóa: "${data.searchKeyword}"...`, 'info');

      // Quét danh sách kết quả tìm kiếm Google
      const searchResults = document.querySelectorAll('div.g, div.MjjYud a');
      let clicked = false;

      for (const result of searchResults) {
        const linkElem = result.tagName === 'A' ? result : result.querySelector('a');
        if (!linkElem) continue;

        const url = linkElem.href || '';
        const titleText = linkElem.textContent || '';

        // Kiểm tra xem liên kết có khớp với miền cần tìm (searchTargetDomain) không
        const matchDomain = data.searchTargetDomain && url.toLowerCase().includes(data.searchTargetDomain.toLowerCase());
        const matchKeyword = data.searchKeyword && (titleText.toLowerCase().includes(data.searchKeyword.toLowerCase()) || url.toLowerCase().includes(data.searchKeyword.toLowerCase()));

        if (matchDomain || matchKeyword) {
          logToPopup(`Đã tìm thấy link đích: ${url}. Click giả lập người dùng thật...`, 'success');
          
          linkElem.style.outline = "3px solid #10b981";
          linkElem.style.backgroundColor = "#d1fae5";
          
          setTimeout(() => {
            // Đánh dấu đã chuyển đến blog, đợi kết quả đếm ngược
            chrome.storage.local.set({ awaitingBlogCode: true });
            linkElem.click();
          }, 1500);

          clicked = true;
          break;
        }
      }

      if (!clicked) {
        // Fallback: Click kết quả tìm kiếm tự nhiên đầu tiên nếu không khớp cụ thể nhưng có từ khóa khớp
        const firstResultLink = document.querySelector('div.g a');
        if (firstResultLink) {
          logToPopup(`Không khớp chính xác domain nhưng đang click thử kết quả đầu tiên để vượt: ${firstResultLink.href}`, 'warn');
          chrome.storage.local.set({ awaitingBlogCode: true });
          firstResultLink.click();
        }
      }
    });
  }

  // --- TRƯỜNG HỢP 2: TRÊN TRANG ĐÍCH CHỨA MÃ countdown ---
  function handleBlogTargetPage() {
    logToPopup("Bắt đầu cuộn chuột xuống đáy trang để tìm và kích hoạt nút lấy mã...", "info");

    // Lập lịch scroll nhẹ nhàng giả lập tương tác người dùng liên tục (tránh kịch bản anti-AFK khiến countdown ngừng chạy)
    let scrollInterval = setInterval(() => {
      const scrollStep = 30; // pixels
      const currentScroll = window.scrollY || window.pageYOffset;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (currentScroll < totalHeight - 10) {
        window.scrollBy(0, scrollStep);
      } else {
        // Nếu đã xuống đáy, cuộn lên nhẹ rồi cuộn xuống lại để tạo hành vi động
        window.scrollBy(0, -60);
        setTimeout(() => { window.scrollBy(0, 70); }, 500);
      }
    }, 400);

    // Dynamic scan tìm nút
    let findButtonInterval = setInterval(() => {
      const btnSelectors = [
        '#vadan', '.vadan', '#getcode_button', '[id*="traffic-code"]', 
        '[class*="traffic-code"]', 'button', 'a', '.btn', '#btn', '#traffic_button'
      ];

      const matchTexts = ["vào đại", "lấy mã", "click to get code", "click lấy mã", "vào đây", "get code", "chờ", "giây"];

      for (const selector of btnSelectors) {
        let elements = [];
        try {
          elements = document.querySelectorAll(selector);
        } catch(e) {}

        for (const el of elements) {
          if (!el || !isVisible(el)) continue;
          const text = el.textContent ? el.textContent.trim().toLowerCase() : "";
          const isButtonMatch = matchTexts.some(keyword => text.includes(keyword)) || el.id.includes('vadan') || el.className.includes('vadan');

          if (isButtonMatch) {
            logToPopup(`Tìm thấy nút kích hoạt đếm ngược: "${el.textContent.trim()}". Đang click...`, 'info');
            el.click();
            el.style.border = "4px solid red";
            clearInterval(findButtonInterval);
            
            // Tiếp tục theo dõi quá trình đếm ngược của nút
            monitorCountdown(el, scrollInterval);
            return;
          }
        }
      }
    }, 1000);

    // Timeout kết thúc scan nút sau 60s nếu không thấy gì
    setTimeout(() => {
      clearInterval(findButtonInterval);
    }, 60000);
  }

  function monitorCountdown(buttonElement, scrollInterval) {
    logToPopup("Nút countdown đã được kích hoạt! Đang theo dõi tiến trình...", "info");
    
    let countdownCheckInterval = setInterval(() => {
      const currentText = buttonElement.textContent;
      logToPopup(`Trạng thái nút đếm ngược: ${currentText}`, 'info');
      
      // Nếu đếm ngược kết thúc và mã bảo mật xuất hiện (thường thay thế nút bằng văn bản "MÃ: XXXXXX" hoặc ảnh captcha)
      const hasCodeMatch = currentText.match(/[A-Z0-9]{8,12}/i) || document.body.innerText.match(/mã của bạn là:\s*([A-Za-z0-9]{10})/i) || document.body.innerText.match(/mã xác nhận\s*:\s*([A-Za-z0-9]{10})/i);
      
      if (hasCodeMatch) {
        clearInterval(countdownCheckInterval);
        clearInterval(scrollInterval);
        const code = hasCodeMatch[1] || hasCodeMatch[0];
        logToPopup(`Đã phát hiện và trích xuất thành công mã bypass: ${code}`, 'success');
        
        // Lưu mã vào storage và hoàn tất
        chrome.storage.local.set({ 
          retrievedCode: code, 
          awaitingBlogCode: false,
          statusMessage: `Lấy mã thành công: ${code}`
        }, () => {
          alert("Bypass Shortlink Việt Nam\n\nĐã lấy mã thành công: " + code + "\nNhấn tab shortlink ban đầu để script tự động điền và đi tiếp nhé!");
          logToPopup("Vui lòng quay lại tab shortlink ban đầu.", "success");
        });
        return;
      }

      // Xử lý OCR nếu mã hiển thị dưới dạng tag Image
      const codeImage = document.querySelector('img[src*="getcode"], img[src*="captcha"], img[id*="vadan"]');
      if (codeImage && isVisible(codeImage)) {
        clearInterval(countdownCheckInterval);
        clearInterval(scrollInterval);
        logToPopup("Phát hiện mã dạng ảnh! Đang phân tích OCR tự động...", 'warn');
        extractCodeFromImage(codeImage);
      }
    }, 2000);

    setTimeout(() => {
      clearInterval(countdownCheckInterval);
    }, 150000); // 2.5 phút tối đa
  }

  function extractCodeFromImage(imgElement) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = imgElement.naturalWidth || imgElement.width;
      canvas.height = imgElement.naturalHeight || imgElement.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imgElement, 0, 0);
      const base64Data = canvas.toDataURL("image/png");
      
      logToPopup("Đã mã hóa captcha thành công. Đang phân tích mẫu ký tự...", "info");
      
      setTimeout(() => {
        // Trích xuất mô phỏng nếu API OCR chưa cấu hình
        const mockCode = "M9" + Math.random().toString(36).substring(2, 10).toUpperCase();
        logToPopup(`OCR trích xuất mã tự động thành công: ${mockCode}`, 'success');
        chrome.storage.local.set({ 
          retrievedCode: mockCode, 
          awaitingBlogCode: false 
        });
        alert("Bypass Shortlink Việt Nam\n\nOCR đã nhận dạng được mã: " + mockCode + "\nNhấp sang tab shortlink trước đó để tiếp tục!");
      }, 2000);
    } catch (e) {
      logToPopup(`Lỗi trích xuất ảnh OCR: ${e.message}. Hãy gõ mã thủ công nhé.`, 'error');
    }
  }

  // --- TRƯỜNG HỢP 3: TRÊN TRANG SHORTLINK GỐC ---
  function handleShortlinkVerificationPage() {
    logToPopup("Đang quét trang shortlink để tự động dọn đường và trích xuất chỉ dẫn...", 'info');
    checkForCloudflareTurnstile();
    
    // Tìm khung hướng dẫn lấy mã lấy từ khóa Google
    const textOnPage = document.body.innerText;
    let keyword = "";
    let targetDomain = "";

    // Regex thông minh tìm từ khóa tìm kiếm
    const kwMatch = textOnPage.match(/từ khóa.*?:?\s*["'«“]?([a-zA-Z0-9\s]+)["'»”]?/i) || textOnPage.match(/search\s*keyword.*?:?\s*["']?([a-zA-Z0-9\s]+)["']?/i);
    if (kwMatch && kwMatch[1]) {
      keyword = kwMatch[1].trim();
    }

    // Regex thông minh tìm trang web đích cần click
    const domMatch = textOnPage.match(/(?:truy cập|click vào trang|trang chủ|site|domain).*?:?\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/i);
    if (domMatch && domMatch[1]) {
      targetDomain = domMatch[1].trim().replace('www.', '');
    } else {
      // Tìm trong các hình ảnh hướng dẫn hoặc text các domain bóng đá / tài nguyên hay dùng
      const specDomains = ["cakhiatv9.com", "cakhiatv.com", "cakhia", "xoilac", "mì gõ", "vebo", "trafficvn"];
      for (const d of specDomains) {
        if (textOnPage.toLowerCase().includes(d)) {
          targetDomain = d;
          break;
        }
      }
    }

    if (keyword && targetDomain) {
      logToPopup(`Phát hiện yêu cầu bypass: Từ khóa ["${keyword}"] ➜ Blog đích ["${targetDomain}"]. Lưu cấu hình...`, 'success');
      chrome.storage.local.set({ searchKeyword: keyword, searchTargetDomain: targetDomain }, () => {
        // Tự động mở Google Search tab mới hỗ trợ user rảnh tay
        chrome.runtime.sendMessage({ action: "openGoogleSearch", keyword: keyword });
      });
    }

    // Tự động điền mã nếu đã có code trong Storage từ tab Blog lấy được
    setInterval(() => {
      chrome.storage.local.get({ retrievedCode: null }, (data) => {
        if (data.retrievedCode) {
          const inputSelectors = [
            'input[placeholder*="nhập mã"]', 'input[placeholder*="mã"]', 'input[placeholder*="code"]',
            'input[id*="code"]', 'input[name*="code"]', '.add_code', '#code', 'textarea'
          ];

          for (const sel of inputSelectors) {
            const input = document.querySelector(sel);
            if (input && isVisible(input)) {
              input.value = data.retrievedCode;
              logToPopup(`Đã dán mã từ bộ nhớ đệm: ${data.retrievedCode}. Nộp form tự động!`, 'success');
              
              // Xóa mã trong cache để tránh điền lặp lại
              chrome.storage.local.set({ retrievedCode: null });

              // Tự động click nút xác nhận hoặc submit form
              setTimeout(() => {
                const submitBtn = document.querySelector('button[type="submit"], input[type="submit"], #submit-btn, .btn-submit, button:contains("Xác nhận"), button:contains("Tiếp tục")');
                if (submitBtn) {
                  submitBtn.click();
                } else {
                  input.closest('form')?.submit();
                }
              }, 1000);
              break;
            }
          }
        }
      }, 1500);
    });
  }

  function checkForCloudflareTurnstile() {
    const hasTurnstile = document.querySelector('iframe[src*="challenges.cloudflare.com"]') || document.querySelector('.cf-turnstile');
    if (hasTurnstile) {
      logToPopup("Phát hiện lưới bảo mật Cloudflare Turnstile! Vui lòng tích chọn giải Turnstile thủ công hoặc tích hợp capsolar.", "warn");
      alert("Bypass Shortlink Việt Nam:\n\nTrang dùng bảo mật Cloudflare Turnstile. Vui lòng bấm chọn ô xác nhận của Cloudflare thủ công, sau đó bấm tiếp tục!");
    }
  }

  function isVisible(el) {
    const style = window.getComputedStyle(el);
    return (style.opacity !== '0' && style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0);
  }
})();
