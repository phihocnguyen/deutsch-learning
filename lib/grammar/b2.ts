import { ids, reference } from "./sources.ts";
import { question as q, type GrammarLesson } from "./types.ts";

export const b2Lessons: GrammarLesson[] = [
  {
    id: "b2-reported-speech", level: "B2", title: "Konjunktiv I trong lời thuật", summary: "Dấu hiệu tường thuật lời người khác trong văn viết.", prerequisites: ["a2-subordinate", "a2-indirect", "b1-future"],
    objectives: ["Nhận ra một số dạng Konjunktiv I thường gặp", "Đổi đại từ khi chuyển lời trực tiếp thành lời thuật"],
    rules: ["Trong văn viết tường thuật, Konjunktiv I thường đánh dấu nội dung được thuật lại; dạng này tự nó không cho biết người viết tin hay không tin lời đó.", "Với ngôi er/sie/es, sein → sei, haben → habe, kommen → komme, werden → werde. Đại từ và mốc thời gian có thể phải đổi theo góc nhìn người thuật.", "Khi Konjunktiv I trùng Indikativ, có thể dùng Konjunktiv II hoặc würde + nguyên mẫu để giữ dấu hiệu lời thuật. Lời nói hằng ngày cũng thường dùng dass + Indikativ."],
    table: { headers: ["Động từ", "Indikativ er/sie", "Konjunktiv I er/sie"], rows: [["sein", "ist", "sei"], ["haben", "hat", "habe"], ["kommen", "kommt", "komme"], ["werden", "wird", "werde"]] },
    examples: [{ de: "Lena sagt, sie sei heute krank.", vi: "Lena nói rằng hôm nay cô ấy bị ốm." }, { de: "Mira fragt, wann der Kurs beginne.", vi: "Mira hỏi khi nào khóa học bắt đầu." }],
    mistake: { wrong: "Lena sagt, sie wäre krank. (đổi máy móc từ ist)", right: "Lena sagt, sie sei krank.", why: "Ở ngôi sie số ít, Konjunktiv I của sein là sei. Wäre là Konjunktiv II và có vai trò khác hoặc được dùng thay thế trong ngữ cảnh phù hợp." },
    scope: "Giới thiệu lời thuật hiện tại với ngôi thứ ba từ PDF đọc thử trang 105–115. Theo tài liệu Goethe Online, chủ đề này đặt ở B2; đây là bài đầu tiên được chọn lọc, chưa phải lộ trình B2 đầy đủ.",
    sources: [reference("Goethe-Institut", "Deutsch Online B2 — Übersicht Redemittel und Grammatik", "https://lernen.goethe.de/deutschonline/B2/PDF/B2_erweitert/DT-online_B2_K01-14_GR-RM_Rueckschau_de.pdf#page=85", "Indirekte Rede und Konjunktiv I · trang 85", "Vị trí chủ đề ở B2, hình thức và cách dùng trong lời thuật."), ids("terminologie/400", "Konjunktiv I", "Formen und Funktion", "Chức năng tường thuật và hình thức Konjunktiv I.")],
    questions: [q("1", "Điền: Lena sagt, sie ____ heute krank. (sein, Konjunktiv I)", "sei", "Ngôi sie số ít của Konjunktiv I sein là sei."), q("2", "Điền: Tom sagt, er ____ Zeit. (haben, Konjunktiv I)", "habe", "Er habe là Konjunktiv I của haben."), q("3", "Điền: Sie sagt, der Zug ____ pünktlich. (sein, Konjunktiv I)", "sei", "Der Zug là ngôi thứ ba số ít; sein → sei.")],
  },
];
