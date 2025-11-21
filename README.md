# Sync Backend API

RESTful API backend cho ứng dụng Sync, hỗ trợ authentication với email/password và Google OAuth.

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Mongoose ODM)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Google Auth Library** - OAuth 2.0 authentication

## 📋 Prerequisites

- Node.js (v16 hoặc cao hơn)
- MongoDB Atlas account (hoặc MongoDB local)
- npm hoặc yarn

## 🔧 Installation

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd sync-be
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Tạo file `.env`:**
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Chạy development server:**
   ```bash
   npm run dev
   ```

Server sẽ chạy tại `http://localhost:3000`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/signup` - Đăng ký user mới
- `POST /api/auth/signin` - Đăng nhập
- `POST /api/auth/google` - Đăng nhập bằng Google OAuth
- `GET /api/auth/profile` - Lấy thông tin user (Protected)

### Health Check

- `GET /health` - Kiểm tra trạng thái API

## 🌐 Deploy trên Render

Render là một platform miễn phí và dễ sử dụng để deploy Node.js applications. Hướng dẫn chi tiết:

### Bước 1: Chuẩn bị MongoDB Atlas

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo tài khoản miễn phí (nếu chưa có)
3. Tạo cluster free (M0 - Shared)
4. Tạo database user:
   - Vào **Database Access** → **Add New Database User**
   - Chọn **Password** authentication
   - Tạo username và password (lưu lại cẩn thận)
5. Whitelist IP:
   - Vào **Network Access** → **Add IP Address**
   - Chọn **Allow Access from Anywhere** (`0.0.0.0/0`) cho development
   - Click **Confirm**
6. Lấy connection string:
   - Vào **Database** → **Connect** → **Connect your application**
   - Copy connection string
   - Thay `<password>` bằng password bạn đã tạo
   - Ví dụ: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority`

### Bước 2: Tạo tài khoản Render

