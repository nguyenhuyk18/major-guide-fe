// The 17 career families of the career test (backend: libs/constant/.../career-family.constant.ts).
export const CAREER_FAMILIES = [
  { code: "it_software", name: "Công nghệ thông tin", icon: "bi-laptop" },
  { code: "engineering", name: "Kỹ thuật", icon: "bi-gear" },
  { code: "architecture_construction", name: "Kiến trúc & Xây dựng", icon: "bi-buildings" },
  { code: "business_management", name: "Kinh doanh & Quản trị", icon: "bi-briefcase" },
  { code: "marketing_communication", name: "Marketing & Truyền thông", icon: "bi-megaphone" },
  { code: "finance_economics", name: "Tài chính, Kế toán & Kinh tế", icon: "bi-graph-up-arrow" },
  { code: "arts_design", name: "Nghệ thuật & Thiết kế", icon: "bi-palette" },
  { code: "humanities_language", name: "Ngôn ngữ & Nhân văn", icon: "bi-translate" },
  { code: "psychology_counseling", name: "Tâm lý học", icon: "bi-chat-heart" },
  { code: "education", name: "Giáo dục", icon: "bi-mortarboard" },
  { code: "social_work", name: "Xã hội học & Công tác xã hội", icon: "bi-people" },
  { code: "law_public", name: "Luật & Khu vực công", icon: "bi-bank" },
  { code: "health_medicine", name: "Y tế & Điều dưỡng", icon: "bi-heart-pulse" },
  { code: "life_sciences", name: "Khoa học sự sống", icon: "bi-flower1" },
  { code: "physical_sciences_math", name: "Khoa học tự nhiên & Toán", icon: "bi-calculator" },
  { code: "hospitality_tourism", name: "Du lịch & Dịch vụ", icon: "bi-airplane" },
  { code: "sports_fitness", name: "Thể thao & Vận động", icon: "bi-trophy" },
];

export const MAX_EXPERT_FAMILIES = 3;

const BY_CODE = Object.fromEntries(CAREER_FAMILIES.map((family) => [family.code, family]));

export const careerFamilyName = (code) => BY_CODE[code]?.name || code;

export const EXPERT_LEVELS = {
  bachelor: "Cử nhân",
  master: "Thạc sĩ",
  doctor: "Tiến sĩ",
  professor: "Giáo sư",
};
