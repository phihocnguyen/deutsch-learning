# Quản trị người dùng

Đăng nhập tại `/admin/login`, quản lý người học tại `/admin/users` và xem góp ý/báo lỗi tại `/admin/feedback`.

`/admin/login` là màn hình riêng, không có sidebar học tập. Các trang quản trị dùng sidebar admin với mục Quản lý người dùng, menu đóng/mở trên điện thoại và liên kết về trang học tập. Các trang người học dùng layout riêng trong route group `(learning)`; đường dẫn URL của chúng không đổi.

## Cài đặt

1. Đặt `DATABASE_URL` trong `.env.local` hoặc môi trường máy chủ.
2. Chạy `npm run db:migrate` để tạo/cập nhật các bảng, bao gồm `feedback_reports`.
3. Đặt `ADMIN_SEED_USERNAME` (mặc định `admin`) và `ADMIN_SEED_PASSWORD` trong môi trường của lệnh seed, rồi chạy `npm run db:seed-admin`.

Lệnh seed chỉ tạo tài khoản mới, xác minh mật khẩu đã băm và không ghi đè mật khẩu của admin có sẵn. Mật khẩu cần 12–1024 ký tự, không lưu trong source code. Sau khi seed, xóa biến mật khẩu seed khỏi môi trường nếu không còn dùng.

Admin dùng tài khoản riêng, tách khỏi danh sách người học Google. Mật khẩu được băm bằng scrypt với salt ngẫu nhiên; phiên 8 giờ dùng token ngẫu nhiên trong cookie HttpOnly, SameSite=Strict (Secure trên production), chỉ lưu SHA-256 của token trong database. Sau 5 lần đăng nhập sai liên tiếp, tài khoản tạm khóa 15 phút. Có thể đặt thêm `ADMIN_EMAILS` là danh sách email Google được xác minh, ngăn cách bằng dấu phẩy, để cấp quyền admin cho các tài khoản Google đã có; quyền này chỉ do cấu hình máy chủ quyết định.

## Chức năng

- Thống kê tổng số, đang hoạt động, đã khóa; tìm theo tên/email, lọc trạng thái, phân trang 25 người.
- Đổi tên hiển thị, khóa/mở khóa và thu hồi mọi phiên đăng nhập của người học.
- Khóa sẽ xóa các phiên hiện tại, ngăn đăng nhập Google mới và từ chối đọc phiên cho tài khoản đã khóa.
- Xóa yêu cầu nhập lại email hoặc ID để xác nhận. Tài khoản, liên kết Google, phiên đăng nhập, chủ đề, flashcard và tiến độ trong database được xóa trong một transaction; lỗi sẽ rollback. Dữ liệu localStorage trên thiết bị không nằm trong phạm vi quản lý này.
- Không cho khóa/xóa/thu hồi phiên của chính tài khoản admin Google đang thao tác hoặc bất kỳ tài khoản thuộc `ADMIN_EMAILS`. Trang này không chỉnh sửa danh tính/email Google và không cấp quyền admin từ trình duyệt.
- Người học gửi góp ý hoặc báo lỗi từ nút cạnh avatar. API lấy người gửi từ phiên đăng nhập, giới hạn 5 phản hồi/24 giờ/tài khoản; trang admin hiển thị nội dung, loại, thời gian, trang gửi và tên/email người gửi nếu tài khoản còn tồn tại.

Trang và mọi API quản trị đều kiểm tra phiên admin ở máy chủ. Các mutation còn kiểm tra Origin. Phiên admin riêng không cấp quyền truy cập API dữ liệu học tập của người học. `proxy.ts` chỉ chuyển yêu cầu admin đến lớp kiểm tra quyền này.