1. Truy cập [Render](https://render.com)
2. Đăng nhập bằng GitHub account
3. Xác thực email (nếu cần)

### Bước 3: Tạo Web Service trên Render

1. Trong Render Dashboard, click **New +** → **Web Service**
2. Connect GitHub repository:
   - Chọn repository `sync-be`
   - Click **Connect**
3. Cấu hình service:
   - **Name:** `sync-be-api` (hoặc tên bạn muốn)
   - **Environment:** `Node`
   - **Region:** `Singapore` (gần Việt Nam nhất)
   - **Branch:** `main` (hoặc branch bạn muốn deploy)
   - **Root Directory:** (để trống)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Click **Create Web Service**

### Bước 4: Cấu hình Environment Variables

Trong Render Dashboard, vào tab **Environment** và thêm các biến sau:

| Key | Value | Mô tả |
|-----|-------|-------|
| `MONGO_URI` | `mongodb+srv://...` | Connection string từ MongoDB Atlas |
| `JWT_SECRET` | `your-secret-key` | Secret key cho JWT (tạo chuỗi ngẫu nhiên mạnh) |
| `GOOGLE_CLIENT_ID` | `your-client-id` | Google OAuth Client ID (nếu dùng) |
| `GOOGLE_CLIENT_SECRET` | `your-client-secret` | Google OAuth Client Secret (nếu dùng) |
| `NODE_ENV` | `production` | Environment mode |

**Lưu ý:** 
- Không commit file `.env` lên Git
- Tất cả secrets phải được thêm trong Render Dashboard
- JWT_SECRET nên là chuỗi ngẫu nhiên mạnh (ít nhất 32 ký tự)

### Bước 5: Deploy

1. Sau khi cấu hình xong, Render sẽ tự động bắt đầu build và deploy
2. Quá trình build mất khoảng 5-10 phút lần đầu
3. Bạn có thể xem logs trong tab **Logs** để theo dõi quá trình
4. Khi deploy thành công, bạn sẽ thấy URL: `https://sync-be-api.onrender.com`

### Bước 6: Kiểm tra Deployment

1. **Health check:**
   ```bash
   curl https://sync-be-api.onrender.com/health
   ```
   Kết quả mong đợi: `{"status":"OK","message":"API is running"}`

2. **Test Sign Up (Đăng ký):**
   ```bash
   curl -X POST https://sync-be-api.onrender.com/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"123456"}'
   ```
   Kết quả mong đợi: `{"msg":"User registered successfully"}`

3. **Test Sign In (Đăng nhập):**
   ```bash
   curl -X POST https://sync-be-api.onrender.com/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"123456"}'
   ```
   Kết quả mong đợi: 
   ```json
   {
     "message": "Login successful",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "user_id",
       "email": "test@example.com",
       "fullName": null
     }
   }
   ```
   **Lưu ý:** Lưu lại `token` từ response để dùng cho API Get Profile

4. **Test Get Profile (Lấy thông tin user):**
   ```bash
   curl -X GET https://sync-be-api.onrender.com/api/auth/profile \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```
   Thay `YOUR_TOKEN_HERE` bằng token nhận được từ Sign In.
   
   Kết quả mong đợi:
   ```json
   {
     "_id": "user_id",
     "email": "test@example.com",
     "fullName": null,
     "authType": "local",
     "createdAt": "2024-01-01T00:00:00.000Z",
     "updatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `GOOGLE_CLIENT_ID` | No | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth Client Secret |

## 📝 API Documentation

### POST /api/auth/signup

Đăng ký user mới.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "msg": "User registered successfully"
}
```

**Error (400):**
```json
{
  "msg": "Email already exists"
}
```

### POST /api/auth/signin

Đăng nhập user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "fullName": "User Name"
  }
}
```

### POST /api/auth/google

Đăng nhập bằng Google OAuth.

**Request:**
```json
{
  "idToken": "google_id_token_from_client"
}
```

**Response (200):**
```json
{
  "message": "Google Login successful",
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@gmail.com",
    "fullName": "User Name",
    "avatarUrl": "https://..."
  }
}
```

### GET /api/auth/profile

Lấy thông tin user hiện tại (Protected route).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "fullName": "User Name",
  "avatarUrl": "https://...",
  "authType": "local",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🛠️ Development

### Scripts

- `npm start` - Chạy production server
- `npm run dev` - Chạy development server với nodemon

### Project Structure

```
sync-be/
├── config/
│   └── db.js              # MongoDB connection configuration
├── controller/
│   └── authController.js  # Authentication business logic
├── middleware/
│   └── authMiddleware.js  # JWT authentication middleware
├── model/
│   └── User.js            # User Mongoose model
├── routes/
│   └── authRoutes.js      # Authentication routes
├── index.js               # Application entry point
├── package.json
└── render.yaml            # Render deployment configuration
```

## ⚠️ Lưu ý quan trọng

1. **Free Tier Limitations:**
   - Render free tier có thể sleep sau 15 phút không có request
   - Request đầu tiên sau khi sleep sẽ mất ~30 giây để wake up
   - Đủ cho development và demo, nhưng không phù hợp cho production

2. **Security:**
   - Không bao giờ commit file `.env` lên Git
   - Sử dụng JWT_SECRET mạnh (ít nhất 32 ký tự)
   - Whitelist IP trên MongoDB Atlas chỉ cho phép IP cần thiết

3. **MongoDB Atlas:**
   - Free tier có giới hạn 512MB storage
   - Đủ cho development và small projects
   - Monitor usage trong Atlas dashboard

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB

- Kiểm tra `MONGO_URI` đúng format chưa
- Kiểm tra IP whitelist trên MongoDB Atlas
- Kiểm tra username/password trong connection string

### API không chạy trên Render

- Kiểm tra logs trong Render Dashboard
- Kiểm tra environment variables đã set đúng chưa
- Kiểm tra build logs để xem lỗi cụ thể

### Service bị sleep

- Request đầu tiên sau khi sleep sẽ mất ~30 giây
- Có thể dùng uptime monitor (như UptimeRobot) để keep-alive
- Hoặc upgrade lên paid plan nếu cần

## 📄 License

ISC

## 👤 Author

Theorng
