import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "../../assets/css/QuizHistoryPage.css";
import { getTestResultsByUser } from "../../services/quiz.api";
import { getCareerAssessmentHistory } from "../../services/careerAssessment.api";
import QuizHistoryDetailModal from "../../components/QuizHistoryDetailModal";
import QuizResultModal from "../../components/QuizResultModal";

export default function QuizHistoryPage() {
  const navigate = useNavigate(),
    user = useSelector((s) => s.authClientReducer.loggedUser),
    isLogin = useSelector((s) => s.authClientReducer.isLogin);
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [selected, setSelected] = useState(null);
  useEffect(() => {
    if (!isLogin) {
      toast.error("Vui lòng đăng nhập để xem lịch sử");
      navigate("/");
      return;
    }
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [modern, legacy] = await Promise.all([
          getCareerAssessmentHistory().catch(() => []),
          getTestResultsByUser(user.id).catch(() => []),
        ]);
        if (active)
          setItems(
            [
              ...(modern || []).map((x) => ({ ...x, kind: "v2" })),
              ...(legacy || []).map((x) => ({ ...x, kind: "legacy" })),
            ].sort(
              (a, b) =>
                new Date(b.completedAt || b.updatedAt || b.createdAt) -
                new Date(a.completedAt || a.updatedAt || a.createdAt)
            )
          );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isLogin, navigate, user?.id]);
  if (loading)
    return (
      <div className="quiz-history-loading">
        <span className="spinner-border text-primary" />
        <p>Đang tải hành trình khám phá...</p>
      </div>
    );
  return (
    <div className="quiz-history-page">
      <div className="container py-4">
        <div className="quiz-history-header">
          <div>
            <h1 className="page-title">
              <i className="bi bi-compass" /> Hành trình định hướng
            </h1>
            <p className="page-subtitle">
              Kết quả mới được lưu theo từng phiên bản; bài test cũ vẫn có thể
              xem lại.
            </p>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/quiz")}
          >
            <i className="bi bi-plus-lg" /> Làm bài mới
          </button>
        </div>
        <div className="history-stats">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <i className="bi bi-clipboard-check" />
            </div>
            <div className="stat-content">
              <span className="stat-number">{items.length}</span>
              <span className="stat-label">Tổng phiên</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper score">
              <i className="bi bi-stars" />
            </div>
            <div className="stat-content">
              <span className="stat-number">
                {items.filter((x) => x.kind === "v2").length}
              </span>
              <span className="stat-label">Đánh giá thích ứng</span>
            </div>
          </div>
        </div>
        {items.length === 0 ? (
          <div className="history-empty">
            <div className="empty-illustration">
              <i className="bi bi-compass" />
            </div>
            <h3>Chưa có hành trình nào</h3>
            <p>Bắt đầu bài đánh giá thích ứng để khám phá các hướng phù hợp.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/quiz")}
            >
              Bắt đầu khám phá
            </button>
          </div>
        ) : (
          <div className="history-list">
            {items.map((item, index) => {
              const modern = item.kind === "v2",
                inProgress = modern
                  ? item.status === "in_progress"
                  : item.isCompleted === false,
                ml = item.result?.careerMatch?.groups?.[0],
                top = ml
                  ? { name: ml.name, matchScore: `${ml.percent}%` }
                  : item.result?.topGroups?.[0];
              return (
                <article
                  key={item.id || item._id || index}
                  className={`history-card ${inProgress ? "in-progress" : ""}`}
                  onClick={() =>
                    inProgress ? navigate("/quiz") : setSelected(item)
                  }
                >
                  <div className="history-card-main">
                    <div className="card-index">
                      <span
                        className={`index-number ${
                          inProgress ? "in-progress" : ""
                        }`}
                      >
                        {inProgress ? (
                          <i className="bi bi-pause-circle" />
                        ) : (
                          index + 1
                        )}
                      </span>
                    </div>
                    <div className="card-info">
                      <div className="card-header-row">
                        <h3 className="card-title">
                          <i
                            className={
                              modern ? "bi bi-compass" : "bi bi-archive"
                            }
                          />{" "}
                          {modern
                            ? "Đánh giá định hướng thích ứng"
                            : "Bài test phiên bản cũ"}{" "}
                          {inProgress && (
                            <span className="status-badge in-progress">
                              Đang dở
                            </span>
                          )}
                        </h3>
                        <span className="card-date">
                          {new Date(
                            item.completedAt || item.updatedAt || item.createdAt
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="card-stats-row">
                        <div className="card-stat">
                          <span className="stat-value">
                            {item.answers?.length || 0}
                          </span>
                          <span className="stat-name">Câu đã trả lời</span>
                        </div>
                        {modern && top && (
                          <>
                            <div className="card-stat highlight">
                              <span className="stat-value">
                                {top.matchScore}
                              </span>
                              <span className="stat-name">Mức tương hợp</span>
                            </div>
                            {item.result.careerMatch ? (
                              <div className="card-stat">
                                <span className="stat-value">
                                  {item.result.careerMatch.riasecCode}
                                </span>
                                <span className="stat-name">Mã RIASEC</span>
                              </div>
                            ) : (
                              <div className="card-stat">
                                <span className="stat-value">
                                  {item.result.evidenceLevel}
                                </span>
                                <span className="stat-name">Bằng chứng</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {top && (
                        <div className="history-v2-top">
                          <span>{ml ? "Nhóm ngành phù hợp nhất" : "Hướng nổi bật"}</span>
                          <b>{top.name}</b>
                        </div>
                      )}
                    </div>
                    <div className="card-action">
                      <i className="bi bi-chevron-right" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      {selected?.kind === "v2" && (
        <QuizResultModal
          show
          assessmentId={selected.id}
          result={selected.result}
          onClose={() => setSelected(null)}
        />
      )}{" "}
      {selected?.kind === "legacy" && (
        <QuizHistoryDetailModal
          show
          result={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
