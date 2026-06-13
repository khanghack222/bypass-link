// Content script for complex Group 2 shortlink sites
// It will look for counters, click proceed buttons, dismiss overlay popups or banners

(function() {
  const currentUrl = window.location.href;
  const currentDomain = window.location.hostname.replace('www.', '');

  console.log(`[Bypass Shortlink content.js] Active on domain: ${currentDomain}`);

  // Checks to ensure bypass is enabled globally
  chrome.storage.local.get({ enabled: true }, (settings) => {
    if (!settings.enabled) return;
    initiateAutoBypass();
  });

  function initiateAutoBypass() {
    // 1. Detect if Captain/Captcha is visible, notify popup
    checkForCaptcha();

    // 2. Perform periodic state audits of the DOM structure
    const intervalId = setInterval(() => {
      domProcessingAutomation();
    }, 1000);

    // Stop checking after 60 seconds to conserve memory/CPU
    setTimeout(() => {
      clearInterval(intervalId);
    }, 60000);
  }

  function checkForCaptcha() {
    const hasReCaptcha = document.querySelector('iframe[src*="recaptcha"]');
    const hasHCaptcha = document.querySelector('iframe[src*="hcaptcha"]') || document.querySelector('.h-captcha');
    const hasTurnstile = document.querySelector('iframe[src*="challenges.cloudflare.com"]');

    if (hasReCaptcha || hasHCaptcha || hasTurnstile) {
      console.log("[Bypass Shortlink] CAPTCHA detected. Informing user to solve manual verification first.");
      chrome.storage.local.set({ 
        statusMessage: "Phát hiện Captcha! Bạn hãy tự giải Captcha trên trang để tiếp tục nhé." 
      });
    }
  }

  function domProcessingAutomation() {
    // 1. Sniff specific high-use domestic/foreign shortener variables or links
    if (detectSpecialShortenerRedirects()) {
      return;
    }

    // List of high likelihood target classes, text anchors, or input elements that yield URLs
    // 2. Scan standard "Download/Get Link" triggers
    const triggerSelectors = [
      '#getlink', '#btn-getlink', '.btn-getlink', 
      '#go-link', '#gotolink', '#go-to-link',
      'a.get-link', 'button.get-link', 'a#btn-getlink',
      '#landing', '#continue', '.continue-btn',
      'a[href*="getlink"]', 'a[href*="gotolink"]',
      'button#invisibleCaptchaCard'
    ];

    for (const selector of triggerSelectors) {
      const element = document.querySelector(selector);
      if (element && isVisible(element)) {
        // If it's a real anchor redirection
        const href = element.getAttribute('href');
        if (href && href !== '#' && href.startsWith('http') && !href.includes(currentDomain)) {
          triggerSuccessBypass(href, "Direct Button Sniffer");
          return;
        }
        // Otherwise try simulated interaction
        element.click();
        console.log(`[Bypass Shortlink] Automatically clicked trigger: ${selector}`);
        return;
      }
    }

    // 3. Scan for Buttons by Vietnamese & English language content
    const VietnameseTextKeywords = [
      "lấy link", "lay link", "tiếp tục", "tiep tuc", "nhấp vào đây để tiếp tục", 
      "click vào đây để tiếp tục", "mở liên kết", "nhấp vào đây", "xác minh"
    ];
    const EnglishTextKeywords = [
      "get link", "continue", "click here to continue", "skip ad", "skip", 
      "proceed", "destination", "verify", "download now", "get-link"
    ];

    const allButtonsAndAnchors = document.querySelectorAll('a, button, div[role="button"], span');
    for (const elem of allButtonsAndAnchors) {
      const text = elem.textContent ? elem.textContent.trim().toLowerCase() : "";
      if (!text) continue;

      const isVietnameseMatch = VietnameseTextKeywords.some(keyword => text === keyword || text.includes(keyword));
      const isEnglishMatch = EnglishTextKeywords.some(keyword => text === keyword || text.includes(keyword));

      if ((isVietnameseMatch || isEnglishMatch) && isVisible(elem)) {
        // If it possesses an anchor href leading out of current shortlink domain
        if (elem.tagName === 'A') {
          const href = elem.getAttribute('href');
          if (href && href !== '#' && href.startsWith('http') && !href.includes(currentDomain)) {
            triggerSuccessBypass(href, "Text Keyword Redirection Sniffer");
            return;
          }
        }
        elem.click();
        console.log(`[Bypass Shortlink] Automatically clicked element with keyword: "${text}"`);
        return;
      }
    }

    // 4. Look for common base-64 encoded queries in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams.entries()) {
      if (value.length > 20 && (key === 'url' || key === 'link' || key === 'dest' || key === 'target' || key === 'to')) {
        try {
          const decoded = atob(value);
          if (decoded.startsWith('http')) {
            triggerSuccessBypass(decoded, "URL Query Base64 Decoder");
            return;
          }
        } catch (e) {
          // not base64
          if (value.startsWith('http')) {
            triggerSuccessBypass(value, "URL Query Literal Redirector");
            return;
          }
        }
      }
    }
  }

  // Domain-specific custom DOM handlers can be placed here
  function detectSpecialShortenerRedirects() {
    // ouo.io bypass snippet: look for form submission post-countdown
    if (currentDomain.includes('ouo.io') || currentDomain.includes('ouo.press')) {
      const form = document.querySelector('form#form-captcha');
      if (form) {
        console.log("[Bypass Shortlink] Ouo.io captcha form detected, triggering submit...");
        form.submit();
        return true;
      }
      const goForm = document.querySelector('form[action*="go-to-link"]');
      if (goForm) {
        console.log("[Bypass Shortlink] Ouo.io redirect form detected, pushing submission...");
        goForm.submit();
        return true;
      }
    }

    // Linkvertise special sniffer
    if (currentDomain.includes('linkvertise.com') || currentDomain.includes('linkvertise.net')) {
      // Look for data objects or script params containing targetURL
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const text = script.textContent || "";
        const match = text.match(/"targetUrl"\s*:\s*"([^"]+)"/);
        if (match && match[1]) {
          const target = match[1].replace(/\\/g, '');
          triggerSuccessBypass(target, "Linkvertise JSON sniffer");
          return true;
        }
      }
    }

    // adf.ly detection
    if (currentDomain.includes('adf.ly')) {
      const skipBtn = document.getElementById('skip_buutton') || document.querySelector('.skip');
      if (skipBtn) {
        skipBtn.click();
        return true;
      }
      // Scrape script configs
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent;
        if (content && content.includes('var ysmm =')) {
          const ysmmMatch = content.match(/var\s+ysmm\s*=\s*['"](.*?)['"]/);
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

    // Link1s / megaurl triggers (often uses window.target_url or hidden forms)
    if (currentDomain.includes('link1s') || currentDomain.includes('megaurl') || currentDomain.includes('link5s')) {
      // Try parsing variables assigned directly on the window object
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const text = script.textContent || "";
        const m = text.match(/target_url\s*=\s*['"](.*?)['"]/);
        if (m && m[1]) {
          triggerSuccessBypass(m[1], "Domestic window.target_url variable");
          return true;
        }
      }
    }

    return false;
  }

  // adf.ly ysmm decryption logic
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
    console.log(`[Bypass Shortlink] Success bypass decoded: ${target} [via ${method}]`);
    chrome.runtime.sendMessage({
      action: "logBypassSuccess",
      shortUrl: currentUrl,
      targetUrl: target,
      method: method
    });
  }

  // Practical assessment to check element display state
  function isVisible(el) {
    const style = window.getComputedStyle(el);
    return (style.opacity !== '0' && style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0);
  }
})();
