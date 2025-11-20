# Hướng dẫn Deploy API (Free Hosting)

Sau khi deploy, bạn sẽ có một URL API (ví dụ: `https://your-api.onrender.com`) để cung cấp cho frontend dev.

## Các biến môi trường cần thiết

Trước khi deploy, bạn cần chuẩn bị các biến môi trường sau:

- `PORT` - Port của server (thường tự động set bởi platform)
- `MONGO_URI` - Connection string của MongoDB (bắt buộc)
- `JWT_SECRET` - Secret key cho JWT (bắt buộc)
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID (nếu dùng Google Sign-in)
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret (nếu dùng Google Sign-in)

---

## Cách 1: Deploy trên Render (Khuyến nghị - Free tốt nhất)

### Ưu điểm:
- ✅ Free tier ổn định
- ✅ Không cần thẻ tín dụng
- ✅ Tự động deploy từ GitHub
- ⚠️ Có thể sleep sau 15 phút không dùng (nhưng vẫn đủ cho dev)

### Bước 1: Tạo tài khoản
1. Truy cập https://render.com
2. Đăng nhập bằng GitHub

### Bước 2: Tạo Web Service
1. Click "New +" → "Web Service"
2. Connect repository của bạn
3. Cấu hình:
   - **Name:** sync-be-api (hoặc tên bạn muốn)
   - **Environment:** Node
   - **Region:** Singapore (gần Việt Nam nhất)
   - **Branch:** main (hoặc branch bạn muốn deploy)
   - **Root Directory:** (để trống)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Bước 3: Cấu hình biến môi trường
