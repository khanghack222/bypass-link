<div align="center">
<img width="1200" height="475" alt="Bypass Shortlink Pro" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Bypass Shortlink Pro

An intelligent browser extension and web application that uses AI to automatically analyze and bypass Vietnamese shortlink verification pages. Built with React, Express, and Google Gemini AI.

Một tiện ích mở rộng trình duyệt và ứng dụng web thông minh sử dụng AI để tự động phân tích và vượt qua các trang xác minh liên kết rút gọn tiếng Việt. Được xây dựng với React, Express và Google Gemini AI.

View app in AI Studio: https://ai.studio/apps/d656d3da-3c61-4df1-a895-11f17b08d112

Xem ứng dụng trên AI Studio: https://ai.studio/apps/d656d3da-3c61-4df1-a895-11f17b08d112

## Features / Tính năng

- **AI-Powered Analysis**: Uses Google Gemini AI (or OpenRouter) to analyze shortlink pages and extract instructions
- **Phân tích bằng AI**: Sử dụng Google Gemini AI (hoặc OpenRouter) để phân tích trang liên kết rút gọn và trích xuất hướng dẫn

- **Heuristic Fallback**: Local NLP heuristics engine as fallback when AI is unavailable
- **Dự phòng Heuristic**: Công cụ NLP heuristic cục bộ làm phương án dự phòng khi AI không khả dụng

- **Browser Extension**: Chrome extension for seamless integration
- **Tiện ích mở rộng**: Tiện ích Chrome để tích hợp liền mạch

- **Smart Redirect Detection**: Automatically follows HTTP redirects and meta refresh tags
- **Phát hiện chuyển hướng thông minh**: Tự động theo dõi các thẻ chuyển hướng HTTP và meta refresh

- **Vietnamese Language Support**: Optimized for Vietnamese shortlink sites
- **Hỗ trợ tiếng Việt**: Tối ưu hóa cho các trang web liên kết rút gọn tiếng Việt

## Project Structure / Cấu trúc dự án

```
├── src/                    # React frontend source code / Mã nguồn frontend React
│   ├── App.tsx            # Main React application component / Component ứng dụng React chính
│   ├── codeTemplates.ts   # Code templates for various platforms / Mẫu code cho các nền tảng khác nhau
│   ├── main.tsx           # React entry point / Điểm nhập React
│   └── index.css          # Global styles / Styles toàn cục
├── extension/              # Chrome extension files / Tệp tiện ích mở rộng Chrome
│   ├── manifest.json      # Extension configuration / Cấu hình tiện ích
│   ├── background.js      # Background service worker / Service worker nền
│   ├── content.js         # Content script for page manipulation / Script nội dung để thao tác trang
│   ├── popup.html         # Extension popup UI / Giao diện popup tiện ích
│   ├── popup.js           # Popup logic / Logic popup
│   └── utils.js           # Utility functions / Hàm tiện ích
├── server.ts              # Express backend server with AI APIs / Máy chủ backend Express với API AI
├── index.html             # HTML entry point / Điểm nhập HTML
├── vite.config.ts         # Vite build configuration / Cấu hình build Vite
└── tsconfig.json          # TypeScript configuration / Cấu hình TypeScript
```

## Prerequisites / Yêu cầu tiên quyết

- Node.js (v18 or higher recommended) / Node.js (khuyến nghị v18 trở lên)
- npm or yarn / npm hoặc yarn
- A Gemini API key (or OpenRouter API key) / Khóa API Gemini (hoặc khóa API OpenRouter)

## Installation / Cài đặt

1. **Clone the repository** (if applicable) / Clone repository (nếu có):
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies** / Cài đặt dependencies:
   ```bash
   npm install
   ```

3. **Configure environment variables** / Cấu hình biến môi trường:
   
   Create a `.env.local` file based on `.env.example` / Tạo tệp `.env.local` dựa trên `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API key / Chỉnh sửa `.env.local` và thêm khóa API của bạn:
   ```env
   # GEMINI_API_KEY: Required for Gemini AI API calls
   # GEMINI_API_KEY: Bắt buộc cho các lời gọi API Gemini AI
   GEMINI_API_KEY="your-gemini-api-key-here"
   
   # APP_URL: The URL where this app is hosted
   # APP_URL: URL nơi ứng dụng này được lưu trữ
   APP_URL="https://your-domain.com/"
   ```

## Running Locally / Chạy cục bộ

### Development Mode / Chế độ phát triển

Start the development server with hot reload / Khởi động máy chủ phát triển với hot reload:

```bash
npm run dev
```

The app will be available at `http://localhost:3000` / Ứng dụng sẽ khả dụng tại `http://localhost:3000`

