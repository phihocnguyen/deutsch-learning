# Deutsch Quest — kế hoạch triển khai

Website học từ vựng Đức–Việt bằng Next.js App Router, TypeScript và Tailwind CSS 4.
Làm việc trong repository hiện tại; chưa triển khai hosting.
Mỗi phase hoàn tất và được kiểm tra sẽ có một commit riêng.
Tác giả commit: kris <ng.phihoc123@gmail.com>.

## Phase 0 — Khởi tạo và kế hoạch
- Giữ nguyên scaffold và AGENTS.md của Next.js.
- Ghi nhận kế hoạch, kiểm tra trạng thái Git và phiên bản thư viện.
- Commit: `intialize`.

## Phase 1 — Giao diện pixel và điều hướng
- Màu kem, xanh lá, vàng; viền vuông, bóng cứng lệch xuống như nút game.
- Nút có trạng thái nhấn, hover, focus, disabled; giảm chuyển động khi người dùng yêu cầu.
- Trang tổng quan, thư viện từ, flashcard, khu trò chơi, bài tập và tiến độ.
- Responsive trên điện thoại và desktop; tiếng Việt dễ đọc, không dùng font pixel cho đoạn dài.
- Kiểm tra: TypeScript, build và điều hướng, kích thước màn hình, bàn phím.
- Commit: `feat: add pixel interface and learning navigation`.

## Phase 2 — Từ vựng, flashcard và audio
- Bộ từ A1 theo chủ đề: chào hỏi, gia đình, đồ ăn, nhà cửa và sinh hoạt.
- Mỗi từ có nghĩa Việt, giống danh từ khi áp dụng, số nhiều, câu ví dụ và nghĩa câu.
- Flashcard lật mặt, nghe từ/câu, đánh dấu đã nhớ hoặc cần ôn, lọc chủ đề.
- Lưu tiến độ trên thiết bị bằng localStorage với xử lý dữ liệu lỗi và phiên bản schema.
- Audio ưu tiên bản thu người Đức có nguồn và quyền sử dụng rõ ràng; lưu thông tin nguồn.
- Giọng tổng hợp de-DE chỉ là phương án dự phòng, có nhãn phân biệt; báo khi không có giọng Đức.
- Không gọi giọng tổng hợp là bản thu người bản xứ và không tự nhận đã xác minh người thu khi chưa có bằng chứng.
- Kiểm tra: chuyển thẻ, lọc, lưu/khôi phục tiến độ, phát âm và lỗi audio.
- Commit: `feat: add vocabulary flashcards and German pronunciation`.

## Phase 3 — Bốn game từ vựng
- Nối từ Đức–Việt: xáo trộn hai cột, phản hồi đúng/sai và hoàn thành lượt chơi.
- Chọn nghĩa: một từ Đức và các đáp án Việt không trùng nhau.
- Nghe đoán từ: nghe audio rồi chọn từ; chỉ tính điểm sau khi xác nhận.
- Sắp xếp chữ: ghép ký tự thành từ, giữ đúng umlaut và ß; hỗ trợ nhập bằng bàn phím.
- Chọn chủ đề, tính điểm, xem kết quả và chơi lại; tránh cộng điểm nhiều lần cho cùng câu.
- Kiểm tra: chấm điểm, câu sai, kết thúc, chơi lại và bộ từ ít phần tử.
- Commit: `feat: add four vocabulary learning games`.

## Phase 4 — Bài tập và ôn luyện
- Bài tập điền từ vào câu, chọn mạo từ der/die/das và dịch từ Việt sang Đức.
- Giải thích đáp án, cho thử lại và ôn những từ trả lời sai.
- Theo dõi số từ đã học và kết quả bài tập thực tế, không dùng số liệu giả.
- Quy tắc chấm rõ ràng: bỏ khoảng trắng thừa, xử lý hoa/thường phù hợp từng dạng bài.
- Kiểm tra: đáp án có dấu, bài hoàn thành, khôi phục dữ liệu và cập nhật tiến độ.
- Commit: `feat: add exercises and review progress`.

## Phase 5 — Kiểm tra và bàn giao
- Chạy lint, TypeScript và production build; sửa lỗi phát hiện được.
- Kiểm tra các luồng chính trong trình duyệt nếu công cụ cho phép; ghi rõ giới hạn kiểm tra.
- Kiểm tra bàn phím, tương phản, giao diện mobile và trạng thái không có audio.
- Cập nhật README: cách chạy, cấu trúc, nguồn audio và giới hạn lưu dữ liệu trên thiết bị.
- Commit: `chore: verify learning flows and document setup`.

## Nguyên tắc triển khai
- Đọc tài liệu tương ứng trong node_modules/next/dist/docs trước khi viết code Next.js.
- Dùng chung bộ dữ liệu và logic tiến độ cho flashcard, game và bài tập.
- Chưa thêm tài khoản, backend, bảng xếp hạng trực tuyến hoặc dịch vụ có phí.
- Cập nhật trạng thái phase trong file này theo kết quả thực tế.

## Trạng thái
- Phase 0: hoàn tất, commit `ea36307` (`intialize`).
- Phase 1: hoàn tất giao diện pixel, điều hướng 6 khu học, bố cục responsive, focus bàn phím và reduced motion. `npm.cmd run build` (bao gồm TypeScript) và `npm.cmd run lint` đều thành công. Chưa kiểm tra trực quan bằng trình duyệt hoặc thao tác bàn phím thực tế; các khu học là khung giao diện có ghi rõ trạng thái.
- Phase 2–5: chưa triển khai.
