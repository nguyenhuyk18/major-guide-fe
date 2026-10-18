import { useState } from "react";
import { toast } from "react-toastify";
import { sendCareerAssessmentFeedback } from "../services/careerAssessment.api";
import "./QuizResultModal.css";
import CareerResult from "./CareerResult";
const labels = {
  R: "Thực hành",
  I: "Khám phá",
  A: "Sáng tạo",
  S: "Hỗ trợ",
  E: "Dẫn dắt",
  C: "Tổ chức",
  achievement: "Thành tựu",
  independence: "Độc lập",
  relationships: "Quan hệ",
  support: "Hỗ trợ",
  recognition: "Ghi nhận",
  workingConditions: "Điều kiện làm việc",
  analytical: "Phân tích",
  creative: "Sáng tạo",
  communication: "Giao tiếp",
  organization: "Tổ chức",
  persistence: "Kiên trì",
  detail: "Chi tiết",
  adaptability: "Thích ứng",
};
export default function QuizResultModal({
  show,
  onClose,
  result,
  assessmentId,
}) {
  const [sent, setSent] = useState(false);
  if (!show || !result) return null;
  if (result.careerMatch)
    return (
      <div className="modal-overlay career-v2-overlay" onClick={onClose}>
        <div className="ct-modal" onClick={(e) => e.stopPropagation()}>
          <button className="career-close" onClick={onClose} aria-label="Đóng">
            <i className="bi bi-x-lg" />
          </button>
          <CareerResult match={result.careerMatch} onClose={onClose} />
        </div>
      </div>
    );
  if (!result.topGroups)
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="result-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="result-modal-header">
            <h2>Kết quả bài đánh giá cũ</h2>
            <p>Điểm tổng: {result.totalScore || 0}</p>
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    );
  const feedback = async (rating) => {
    try {
      await sendCareerAssessmentFeedback(assessmentId, { rating });
      setSent(true);
      toast.success("Cảm ơn phản hồi của bạn");
    } catch {
      toast.error("Chưa thể lưu phản hồi");
    }
  };
  return (
    <div className="modal-overlay career-v2-overlay">
      <div className="result-modal-content career-v2-result">
        <button className="career-close" onClick={onClose}>
          <i className="bi bi-x-lg" />
        </button>
        <header>
          <div>
            <i className="bi bi-compass-fill" />
          </div>
          <span>KẾT QUẢ KHÁM PHÁ</span>
          <h2>Những hướng đáng để bạn tìm hiểu</h2>
          <p>{result.explanation}</p>
        </header>
        {result.mlModel?.used && (
          <section className="ml-result">
            <div className="ml-result-title">
              <span>
                <i className="bi bi-cpu" /> NHÓM NGÀNH PHÙ HỢP (MACHINE LEARNING)
              </span>
              <small>
                Mô hình {result.mlModel.model?.type?.toUpperCase()} · v
                {result.mlModel.model?.version}
              </small>
            </div>
            <div className="ml-result-list">
              {result.mlModel.topFamilies.map((family, index) => (
                <article key={family.code} className={index === 0 ? "top" : ""}>
                  <div className="ml-result-rank">#{index + 1}</div>
                  <div className="ml-result-body">
                    <header>
                      <h3>{family.name}</h3>
                      <b>{family.percent}%</b>
                    </header>
                    <div className="ml-bar">
                      <i
                        style={{
                          width: `${Math.round(
                            (family.probability /
                              result.mlModel.topFamilies[0].probability) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    {!!family.majors?.length && (
                      <p>
                        <span>Ngành học:</span> {family.majors.join(" · ")}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <small className="ml-note">
              % = xác suất mô hình dự đoán bạn thuộc nhóm ngành này, dựa trên câu
              trả lời sở thích của bạn.
            </small>
          </section>
        )}
        <div className={`evidence ${result.evidenceLevel}`}>
          <i className="bi bi-shield-check" />
          <b>
            Mức bằng chứng:{" "}
            {result.evidenceLevel === "strong"
              ? "Tốt"
              : result.evidenceLevel === "moderate"
              ? "Khá"
              : "Cần khám phá thêm"}
          </b>
          <span>Độ bất định {result.uncertainty}%</span>
        </div>
        {result.parallelTop && (
          <div className="parallel-note">
            <i className="bi bi-signpost-split" /> Hai hướng đầu có mức tương
            hợp gần nhau; hãy khám phá song song.
          </div>
        )}
        {result.personalProfile && (
          <section className="personal-profile-card">
            <span>CHÂN DUNG CÁ NHÂN</span>
            <h3>
              {result.personalProfile.title}{" "}
              <small>{result.personalProfile.riasecCode}</small>
            </h3>
            <p>{result.personalProfile.summary}</p>
          </section>
        )}
        <section className="career-v2-ranking">
          {result.topGroups.map((group) => (
            <article key={group.code} className={group.rank === 1 ? "top" : ""}>
              <div className="rank">#{group.rank}</div>
              <div className="career-copy">
                <h3>{group.name}</h3>
                <div className="match-track">
                  <i style={{ width: `${group.matchScore}%` }} />
                </div>
                <b>{group.matchScore}/100 mức tương hợp</b>
                {!!group.fitReasons?.length && (
                  <ul className="fit-reasons">
                    {group.fitReasons.map((reason) => (
                      <li key={reason.facet}>{reason.reason}</li>
                    ))}
                  </ul>
                )}
                <p>{group.relatedMajors.join(" · ")}</p>
                <small>
                  <i className="bi bi-lightbulb" />{" "}
                  {group.explorationActivities[0]}
                </small>
              </div>
            </article>
          ))}
        </section>
        {!!result.hybridPaths?.length && (
          <section className="hybrid-paths">
            <h3>Hướng giao thoa dành riêng cho bạn</h3>
            <p>Bạn không nhất thiết phải nằm gọn trong một nhóm ngành.</p>
            <div>
              {result.hybridPaths.map((path) => (
                <article key={path.name}>
                  <i className="bi bi-intersect" />
                  <div>
                    <b>{path.name}</b>
                    <span>{path.examples.join(" · ")}</span>
                    <small>{path.reason}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {result.decisionSupport && (
          <section className="decision-support">
            <h3>Điều giúp bạn phân biệt hai hướng đầu</h3>
            <p>{result.decisionSupport.between.join(" ↔ ")}</p>
            {result.decisionSupport.decisiveFactors.map((factor) => (
              <div key={factor.facet}>
                <i className="bi bi-question-circle" />
                <span>{factor.question}</span>
                <small>Nghiêng về {factor.leansTo}</small>
              </div>
            ))}
          </section>
        )}
        {(result.preferredEnvironments?.length > 0 ||
          result.watchOuts?.length > 0) && (
          <section className="environment-grid">
            <div>
              <h3>Môi trường có thể giúp bạn phát huy</h3>
              {result.preferredEnvironments.map((item) => (
                <p key={item}>
                  <i className="bi bi-check-circle" />
                  {item}
                </p>
              ))}
            </div>
            <div>
              <h3>Điều nên kiểm chứng thêm</h3>
              {result.watchOuts.map((item) => (
                <p key={item}>
                  <i className="bi bi-exclamation-circle" />
                  {item}
                </p>
              ))}
            </div>
          </section>
        )}
        {!!result.feasibility?.notes?.length && (
          <section className="feasibility-notes">
            <h3>Bối cảnh thực tế của bạn</h3>
            {result.feasibility.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
            <small>Phần này không thay đổi mức tương hợp.</small>
          </section>
        )}
        {!!result.personalizedRoadmap?.length && (
          <section className="personal-roadmap">
            <h3>Lộ trình kiểm chứng cá nhân</h3>
            {result.personalizedRoadmap.map((item) => (
              <div key={item.step}>
                <span>{item.step}</span>
                <p>
                  <b>{item.title}</b>
                  <small>{item.action}</small>
                </p>
              </div>
            ))}
          </section>
        )}
        <section className="career-strengths">
          <h3>Điểm nổi bật trong câu trả lời</h3>
          <div>
            {result.strengths.map((item) => (
              <span key={item.facet}>
                {labels[item.facet] || item.facet} <b>{item.score}</b>
              </span>
            ))}
          </div>
        </section>
        <div className="career-disclaimer">
          <i className="bi bi-info-circle" />
          {result.matchMeaning}
        </div>
        <footer>
          <div>
            {!sent ? (
              <>
                <span>Kết quả này có hữu ích?</span>
                <button onClick={() => feedback("helpful")}>
                  <i className="bi bi-hand-thumbs-up" />
                </button>
                <button onClick={() => feedback("unsure")}>Chưa chắc</button>
                <button onClick={() => feedback("not_helpful")}>
                  <i className="bi bi-hand-thumbs-down" />
                </button>
              </>
            ) : (
              <span>Đã ghi nhận phản hồi.</span>
            )}
          </div>
          <button className="career-primary-action" onClick={onClose}>
            Xem lịch sử <i className="bi bi-arrow-right" />
          </button>
        </footer>
      </div>
    </div>
  );
}
