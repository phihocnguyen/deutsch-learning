# Phase 6.4 — Rà soát nội dung và chức năng

Ngày: 2026-11-16. Người biên soạn/đối chiếu: Codex. Chưa có giáo viên độc lập duyệt.

## Phạm vi nội dung

- A1 có 14 bài, A2 có 15 bài; B1 có 3 bài và B2 có 1 bài chọn lọc từ PDF.
  Không tuyên bố bao phủ toàn bộ giáo trình hay đủ kỹ năng thi chứng chỉ.
- 104 câu luyện: A1 có 47, A2 có 45, B1 có 9, B2 có 3.
- Ví dụ và câu luyện được tự biên soạn. Nguồn trong `a1.ts`, `a2.ts`, `b1.ts`, `b2.ts`, `sources.ts`
  ghi tổ chức, mục/trang, ngày truy cập và điều được đối chiếu.
- Theo yêu cầu người dùng, không hiển thị reference trên UI; hồ sơ đối chiếu vẫn
  được giữ trong repository, không thay bằng nhãn tự nhận đã được tổ chức chứng nhận.

## Điểm ngôn ngữ đã rà soát có chủ đích

| Điểm dễ sai | Cách thể hiện trong bài |
| --- | --- |
| V2 | Tính theo thành phần câu, không theo số thứ tự từng từ. |
| Nicht | Vị trí phụ thuộc phần phủ định; không nói luôn cuối câu. |
| Nicht müssen | Không bắt buộc, phân biệt với cấm của nicht dürfen. |
| Perfekt | Có giới hạn về ngữ cảnh, bổ ngữ và biến thể vùng miền; không dạy mọi chuyển động đều sein. |
| Imperativ | Chấp nhận cả Komm/Komme; Lies có đổi dạng. |
| Weil | Dùng mẫu văn viết trong bài; ghi nhận khẩu ngữ V2 có chức năng riêng. |
| Als/wenn | Als có thể chỉ một giai đoạn quá khứ kéo dài, không chỉ một động tác tức thời. |
| Đuôi tính từ | Bảng mẫu ghi phạm vi, phân biệt vị ngữ và định ngữ; không gọi là bảng đầy đủ. |
| Phản thân | Akk/Dat tùy cấu trúc, không dạy luôn dùng mich. |
| Wechselpräpositionen | Phân biệt nơi diễn ra và đích, có chuyển động tại một nơi vẫn Dativ. |
| Đại từ quan hệ | Genus/Numerus theo danh từ gốc, Kasus theo vai trò trong mệnh đề quan hệ. |
| Hai tân ngữ | Chỉ nêu trật tự trung hòa; không xem mọi đảo vị trí vì nhấn mạnh là sai tuyệt đối. |
| Um … zu | Nêu phạm vi chủ động cơ bản, không khái quát các cấu trúc ngoại lệ. |
| Passiv | Chỉ mở đầu werden-Passiv Präsens, ghi rõ phân bố cuối A2 tùy giáo trình. |
| Đọc giờ | Halb chỉ giờ tiếp theo, Viertel nach/vor là 15 phút sau/trước mốc; tách mẫu 24h và 12h. |

## Bổ sung bài đọc giờ

Đã đối chiếu:

- [DW Deutschtrainer 17, trang 1](https://static.dw.com/downloads/59695311/deutschtrainer-017-uhrzeit-wortschatz-englisch.pdf#page=1):
  cách hỏi giờ, Viertel nach/vor, halb và um.
- [DW Mission Berlin — Language Guide, Die Uhrzeit](https://static.dw.com/downloads/26514186/booklet_%C3%BCbungsbuch_mission_berlin.pdf#page=21):
  mẫu chính thức và năm phút trước/sau mốc rưỡi.
- [Goethe A2 Wortliste, phần Uhrzeit](https://www.goethe.de/pro/relaunch/prf/bg/Goethe-Zertifikat_A2_Wortliste.pdf#page=7):
  cách đọc giờ chính thức/thường ngày. Không nhập lại bảng/bài tập nguồn vào dự án.

Đồng hồ tương tác hiển thị mốc 5 phút, kim giờ có dịch theo phút, đọc cả kiểu
chính thức và thường ngày bằng giọng trình duyệt. Có ghi chú về sáng/tối và biến thể
vùng miền; không xem một cách đọc là lựa chọn duy nhất ở mọi địa phương.

## Kiểm tra kỹ thuật

- Schema ngữ pháp riêng `deutsch-quest-grammar-v1`, không ghi vào schema từ vựng.
- Phân biệt đã đọc, có lượt luyện và kết quả gần nhất từng câu.
- Không tăng điểm lần đầu khi thử lại; lượt ôn chỉ cập nhật các câu được ôn.
- Kiểm tra chữ hoa, umlaut, ß, dấu câu và các đáp án thay thế đã khai báo.
- Lọc bản ghi sai/khác phiên bản; giới hạn 50 lượt; giữ dữ liệu phiên khi lưu thất bại.
- Kiểm tra các trang/bài trên production và màn hình nhỏ, bao gồm bảng dài và từ ghép dài.

Tests kiểm tra phần mềm và tính nhất quán dữ liệu; không tự chứng minh nội dung
ngôn ngữ là đúng tuyệt đối. Cần tiếp tục rà soát khi thêm bài hoặc có phản hồi.

## Đối chiếu bản PDF đọc thử do người dùng cung cấp

Bản PDF 125 trang tự nhận là bản đọc thử đã lược bớt nội dung. Đã đọc các nhóm
trang về đại từ, danh từ và bốn cách, giới từ, Präteritum, đồng vị, Futur I và
Konjunktiv I. [Sổ tay bổ sung](bo-sung-tu-pdf.md) ghi rõ trang và cung cấp ví dụ,
bài tập do dự án viết mới.

Đại từ ba cách nằm trong bài A2 mới; Genitiv, đồng vị, Futur I ở B1; Konjunktiv I
ở B2 theo phân bổ của Goethe Online B2. Giới từ và Präteritum củng cố các bài
A1/A2 hiện có. Khi rà lại, không dùng mẹo “hễ chuyển động là
Akkusativ” hoặc “Futur I là mọi hành động tương lai” như quy tắc tuyệt đối.
Các điểm này đã được đối chiếu thêm với các mục IDS grammis liên kết trong sổ tay.
