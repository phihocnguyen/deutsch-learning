# Deutsch Quest

Website học từ vựng Đức–Việt và ngữ pháp A1–A2 bằng Next.js 16, React 19 và Tailwind CSS 4, giao diện pixel.

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
- `/grammar`: hai mục ngữ pháp A1 và A2, mỗi mục 14 bài; tổng 28 bài và 89 câu luyện. Bài đã đánh dấu đọc có nền xanh nhẹ. Mỗi bài có mục tiêu, quy tắc, bảng mẫu, ví dụ có audio, lỗi thường gặp và phạm vi áp dụng.
- `/grammar/a1?lesson=a1-time`: bài đọc giờ chi tiết với vor/nach/halb/Viertel, đồng hồ tương tác, hai cách đọc 12/24 giờ và 8 câu luyện.
- Ngữ pháp có nguồn đối chiếu trong `lib/grammar/` và `docs/grammar/`; theo yêu cầu người dùng, reference không hiển thị trên giao diện học.
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

Ngữ pháp lưu riêng trong `deutsch-quest-grammar-v1`: danh sách bài đã đọc và tối đa
50 lượt luyện gần nhất, không ghi vào dữ liệu từ vựng. Kết quả gần nhất từng câu
được tổng hợp từ lịch sử còn lưu; lượt ôn chỉ cập nhật những câu được ôn. Đánh dấu
đã đọc là thao tác của người học, không tự coi là đã đạt chuẩn ngữ pháp.
Chấm ngữ pháp giữ hoa/thường, umlaut, ß và dấu câu theo đề; không áp dụng cách chấm
không phân biệt hoa/thường của bài từ vựng cho mọi bài ngữ pháp.

## Cấu trúc

- `lib/vocabulary.ts`: bộ từ dùng chung.
- `lib/progress.ts`: schema và kiểm tra dữ liệu tiến độ.
- `lib/exercises.ts`: câu hỏi, đáp án và giải thích; đáp án điền từ có cả dạng chia động từ.
- `lib/grammar/`: bài A1/A2, thông tin đối chiếu, chấm đáp án, schema tiến độ và cách đọc giờ.
- `app/components/`: giao diện học, lưu tiến độ, phát âm và điều hướng.
- `tests/progress.test.mjs`: kiểm tra dữ liệu lưu, bộ từ và mạo từ trong văn bản phát âm.
- `tests/games.test.mjs`, `tests/speech.test.mjs`: kiểm tra điểm, bộ câu hỏi, Unicode tiếng Đức và tải giọng bất đồng bộ.
- `tests/exercises.test.mjs`: câu hỏi/đáp án, dữ liệu cũ, giới hạn lịch sử và tránh lưu trùng kết quả.
- `tests/grammar.test.mjs`, `tests/time.test.mjs`: phạm vi bài học, đáp án thay thế, chữ hoa/dấu, dữ liệu ngữ pháp và các mốc giờ.
- `e2e/learning.spec.ts`, `e2e/exercises.spec.ts`: kiểm tra giao diện, lượt chơi và bài tập bằng Playwright.
- `e2e/quality.spec.ts`: kiểm tra màn hình nhỏ, điều hướng, bàn phím, giảm chuyển động, lỗi dữ liệu, đồng bộ hai tab, audio và 404.
- `e2e/grammar.spec.ts`: hai mục A1/A2, 28 bài học, luyện/ôn/lưu, highlight bài đọc, màn hình nhỏ và đồng hồ tương tác.
- `scripts/test-production.mjs`: mở và dừng production server cho kiểm tra tự động, kể cả trên Windows.
- `PLAN.md`: trạng thái và commit từng phase.

Chạy kiểm tra trình duyệt:

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright sử dụng dev server tại localhost:3000 hoặc tự mở server nếu chưa có.
Để kiểm tra trên bản production:

```sh
npm run test:e2e:prod
```

Lệnh này build, mở server riêng tại localhost:3100, chạy kiểm tra và dừng server sau khi xong.
Giữ cổng 3100 trống trước khi chạy. Dev server cổng 3000 vẫn có thể chạy song song.

## Kết quả bàn giao

- Lint, TypeScript và production build thành công.
- 29 unit tests và 20 kiểm tra trình duyệt Chromium trên bản production đều qua.
- Đã kiểm tra 6 trang ở độ rộng 320, 390, 768 và 1366px; bảng game đang chơi cũng vừa màn hình 320px.
- Kiểm tra bàn phím, giảm chuyển động, font pixel, số nhiều, tải giọng chậm/hủy chờ, dữ liệu lỗi và đồng bộ giữa hai tab.
- Có trang 404 tiếng Việt, tiêu đề riêng từng trang và biểu tượng pixel của ứng dụng.

## Giới hạn hiện tại

Kiểm tra audio dùng giọng giả lập để kiểm chứng văn bản đọc và trạng thái tải;
chất lượng giọng thật vẫn phụ thuộc trình duyệt/hệ điều hành.
Chưa kiểm tra trực tiếp Safari/Firefox hoặc nghe giọng thật trên từng thiết bị.
Nội dung hiện có 25 từ/cụm từ A1; bài dịch chấm theo từ trong bộ đã học, chưa có chấm câu tự do.
Ngữ pháp là lộ trình nền tảng tự biên soạn, chưa bao phủ mọi phần của mọi giáo trình
A1/A2 và chưa có giáo viên độc lập duyệt toàn bộ. Nguồn, phạm vi và các điểm rà soát
được ghi trong `docs/grammar/`; tests phần mềm không phải kiểm định học thuật.
Tiến độ và lịch sử chỉ nằm trên trình duyệt hiện tại, không có tài khoản hay đồng bộ cloud.
Mã nguồn đã sẵn sàng chạy local; chưa triển khai hosting.
