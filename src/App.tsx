import React, { useState } from 'react';
import { 
  Zap, 
  Download, 
  Layers, 
  ShieldCheck, 
  HelpCircle, 
  Check, 
  List, 
  ExternalLink,
  ChevronRight,
  Code,
  FileCode,
  Coffee,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play
} from 'lucide-react';
import JSZip from 'jszip';
import { extensionFiles } from './codeTemplates';

export default function App() {
  const [testUrl, setTestUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'info' | 'domains' | 'files' | 'steps'>('info');
  const [selectedFile, setSelectedFile] = useState<keyof typeof extensionFiles>('manifest.json');
  const [copiedFile, setCopiedFile] = useState(false);
  const [zippingMessage, setZippingMessage] = useState<string | null>(null);

  // Scanner simulator states (V3.0.0 Pro with Gemini AI)
  const [scanKeyword, setScanKeyword] = useState('five 88');
  const [scanDomain, setScanDomain] = useState('afq.com');
  const [scanPage, setScanPage] = useState(2);
  const [scanButtonText, setScanButtonText] = useState('LÀM LẤY MẪN');
  const [scanWaitTime, setScanWaitTime] = useState(59);
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [countdownTimer, setCountdownTimer] = useState<any>(null);

  // AI interactive simulation states
  const [simulatorTab, setSimulatorTab] = useState<'manual' | 'ai'>('manual');
  const [aiRawHtml, setAiRawHtml] = useState(`Bước 1: Tìm kiếm từ khóa "cakhiatv" trên Google Search
Bước 2: Tìm trang web có nhãn tên miền "cakhiatv9.com" ở trang 2 google search
Bước 3: Nhấp vào liên kết, kéo xuống và click nút nhãn 'LÀM LẤY MẪN'
Bước 4: Chờ countdown 60 giây để thu được mã bypass.`);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  const handleAiAnalysis = async () => {
    if (!aiRawHtml.trim()) return;
    setIsAiAnalyzing(true);
    setAiAnalysisResult(null);
    setAiAnalysisError(null);
    try {
      const resp = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: aiRawHtml })
      });
      const data = await resp.json();
      if (data.success) {
        setAiAnalysisResult(data);
      } else {
        setAiAnalysisError(data.error || "Gặp lỗi khi xử lý phân tích AI của máy chủ.");
      }
    } catch (err: any) {
      setAiAnalysisError("Không kết nối được tới dịch vụ AI của máy chủ.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const applyAiConfig = () => {
    if (!aiAnalysisResult) return;
    setScanKeyword(aiAnalysisResult.searchKeyword || "five 88");
    setScanDomain(aiAnalysisResult.targetDomainHint || "afq.com");
    setScanPage(aiAnalysisResult.expectedPageNumber || 2);
    setScanButtonText(aiAnalysisResult.buttonText || "LÀM LẤY MẪN");
    setScanWaitTime(aiAnalysisResult.waitTime || 59);
    setSimulatorTab('manual');
    
    setScanLogs([
      `[✨ AI PRO] Đồng bộ hóa thành công cấu hình Gemini AI từ trang hướng dẫn!`,
      `[🔑 TỪ KHÓA]: "${aiAnalysisResult.searchKeyword}"`,
      `[🌐 TRANG BLOG ĐÍCH]: "${aiAnalysisResult.targetDomainHint}"`,
      `[🎯 BUTTON]: "${aiAnalysisResult.buttonText}"`,
      `[⏳ THỜI GIAN]: ${aiAnalysisResult.waitTime} giây`,
      `[📈 ĐỘ TIN CẬY]: ${Math.round((aiAnalysisResult.confidence || 0.8) * 100)}%`,
      `[💡 GIẢI THÍCH]: ${aiAnalysisResult.explanation}`
    ]);
  };

  const startSimulation = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs([`[11:15:01] Bắt đầu chuỗi quét tự động cho từ khóa: "${scanKeyword}"...`]);
    
    const steps = [
      { text: `[11:15:02] Thiết lập kết nối an toàn với máy chủ Google Search...`, progress: 10, delay: 1000 },
      { text: `[11:15:03] Gõ giả lập từ khóa "${scanKeyword}" và rà soát kết quả tìm kiếm trang 1...`, progress: 25, delay: 2500 },
      { text: `[11:15:05] Vận hành rà soát trang kết quả Google kế tiếp (Trang ${scanPage})...`, progress: 45, delay: 4500 },
      { text: `[11:15:08] Đã định vị trùng khớp miền đích "${scanDomain}"! Đang click chuyển hướng...`, progress: 60, delay: 6500 },
      { text: `[11:15:10] Đã chuyển vào Blog đích lấy mã. Đang cuộn chuột mượt mà lên/xuống liên tục để kích hoạt countdown...`, progress: 75, delay: 8500 },
      { text: `[11:15:13] Phát hiện nút lấy mã "${scanButtonText}" (Normalized match). Click tự động nhấp chuột!`, progress: 90, delay: 10500 },
      { text: `[11:15:15] [COUNTDOWN BẮT ĐẦU] Đang chờ đếm ngược ${scanWaitTime} giây...`, progress: 94, delay: 12500 },
      { text: `[11:15:20] Countdown hoàn tất! Đã trích xuất mã vượt link: "BYP5812492"`, progress: 100, delay: 15000 },
      { text: `[11:15:21] Dán mã "BYP5812492" thành công vào ô nhập trang shortlink gốc. Đang kích hoạt Submit...`, progress: 100, delay: 16500 },
      { text: `[11:15:23] [BYPASS THÀNH CÔNG RỰC RỠ] Form đã tự động submit an toàn! Chuyển hướng sang link đích cuối cùng.`, progress: 100, delay: 18000 },
    ];

    const timerIds: any[] = [];
    steps.forEach((step) => {
      const id = setTimeout(() => {
        setScanLogs((prev) => [...prev, step.text]);
        setScanProgress(step.progress);
        if (step.progress === 100 && step.text.includes("THÀNH CÔNG")) {
          setIsScanning(false);
        }
      }, step.delay);
      timerIds.push(id);
    });

    setCountdownTimer(timerIds);
  };

  const stopSimulation = () => {
    if (countdownTimer) {
      countdownTimer.forEach((id: any) => clearTimeout(id));
    }
    setIsScanning(false);
    setScanLogs((prev) => [...prev, `[🛑 HỆ THỐNG] Người dùng yêu cầu dừng cưỡng chế luồng quét.`]);
  };

  // Group 1 list
  const group1Domains = [
    "bitly.com", "bitly.com.vn", "by.com.vn", "tinyurl.com", "tinyurl.com.vn",
    "new.tinyurl.com.vn", "rutgonlink.vn", "rut.vn", "go2.vn", "bom.so", "vnlink.top",
    "shorturl.at", "is.gd", "tiny.cc", "cutt.ly", "ow.ly", "rebrandly.com", "t.ly"
  ];

  // Group 2 list
  const group2Domains = [
    "link1s.com", "link1s.me", "megaurl.in", "mmo1s.com", "nghienlink.com",
    "droplink.co", "123link.co", "linktot.net", "traffic68.com", "trafficvn.com",
    "link1m.com", "link5s.com", "ron.vn", "tinyvn.com",
    "adf.ly", "shrtfly.com", "clicksfly.com", "shrinkme.io", "shrinkearn.com",
    "exe.io", "exey.io", "mitly.us", "clk.sh", "cuty.io", "ouo.io", "ouo.press", "shorte.st",
    "linkvertise.com", "linkvertise.net", "fas.li", "adpaylink.com", "smoner.com",
    "vb.lk", "bioqr.top"
  ];

  // Action: Launch live proxy tester search call to /api/bypass-proxy
  const handleBypassTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;

    setIsTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const resp = await fetch(`/api/bypass-proxy?url=${encodeURIComponent(testUrl.trim())}`);
      const data = await resp.json();
      if (data.success) {
        setTestResult(data);
      } else {
        setTestError(data.error || "Không thể bypass trang này từ dịch vụ proxy của máy chủ.");
      }
    } catch (err: any) {
      setTestError("Gặp lỗi khi tạo kết nối đến máy chủ proxy để bypass.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(extensionFiles[selectedFile]);
    setCopiedFile(true);
    setTimeout(() => {
      setCopiedFile(false);
    }, 2000);
  };

  // Action: Compile all code templates + circular custom PNG base64 icons -> JSZip downloader
  const handleDownloadZip = async () => {
    setZippingMessage("Đang đóng gói file extension...");
    try {
      const zip = new JSZip();

      // Write code template files
      Object.entries(extensionFiles).forEach(([filename, content]) => {
        zip.file(filename, content);
      });

      // Mock circular colored PNG data to bypass image requirements beautifully
      const icon16 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const icon48 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      const icon128 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

      const iconsFolder = zip.folder("icons");
      if (iconsFolder) {
        iconsFolder.file("icon16.png", icon16, { base64: true });
        iconsFolder.file("icon48.png", icon48, { base64: true });
        iconsFolder.file("icon128.png", icon128, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "Bypass_Shortlink_Vietnam.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setZippingMessage("Tải xuống hoàn tất! Vui lòng làm theo hướng dẫn Giải nén.");
      setTimeout(() => setZippingMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setZippingMessage("Lỗi đóng gói zip. Vui lòng copy thủ công.");
      setTimeout(() => setZippingMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-500 rounded-xl text-white shadow-md shadow-emerald-500/20">
              <Zap className="h-6 w-6 fill-current animate-pulse" />
            </span>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                Bypass Shortlink Việt Nam <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full animate-pulse">v3.0.0 PRO</span>
              </h1>
              <p className="text-xs text-slate-500">Khám phá, đóng gói & phân tích tự động bằng Gemini AI</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadZip}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-lg transition shadow-sm cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Tải Extension (.ZIP)
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column - Live Interactive Test area */}
        <section className="lg:col-span-8 flex flex-col gap-6" id="test-sandbox">
          
          {/* Dynamic Zipping Notification Toast */}
          {zippingMessage && (
            <div className="bg-slate-950 text-white p-4 rounded-xl shadow-lg border border-slate-800 flex items-center justify-between animate-bounce">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-medium">{zippingMessage}</span>
              </div>
              <button onClick={() => setZippingMessage(null)} className="text-xs text-slate-400 hover:text-white underline">Đóng</button>
            </div>
          )}

          {/* Hero Banner Intro */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="bg-emerald-500/30 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Chrome & Firefox Extension</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Vượt qua link rút gọn Việt Nam cực nhanh không cần chờ!</h2>
              <p className="text-emerald-100 mt-2 text-sm sm:text-base leading-relaxed">
                Quá mệt mỏi với đếm ngược 15 giây, nhấp 3 lần để lấy link, hay những quảng cáo độc hại? Extension tự động theo dõi headers HTTP của nhóm link rút gọn đơn giản, giả lập nhấp chuột an toàn cho các trang Việt Nam phức tạp và tự động chuyển về URL gốc nguyên bản.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  100% Bảo mật (Không gửi dữ liệu)
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                  <Zap className="h-4 w-4 text-emerald-300" />
                  Phản hồi thời gian thực
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                  <Coffee className="h-4 w-4 text-emerald-300" />
                  Hỗ trợ 45+ Domain Việt/Quốc tế
                </div>
              </div>
            </div>

            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-20 -translate-y-20 blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-emerald-500/20 rounded-full translate-x-10 translate-y-10 blur-xl"></div>
          </div>

          {/* Real-time Web Interface Tester */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg uppercase tracking-wide">Trải nghiệm</span>
                <h3 className="font-bold text-lg text-slate-900 tracking-tight">Chạy thử Công cụ Bypass Link (HTTP Redirects)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Nhập link rút gọn Nhóm 1 (như bit.ly, tinyurl...) bên dưới để máy chủ của chúng tôi tự động gửi yêu cầu theo dõi chuyển hướng và trả về link đích thực tế của bạn ngay lập tức!
              </p>
            </div>

            <form onSubmit={handleBypassTest} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Ví dụ: https://bit.ly/3X8hB9 hoặc tinyurl.com/xyz..."
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:border-blue-500 rounded-xl text-sm transition font-medium focus:ring-4 focus:ring-blue-100 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isTesting}
                className={`px-6 py-3 font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  isTesting 
                    ? 'bg-slate-200 text-slate-400' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                }`}
              >
                {isTesting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></span>
                    Đang giải mã...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current text-white" />
                    Chạy Thử Ngay
                  </>
                )}
              </button>
            </form>

            {/* Test Results Output Display */}
            {testResult && (
              <div className="mt-2 bg-emerald-50 rounded-xl p-5 border border-emerald-100 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3 mb-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <Check className="h-4 w-4 p-0.5 bg-emerald-500 text-white rounded-full" />
                    Bypass thành công bằng Proxy máy chủ!
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md">
                    {testResult.method}
                  </span>
                </div>

                <div className="flex flex-col gap-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-slate-500 block font-medium">Link rút gọn gửi đi:</span>
                    <span className="font-mono text-slate-700 font-semibold break-all">{testResult.shortUrl}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block font-medium">Link Gốc giải mã thành công:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded-md font-bold break-all flex-1 text-[13px]">
                        {testResult.finalUrl}
                      </span>
                      <a 
                        href={testResult.finalUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1 font-bold shrink-0 text-[11px]"
                      >
                        Mở Link
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {testResult.chain && testResult.chain.length > 2 && (
                    <div>
                      <span className="text-slate-500 block font-medium mb-1">Chuỗi chuyển hướng (Redirect Chain):</span>
                      <div className="flex flex-col gap-1 pl-2 border-l-2 border-emerald-300">
                        {testResult.chain.map((c: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                            <span className="text-emerald-500 font-bold shrink-0">Hợp {idx + 1}:</span>
                            <span className="truncate" title={c}>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {testError && (
              <div className="mt-2 bg-red-50 rounded-xl p-4 border border-red-100 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-800">Không thể giải mã tự động qua Proxy</h4>
                  <p className="mt-1 leading-relaxed">
                    {testError}. Điều này thường xảy ra do trang web chặn truy cập từ xa hoặc yêu cầu phải có <b>Content Script / Tương tác DOM (Nhóm 2)</b> vốn chỉ chạy được trên trình duyệt của bạn sau khi bạn cài đặt <b>Extension Bypass Shortlink</b>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scan Controls Section (Interactive Simulator V3.0.0 PRO with Gemini AI) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4" id="scan-simulator">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wide">Mô phỏng 3.0 Pro</span>
                  <h3 className="font-bold text-lg text-slate-900 tracking-tight">Cấu hình & Tương tác thông minh bằng AI</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Mô phỏng tiến trình phân tích tự động, điền tham số, chạy giả lập nhấp chuột và đếm ngược.
                </p>
              </div>

              {/* Tab options selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl self-start shrink-0">
                <button
                  type="button"
                  onClick={() => setSimulatorTab('manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    simulatorTab === 'manual' 
                      ? 'bg-white text-emerald-600 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚙️ Cấu hình Thủ công
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatorTab('ai')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    simulatorTab === 'ai' 
                      ? 'bg-white text-indigo-600 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✨ Phân tích bằng Gemini AI
                </button>
              </div>
            </div>

            {simulatorTab === 'manual' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Từ khóa (Google):</label>
                    <input
                      type="text"
                      value={scanKeyword}
                      onChange={(e) => setScanKeyword(e.target.value)}
                      disabled={isScanning}
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Domain blog đích:</label>
                    <input
                      type="text"
                      value={scanDomain}
                      onChange={(e) => setScanDomain(e.target.value)}
                      disabled={isScanning}
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Trang Google quét:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={scanPage}
                      onChange={(e) => setScanPage(parseInt(e.target.value) || 1)}
                      disabled={isScanning}
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Nhãn nút lấy mã:</label>
                    <input
                      type="text"
                      value={scanButtonText}
                      onChange={(e) => setScanButtonText(e.target.value)}
                      disabled={isScanning}
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Thời gian chờ (s):</label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={scanWaitTime}
                      onChange={(e) => setScanWaitTime(parseInt(e.target.value) || 60)}
                      disabled={isScanning}
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={startSimulation}
                    disabled={isScanning}
                    className={`flex-1 py-3 px-4 font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isScanning 
                        ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10'
                    }`}
                  >
                    <span>🔍</span> Bắt đầu quét tự động
                  </button>
                  <button
                    onClick={stopSimulation}
                    disabled={!isScanning}
                    className={`py-3 px-6 font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      !isScanning 
                        ? 'bg-slate-100 text-slate-350 border border-slate-200 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                    }`}
                  >
                    <span>🛑</span> Dừng
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 animate-fadeIn">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <span>✨</span> Nhập văn bản thô hướng dẫn vượt link (Raw Text/HTML Content):
                  </label>
                  <textarea
                    rows={4}
                    value={aiRawHtml}
                    onChange={(e) => setAiRawHtml(e.target.value)}
                    placeholder="Dán mã nguồn HTML hoặc văn bản hướng dẫn lấy mã vào đây..."
                    className="w-full p-3 font-mono text-xs text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 transition outline-none"
                  />
                </div>

                <button
                  onClick={handleAiAnalysis}
                  disabled={isAiAnalyzing}
                  className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAiAnalyzing ? (
                    <>
                      <span className="h-4 w-4 border-2 border-slate-300 border-t-white rounded-full animate-spin"></span>
                      Mô hình Gemini-3.5-flash đang giải mã DOM trang...
                    </>
                  ) : (
                    <>
                      <span>✨</span> Chạy Phân Tích Bằng AI
                    </>
                  )}
                </button>

                {aiAnalysisError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium leading-relaxed">
                    ❌ Lỗi phân tích: {aiAnalysisError}
                  </div>
                )}

                {aiAnalysisResult && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                      <span className="text-indigo-950 font-bold text-xs flex items-center gap-1">
                        🚀 Tham số trích xuất thành công! (Dịch vụ: {aiAnalysisResult.source})
                      </span>
                      <span className="bg-indigo-200 text-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded">
                        Độ tin cậy: {Math.round((aiAnalysisResult.confidence || 0.8) * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block font-medium">Từ khóa Google:</span>
                        <span className="font-mono text-indigo-950 font-bold bg-indigo-100/50 px-2 py-0.5 rounded inline-block mt-0.5 break-all">
                          {aiAnalysisResult.searchKeyword}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">Domain blog đích:</span>
                        <span className="font-mono text-indigo-950 font-bold bg-indigo-100/50 px-2 py-0.5 rounded inline-block mt-0.5 break-all">
                          {aiAnalysisResult.targetDomainHint}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">Click nhãn nút:</span>
                        <span className="font-mono text-purple-950 font-bold bg-purple-100/50 px-2 py-0.5 rounded inline-block mt-0.5 break-all">
                          {aiAnalysisResult.buttonText}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block font-medium">Chờ đợi / Google trang:</span>
                        <span className="font-mono text-slate-800 font-bold mt-0.5 block">
                          Trang {aiAnalysisResult.expectedPageNumber} / Chờ {aiAnalysisResult.waitTime}s
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-indigo-900 font-medium bg-white/60 p-2.5 rounded-lg border border-indigo-100/60 leading-relaxed italic">
                      <b>Giải thích từ AI:</b> {aiAnalysisResult.explanation}
                    </div>

                    <button
                      onClick={applyAiConfig}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      🚀 Đồng bộ hóa và Áp dụng vào bảng điều khiển mô phỏng
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Live Terminal Output Logs */}
            {(scanLogs.length > 0) && (
              <div className="bg-slate-950 rounded-xl p-4 border border-emerald-500/30 font-mono text-xs text-slate-300 leading-relaxed max-h-[220px] overflow-y-auto">
                <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/10 pb-2 mb-2 font-sans font-bold">
                  <span>Terminal Hoạt động Quét thời gian thực (Simulator)</span>
                  <span className={`${isScanning ? 'text-emerald-400' : 'text-slate-500'} flex items-center gap-1`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    {isScanning ? 'SEARCHING...' : 'IDLE'}
                  </span>
                </div>
                
                {/* Simulated Log Output lines */}
                <div className="space-y-1.5">
                  {scanLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`${
                        log.includes("THÀNH CÔNG") 
                          ? 'text-emerald-400 font-bold' 
                          : log.includes("🛑") 
                            ? 'text-amber-400 font-bold' 
                            : 'text-slate-350'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
                
                {isScanning && (
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3.5 border border-white/5">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Information Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition outline-none cursor-pointer text-center ${
                  activeTab === 'info' 
                    ? 'border-emerald-500 text-emerald-600 bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Cơ Chế Lấy Mã Tự Động
              </button>
              <button
                onClick={() => setActiveTab('domains')}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition outline-none cursor-pointer text-center ${
                  activeTab === 'domains' 
                    ? 'border-emerald-500 text-emerald-600 bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Các Domain Hỗ Trợ
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition outline-none cursor-pointer text-center ${
                  activeTab === 'files' 
                    ? 'border-emerald-500 text-emerald-600 bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Mã Nguồn (JS / Python Script)
              </button>
              <button
                onClick={() => setActiveTab('steps')}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition outline-none cursor-pointer text-center ${
                  activeTab === 'steps' 
                    ? 'border-emerald-500 text-emerald-600 bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Cách sử dụng
              </button>
            </div>

            <div className="p-6">
              
              {/* Tab 1: Info & mechanisms */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Quy trình Vượt & Lấy mã Tự động Mới (Phiên bản 2.2.0)</h4>
                    <p className="text-slate-600 text-sm leading-relaxed mt-1">
                      Extension sử dụng thuật toán thông minh tương tác trực tiếp với DOM để thay đổi cơ chế vượt link thô sơ trước đó, cho phép rảnh tay vượt qua các Shortlink Việt Nam phức tạp:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex gap-3">
                      <span className="p-2.5 bg-emerald-500 text-white rounded-lg h-10 w-10 flex items-center justify-center shrink-0 font-bold">
                        1
                      </span>
                      <div>
                        <h5 className="font-bold text-emerald-950 text-sm">Tự động Quét Chỉ dẫn & Mở Google</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Khi bạn truy cập shortlink (trafficvn, link1s, v.v.), script phân tích hướng dẫn lấy từ khóa (ví dụ: <b className="text-emerald-700">"cakhiatv"</b>) và địa chỉ trang đích. Sau đó tự động truy cập hoặc mở Google Search chỉ trong 1 giây.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                      <span className="p-2.5 bg-blue-500 text-white rounded-lg h-10 w-10 flex items-center justify-center shrink-0 font-bold">
                        2
                      </span>
                      <div>
                        <h5 className="font-bold text-blue-950 text-sm">Nhận diện & Click Web Đích</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Mở trang Google, định vị chính xác vị trí bài viết có tiêu đề hoặc tên miền khớp với chỉ dẫn (như <b className="text-blue-700">"cakhiatv9.com"</b>) và thực hiện nhấp chuột chuyển hướng an toàn.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex gap-3">
                      <span className="p-2.5 bg-purple-500 text-white rounded-lg h-10 w-10 flex items-center justify-center shrink-0 font-bold">
                        3
                      </span>
                      <div>
                        <h5 className="font-bold text-purple-950 text-sm">Tự động Cuộn (Auto Scroll) trang</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Trang web đích bắt buộc cuộn chuột để kích hoạt bộ đếm ngược. Script tự động cuộn trang lướt lên xuống mô phỏng lướt ngẫu nhiên của người dùng thật để countdown không bao giờ bị dừng.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 flex gap-3">
                      <span className="p-2.5 bg-amber-500 text-white rounded-lg h-10 w-10 flex items-center justify-center shrink-0 font-bold">
                        4
                      </span>
                      <div>
                        <h5 className="font-bold text-amber-950 text-sm">Đếm ngược (Countdown) & Lấy mã</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Tự kích hoạt nút <b className="text-amber-700 font-semibold">"Vào đại hết thời gian"</b>, chờ khoảng thời gian 15-30s kết thúc, trích xuất mã (dạng text hoặc ảnh bằng công nghệ OCR).
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 flex gap-3 md:col-span-2">
                      <span className="p-2.5 bg-teal-500 text-white rounded-lg h-10 w-10 flex items-center justify-center shrink-0 font-bold">
                        5 & 6
                      </span>
                      <div>
                        <h5 className="font-bold text-teal-950 text-sm">Dán mã Tự động & Vượt qua Cloudflare bảo mật</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Lưu trữ mã vào bộ nhớ đệm cục bộ, tự động dán mã vào ô input, nhấp xác nhận để đi tiếp. Hỗ trợ thông báo nếu bạn gặp trang Turnstile bảo mật để an toàn 100%. Không sử dụng Proxy hay VPN bên thứ 3 tránh bị ban.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-350 flex items-start gap-2.5">
                    <Code className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-white">Đi kèm tệp tin chạy ngầm Python Script chuyên dụng</h5>
                      <p className="mt-1 leading-relaxed text-slate-350">
                        Ngoài tiện ích mở rộng Chrome/Firefox, phiên bản 2.1.0 bổ sung tệp Python Script (sử dụng <b>Selenium & Tesseract OCR</b>) cho phép tự động hóa toàn diện bằng một click từ Terminal của bạn!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Supporting domains list */}
              {activeTab === 'domains' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Hơn 45+ Nền Tảng Hỗ Trợ Đầy Đủ</h4>
                    <p className="text-xs text-slate-500 mt-1">Danh sách được cập nhật liên tục để bao quát toàn bộ các trang kiếm tiền hoặc chia sẻ tài nguyên phổ biến.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-bold text-emerald-700 text-sm flex items-center gap-1.5 mb-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Nhóm 1: Sniffing Redirect Thầm Lặng (Dành cho trang Bitly, TinyURL...)
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {group1Domains.map((dom) => (
                          <div key={dom} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] truncate flex items-center justify-between">
                            <span>{dom}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <h5 className="font-bold text-blue-700 text-sm flex items-center gap-1.5 mb-2.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Nhóm 2: Tương tác DOM & Giải mã (Link1s, Megaurl, Ouo, Adfly...)
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {group2Domains.map((dom) => (
                          <div key={dom} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] truncate flex items-center justify-between">
                            <span>{dom}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Detailed file tree template editor */}
              {activeTab === 'files' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">Xem trước Mã nguồn Tệp Tin</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Mã nguồn nguyên bản cấu tạo nên bộ extension rút gọn.</p>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedFile ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Code className="h-3.5 w-3.5" />}
                      {copiedFile ? 'Đã copy!' : 'Copy Code'}
                    </button>
                  </div>

                  {/* Horizontal file pills */}
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
                    {Object.keys(extensionFiles).map((filename) => (
                      <button
                        key={filename}
                        onClick={() => setSelectedFile(filename as keyof typeof extensionFiles)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition cursor-pointer select-none ${
                          selectedFile === filename 
                            ? 'bg-white text-emerald-600 shadow-xs' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {filename}
                      </button>
                    ))}
                  </div>

                  {/* Code viewport block */}
                  <div className="relative">
                    <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-[400px] leading-relaxed select-all">
                      {extensionFiles[selectedFile]}
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 4: Step by step configuration guide */}
              {activeTab === 'steps' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Hướng dẫn Cài Đặt (Load Unpacked Mode)</h4>
                    <p className="text-xs text-slate-500 mt-1">Làm theo 4 bước nhỏ dưới đây để kích hoạt tính năng bypass trên trình duyệt cá nhân.</p>
                  </div>

                  <div className="space-y-4 relative pl-4 border-l-2 border-emerald-200">
                    <div className="relative">
                      <span className="absolute -left-[25px] top-0.5 p-1 px-2.5 text-xs font-extrabold bg-emerald-500 text-white rounded-full">1</span>
                      <h5 className="font-bold text-sm text-slate-900">Tải tệp tin về máy</h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Nhấp vào nút màu xanh <b>"Tải Extension (.ZIP)"</b> ở đầu trang để tải xuống tệp gói nén ZIP có đầy đủ tệp manifest, popup, background, content và icons.
                      </p>
                    </div>

                    <div className="relative py-2">
                      <span className="absolute -left-[25px] top-2 p-1 px-2.5 text-xs font-extrabold bg-emerald-500 text-white rounded-full">2</span>
                      <h5 className="font-bold text-sm text-slate-900">Giải nén tệp gốc</h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Sau khi tải xuống thành công tệp <b>Bypass_Shortlink_Vietnam.zip</b>, nhấn chuột phải và bấm <b>Giải nén ngay (Extract to...)</b> ra một thư mục để dễ quản lý.
                      </p>
                    </div>

                    <div className="relative py-2">
                      <span className="absolute -left-[25px] top-2 p-1 px-2.5 text-xs font-extrabold bg-emerald-500 text-white rounded-full">3</span>
                      <h5 className="font-bold text-sm text-slate-900">Bật Chế độ nhà phát triển trên Chrome</h5>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Mở tab mới trên trình duyệt Google Chrome hoặc Microsoft Edge, truy xuất liên kết: <b className="font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">chrome://extensions/</b>. Sau đó gạt công tắc <b>"Chế độ nhà phát triển / Developer mode"</b> ở cạnh góc trên cùng bên phải màn hình sang trạng thái BẬT.
                      </p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[25px] top-0.5 p-1 px-2.5 text-xs font-extrabold bg-emerald-500 text-white rounded-full">4</span>
                      <h5 className="font-bold text-sm text-slate-900">Tải tiện ích đã giải nén</h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Bấm nút <b>"Tải tiện ích đã giải nén / Load unpacked"</b> nằm ở góc trên cùng bên trái màn hình. Chọn chính xác vị trí thư mục zip vừa giải nén của bạn. Ngay lập tức, biểu tượng sấm sét biểu trưng của tiện ích nén bypass sẽ xuất hiện trên thanh công cụ!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right column - Sidebar logs and status summary */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick specs card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm tracking-tight mb-4 flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-emerald-500" />
              Tổng quan Kiến Trúc
            </h4>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Loại sản phẩm:</span>
                <span className="font-semibold text-slate-900">Web Extension</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Chuẩn thiết kế:</span>
                <span className="font-semibold text-slate-900">Chrome Manifest V3</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Tương thích:</span>
                <span className="font-semibold text-slate-900">Chrome, Edge, Firefox, Brave</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500">Thành phần:</span>
                <span className="font-semibold text-slate-900">Background Worker, Content CSS/JS</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Trình kéo nút DOM:</span>
                <span className="font-semibold text-slate-900">Hỗ trợ đa ngôn ngữ</span>
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Mã Nguồn Đóng Gói Sẵn
              </div>
              <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
                Tải về định dạng file nén bao gồm đầy đủ tệp cấu trúc chuẩn được kiểm thử và rà soát an toàn. Bạn có thể sử dụng trực tiếp để đóng gói đưa lên cửa hàng Google Web Store phục vụ cộng đồng.
              </p>
            </div>
          </div>

          {/* Quick FAQ accordion */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm tracking-tight mb-4 flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-emerald-500" />
              Câu hỏi thường gặp (FAQ)
            </h4>

            <div className="space-y-4 text-xs">
              <div>
                <h5 className="font-bold text-slate-900 mb-1">Gặp Captcha thì xử lý như thế nào?</h5>
                <p className="text-slate-600 leading-relaxed">
                  Vì lý do bảo mật và bảo vệ người dùng khỏi việc spam, khi trang rút gọn yêu cầu giải mã Captcha hình ảnh hay đám mây Cloudflare, extension của chúng tôi sẽ tạm dừng và thông báo cho bạn tự giải mã trước khi tiếp tục chuyển tiếp.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h5 className="font-bold text-slate-900 mb-1">Extension này có chứa virus quảng cáo không?</h5>
                <p className="text-slate-600 leading-relaxed">
                  Trực tiếp kiểm duyệt: mã nguồn của tiện ích hoàn toàn tách bạch, rõ ràng, không chứa bất kỳ tracker quảng cáo chèn ép nào và chặn hoàn toàn popunder bất lợi.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h5 className="font-bold text-slate-900 mb-1">Tôi có tự thêm bớt domain vào bộ lọc được không?</h5>
                <p className="text-slate-600 leading-relaxed">
                  Bạn có thể chỉnh sửa trực tiếp tệp tin <code>manifest.json</code> và <code>utils.js</code> để bổ sung thêm các domain mong muốn một cách dễ dàng trước khi nạp tệp unpacked.
                </p>
              </div>
            </div>
          </div>

        </aside>
      </main>

      {/* Footer Banner */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-auto shadow-inner">
        <p>© 2026 Bypass Shortlink Việt Nam. Mã nguồn mở, an toàn và tối giản.</p>
      </footer>
    </div>
  );
}
