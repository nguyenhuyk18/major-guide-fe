import { useMemo, useState } from "react";

const GROUPS = [
  ["Môn chung", ["toan", "ngu_van", "ngoai_ngu"]],
  ["Khoa học tự nhiên", ["vat_li", "hoa_hoc", "sinh_hoc"]],
  ["Khoa học xã hội", ["lich_su", "dia_li", "gdcd"]],
];

const SOURCES = [
  ["thi_thu", "Điểm thi thử THPT", "So sánh được với phổ điểm thi THPT 2024 cả nước"],
  ["hoc_ba", "Điểm TB học bạ lớp 12", "Dùng để xem môn nào là thế mạnh của bạn"],
];

/** Optional step after the 30 interest questions: subject scores. */
export default function AcademicStep({ session, saving, draft, onDraft, onBack, onSubmit }) {
  const labels = useMemo(
    () => Object.fromEntries((session.subjects || []).map((s) => [s.code, s.label])),
    [session.subjects]
  );
  // The draft lives in the parent so it survives going back to the questions.
  const [source, setSourceState] = useState(
    draft?.source || session.academic?.source || "thi_thu"
  );
  const [scores, setScoresState] = useState(
    () =>
      draft?.scores ||
      Object.fromEntries(
        Object.entries(session.academic?.scores || {}).map(([k, v]) => [k, String(v)])
      )
  );
  const setSource = (value) => {
    setSourceState(value);
    onDraft?.({ source: value, scores });
  };
  const setScores = (value) => {
    setScoresState(value);
    onDraft?.({ source, scores: value });
  };

  const parsed = Object.fromEntries(
    Object.entries(scores)
      .filter(([, v]) => v !== "" && v !== undefined)
      .map(([k, v]) => [k, Number(String(v).replace(",", "."))])
  );
  const invalid = Object.entries(parsed).filter(([, v]) => !Number.isFinite(v) || v < 0 || v > 10);
  const combos = Object.entries(session.combinations || {}).filter(([, subjects]) =>
    subjects.every((s) => Number.isFinite(parsed[s]))
  );
  const canSubmit = combos.length > 0 && invalid.length === 0;

  return (
    <section className="ct-academic">
      <span className="ct-eyebrow">
        <i className="bi bi-mortarboard" /> BƯỚC 2 / 2 · KHÔNG BẮT BUỘC
      </span>
      <h2>Học lực của bạn</h2>
      <p className="ct-muted">
        Nhập điểm các môn bạn có. Hệ thống tính điểm các tổ hợp xét tuyển (A00, D01,
        B00…) và kết hợp với sở thích để xếp hạng nhóm ngành sát thực tế hơn.
      </p>

      <div className="ct-source" role="radiogroup" aria-label="Nguồn điểm">
        {SOURCES.map(([value, title, hint]) => (
          <button
            key={value}
            role="radio"
            aria-checked={source === value}
            className={source === value ? "selected" : ""}
            onClick={() => setSource(value)}
          >
            <b>{title}</b>
            <small>{hint}</small>
          </button>
        ))}
      </div>

      <div className="ct-subject-groups">
        {GROUPS.map(([title, codes]) => (
          <fieldset key={title}>
            <legend>{title}</legend>
            {codes.map((code) => {
              const value = scores[code] ?? "";
              const bad = value !== "" && invalid.some(([k]) => k === code);
              return (
                <label key={code} className={bad ? "invalid" : ""}>
                  <span>{labels[code] || code}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="10"
                    step="0.05"
                    placeholder="—"
                    value={value}
                    onChange={(e) => setScores({ ...scores, [code]: e.target.value })}
                  />
                </label>
              );
            })}
          </fieldset>
        ))}
      </div>

      <div className="ct-combos">
        {combos.length ? (
          <>
            <span>Tổ hợp đã đủ điểm:</span>
            {combos.map(([code, subjects]) => (
              <b key={code} title={subjects.map((s) => labels[s]).join(" + ")}>
                {code} · {subjects.reduce((sum, s) => sum + parsed[s], 0).toFixed(2)}
              </b>
            ))}
          </>
        ) : (
          <span>Nhập đủ 3 môn của ít nhất một tổ hợp, ví dụ Toán + Văn + Anh (D01).</span>
        )}
      </div>
      {invalid.length > 0 && <p className="ct-error">Điểm mỗi môn phải từ 0 đến 10.</p>}

      <div className="ct-nav">
        <button className="ct-btn" disabled={saving} onClick={onBack}>
          <i className="bi bi-arrow-left" /> Xem lại câu trả lời
        </button>
        <div className="ct-nav-right">
          <button className="ct-btn ghost" disabled={saving} onClick={() => onSubmit(null)}>
            Bỏ qua
          </button>
          <button
            className="ct-btn primary"
            disabled={saving || !canSubmit}
            onClick={() => onSubmit({ source, scores: parsed })}
          >
            {saving ? "Đang phân tích…" : "Xem kết quả"} <i className="bi bi-stars" />
          </button>
        </div>
      </div>
    </section>
  );
}
