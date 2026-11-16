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
- Responsive trên điện thoại và desktop; font pixel VT323 hỗ trợ tiếng Việt và tiếng Đức theo yêu cầu mới.
- Kiểm tra: TypeScript, build và điều hướng, kích thước màn hình, bàn phím.
- Commit: `feat: add pixel interface and learning navigation`.

## Phase 2 — Từ vựng, flashcard và audio
- Bộ từ A1 theo chủ đề: chào hỏi, gia đình, đồ ăn, nhà cửa và sinh hoạt.
- Mỗi từ có nghĩa Việt, giống danh từ khi áp dụng, số nhiều, câu ví dụ và nghĩa câu.
- Flashcard lật mặt, nghe từ/câu, đánh dấu đã nhớ hoặc cần ôn, lọc chủ đề.
- Lưu tiến độ trên thiết bị bằng localStorage với xử lý dữ liệu lỗi và phiên bản schema.
- Theo yêu cầu cập nhật: chỉ dùng giọng Đức của trình duyệt, ưu tiên de-DE và đọc cả mạo từ.
- Báo khi không có giọng Đức. Không dùng file bản thu hay dịch vụ audio riêng.
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

## Phase 6 — Ngữ pháp tiếng Đức A1–A2 có nguồn đối chiếu
- 6.1: Research và lập ma trận chủ đề/trình độ/điều kiện tiên quyết/nguồn. Dùng CEFR cho mục tiêu năng lực; dùng giáo trình tiếng Đức cụ thể để phân chia ngữ pháp, không coi CEFR là danh sách quy tắc cố định.
- 6.2: Biên soạn bài học tiếng Việt, thuật ngữ Đức, bảng quy tắc, ví dụ tự viết, phạm vi áp dụng, ngoại lệ và lỗi thường gặp. Mỗi bài có nguồn cụ thể đến chương/trang/mục và ngày truy cập.
- 6.3: Thêm khu ngữ pháp theo A1/A2, bài tập có giải thích, ôn lỗi và tiến độ. Giữ giao diện pixel và giọng đọc trình duyệt hiện tại.
- 6.4: Đối chiếu nội dung với nguồn; kiểm tra bảng chia, Kasus, vị trí động từ và tập đáp án hợp lệ. Chấm hoa/thường, dấu câu và trật tự từ theo mục tiêu từng bài; không dùng mặc định chấm không phân biệt hoa/thường của bài từ vựng cho mọi bài ngữ pháp.
- Tham khảo nguồn để tự biên soạn, không sao chép nguyên bài tập/bảng giải thích từ giáo trình.
- Tài liệu tự học có nguồn tham chiếu; không tự nhận được Goethe/CEFR chứng nhận, hoặc đảm bảo không có lỗi chỉ vì tests phần mềm chạy qua.
- Có thể bổ sung người dạy tiếng Đức rà soát học thuật; đây là lớp kiểm tra khuyến nghị, không phải điều kiện phải có tài liệu người dùng mới bắt đầu research.
- Chi tiết nguồn và tiêu chí nghiệm thu: `docs/grammar/research-plan.md`.
- Commit riêng sau mỗi phần 6.1–6.4. Điều chỉnh theo yêu cầu mới: bài đã đọc tô xanh nhẹ; không hiện reference trên giao diện; bài đọc giờ có vor/nach/halb/Viertel và công cụ tương tác.

## Nguyên tắc triển khai
- Đọc tài liệu tương ứng trong node_modules/next/dist/docs trước khi viết code Next.js.
- Dùng chung bộ dữ liệu và logic tiến độ cho flashcard, game và bài tập.
- Chưa thêm tài khoản, backend, bảng xếp hạng trực tuyến hoặc dịch vụ có phí.
- Cập nhật trạng thái phase trong file này theo kết quả thực tế.

