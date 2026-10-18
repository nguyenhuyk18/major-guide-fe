import { useNavigate } from "react-router-dom";
import "../assets/css/CareerTest.css";
import CareerExperts from "./CareerExperts";

const SCALE_ORDER = ["R", "I", "A", "S", "E", "C"];

export default function CareerResult({ match, onClose, onRetake }) {
  const navigate = useNavigate();
  const labels = match.riasecLabels || {};
  const go = (path) => {
    onClose?.();
    navigate(path);
  };
  return (
    <div className="ct-result">
      <header className="ct-result-hero">
        <span className="ct-eyebrow">
          <i className="bi bi-stars" /> KẾT QUẢ TRẮC NGHIỆM HƯỚNG NGHIỆP
        </span>
        <h1>3 nhóm ngành phù hợp nhất với bạn</h1>
        <div className="ct-code">
          {match.riasecCode.split("").map((scale) => (
            <span key={scale} title={labels[scale]}>
              <b>{scale}</b>
              {labels[scale]}
            </span>
          ))}
        </div>
        <p>
          Mã sở thích của bạn là <b>{match.riasecCode}</b>
          {match.academicUsed && <> · Đã kết hợp học lực ({match.academicSource === "thi_thu" ? "điểm thi thử" : "học bạ"})</>}
          {match.source === "ml" ? (
            <> · Kết quả từ mô hình học máy huấn luyện trên hơn 62.000 hồ sơ thật.</>
          ) : (
            <> · Kết quả dựa trên mức tương đồng hồ sơ sở thích.</>
          )}
        </p>
      </header>

      {match.academicUsed && (match.alignment || match.interestOnly) && (
        <section className="ct-insight">
          {match.alignment && (
            <div className={`ct-alignment ${match.alignment.status}`}>
              <i
                className={`bi ${
                  match.alignment.status === "aligned"
                    ? "bi-check2-circle"
                    : match.alignment.status === "mismatch"
                    ? "bi-exclamation-triangle"
                    : "bi-info-circle"
                }`}
              />
              <div>
                <b>
                  {match.alignment.status === "aligned"
                    ? "Sở thích và học lực đồng thuận"
                    : match.alignment.status === "mismatch"
                    ? "Sở thích và học lực chưa đồng thuận"
                    : "Sở thích và học lực"}
                </b>
                <p>{match.alignment.message}</p>
              </div>
            </div>
          )}
          {match.interestOnly && (
            <div className="ct-compare">
              <span>Nếu chỉ xét sở thích:</span>
              {match.interestOnly.map((g, i) => (
                <b key={g.code}>
                  {i + 1}. {g.name}
                </b>
              ))}
              <em>
                {match.rankingChanged
                  ? "→ Học lực đã thay đổi thứ tự xếp hạng."
                  : "→ Học lực không làm thay đổi top 3."}
              </em>
            </div>
          )}
        </section>
      )}

      <section className="ct-groups">
        {match.groups.map((group) => (
          <article key={group.code} className={`ct-group rank-${group.rank}`}>
            <div className="ct-group-head">
              <span className="ct-rank">{group.rank}</span>
              <div>
                <span className="ct-fit">{group.fitLevel}</span>
                <h2>{group.name}</h2>
                <p>{group.description}</p>
              </div>
              <div className="ct-percent" style={{ "--p": group.percent }}>
                <strong>{group.percent}%</strong>
              </div>
            </div>
            {group.academic && (
              <div className="ct-split">
                <div>
                  <span>Sở thích</span>
                  <div className="ct-bar">
                    <i style={{ width: `${group.interestPercent}%` }} />
                  </div>
                  <em>{group.interestPercent}%</em>
                </div>
                <div>
                  <span>Học lực</span>
                  <div className="ct-bar academic">
                    <i style={{ width: `${group.academic.percent}%` }} />
                  </div>
                  <em>{group.academic.percent}/100</em>
                </div>
                {group.academic.combo && (
                  <div
                    className="ct-combo-chip"
                    title={`${group.academic.comboSubjects.join(" + ")}${
                      group.academic.nationalPercentile !== null
                        ? " · so với phổ điểm thi tốt nghiệp THPT 2024 của thí sinh thi tổ hợp này"
                        : ""
                    }`}
                  >
                    <b>{group.academic.combo}</b>
                    {group.academic.total}/30
                    {group.academic.nationalPercentile !== null && (
                      <small>
                        Top {Math.max(1, 100 - group.academic.nationalPercentile)}% · THPT 2024
                      </small>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="ct-why">
              <h3>
                <i className="bi bi-lightbulb" /> Vì sao phù hợp với bạn
              </h3>
              <p>{group.explanation}</p>
            </div>
            <div className="ct-group-cols">
              <div>
                <h4>Ngành học tiêu biểu</h4>
                <div className="ct-chips">
                  {group.majors.map((major) => (
                    <span key={major}>{major}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4>Công việc sau khi ra trường</h4>
                <ul>
                  {group.jobs.map((job) => (
                    <li key={job}>{job}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
        <small className="ct-percent-note">% = {match.percentMeaning}.</small>
      </section>

      <CareerExperts groups={match.groups} go={go} />

      <section className="ct-profile">
        <h3>Hồ sơ sở thích của bạn</h3>
        {SCALE_ORDER.map((scale) => (
          <div key={scale} className="ct-bar-row">
            <span>
              <b>{scale}</b> {labels[scale]}
            </span>
            <div className="ct-bar">
              <i style={{ width: `${match.riasec[scale] ?? 0}%` }} />
            </div>
            <em>{match.riasec[scale] ?? 0}</em>
          </div>
        ))}
      </section>

      <footer className="ct-result-actions">
        <button className="ct-btn primary" onClick={() => go("/experts")}>
          <i className="bi bi-people" /> Xem tất cả chuyên gia
        </button>
        {onRetake && (
          <button className="ct-btn" onClick={onRetake}>
            <i className="bi bi-arrow-repeat" /> Làm lại bài
          </button>
        )}
        <button className="ct-btn" onClick={() => go("/quiz-history")}>
          <i className="bi bi-clock-history" /> Lịch sử làm bài
        </button>
      </footer>
    </div>
  );
}
