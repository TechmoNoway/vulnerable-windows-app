## **1. Remote Command Execution (RCE) – Thực Thi Lệnh Từ Xa**

**Là gì?**

RCE là một lỗ hổng nghiêm trọng cho phép kẻ tấn công thực thi các lệnh hệ thống trên máy chủ đích với quyền hạn của ứng dụng.

**Cách hoạt động trong ứng dụng của bạn:**

```tsx
exec(command, (error, stdout, stderr) => {
  // THỰC THI LỆNH NGƯỜI DÙNG NHẬP VÀO — không kiểm tra an toàn
});
```

**Cách kiểm tra:**

- Gửi yêu cầu đến endpoint `/api/execute` với một lệnh như `whoami` hoặc `dir`.

**Tác động thực tế:**

- Truy cập và đọc/xoá file hệ thống
- Cài phần mềm độc hại
- Chiếm quyền kiểm soát máy chủ

**Cách phòng tránh:**

- Không nên cho phép người dùng gửi lệnh hệ thống.
- Nếu buộc phải làm, chỉ cho phép chạy một số lệnh nằm trong danh sách trắng.

---

## **2. Insecure File Permissions – Quyền File Không An Toàn**

**Là gì?**

Lỗi do tạo file với quyền truy cập quá rộng, cho phép bất kỳ người dùng nào thay đổi hoặc xoá file.

**Ví dụ trong mã:**

```tsx
execSync(`icacls "${filePath}" /grant Everyone:F`);
```

**Cách kiểm tra:**

- Tạo một file và dùng `icacls` để kiểm tra quyền truy cập.
- Nếu thấy `Everyone:(F)` là không an toàn.

**Tác động thực tế:**

- Người dùng có quyền thấp vẫn có thể sửa đổi file nhạy cảm
- Dẫn đến thực thi mã độc

**Phòng tránh:**

- Chỉ cấp quyền cần thiết theo nguyên tắc **"ít quyền nhất"**
- Dùng API để thiết lập quyền rõ ràng và giới hạn

---

## **3. Unquoted Service Path – Đường dẫn dịch vụ không đặt trong dấu nháy**

**Là gì?**

Trên Windows, nếu đường dẫn tới tệp thực thi của dịch vụ có khoảng trắng và không có dấu nháy (`"`), hệ điều hành sẽ tìm kiếm sai lệch và có thể chạy mã độc.

**Cách hoạt động:**

```tsx
sc create "ServiceName" binPath= C:\Program Files\Vuln App\app.exe
```

**Tác động thực tế:**

- Hacker có thể đặt mã độc tên là `C:\Program.exe`
- Khi dịch vụ khởi động, Windows sẽ chạy `Program.exe` đầu tiên

**Phòng tránh:**

- Luôn đặt toàn bộ đường dẫn trong dấu nháy:

```bash
sc create "ServiceName" binPath= "C:\Program Files\Vuln App\app.exe"
```

---

## **4. Registry Modification – Thay đổi Registry không kiểm soát**

**Là gì?**

Sửa đổi registry của Windows mà không kiểm tra quyền hoặc nội dung, có thể gây nguy hiểm.

**Cách hoạt động:**

```tsx
reg add "${key}" /v "${valueName}" /d "${data}" /f
```

**Tác động thực tế:**

- Cài phần mềm khởi động cùng hệ thống
- Vô hiệu hóa các tính năng bảo mật như Windows Defender
- Duy trì quyền truy cập (persistence)

**Phòng tránh:**

- Giới hạn quyền truy cập registry
- Chỉ thao tác với key được xác định trước

---

## **5. Windows Path Traversal – Đi xuyên đường dẫn**

**Là gì?**

Lỗ hổng cho phép người dùng truy cập file ngoài thư mục dự định bằng cách thao túng đường dẫn (ví dụ: `..\..\..`).

**Cách hoạt động:**

```tsx
fs.readFileSync(filePath)
```

**Ví dụ khai thác:**

**Tác động thực tế:**

- Truy cập các file cấu hình hoặc dữ liệu nhạy cảm
- Đọc dữ liệu ẩn qua Alternate Data Streams (ADS)

**Phòng tránh:**

- Chuẩn hoá và kiểm tra đường dẫn
- Chỉ cho phép truy cập trong thư mục an toàn định sẵn

---

## **6. SQL Injection – Chèn mã SQL**