## Trạng thái
- Phase 0: hoàn tất, commit `ea36307` (`intialize`).
- Phase 1: hoàn tất giao diện pixel, điều hướng 6 khu học, bố cục responsive, focus bàn phím và reduced motion. `npm.cmd run build` (bao gồm TypeScript) và `npm.cmd run lint` đều thành công. Chưa kiểm tra trực quan bằng trình duyệt hoặc thao tác bàn phím thực tế; các khu học là khung giao diện có ghi rõ trạng thái.
- Phase 2: hoàn tất 25 từ/cụm từ A1, 5 chủ đề, flashcard, thư viện tìm kiếm/lọc, đánh dấu đã nhớ/cần ôn và tiến độ dùng localStorage có schema/kiểm tra lỗi. Theo yêu cầu mới, đã xóa toàn bộ bản thu, metadata, công cụ nhập và ghi nguồn audio; mọi từ/câu chỉ dùng giọng Đức của trình duyệt, danh từ đọc cả mạo từ. Build/TypeScript, lint và 5 tests đều qua. Chưa kiểm tra tương tác UI, lưu dữ liệu và nghe thực tế bằng trình duyệt.
- Phase 3: hoàn tất 4 game nối từ/chọn nghĩa/nghe đoán từ/sắp xếp chữ; chọn chủ đề, 5 từ/lượt, xác nhận đáp án, điểm lần đầu, kết quả và chơi lại. Có nút đưa từ sai vào danh sách cần ôn. Đã thêm 5 tests game và Playwright kiểm tra các lượt chơi, font, click khoảng trống/lật 3D, đọc số nhiều, tải giọng chậm và giao diện mobile.
- Kiểm tra cuối Phase 3: 13 unit tests, 4 tests Playwright, TypeScript/production build đều thành công. Audio trong kiểm tra trình duyệt được giả lập để kiểm tra đúng văn bản và trạng thái tải; chưa đánh giá chất lượng giọng thật của thiết bị.
- Phase 4: hoàn tất 3 dạng bài điền từ/chọn mạo từ/dịch Việt–Đức. Có giải thích, nghe đáp án, thử lại không tăng điểm lần đầu, lượt ôn chỉ gồm từ sai, bộ lọc chủ đề/từ cần ôn. Lưu tối đa 50 kết quả, tránh lưu trùng ID, giữ dữ liệu từ đã học trước đây và tự đánh dấu từ sai cần ôn. Trang tiến độ hiển thị lịch sử và thống kê câu đúng thực tế. 18 unit tests và kiểm tra trình duyệt các lượt bài tập/game đều qua; bao gồm tải lại trang, sửa từ không mất lịch sử và mobile.
- Kiểm tra cuối Phase 4: build/TypeScript, lint, 18 unit tests và 8 tests trình duyệt đã qua (4 luồng học/game, 4 luồng bài tập). Khi storage từ chối ghi, có cảnh báo và kết quả vẫn được giữ trong phiên, không thông báo đã lưu thành công.
- Phase 5: hoàn tất. Lint, TypeScript/production build, 18 unit tests và 14 tests Chromium trên bản production đều qua. Kiểm tra 6 trang ở 320/390/768/1366px, các bảng game ở 320px, keyboard/skip link/reduced motion, dữ liệu lỗi/phục hồi và đồng bộ hai tab. Có 404 tiếng Việt, tiêu đề từng trang, icon pixel riêng và cấu hình kiểm tra production tự mở/dừng server trên Windows. Đã cập nhật README và giới hạn: chưa nghe giọng thật trên từng thiết bị, chưa kiểm tra Safari/Firefox, lưu browser-local, chưa hosting.
- Phase 6: hoàn tất hai mục A1/A2, mỗi mục 14 bài. Có 89 câu luyện, nguồn đối chiếu lưu trong dữ liệu/docs, quy tắc/bảng mẫu/ví dụ có audio/lỗi thường gặp/phạm vi; reference không hiện trên UI. Bài giờ có cách đọc 12/24h, vor/nach/halb/Viertel, bảng ví dụ, đồng hồ tương tác và 8 câu luyện. Bài đã đọc nền xanh nhẹ. Tiến độ ngữ pháp lưu riêng, không ảnh hưởng từ vựng; có ôn câu sai, chấm chữ hoa/dấu câu, bảo toàn điểm lần đầu. Build/TypeScript, lint, 29 unit tests và 20 tests trình duyệt production đều qua, gồm cả 28 bài ở 320px và kiểm tra đồng hồ. Chưa có giáo viên độc lập duyệt toàn bộ nội dung. Commit 6.1: `47f64b3`; 6.2: `bffe556`; 6.3: `f3137d9`; phần 6.4 là commit bàn giao tiếp theo.

## Điều chỉnh sau Phase 2
- Phase 7: thêm bộ flashcard cá nhân theo chủ đề, quản lý trong popup có đóng/Esc/vùng cuộn riêng. Tạo chủ đề trước khi thêm thẻ; nhập từ, nghĩa, mạo từ, số nhiều, ví dụ và bản dịch; sửa/xóa thẻ và xác nhận trước khi xóa chủ đề. Bộ thẻ dùng chung trong flashcard/thư viện/tiến độ, lưu local riêng, hỗ trợ đồng bộ tab và thông báo khi không lưu được. Game/bài tập hiện vẫn dùng từ có sẵn.
- Bố cục dùng toàn bộ chiều rộng màn hình, sidebar co giãn theo viewport và giữ vị trí khi đổi trang; dành sẵn vùng thanh cuộn. Ba ô lọc từ vựng cùng chiều cao, ô tìm từ dùng nền xanh nhẹ khi focus thay outline. Bổ sung kiểm tra màn hình 1366/1920/2560px và chuyển sidebar giữa thư viện/Bài tập.
- Đổi toàn bộ font sang VT323 (latin, latin-ext, vietnamese), bỏ Arial và chú thích giọng đọc.
- Bấm trực tiếp vào mặt thẻ hoặc dùng Enter/Space để lật; nút nghe/đánh dấu độc lập.
- Danh từ hiển thị mạo từ số ít và dạng số nhiều đầy đủ với `die` ở cả hai mặt.
- Mặt sau có nút nghe số nhiều; danh từ không có số nhiều thông dụng và động từ không tạo số nhiều giả.
- Thêm hiệu ứng mở/lật thẻ 240ms, vùng mặt thẻ có chiều cao tối thiểu ổn định, tôn trọng reduced motion.
- Chờ giọng Đức tải bất đồng bộ tối đa 10 giây; hiện trạng thái tải, tự phát khi sẵn sàng, cho phép dừng/hủy khi đổi thẻ. Kiểm tra bằng 3 tests riêng cho tải chậm, chọn ngôn ngữ và hủy chờ; tổng 8 tests cùng build/lint đã qua.
- Theo phản hồi tiếp theo, mở rộng vùng bấm ra toàn bộ mặt thẻ (bao gồm padding/khoảng trống), dùng hai mặt xếp chồng và rotateY 180 độ trong 420ms; chiều cao giữ theo mặt cao nhất. Nút nghe/đánh dấu nằm ngoài vùng lật. Kiểm tra trình duyệt đã xác nhận font VT323 được tải và sử dụng.
- Đổi tích hợp Tailwind sang PostCSS theo tài liệu Next.js sau khi quan sát CSS dev giữ Arial cũ dù build đã có VT323. Đã kiểm tra CSS cập nhật ngay mà không phải khởi động lại dev server.
- Điều chỉnh mới nhất: nút nghe số nhiều hiện ở cả mặt trước; bỏ outline xanh của flashcard và thẻ danh sách, giữ tín hiệu focus bằng màu nền/nhãn.
