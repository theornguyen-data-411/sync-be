# CURL

## 1. Sign Up (Đăng ký)

```bash
curl -X POST https://sync-be-f8rn.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## 2. Sign In (Đăng nhập)

```bash
curl -X POST https://sync-be-f8rn.onrender.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## 3. Get Profile (Lấy thông tin user)

```bash
curl -X GET https://sync-be-f8rn.onrender.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 4. Logout (Đăng xuất)

```bash
curl -X POST https://sync-be-f8rn.onrender.com/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Lưu ý:** Thay `YOUR_TOKEN_HERE` bằng token nhận được từ Sign In.

---

## 5. Create Task

### 5.1. Tạo Task với Energy Rating (Bắt buộc các rating fields)

**Required fields:**
- `description` (Title): Bắt buộc
- `startTime`: Bắt buộc
- `endTime`: Bắt buộc
- `focusLevel`: Bắt buộc (low/medium/high)
- `mentalLoad`: Bắt buộc (low/medium/high)
- `movement`: Bắt buộc (low/medium/high)
- `urgency`: Bắt buộc (low/medium/high)

**Optional fields:**
- `date`: Mặc định là ngày đang chọn (Planning Tab)
- `enableEnergyRating`: Mặc định `true`
- `tag`: Optional (deep_work/admin/communicating/learning)
- `repeat`: Mặc định `null` (Does not repeat)
- `note`: Optional
- `subtasks`: Optional
- `locked`: Mặc định `false`

```bash
curl -X POST https://sync-be-f8rn.onrender.com/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
        "description":"Prepare quarterly finance report",
        "startTime":"09:00",
        "endTime":"11:00",
        "focusLevel":"high",
        "mentalLoad":"high",
        "movement":"low",
        "urgency":"high",
        "date":"2025-01-01",
        "tag":"deep_work",
        "note":"Need draft for leadership sync",
        "subtasks":[
          {"title":"Collect data"},
          {"title":"Create slides"}
        ],
        "enableEnergyRating":true,
        "locked":false
      }'
```

### 5.2. Tạo Task với Energy Rating OFF (Rating fields sẽ được set default = "low")

```bash
curl -X POST https://sync-be-f8rn.onrender.com/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
        "description":"Quick email check",
        "startTime":"10:00",
        "endTime":"10:30",
        "enableEnergyRating":false,
        "date":"2025-01-01",
        "note":"Check inbox and respond to urgent emails"
      }'
```

### 5.3. Tạo Task tối thiểu (chỉ các trường bắt buộc)

```bash
curl -X POST https://sync-be-f8rn.onrender.com/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
        "description":"Team meeting",
        "startTime":"14:00",
        "endTime":"15:00",
        "focusLevel":"medium",
        "mentalLoad":"medium",
        "movement":"low",
        "urgency":"medium"
      }'
```

### 5.4. Tạo Task với AI Scoring (tự động tính rating nếu không cung cấp)

```bash
curl -X POST https://sync-be-f8rn.onrender.com/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
        "description":"Deep work on architecture design",
        "startTime":"09:00",
        "endTime":"12:00",
        "focusLevel":"high",
        "useAiScoring":true,
        "useAiTagging":true,
        "date":"2025-01-01"
      }'
```

**Lưu ý:** Khi `enableEnergyRating=true` (mặc định), bạn **phải** cung cấp đầy đủ 4 rating fields (focusLevel, mentalLoad, movement, urgency). Nếu không, API sẽ trả về lỗi 400.

## 6. List Tasks (Filter + hiểu rõ aiSchedule)

```bash
curl "https://sync-be-f8rn.onrender.com/api/tasks?energyZone=Peak&tag=deep_work&date=2025-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

- Response có 2 nhóm:
  - Task `aiSchedule=true`: đứng ở đầu list và đã được backend sort theo Zone → Mana → Date.
  - Task `aiSchedule=false`: nằm cuối list theo thứ tự tạo để FE tự drag/drop.

## 7. Get Task Detail

```bash
curl https://sync-be-f8rn.onrender.com/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 8. Update Task (Force AI recalculation)

```bash
curl -X PUT https://sync-be-f8rn.onrender.com/api/tasks/TASK_ID \
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
curl -X DELETE https://sync-be-f8rn.onrender.com/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 10. AI Preview (Không lưu DB)

```bash
curl -X POST https://sync-be-f8rn.onrender.com/api/tasks/ai/preview \
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

## 11. Subtask Templates (Tái sử dụng subtask cũ khi tạo task mới)

API này dùng cho màn **Create Task**: khi người dùng mở phần Subtask (dropdown / sheet), FE gọi để lấy danh sách subtask đã dùng trước đó của **chính user hiện tại**.

### 11.1. Lấy danh sách subtask templates

**Mặc định**: trả về tối đa 50 subtask khác nhau, sort theo thời gian sử dụng gần nhất.

```bash
curl "https://sync-be-f8rn.onrender.com/api/tasks/subtasks/templates" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response ví dụ:**

```json
{
  "items": [
    {
      "title": "Check email",
      "lastUsedAt": "2025-01-01T10:00:00.000Z",
      "usageCount": 5
    },
    {
      "title": "Prepare slides",
      "lastUsedAt": "2025-01-02T09:00:00.000Z",
      "usageCount": 3
    }
  ],
  "count": 2
}
```

### 11.2. Search theo keyword (cho ô search trong dropdown)

Thêm query param `q` để filter theo `title` (không phân biệt hoa thường):

```bash
curl "https://sync-be-f8rn.onrender.com/api/tasks/subtasks/templates?q=email" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Gợi ý dùng ở FE:**
- Khi user mở phần Subtask: gọi API ở 11.1 để hiển thị list gợi ý.
- Khi user gõ text trong ô search: debounce và gọi lại API với `q=...`.
- Khi user chọn 1 item: map thành `{ "title": "<title>" }` và đưa vào mảng `subtasks` trong body `POST /api/tasks`.


