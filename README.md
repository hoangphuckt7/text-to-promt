# Veo Story-to-Prompt Builder

Chuyên gia chuyển đổi câu chuyện & kịch bản thành video prompt chi tiết cho **Google Veo 3** (Veo 3.1 Pro / Fast / Lite) với phong cách điện ảnh và nhân vật nhất quán bằng Gemini AI.

---

## 🚀 Hướng dẫn cài đặt và chạy ở máy Local

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18 trở lên (khuyên dùng Node.js 20 LTS hoặc mới nhất).
- **npm** (đi kèm Node.js) hoặc **pnpm** / **yarn** / **bun**.

Kiểm tra phiên bản trong terminal:
```bash
node -v
npm -v
```

---

### 2. Cài đặt các gói phụ thuộc (Dependencies)
Mở terminal tại thư mục dự án và chạy:
```bash
npm install
```

---

### 3. Cấu hình biến môi trường (`.env`)
Tạo một file có tên `.env` ở thư mục gốc của dự án (cùng cấp với `package.json`):

```bash
# Tạo file .env từ file mẫu
cp .env.example .env
```

Mở file `.env` và điền API Key của Google Gemini:
```env
# Lấy miễn phí tại: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="AIzaSy..."

# Cổng chạy ứng dụng (mặc định 3000)
PORT=3000
```

> **Lưu ý**: Bạn có thể lấy **GEMINI_API_KEY** miễn phí tại [Google AI Studio](https://aistudio.google.com/app/apikey).

---

### 4. Chạy môi trường phát triển (Development)
Chạy lệnh sau để khởi động cả backend Express API và frontend Vite:
```bash
npm run dev
```

Sau khi terminal hiển thị:
```
Server running on http://0.0.0.0:3000
```
Mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)**

---

### 5. Build và chạy bản Production (Tùy chọn)

Nếu bạn muốn đóng gói ứng dụng để deploy hoặc chạy bản tối ưu:

```bash
# 1. Build frontend Vite sang thư mục dist/
npm run build

# 2. Khởi chạy server production
npm run start
```

Mở trình duyệt tại **[http://localhost:3000](http://localhost:3000)**.

---

## 🛠️ Cấu trúc dự án

- `server.ts`: Backend Express Server xử lý gọi Gemini API và tích hợp middleware Vite.
- `src/App.tsx`: Giao diện chính điều phối toàn bộ luồng chia cảnh, cấu hình và kết quả prompt.
- `src/components/`: Các thành phần giao diện (Header, Nhập kịch bản, Danh sách cảnh, Phong cách, Nhân vật, Cài đặt chung, Lưu preset).
- `src/utils/sceneSplitter.ts`: Thuật toán tách cảnh theo tốc độ nói (~8s) hoặc từng câu đơn.
- `src/utils/storage.ts`: Quản lý lưu trữ local trên trình duyệt và xuất file `.TXT`, `.CSV`.
- `src/data/defaults.ts`: Thư viện tag phong cách, thể loại, kịch bản mẫu và nhân vật mặc định.
