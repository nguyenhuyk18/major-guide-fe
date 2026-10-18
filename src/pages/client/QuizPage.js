import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "../../assets/css/CareerTest.css";
import {
  answerCareerQuestion,
  completeCareerAssessment,
  saveCareerAcademic,
  startCareerAssessment,
} from "../../services/careerAssessment.api";
import CareerResult from "../../components/CareerResult";
import AcademicStep from "../../components/AcademicStep";

const SCALES = [
  ["R", "Thực hành - Kỹ thuật", "bi-tools"],
  ["I", "Nghiên cứu - Phân tích", "bi-search"],
  ["A", "Nghệ thuật - Sáng tạo", "bi-palette"],
  ["S", "Xã hội - Hỗ trợ", "bi-people"],
  ["E", "Quản lý - Thuyết phục", "bi-megaphone"],
  ["C", "Nghiệp vụ - Tổ chức", "bi-clipboard-check"],
];

export default function QuizPage() {
  const navigate = useNavigate();
  const isLogin = useSelector((s) => s.authClientReducer.isLogin);
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(0);
  const [showMissing, setShowMissing] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState("questions");
  const [academicDraft, setAcademicDraft] = useState(null);
  const shownAt = useRef(Date.now());

  useEffect(() => {
    if (!isLogin) {
      toast.error("Vui lòng đăng nhập để làm bài trắc nghiệm");
      navigate("/");
    }
  }, [isLogin, navigate]);

  const questions = useMemo(() => session?.questions || [], [session]);
  const options = session?.options || [];
  const answeredCount = questions.filter((q) => answers[q.code]).length;
  const missing = questions.filter((q) => !answers[q.code]);
  const question = questions[current];

  const begin = async () => {
    try {
      setStarting(true);
      const started = await startCareerAssessment();
      if (!started?.questions?.length) throw new Error("Không tải được câu hỏi");
      const saved = Object.fromEntries(
        (started.answers || [])
          .filter((a) => a.value)
          .map((a) => [a.code, a.value])
      );
      const firstOpen = started.questions.findIndex((q) => !saved[q.code]);
      setSession(started);
      setAnswers(saved);
      setCurrent(firstOpen === -1 ? 0 : firstOpen);
      setResult(null);
      setStep("questions");
      setAcademicDraft(null);
      setShowMissing(false);
      if (Object.keys(saved).length)
        toast.info(
          `Tiếp tục bài đang làm (${Object.keys(saved).length}/${started.questions.length} câu)`
        );
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Không thể bắt đầu bài trắc nghiệm"
      );
    } finally {
      setStarting(false);
    }
  };

  const goTo = useCallback(
    (index) => {
      if (index < 0 || index >= questions.length) return;
      setCurrent(index);
      setMapOpen(false);
      shownAt.current = Date.now();
    },
    [questions.length]
  );

  const choose = useCallback(
    async (value) => {
      if (!question || submitting) return;
      const code = question.code;
      const previous = answers[code];
      if (previous === value) return;
      setAnswers((all) => ({ ...all, [code]: value }));
      setSaving((n) => n + 1);
      try {
        await answerCareerQuestion(session.id, {
          code,
          value,
          responseTimeMs: Date.now() - shownAt.current,
        });
      } catch (e) {
        setAnswers((all) => {
          const next = { ...all };
          if (previous) next[code] = previous;
          else delete next[code];
          return next;
        });
        toast.error(
          e?.response?.data?.message || "Chưa lưu được câu trả lời, vui lòng chọn lại"
        );
      } finally {
        setSaving((n) => n - 1);
      }
    },
    [question, answers, session, submitting]
  );

  const submit = () => {
    if (missing.length) {
      setShowMissing(true);
      goTo(questions.indexOf(missing[0]));
      toast.warning(
        `Còn ${missing.length} câu chưa trả lời. Các câu này được đánh dấu đỏ trong sơ đồ.`
      );
      return;
    }
    if (saving) {
      toast.info("Đang lưu câu trả lời cuối, vui lòng thử lại sau giây lát");
      return;
    }
    setStep("academic");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const finish = async (academic) => {
    try {
      setSubmitting(true);
      if (academic) {
        setSession(await saveCareerAcademic(session.id, academic));
      } else if (session.academic) {
        // Skipped this time: clear scores saved earlier so they do not affect the result.
        setSession(await saveCareerAcademic(session.id, { source: "hoc_ba", scores: {} }));
      }
      setResult(await completeCareerAssessment(session.id));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không thể nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!question || result || step !== "questions") return;
    const onKey = (event) => {
      if (event.target.closest?.("input, textarea")) return;
      const value = Number(event.key);
      if (value >= 1 && value <= 5) choose(value);
      else if (event.key === "ArrowRight") goTo(current + 1);
      else if (event.key === "ArrowLeft") goTo(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, result, step, current, choose, goTo]);

  if (result?.careerMatch)
    return (
      <div className="ct-page">
        <div className="ct-container">
          <CareerResult match={result.careerMatch} onRetake={begin} />
        </div>
      </div>
    );

  if (!session)
    return (
      <div className="ct-page">
        <div className="ct-container ct-intro">
          <span className="ct-eyebrow">
            <i className="bi bi-compass" /> TRẮC NGHIỆM HƯỚNG NGHIỆP RIASEC
          </span>
          <h1>Tìm nhóm ngành phù hợp với sở thích của bạn</h1>
          <p className="ct-lead">
            Trả lời 30 câu về những hoạt động bạn thích, sau đó (không bắt buộc)
            nhập điểm các môn. Hệ thống kết hợp sở thích và học lực để đưa ra 3 nhóm
            ngành phù hợp nhất, kèm giải thích vì sao.
          </p>
          <div className="ct-facts">
            <div>
              <b>30</b>
              <span>câu hỏi</span>
            </div>
            <div>
              <b>~5</b>
              <span>phút</span>
            </div>
            <div>
              <b>3</b>
              <span>nhóm ngành phù hợp</span>
            </div>
          </div>
          <div className="ct-scales">
            {SCALES.map(([code, label, icon]) => (
              <div key={code}>
                <i className={`bi ${icon}`} />
                <span>
                  <b>{code}</b> {label}
                </span>
              </div>
            ))}
          </div>
          <button className="ct-btn primary lg" disabled={starting} onClick={begin}>
            {starting ? "Đang tải câu hỏi…" : "Bắt đầu làm bài"}{" "}
            <i className="bi bi-arrow-right" />
          </button>
          <small className="ct-muted">
            Không có đáp án đúng hay sai. Bài làm được lưu tự động, bạn có thể
            thoát và quay lại làm tiếp.
          </small>
        </div>
      </div>
    );

  if (step === "academic")
    return (
      <div className="ct-page">
        <div className="ct-container">
          <AcademicStep
            session={session}
            saving={submitting}
            draft={academicDraft}
            onDraft={setAcademicDraft}
            onBack={() => setStep("questions")}
            onSubmit={finish}
          />
        </div>
      </div>
    );

  const percent = Math.round((answeredCount / questions.length) * 100);
  const isLast = current === questions.length - 1;

  return (
    <div className="ct-page">
      <header className="ct-topbar">
        <div className="ct-topbar-inner">
          <div className="ct-topbar-title">
            <strong>Trắc nghiệm hướng nghiệp</strong>
            <small>
              Đã trả lời {answeredCount}/{questions.length} câu
              {saving > 0 ? " · đang lưu…" : " · đã lưu"}
            </small>
          </div>
          <div className="ct-progress" aria-label={`Hoàn thành ${percent}%`}>
            <i style={{ width: `${percent}%` }} />
          </div>
          <button className="ct-btn ghost" onClick={() => navigate("/")}>
            <i className="bi bi-box-arrow-left" /> Thoát
          </button>
        </div>
      </header>

      <div className="ct-container ct-runner">
        <main className="ct-question">
          <div className="ct-question-top">
            <span className="ct-qnum">
              Câu {current + 1}
              <small>/{questions.length}</small>
            </span>
            {answers[question.code] ? (
              <span className="ct-status done">
                <i className="bi bi-check-circle-fill" /> Đã trả lời
              </span>
            ) : (
              <span className={`ct-status ${showMissing ? "missing" : ""}`}>
                <i className="bi bi-circle" /> Chưa trả lời
              </span>
            )}
          </div>
          <h2>{question.text}</h2>
          <p className="ct-muted">Bạn thích làm việc này đến mức nào?</p>

          <div className="ct-options" role="radiogroup" aria-label="Mức độ yêu thích">
            {options.map((option) => (
              <button
                key={option.value}
                role="radio"
                aria-checked={answers[question.code] === option.value}
                className={answers[question.code] === option.value ? "selected" : ""}
                onClick={() => choose(option.value)}
              >
                <span className="ct-dot">{option.value}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="ct-nav">
            <button
              className="ct-btn"
              disabled={current === 0}
              onClick={() => goTo(current - 1)}
            >
              <i className="bi bi-arrow-left" /> Câu trước
            </button>
            <span className="ct-hint">Phím 1–5 để chọn, ← → để chuyển câu</span>
            {isLast ? (
              <button className="ct-btn primary" disabled={submitting} onClick={submit}>
                Tiếp tục <i className="bi bi-arrow-right" />
              </button>
            ) : (
              <button className="ct-btn primary" onClick={() => goTo(current + 1)}>
                Câu tiếp <i className="bi bi-arrow-right" />
              </button>
            )}
          </div>
        </main>

        <aside className={`ct-map ${mapOpen ? "open" : ""}`}>
          <button className="ct-map-toggle" onClick={() => setMapOpen((o) => !o)}>
            <i className="bi bi-grid-3x3-gap" /> Sơ đồ câu hỏi ({answeredCount}/
            {questions.length})
            <i className={`bi bi-chevron-${mapOpen ? "up" : "down"}`} />
          </button>
          <div className="ct-map-body">
            <h3>Sơ đồ câu hỏi</h3>
            <div className="ct-grid">
              {questions.map((q, index) => {
                const done = Boolean(answers[q.code]);
                return (
                  <button
                    key={q.code}
                    className={[
                      done ? "done" : "",
                      index === current ? "current" : "",
                      showMissing && !done ? "missing" : "",
                    ].join(" ")}
                    onClick={() => goTo(index)}
                    title={`Câu ${index + 1}: ${done ? "đã trả lời" : "chưa trả lời"}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="ct-legend">
              <span>
                <i className="done" /> Đã làm
              </span>
              <span>
                <i className="current" /> Đang xem
              </span>
              <span>
                <i /> Chưa làm
              </span>
            </div>
            <button className="ct-btn primary block" disabled={submitting} onClick={submit}>
              {missing.length
                ? `Hoàn thành (còn ${missing.length} câu)`
                : "Hoàn thành phần sở thích"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