Trong phần "Environment Variables", thêm:
- `MONGO_URI` = connection string MongoDB của bạn
- `JWT_SECRET` = một chuỗi ngẫu nhiên mạnh (ví dụ: `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` = (nếu cần)
- `GOOGLE_CLIENT_SECRET` = (nếu cần)
- `NODE_ENV` = `production`

### Bước 4: Deploy
1. Click "Create Web Service"
2. Render sẽ tự động build và deploy
3. Sau khi deploy xong, URL sẽ là: `https://sync-be-api.onrender.com`
4. Copy URL này và gửi cho frontend dev

**Lưu ý:** Lần đầu deploy có thể mất 5-10 phút. Nếu service sleep, request đầu tiên sẽ mất ~30 giây để wake up.

---

## Cách 2: Deploy trên Fly.io (Free - Không sleep)

### Ưu điểm:
- ✅ Free tier tốt (3 VMs miễn phí)
- ✅ Không bị sleep
- ✅ Performance tốt
- ⚠️ Cần cài CLI và setup phức tạp hơn một chút

### Bước 1: Cài đặt Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### Bước 2: Đăng nhập
```bash
fly auth login
```

### Bước 3: Tạo app
```bash
fly launch
```
- Chọn region gần nhất (ví dụ: `sin` - Singapore)
- Không tạo Postgres (vì dùng MongoDB)
- Không deploy ngay

### Bước 4: Cấu hình biến môi trường
```bash
fly secrets set MONGO_URI="your-mongodb-uri"
fly secrets set JWT_SECRET="your-jwt-secret"
fly secrets set GOOGLE_CLIENT_ID="your-client-id"  # nếu cần
fly secrets set GOOGLE_CLIENT_SECRET="your-client-secret"  # nếu cần
```

### Bước 5: Deploy
```bash
fly deploy
```

Sau khi deploy, URL sẽ là: `https://your-app-name.fly.dev`

---

## Cách 3: Deploy trên Koyeb (Free - Không sleep)

### Ưu điểm:
- ✅ Free tier không sleep
- ✅ Tự động deploy từ GitHub
- ✅ Dễ setup

### Bước 1: Tạo tài khoản
1. Truy cập https://www.koyeb.com
2. Đăng nhập bằng GitHub

### Bước 2: Tạo App
1. Click "Create App"
2. Chọn "GitHub" → chọn repository
3. Cấu hình:
   - **Name:** sync-be-api
   - **Build Command:** `npm install`
   - **Run Command:** `npm start`
   - **Region:** Singapore

### Bước 3: Thêm biến môi trường
Trong tab "Variables", thêm:
- `MONGO_URI`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID` (nếu cần)
- `GOOGLE_CLIENT_SECRET` (nếu cần)

### Bước 4: Deploy
1. Click "Deploy"
2. URL sẽ là: `https://sync-be-api-xxxxx.koyeb.app`

---

## Cách 4: Deploy trên Cyclic.sh (Free - Serverless)

### Ưu điểm:
- ✅ Free tier không sleep
- ✅ Serverless (auto scale)
- ✅ Tự động deploy từ GitHub

### Bước 1: Tạo tài khoản
1. Truy cập https://www.cyclic.sh
2. Đăng nhập bằng GitHub

### Bước 2: Deploy
1. Click "Deploy Now"
2. Chọn repository
3. Cyclic sẽ tự động detect và deploy

### Bước 3: Thêm biến môi trường
Trong dashboard, vào "Environment Variables" và thêm các biến cần thiết.

URL sẽ là: `https://your-app.cyclic.app`

---

## Setup MongoDB (Bắt buộc)

### MongoDB Atlas (Free - Khuyến nghị)
1. Truy cập https://www.mongodb.com/cloud/atlas
2. Tạo tài khoản miễn phí
3. Tạo cluster free (M0 - Shared)
4. Tạo database user:
   - Vào "Database Access" → "Add New Database User"
   - Username/Password (lưu lại)
5. Whitelist IP:
   - Vào "Network Access" → "Add IP Address"
   - Chọn "Allow Access from Anywhere" (0.0.0.0/0) cho development
6. Lấy connection string:
   - Vào "Database" → "Connect" → "Connect your application"
   - Copy connection string
   - Thay `<password>` bằng password bạn đã tạo
   - Ví dụ: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority`

### Railway MongoDB (Nếu dùng Railway)
1. Trong Railway dashboard, click "New"
2. Chọn "Database" → "MongoDB"
3. Railway sẽ tự động tạo và cung cấp `MONGO_URI` trong biến môi trường

---

## Kiểm tra API sau khi deploy

1. **Health check:**
   ```
   GET https://your-api-url.com/health
   ```
   Kết quả mong đợi: `{ "status": "OK", "message": "API is running" }`

2. **Test endpoint:**
   ```bash
   POST https://your-api-url.com/api/auth/signup
   Content-Type: application/json
   
   {
     "email": "test@example.com",
     "password": "123456"
   }
   ```

---

## Cung cấp API cho Frontend Dev

Sau khi deploy thành công, gửi cho frontend dev:

### 1. Base URL
```
https://your-api-url.com
```

### 2. API Endpoints
- `POST /api/auth/signup` - Đăng ký
  - Body: `{ "email": "string", "password": "string" }`
  
- `POST /api/auth/signin` - Đăng nhập
  - Body: `{ "email": "string", "password": "string" }`
  - Response: `{ "token": "string", "user": {...} }`
  
- `POST /api/auth/google` - Google Sign-in
  - Body: `{ "idToken": "string" }`
  - Response: `{ "token": "string", "user": {...} }`
  
- `GET /api/auth/profile` - Lấy thông tin user (Protected)
  - Headers: `Authorization: Bearer <token>`

### 3. Headers cần thiết
- `Content-Type: application/json` (cho POST/PUT)
- `Authorization: Bearer <token>` (cho protected routes)

### 4. Ví dụ sử dụng
```javascript
// Đăng nhập
const response = await fetch('https://your-api-url.com/api/auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.token; // Lưu token này

// Gọi API protected
const profile = await fetch('https://your-api-url.com/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## So sánh các platform

| Platform | Free Tier | Sleep? | Setup | Tốt cho |
|----------|-----------|--------|-------|---------|
| **Render** | ✅ Tốt | ⚠️ Có (15 phút) | ⭐⭐⭐⭐⭐ Dễ | Development, Demo |
| **Fly.io** | ✅ Tốt | ✅ Không | ⭐⭐⭐ Trung bình | Production nhỏ |
| **Koyeb** | ✅ Tốt | ✅ Không | ⭐⭐⭐⭐ Dễ | Production |
| **Cyclic** | ✅ Tốt | ✅ Không | ⭐⭐⭐⭐⭐ Dễ | Serverless API |

**Khuyến nghị:** Dùng **Render** cho development/demo, **Koyeb** hoặc **Fly.io** cho production.

---

## Troubleshooting

### Lỗi kết nối MongoDB
- ✅ Kiểm tra `MONGO_URI` đúng chưa
- ✅ Kiểm tra IP whitelist trên MongoDB Atlas (nên dùng 0.0.0.0/0 cho dev)
- ✅ Kiểm tra username/password trong connection string
- ✅ Kiểm tra network access trên MongoDB Atlas

### Lỗi CORS
- ✅ Đã thêm CORS middleware vào code
- ✅ Nếu vẫn lỗi, kiểm tra frontend URL có đúng không
- ✅ Có thể cần config CORS cụ thể hơn trong `index.js`

### API không chạy / Lỗi 500
- ✅ Kiểm tra logs trên platform deploy
- ✅ Kiểm tra biến môi trường đã set đúng chưa
- ✅ Kiểm tra PORT có được set tự động không
- ✅ Kiểm tra MongoDB connection

### Service bị sleep (Render)
- ✅ Request đầu tiên sau khi sleep sẽ mất ~30 giây
- ✅ Có thể dùng uptime monitor (như UptimeRobot) để keep-alive
- ✅ Hoặc chuyển sang Fly.io/Koyeb nếu cần không sleep

### Build failed
- ✅ Kiểm tra `package.json` có đúng không
- ✅ Kiểm tra Node version (thường auto-detect)
- ✅ Kiểm tra build logs để xem lỗi cụ thể

---

## Tips

1. **Tạo JWT_SECRET mạnh:**
   ```bash
   # Windows PowerShell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

2. **Test local trước khi deploy:**
   ```bash
   npm install
   # Tạo file .env với các biến môi trường
   npm run dev
   ```

3. **Monitor logs:**
   - Render: Dashboard → Logs
   - Fly.io: `fly logs`
   - Koyeb: Dashboard → Logs

4. **Auto-deploy từ GitHub:**
   - Tất cả platform đều hỗ trợ auto-deploy khi push code
   - Chỉ cần push lên branch chính là tự động deploy

