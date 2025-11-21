# CURL

## 1. Sign Up (Đăng ký)

```bash
curl -X POST https://sync-be-api.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## 2. Sign In (Đăng nhập)

```bash
curl -X POST https://sync-be-api.onrender.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## 3. Get Profile (Lấy thông tin user)

```bash
curl -X GET https://sync-be-api.onrender.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Lưu ý:** Thay `YOUR_TOKEN_HERE` bằng token nhận được từ Sign In.