### Build for Production / Build cho production

Build the frontend and bundle the server / Build frontend và đóng gói máy chủ:

```bash
npm run build
```

### Production Mode / Chế độ production

Run the production server / Chạy máy chủ production:

```bash
npm run start
```

### Other Commands / Các lệnh khác

```bash
# Clean build artifacts / Xóa các tệp build
npm run clean

# Run TypeScript type checking / Chạy kiểm tra kiểu TypeScript
npm run lint
```

## API Endpoints / Các điểm cuối API

The server provides several API endpoints / Máy chủ cung cấp một số điểm cuối API:

| Endpoint | Method | Description / Mô tả |
|----------|--------|-------------|
| `/api/health` | GET | Health check endpoint / Điểm kiểm tra trạng thái |
| `/api/gemini/test` | POST | Test AI connection (Gemini or OpenRouter) / Kiểm tra kết nối AI (Gemini hoặc OpenRouter) |
| `/api/gemini/analyze` | POST | Analyze HTML content and extract instructions / Phân tích nội dung HTML và trích xuất hướng dẫn |
| `/api/bypass-proxy` | GET | CORS-safe redirect proxy for testing / Proxy chuyển hướng an toàn CORS để kiểm tra |

### Example: Analyze Content / Ví dụ: Phân tích nội dung

```bash
curl -X POST http://localhost:3000/api/gemini/analyze \
  -H "Content-Type: application/json" \
  -d '{"html": "<html>...</html>", "url": "https://example.com"}'
```

## Browser Extension Installation / Cài đặt tiện ích mở rộng trình duyệt

1. Open Chrome and navigate to `chrome://extensions/` / Mở Chrome và truy cập `chrome://extensions/`
2. Enable "Developer mode" in the top right / Bật "Chế độ nhà phát triển" ở góc trên bên phải
3. Click "Load unpacked" / Nhấp vào "Tải lên chưa đóng gói"
4. Select the `extension/` directory / Chọn thư mục `extension/`
5. The extension icon should appear in your toolbar / Biểu tượng tiện ích sẽ xuất hiện trên thanh công cụ của bạn

## AI Engine Options / Tùy chọn công cụ AI

The application supports multiple AI backends / Ứng dụng hỗ trợ nhiều backend AI:

1. **Google Gemini API** (default): Direct integration with Google's Gemini models
   **Google Gemini API** (mặc định): Tích hợp trực tiếp với các mô hình Gemini của Google

2. **OpenRouter**: Alternative endpoint supporting Gemini models
   **OpenRouter**: Điểm cuối thay thế hỗ trợ các mô hình Gemini

3. **Local Heuristics**: Fallback NLP engine when no API key is configured
   **Heuristic cục bộ**: Công cụ NLP dự phòng khi không có khóa API được cấu hình

## Technology Stack / Công nghệ sử dụng

- **Frontend**: React 19, TypeScript, TailwindCSS, Motion (animations), Lucide React (icons)
- **Backend**: Express.js, TypeScript
- **Build Tools**: Vite, esbuild, tsx
- **AI**: Google Generative AI SDK (@google/genai)
- **Utilities**: dotenv, jszip

## Configuration / Cấu hình

### Vite Configuration / Cấu hình Vite

See `vite.config.ts` for frontend build settings including TailwindCSS integration / Xem `vite.config.ts` để biết cài đặt build frontend bao gồm tích hợp TailwindCSS.

### TypeScript Configuration / Cấu hình TypeScript

See `tsconfig.json` for TypeScript compiler options / Xem `tsconfig.json` để biết các tùy chọn trình biên dịch TypeScript.

## Security Notes / Ghi chú bảo mật

- Never commit your `.env.local` file with actual API keys / Không bao giờ commit tệp `.env.local` với khóa API thực tế
- The `.env.example` file contains placeholder values only / Tệp `.env.example` chỉ chứa các giá trị giữ chỗ
- API keys are stored server-side and never exposed to the client / Khóa API được lưu trữ ở phía máy chủ và không bao giờ hiển thị cho client

## License / Giấy phép

This project is private and proprietary. / Dự án này là riêng tư và độc quyền.

## Support / Hỗ trợ

For issues or questions, please refer to the AI Studio documentation or contact support. / Đối với các vấn đề hoặc câu hỏi, vui lòng tham khảo tài liệu AI Studio hoặc liên hệ hỗ trợ.
