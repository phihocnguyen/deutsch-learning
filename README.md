# Deutsch Quest

Website học từ vựng Đức–Việt bằng Next.js 16, React 19 và Tailwind CSS 4, giao diện pixel.

## Chạy local

```sh
npm ci
npm run dev
```

Mở http://localhost:3000. Trên PowerShell chặn npm.ps1, dùng `npm.cmd` thay cho `npm`.

```sh
npm run build
npm start
npm run lint
npm test
```

Tests dùng khả năng chạy TypeScript trực tiếp của Node.js; dùng Node >=22.18 (đã kiểm tra bằng Node 26).

## Chức năng hiện có

- 25 từ/cụm từ A1, 5 chủ đề, nghĩa Việt, ví dụ và dạng số nhiều cho danh từ.
- `/vocabulary`: tìm kiếm, lọc chủ đề/trạng thái và nghe phát âm.
- `/flashcards`: bấm toàn bộ mặt thẻ để lật 3D (hoặc Enter/Space), chuyển thẻ, đánh dấu đã nhớ/cần ôn; hiển thị cả mạo từ và số nhiều, nghe số nhiều ngay ở mặt trước.
- `/progress`: thống kê từ, danh sách từ theo trạng thái thực tế và lịch sử 50 lượt bài tập gần nhất.
- `/games`: nối từ, chọn nghĩa, nghe đoán từ, sắp xếp chữ; chọn chủ đề, 5 từ/lượt, chấm điểm lần đầu, xem kết quả, chơi lại và lưu các từ sai vào danh sách cần ôn.
- `/exercises`: điền từ đúng dạng vào câu, chọn mạo từ và dịch Việt–Đức. Có giải thích, nghe đáp án, thử lại và lượt ôn riêng cho những từ sai; lọc theo chủ đề hoặc từ cần ôn.
- Font pixel VT323 hỗ trợ tiếng Việt và tiếng Đức, được Next.js tự phục vụ từ ứng dụng.

## Audio

Tất cả từ và câu ví dụ dùng giọng tiếng Đức của trình duyệt qua Web Speech API.
Danh từ được đọc kèm mạo từ, ví dụ `das Haus`, `der Apfel`, `die Tür`.
Ưu tiên giọng `de-DE`, sau đó giọng tiếng Đức khác có trên thiết bị.
Không có giọng Đức thì ứng dụng báo rõ, không tự chuyển sang giọng ngôn ngữ khác.
Audio chỉ bắt đầu khi người dùng bấm, có nút dừng, không phát chồng nhau.
Nếu danh sách giọng chưa sẵn sàng, nút hiển thị trạng thái tải và chờ tối đa 10 giây;
khi giọng Đức xuất hiện, câu đang chờ được đọc tự động. Đổi thẻ hoặc dừng sẽ hủy lượt chờ.
Chất lượng và khả năng dùng offline phụ thuộc giọng do trình duyệt/hệ điều hành cung cấp.
Không sử dụng file bản thu, dịch vụ audio riêng hay API key.

## Lưu tiến độ

`localStorage`, key `deutsch-quest-progress-v1`, schema `{ version: 1, words: { [id]: "known" | "review" } }`.
Schema vẫn nhận dữ liệu cũ. Trường `exercises` tùy chọn lưu tối đa 50 kết quả gần nhất:
ID lượt, dạng bài, luyện mới/ôn lại, thời điểm hoàn thành, tổng câu, số câu đúng lần đầu và ID từ sai.
Chỉ lưu khi bấm hoàn thành lượt; bài đang làm sẽ không được khôi phục khi tải lại trang.
Thử lại một câu không thay đổi điểm lần đầu. Lượt ôn có ID riêng, không ghi đè kết quả trước đó.
Khi hoàn thành, các từ sai được đánh dấu cần ôn; trả lời đúng không tự thay đổi đánh dấu từ của người học.
Dữ liệu được lọc theo các ID hợp lệ; dữ liệu lỗi hoặc phiên bản không hỗ trợ được báo cho người dùng.
Khi lưu thất bại, trạng thái tiếp tục được giữ trong bộ nhớ của phiên. Các tab nhận thay đổi qua storage event.
Không có tài khoản hay đồng bộ cloud. Xóa dữ liệu trình duyệt sẽ mất tiến độ.

## Cấu trúc

- `lib/vocabulary.ts`: bộ từ dùng chung.
- `lib/progress.ts`: schema và kiểm tra dữ liệu tiến độ.
- `lib/exercises.ts`: câu hỏi, đáp án và giải thích; đáp án điền từ có cả dạng chia động từ.
- `app/components/`: giao diện học, lưu tiến độ, phát âm và điều hướng.
- `tests/progress.test.mjs`: kiểm tra dữ liệu lưu, bộ từ và mạo từ trong văn bản phát âm.
- `tests/games.test.mjs`, `tests/speech.test.mjs`: kiểm tra điểm, bộ câu hỏi, Unicode tiếng Đức và tải giọng bất đồng bộ.
- `tests/exercises.test.mjs`: câu hỏi/đáp án, dữ liệu cũ, giới hạn lịch sử và tránh lưu trùng kết quả.
- `e2e/learning.spec.ts`, `e2e/exercises.spec.ts`: kiểm tra giao diện, lượt chơi và bài tập bằng Playwright.
- `PLAN.md`: trạng thái và commit từng phase.

Chạy kiểm tra trình duyệt:

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright sử dụng dev server tại localhost:3000 hoặc tự mở server nếu chưa có.
Kiểm tra audio dùng giọng giả lập để kiểm chứng văn bản đọc và trạng thái tải;
chất lượng giọng thật vẫn phụ thuộc trình duyệt/hệ điều hành.
