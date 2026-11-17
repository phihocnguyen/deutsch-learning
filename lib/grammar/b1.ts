import { ids, reference } from "./sources.ts";
import { question as q, type GrammarLesson } from "./types.ts";

const goetheB1 = "https://lernplattform.goethe.de/pluginfile.php/1502007/mod_folder/content/0/DT_Training_Online_B1_RM-GR_K01-18_de.pdf";

export const b1Lessons: GrammarLesson[] = [
  {
    id: "b1-genitive", level: "B1", title: "Genitiv và bốn cách của mạo từ", summary: "Nhận ra quan hệ sở hữu và hoàn chỉnh bảng mạo từ xác định.", prerequisites: ["a1-articles", "a1-accusative", "a1-dative"],
    objectives: ["So sánh mạo từ ở bốn cách", "Nhận ra Genitiv trong cụm danh từ sở hữu"],
    rules: ["Trong mẫu sở hữu đang học, Genitiv trả lời câu hỏi của ai/của cái gì: das Fahrrad des Nachbarn.", "Mạo từ xác định ở Genitiv là des với giống đực/trung, der với giống cái/số nhiều. Danh từ đực/trung số ít thường thêm -s hoặc -es.", "Dativ số nhiều thường thêm -n cho danh từ nếu chưa kết thúc bằng -n hoặc -s: mit den Kindern, nhưng mit den Autos."],
    table: { headers: ["Giống/số", "Nominativ", "Akkusativ", "Dativ", "Genitiv"], rows: [["đực", "der", "den", "dem", "des"], ["cái", "die", "die", "der", "der"], ["trung", "das", "das", "dem", "des"], ["số nhiều", "die", "die", "den", "der"]] },
    examples: [{ de: "Das Fahrrad des Nachbarn steht hier.", vi: "Xe đạp của người hàng xóm ở đây." }, { de: "Die Farbe der Tasche gefällt mir.", vi: "Tôi thích màu của chiếc túi." }],
    mistake: { wrong: "Das Fahrrad des Nachbar steht hier.", right: "Das Fahrrad des Nachbarn steht hier.", why: "Nachbar thuộc nhóm N-Deklination; sau des có dạng Nachbarn, không áp dụng máy móc -s/-es cho mọi danh từ." },
    scope: "Bảng chỉ có mạo từ xác định. Genitiv của danh từ và các cấu trúc sở hữu khác có ngoại lệ; PDF đọc thử trình bày bảng ở trang 20–45. A2 trong dự án tập trung Nom/Akk/Dat; Genitiv của tên riêng có thể xuất hiện sớm hơn.",
    sources: [reference("Goethe-Institut", "Deutsche Grammatik", "https://www.goethe.de/ins/de/de/prf/grm.html", "Bestimmter Artikel · vier Kasus", "Bảng mạo từ xác định ở bốn cách."), reference("Goethe-Institut", "Deutsch Online B1 — Übersicht Redemittel und Grammatik", "https://lernplattform.goethe.de/pluginfile.php/1499547/mod_folder/content/0/DTonlineB1_GR-RM_Rueckschau_DE.pdf", "Kasus und Genitiv", "Genitiv và bảng cách trong tài liệu B1.")],
    questions: [q("1", "Điền: Das ist das Fahrrad ____ Kindes. (das Kind, Genitiv)", "des", "Genitiv giống trung dùng des; Kind nhận -es thành Kindes."), q("2", "Điền: Die Farbe ____ Tasche ist schön. (die Tasche, Genitiv)", "der", "Genitiv giống cái dùng der."), q("3", "Điền: Ich spreche mit ____ Kindern. (số nhiều, Dativ)", "den", "Dativ số nhiều dùng den; Kinder thêm -n thành Kindern.")],
  },
  {
    id: "b1-apposition", level: "B1", title: "Đồng vị: thêm thông tin cho danh từ", summary: "Nhận ra và tạo cụm giải thích đi cùng một danh từ.", prerequisites: ["b1-genitive", "a1-dative"],
    objectives: ["Nhận ra đồng vị lỏng giữa dấu phẩy", "Hòa hợp cách trong các mẫu Nom/Akk/Dat"],
    rules: ["Đồng vị là cụm danh từ giải thích thêm cho người hoặc vật vừa nêu. Trong mẫu đồng vị lỏng ở đây, cụm đó nằm giữa dấu phẩy.", "Đồng vị thường theo cách của cụm danh từ chính: mein Nachbar ở Nominativ, meinen Nachbarn ở Akkusativ, meinem Nachbarn ở Dativ.", "Tên riêng, chức danh và đồng vị gắn chặt có cách dùng khác; không áp một khuôn dấu phẩy hoặc biến cách cho mọi trường hợp."],
    table: { headers: ["Cách", "Mẫu"], rows: [["Nominativ", "Herr Weber, mein Nachbar, arbeitet hier."], ["Akkusativ", "Ich treffe Herrn Weber, meinen Nachbarn."], ["Dativ", "Ich spreche mit Herrn Weber, meinem Nachbarn."]] },
    examples: [{ de: "Frau Klein, meine Lehrerin, wohnt in Bonn.", vi: "Bà Klein, cô giáo của tôi, sống ở Bonn." }, { de: "Ich danke Frau Klein, meiner Lehrerin.", vi: "Tôi cảm ơn bà Klein, cô giáo của tôi." }],
    mistake: { wrong: "Ich spreche mit Herrn Weber, meinen Nachbarn.", right: "Ich spreche mit Herrn Weber, meinem Nachbarn.", why: "Mit yêu cầu Dativ; đồng vị trong mẫu này cũng dùng Dativ." },
    scope: "Giới thiệu đồng vị lỏng với người và ba cách Nom/Akk/Dat, dựa trên PDF đọc thử trang 97–99. Chưa bao gồm mọi kiểu đồng vị hoặc danh xưng đặc biệt.",
    sources: [ids("systematische-grammatik/1676", "Appositionen", "Kasuskongruenz und lockere Apposition", "Quan hệ đồng vị, dấu phẩy và cách trong mẫu thông dụng."), reference("Goethe-Institut", "Rahmencurriculum", "https://www.goethe.de/resources/files/pdf236/rahmencurriculum_buh.pdf", "Nominalgruppen · Genitiv und Apposition", "Đồng vị có trong đọc hiểu từ A2; bài này luyện tạo câu sau nền tảng A2.")],
    questions: [q("1", "Điền: Herr Weber, ____ Nachbar, arbeitet hier. (mein)", "mein", "Đồng vị đứng cùng chủ ngữ ở Nominativ."), q("2", "Điền: Ich treffe Herrn Weber, ____ Nachbarn. (mein)", "meinen", "Đồng vị ở Akkusativ theo Herrn Weber."), q("3", "Điền: Ich spreche mit Herrn Weber, ____ Nachbarn. (mein)", "meinem", "Mit yêu cầu Dativ; dùng meinem Nachbarn.")],
  },
  {
    id: "b1-future", level: "B1", title: "Futur I và dự đoán", summary: "Werden + nguyên mẫu; khi nào hiện tại cũng nói về tương lai.", prerequisites: ["a1-present", "a1-modals", "a2-passive"],
    objectives: ["Tạo câu Futur I cơ bản", "Phân biệt Futur I và werden-Passiv", "Chọn Präsens khi có mốc thời gian rõ"],
    rules: ["Futur I gồm werden được chia + nguyên mẫu ở cuối: Ich werde morgen anrufen.", "Präsens với mốc thời gian tương lai cũng rất tự nhiên: Ich rufe morgen an. Không cần đổi mọi chữ “sẽ” thành werden.", "Futur I còn dùng cho dự đoán hoặc lời hứa; werden + Partizip II trong mẫu Das Auto wird repariert là bị động hiện tại, không phải Futur I."],
    table: { headers: ["Chủ ngữ", "werden", "Ví dụ"], rows: [["ich", "werde", "Ich werde antworten."], ["du", "wirst", "Du wirst antworten."], ["er/sie/es", "wird", "Sie wird antworten."], ["wir", "werden", "Wir werden antworten."], ["ihr", "werdet", "Ihr werdet antworten."], ["sie/Sie", "werden", "Sie werden antworten."]] },
    examples: [{ de: "Morgen fahren wir nach Köln.", vi: "Ngày mai chúng tôi đi Köln." }, { de: "Es wird heute Abend wohl regnen.", vi: "Có lẽ tối nay trời sẽ mưa." }],
    mistake: { wrong: "Ich werde morgen anrufe.", right: "Ich werde morgen anrufen.", why: "Sau werde phải dùng động từ nguyên mẫu anrufen ở cuối." },
    scope: "Mẫu câu chính, dự đoán và lời hứa theo PDF đọc thử trang 100–104. Chưa đi sâu Futur II hoặc cụm nhiều động từ phức tạp.",
    sources: [reference("Goethe-Institut", "Deutsch Training Online B1 — Redemittel und Grammatik", `${goetheB1}#page=37`, "Futur I und Präsens für die Zukunft · trang 37", "Futur I để dự đoán; Präsens với mốc thời gian tương lai."), reference("Goethe-Institut", "Deutsch Training Online B1 — Redemittel und Grammatik", `${goetheB1}#page=68`, "Futur I · Vermutung und Versprechen", "Futur I cho dự đoán và lời hứa."), ids("progr%40mm/6905", "Futur I und Präsens", "Gebrauch", "Quan hệ giữa tương lai bằng Präsens và Futur I.")],
    questions: [q("1", "Điền: Ich ____ morgen anrufen. (werden)", "werde", "Ich + werden → werde; anrufen là nguyên mẫu cuối câu."), q("2", "Điền: Du wirst mir morgen ____. (antworten)", "antworten", "Futur I cần nguyên mẫu sau wirst."), q("3", "Chọn câu dùng Präsens để nói tương lai với mốc rõ.", "Morgen fahren wir nach Köln.", "Morgen là mốc tương lai; Präsens fahren phù hợp.", ["Morgen fahren wir nach Köln.", "Morgen werden wir nach Köln gefahren.", "Morgen wir fahren nach Köln."])],
  },
];