**Mô** Ứng dụng dễ bị tấn công SQL Injection vì chèn trực tiếp dữ liệu người dùng vào câu lệnh SQL mà không có biện pháp bảo vệ.

---

### 🧨 **Mô tả chi tiết lỗ hổng**

### 📍 Vị trí lỗ hổng 1: API đăng nhập (`/api/login`)

Trong file `database.ts`, hàm `loginUser` chứa đoạn mã sau:

```tsx
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

**Vấn đề**: Mã này nối trực tiếp giá trị `username` và `password` vào câu lệnh SQL, cho phép kẻ tấn công chèn mã độc để vượt qua xác thực.

**Ví dụ tấn công**:

- Nhập username: `admin' --`
- Nhập mật khẩu: (bất kỳ)

Câu truy vấn trở thành:

```sql
SELECT * FROM users WHERE username = 'admin' -- ' AND password = '...
```

Ký tự `--` được dùng làm chú thích trong SQL, vô hiệu hóa phần kiểm tra mật khẩu. Kết quả: kẻ tấn công có thể đăng nhập vào tài khoản `admin` mà không cần mật khẩu.

---

### 📍 Vị trí lỗ hổng 2: API tìm kiếm người dùng (`/api/search-users`)

Hàm `searchUsers` cũng có lỗ hổng tương tự:

```tsx
typescript
CopyEdit
const query = `SELECT id, username, email, role FROM users WHERE username LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%'`;

```

**Vấn đề**: Việc chèn trực tiếp `searchTerm` vào câu SQL cho phép thực thi lệnh SQL tùy ý.

**Ví dụ tấn công**:

- Từ khóa tìm kiếm: `%' UNION SELECT 1,username,password,role FROM users --`

Câu truy vấn biến thành:

```sql
sql
CopyEdit
SELECT id, username, email, role FROM users
WHERE username LIKE '%%'
UNION SELECT 1,username,password,role FROM users -- %' OR email LIKE '%%'

```

Kết quả: hệ thống sẽ trả về toàn bộ tên người dùng và mật khẩu từ bảng `users`.

---

### 🔬 **Cách kiểm tra lỗ hổng**

1. **Bypass đăng nhập**:
    - Nhập: `admin' --` vào trường username
    - Đăng nhập thành công mà không cần mật khẩu
2. **Trích xuất dữ liệu người dùng**:
    - Nhập chuỗi tìm kiếm: `%' UNION SELECT 1,username,password,role FROM users --`
    - Hệ thống sẽ trả về dữ liệu nhạy cảm

---

### ✅ **Cách khắc phục**

Sử dụng **truy vấn có tham số (parameterized queries)** để tách biệt dữ liệu người dùng khỏi câu lệnh SQL:

```tsx
typescript
CopyEdit
const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
db.get(query, [username, password], (err, row) => {
  // xử lý kết quả
});

```

**Lợi ích**: Truy vấn có tham số ngăn chặn hoàn toàn khả năng chèn mã SQL từ người dùng.

---

### 📌 **Mức độ nghiêm trọng**: **CAO**

- Gây **mất quyền kiểm soát tài khoản admin**
- Cho phép **rò rỉ toàn bộ thông tin người dùng**
- Có thể dẫn đến **chiếm quyền hệ thống và đánh cắp dữ liệu**

---

## **7. DLL Hijacking – Chiếm quyền DLL**

**Là gì?**

Nếu một ứng dụng không chỉ rõ đường dẫn khi tải DLL, Windows sẽ tìm DLL ở nhiều nơi. Kẻ tấn công có thể đặt một DLL giả mạo sớm trong đường tìm kiếm.

```tsx
// in windows-vulns.ts
export function simulateDllLoading(dllPath: string) {
  try {
    log(`[VULNERABILITY] Simulating DLL loading from: ${dllPath}`);
    
    if (!fs.existsSync(dllPath)) {
      return { success: false, message: `DLL not found at ${dllPath}` };
    }
    
    // In a real vulnerable app, this would actually load the DLL
    return { success: true, message: `DLL at ${dllPath} would be loaded (simulation)` };
  } catch (error) {
    // Error handling
  }
}
```

**Tác động thực tế:**

- Chạy mã độc với quyền của ứng dụng
- Leo thang đặc quyền

**Phòng tránh:**

- Luôn sử dụng đường dẫn đầy đủ khi nạp DLL
- Kích hoạt chế độ tìm kiếm DLL an toàn trong registry
- Kiểm tra chữ ký số của DLL