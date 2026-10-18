import { CAREER_FAMILIES, MAX_EXPERT_FAMILIES } from "../constants/careerFamilies";
import "../assets/css/CareerFamilyPicker.css";

/** Chip picker for the career families an expert advises on (max 3). */
export default function CareerFamilyPicker({ value = [], onChange, disabled = false }) {
  const toggle = (code) => {
    if (value.includes(code)) onChange(value.filter((item) => item !== code));
    else if (value.length < MAX_EXPERT_FAMILIES) onChange([...value, code]);
  };
  return (
    <div className="cf-picker">
      <div className="cf-picker-chips" role="group" aria-label="Nhóm ngành tư vấn">
        {CAREER_FAMILIES.map((family) => {
          const active = value.includes(family.code);
          return (
            <button
              type="button"
              key={family.code}
              className={`cf-chip${active ? " active" : ""}`}
              aria-pressed={active}
              disabled={disabled || (!active && value.length >= MAX_EXPERT_FAMILIES)}
              onClick={() => toggle(family.code)}
            >
              <i className={`bi ${active ? "bi-check2" : family.icon}`} /> {family.name}
            </button>
          );
        })}
      </div>
      <small className="cf-picker-hint">
        Đã chọn {value.length}/{MAX_EXPERT_FAMILIES}. Học sinh có kết quả trắc nghiệm thuộc các nhóm này sẽ được gợi ý
        chuyên gia. Để trống thì hệ thống tự suy ra từ chuyên ngành.
      </small>
    </div>
  );
}
