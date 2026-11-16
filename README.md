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
- `/flashcards`: lật thẻ, chuyển thẻ, đánh dấu đã nhớ/cần ôn.
- `/progress`: thống kê và danh sách từ theo trạng thái thực tế.
- Game và bài tập hiện là khung giao diện, sẽ triển khai trong phase tiếp theo.

## Audio

Tất cả từ và câu ví dụ dùng giọng tiếng Đức của trình duyệt qua Web Speech API.
Danh từ được đọc kèm mạo từ, ví dụ `das Haus`, `der Apfel`, `die Tür`.
Ưu tiên giọng `de-DE`, sau đó giọng tiếng Đức khác có trên thiết bị.
Không có giọng Đức thì ứng dụng báo rõ, không tự chuyển sang giọng ngôn ngữ khác.
Audio chỉ bắt đầu khi người dùng bấm, có nút dừng, không phát chồng nhau.
Chất lượng và khả năng dùng offline phụ thuộc giọng do trình duyệt/hệ điều hành cung cấp.
Không sử dụng file bản thu, dịch vụ audio riêng hay API key.

## Lưu tiến độ

`localStorage`, key `deutsch-quest-progress-v1`, schema `{ version: 1, words: { [id]: "known" | "review" } }`.
Dữ liệu được lọc theo các ID hợp lệ; dữ liệu lỗi hoặc phiên bản không hỗ trợ được báo cho người dùng.
Khi lưu thất bại, trạng thái tiếp tục được giữ trong bộ nhớ của phiên. Các tab nhận thay đổi qua storage event.
Không có tài khoản hay đồng bộ cloud. Xóa dữ liệu trình duyệt sẽ mất tiến độ.

## Cấu trúc

- `lib/vocabulary.ts`: bộ từ dùng chung.
- `lib/progress.ts`: schema và kiểm tra dữ liệu tiến độ.
- `app/components/`: giao diện học, lưu tiến độ, phát âm và điều hướng.
- `tests/progress.test.mjs`: kiểm tra dữ liệu lưu, bộ từ và mạo từ trong văn bản phát âm.
- `PLAN.md`: trạng thái và commit từng phase.

Đã kiểm tra build, lint, tests và HTTP các trang chính. Chưa kiểm tra thao tác UI
hoặc nghe audio trực tiếp bằng trình duyệt trong môi trường này.
