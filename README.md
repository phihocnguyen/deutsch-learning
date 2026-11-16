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

10 từ có bản thu gốc của Jeuwre, được trang nguồn mô tả là người Đức bản xứ từ Berlin.
File Ogg được lưu trong `public/audio/`; nguồn và giấy phép CC BY-SA 4.0 có trong
`lib/audio-manifest.json`, `public/audio/README.md` và cạnh nút nghe.
Bản thu đọc từ đơn, không đọc kèm mạo từ; mạo từ vẫn được hiển thị để học.

15 từ còn lại và mọi câu ví dụ dùng giọng tổng hợp Đức của thiết bị, có nhãn riêng.
Không có giọng Đức thì ứng dụng báo rõ, không tự chuyển sang giọng ngôn ngữ khác.
Audio chỉ bắt đầu khi người dùng bấm, có nút dừng, không phát chồng nhau.
Có thể cập nhật nguồn đã kiểm tra bằng `node scripts/import-audio.mjs`; không cần chạy khi cài dự án.

## Lưu tiến độ

`localStorage`, key `deutsch-quest-progress-v1`, schema `{ version: 1, words: { [id]: "known" | "review" } }`.
Dữ liệu được lọc theo các ID hợp lệ; dữ liệu lỗi hoặc phiên bản không hỗ trợ được báo cho người dùng.
Khi lưu thất bại, trạng thái tiếp tục được giữ trong bộ nhớ của phiên. Các tab nhận thay đổi qua storage event.
Không có tài khoản hay đồng bộ cloud. Xóa dữ liệu trình duyệt sẽ mất tiến độ.

## Cấu trúc

- `lib/vocabulary.ts`: bộ từ dùng chung.
- `lib/progress.ts`: schema và kiểm tra dữ liệu tiến độ.
- `app/components/`: giao diện học, lưu tiến độ, phát âm và điều hướng.
- `tests/progress.test.mjs`: kiểm tra dữ liệu lưu và tính toàn vẹn bộ từ/audio.
- `PLAN.md`: trạng thái và commit từng phase.

Đã kiểm tra build, lint, tests và HTTP các trang chính. Chưa kiểm tra thao tác UI
hoặc nghe audio trực tiếp bằng trình duyệt trong môi trường này.
