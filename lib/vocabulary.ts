export const topics = ["Chào hỏi", "Gia đình", "Đồ ăn", "Nhà cửa", "Sinh hoạt"] as const;
export type Word = {
  id: string; topic: typeof topics[number]; german: string; vietnamese: string;
  article?: "der" | "die" | "das"; plural?: string; example: string; translation: string;
};
export const vocabulary: Word[] = [
  { id: "hallo", topic: "Chào hỏi", german: "Hallo", vietnamese: "Xin chào", example: "Hallo, ich bin Anna.", translation: "Xin chào, tôi là Anna." },
  { id: "danke", topic: "Chào hỏi", german: "danke", vietnamese: "Cảm ơn", example: "Danke für deine Hilfe.", translation: "Cảm ơn sự giúp đỡ của bạn." },
  { id: "bitte", topic: "Chào hỏi", german: "bitte", vietnamese: "Làm ơn / không có gì", example: "Ein Wasser, bitte.", translation: "Cho tôi một nước, làm ơn." },
  { id: "tschuss", topic: "Chào hỏi", german: "tschüss", vietnamese: "Tạm biệt", example: "Tschüss, bis morgen!", translation: "Tạm biệt, hẹn ngày mai!" },
  { id: "morgen", topic: "Chào hỏi", german: "Guten Morgen", vietnamese: "Chào buổi sáng", example: "Guten Morgen, Frau Müller!", translation: "Chào buổi sáng, bà Müller!" },
  { id: "mutter", topic: "Gia đình", german: "Mutter", article: "die", plural: "Mütter", vietnamese: "Mẹ", example: "Meine Mutter ist hier.", translation: "Mẹ tôi ở đây." },
  { id: "vater", topic: "Gia đình", german: "Vater", article: "der", plural: "Väter", vietnamese: "Bố", example: "Mein Vater kocht gern.", translation: "Bố tôi thích nấu ăn." },
  { id: "kind", topic: "Gia đình", german: "Kind", article: "das", plural: "Kinder", vietnamese: "Đứa trẻ", example: "Das Kind spielt.", translation: "Đứa trẻ đang chơi." },
  { id: "bruder", topic: "Gia đình", german: "Bruder", article: "der", plural: "Brüder", vietnamese: "Anh / em trai", example: "Mein Bruder lernt Deutsch.", translation: "Anh/em trai tôi học tiếng Đức." },
  { id: "schwester", topic: "Gia đình", german: "Schwester", article: "die", plural: "Schwestern", vietnamese: "Chị / em gái", example: "Meine Schwester liest ein Buch.", translation: "Chị/em gái tôi đang đọc một cuốn sách." },
  { id: "apfel", topic: "Đồ ăn", german: "Apfel", article: "der", plural: "Äpfel", vietnamese: "Quả táo", example: "Ich esse einen Apfel.", translation: "Tôi ăn một quả táo." },
  { id: "brot", topic: "Đồ ăn", german: "Brot", article: "das", plural: "Brote", vietnamese: "Bánh mì", example: "Das Brot ist frisch.", translation: "Bánh mì này còn mới." },
  { id: "wasser", topic: "Đồ ăn", german: "Wasser", article: "das", plural: "— (thường không dùng số nhiều)", vietnamese: "Nước", example: "Ich trinke Wasser.", translation: "Tôi uống nước." },
  { id: "milch", topic: "Đồ ăn", german: "Milch", article: "die", plural: "— (thường không dùng số nhiều)", vietnamese: "Sữa", example: "Die Milch ist kalt.", translation: "Sữa lạnh." },
  { id: "ei", topic: "Đồ ăn", german: "Ei", article: "das", plural: "Eier", vietnamese: "Quả trứng", example: "Ich esse ein Ei.", translation: "Tôi ăn một quả trứng." },
  { id: "haus", topic: "Nhà cửa", german: "Haus", article: "das", plural: "Häuser", vietnamese: "Ngôi nhà", example: "Das Haus ist groß.", translation: "Ngôi nhà này lớn." },
  { id: "tisch", topic: "Nhà cửa", german: "Tisch", article: "der", plural: "Tische", vietnamese: "Cái bàn", example: "Das Buch liegt auf dem Tisch.", translation: "Cuốn sách nằm trên bàn." },
  { id: "stuhl", topic: "Nhà cửa", german: "Stuhl", article: "der", plural: "Stühle", vietnamese: "Cái ghế", example: "Der Stuhl ist neu.", translation: "Cái ghế này mới." },
  { id: "tur", topic: "Nhà cửa", german: "Tür", article: "die", plural: "Türen", vietnamese: "Cánh cửa", example: "Die Tür ist offen.", translation: "Cửa đang mở." },
  { id: "fenster", topic: "Nhà cửa", german: "Fenster", article: "das", plural: "Fenster", vietnamese: "Cửa sổ", example: "Das Fenster ist zu.", translation: "Cửa sổ đang đóng." },
  { id: "lernen", topic: "Sinh hoạt", german: "lernen", vietnamese: "Học", example: "Wir lernen Deutsch.", translation: "Chúng tôi học tiếng Đức." },
  { id: "lesen", topic: "Sinh hoạt", german: "lesen", vietnamese: "Đọc", example: "Ich lese ein Buch.", translation: "Tôi đọc một cuốn sách." },
  { id: "essen", topic: "Sinh hoạt", german: "essen", vietnamese: "Ăn", example: "Wir essen zusammen.", translation: "Chúng tôi ăn cùng nhau." },
  { id: "trinken", topic: "Sinh hoạt", german: "trinken", vietnamese: "Uống", example: "Ich trinke gern Tee.", translation: "Tôi thích uống trà." },
  { id: "schlafen", topic: "Sinh hoạt", german: "schlafen", vietnamese: "Ngủ", example: "Das Baby schläft.", translation: "Em bé đang ngủ." },
];
export function fullWord(word: Word) { return [word.article, word.german].filter(Boolean).join(" "); }
