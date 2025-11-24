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

## 4. Logout (Đăng xuất)

```bash
curl -X POST https://sync-be-api.onrender.com/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Lưu ý:** Thay `YOUR_TOKEN_HERE` bằng token nhận được từ Sign In.

---

## 5. Create Task (AI scoring + tag AI optional)

```bash
curl -X POST https://sync-be-api.onrender.com/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
        "description":"Prepare quarterly finance report",
        "aiSchedule":true,
        "date":"2025-01-01",
        "startTime":"09:00",
        "endTime":"11:00",
        "tag":"deep_work",
        "useAiTagging":false,
        "note":"Need draft for leadership sync",
        "subtasks":[
          {"title":"Collect data"},
          {"title":"Create slides"}
        ]
      }'
```

## 6. List Tasks (Filter + hiểu rõ aiSchedule)

```bash
curl "https://sync-be-api.onrender.com/api/tasks?energyZone=Peak&tag=deep_work&date=2025-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

- Response có 2 nhóm:
  - Task `aiSchedule=true`: đứng ở đầu list và đã được backend sort theo Zone → Mana → Date.
  - Task `aiSchedule=false`: nằm cuối list theo thứ tự tạo để FE tự drag/drop.

## 7. Get Task Detail

```bash
curl https://sync-be-api.onrender.com/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 8. Update Task (Force AI recalculation)

```bash
curl -X PUT https://sync-be-api.onrender.com/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
        "description":"Finalize finance report",
        "useAiScoring":true,
        "useAiTagging":true,
        "status":"in_progress",
        "aiSchedule":true
      }'
```

## 9. Delete Task

```bash
curl -X DELETE https://sync-be-api.onrender.com/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 10. AI Preview (Không lưu DB)

```bash
curl -X POST https://sync-be-api.onrender.com/api/tasks/ai/preview \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
        "description":"Deep work on product strategy",
        "focusLevel":"high",
        "movement":"low",
        "useAiTagging":true,
        "aiSchedule":true
      }'
```


