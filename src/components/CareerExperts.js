import { useEffect, useState } from "react";
import { getCareerExperts } from "../services/careerAssessment.api";
import { EXPERT_LEVELS } from "../constants/careerFamilies";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

/** "Experts for you" block of the career-test result: experts matching the top 3 families. */
export default function CareerExperts({ groups, go }) {
  const codes = groups.map((group) => group.code).join(",");
  const [state, setState] = useState({ loading: true, experts: [] });

  useEffect(() => {
    let alive = true;
    if (!codes) {
      setState({ loading: false, experts: [] });
      return undefined;
    }
    setState({ loading: true, experts: [] });
    getCareerExperts(codes.split(","))
      .then((experts) => alive && setState({ loading: false, experts: experts || [] }))
      .catch(() => alive && setState({ loading: false, experts: [], failed: true }));
    return () => {
      alive = false;
    };
  }, [codes]);

  const top = groups[0];
  const hasExactTop = state.experts.some((e) => e.matchType === "exact" && e.matchedGroup.rank === 1);

  return (
    <section className="ct-experts">
      <div className="ct-experts-head">
        <div>
          <span className="ct-eyebrow">
            <i className="bi bi-person-check" /> BƯỚC TIẾP THEO
          </span>
          <h3>Chuyên gia phù hợp với kết quả của bạn</h3>
          <p>Trò chuyện 1-1 qua video với người đang làm trong đúng lĩnh vực để kiểm chứng lựa chọn trước khi đăng ký nguyện vọng.</p>
        </div>
        <button className="ct-btn" onClick={() => go("/experts")}>
          Xem tất cả <i className="bi bi-arrow-right" />
        </button>
      </div>

      {state.loading && (
        <div className="ct-experts-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="ct-expert skeleton" aria-hidden="true" />
          ))}
        </div>
      )}

      {!state.loading && state.experts.length === 0 && (
        <div className="ct-experts-empty">
          <i className="bi bi-search" />
          <p>
            {state.failed
              ? "Chưa tải được danh sách chuyên gia, bạn có thể xem toàn bộ chuyên gia của hệ thống."
              : `Hiện chưa có chuyên gia thuộc nhóm ${top?.name} hoặc các nhóm gần. Bạn vẫn có thể đặt lịch với chuyên gia hướng nghiệp chung.`}
          </p>
        </div>
      )}

      {!state.loading && state.experts.length > 0 && (
        <>
          {!hasExactTop && top && (
            <p className="ct-experts-note">
              <i className="bi bi-info-circle" /> Hệ thống chưa có chuyên gia đúng nhóm <b>{top.name}</b>, dưới đây là
              những chuyên gia có chuyên môn gần nhất.
            </p>
          )}
          <div className="ct-experts-grid">
            {state.experts.map((expert) => (
              <article key={expert.id} className={`ct-expert ${expert.matchType}`}>
                <span className={`ct-expert-match ${expert.matchType}`}>
                  {expert.matchType === "exact" ? (
                    <>
                      <i className="bi bi-bullseye" /> Đúng nhóm #{expert.matchedGroup.rank}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-diagram-3" /> Nhóm gần #{expert.matchedGroup.rank}
                    </>
                  )}
                </span>
                <div className="ct-expert-id">
                  <img src={expert.avatar || `https://i.pravatar.cc/150?u=${expert.id}`} alt={expert.name} />
                  <div>
                    <h4>{expert.name}</h4>
                    <span>
                      {EXPERT_LEVELS[expert.level] || "Chuyên gia"}
                      {expert.major ? ` · ${expert.major}` : ""}
                    </span>
                  </div>
                </div>
                {expert.teachAt && (
                  <p className="ct-expert-at">
                    <i className="bi bi-building" /> {expert.teachAt}
                  </p>
                )}
                <div className="ct-expert-families">
                  {expert.families.map((family) => (
                    <span key={family.code} className={family.code === (expert.expertFamily?.code || expert.matchedGroup.code) ? "hit" : ""}>
                      {family.name}
                    </span>
                  ))}
                </div>
                <p className="ct-expert-reason">{expert.reason}</p>
                <div className="ct-expert-foot">
                  <div>
                    <small>Phí tư vấn</small>
                    <b>{money(expert.price)}</b>
                  </div>
                  <div className="ct-expert-actions">
                    <button className="ct-btn" onClick={() => go(`/experts/${expert.id}`)}>
                      Hồ sơ
                    </button>
                    <button className="ct-btn primary" onClick={() => go(`/choose-schedule?expert_id=${expert.id}`)}>
                      <i className="bi bi-calendar2-check" /> Đặt lịch
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
