import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import CareerExperts from "./CareerExperts";
import * as api from "../services/careerAssessment.api";

jest.mock("../services/careerAssessment.api", () => ({ getCareerExperts: jest.fn() }));

const groups = [
  { rank: 1, code: "finance_economics", name: "Tài chính, Kế toán & Kinh tế" },
  { rank: 2, code: "business_management", name: "Kinh doanh & Quản trị" },
  { rank: 3, code: "it_software", name: "Công nghệ thông tin" },
];
const expert = (id, matchType, rank, code) => ({
  id,
  name: `Chuyên gia ${id}`,
  level: "master",
  major: "Kế toán",
  price: 150000,
  families: [{ code, name: code }],
  matchType,
  matchedGroup: { rank, code, name: code },
  reason: `Lý do ${id}`,
});

const renderExperts = async (go = jest.fn()) => {
  await act(async () => {
    render(<CareerExperts groups={groups} go={go} />);
  });
  return go;
};

beforeEach(() => jest.clearAllMocks());

test("TC-CG-01: asks for experts of the top 3 families, best first", async () => {
  api.getCareerExperts.mockResolvedValue([]);
  await renderExperts();
  expect(api.getCareerExperts).toHaveBeenCalledWith(["finance_economics", "business_management", "it_software"]);
});

test("TC-CG-02: shows matching experts with the reason and match badge", async () => {
  api.getCareerExperts.mockResolvedValue([expert("a", "exact", 1, "finance_economics"), expert("b", "related", 2, "law_public")]);
  await renderExperts();
  expect(screen.getByText("Chuyên gia a")).toBeInTheDocument();
  expect(screen.getByText(/Đúng nhóm #1/)).toBeInTheDocument();
  expect(screen.getByText(/Nhóm gần #2/)).toBeInTheDocument();
  expect(screen.getByText("Lý do a")).toBeInTheDocument();
  expect(screen.getAllByText("150.000đ")).toHaveLength(2);
  expect(screen.queryByText(/chưa có chuyên gia đúng nhóm/)).not.toBeInTheDocument();
});

test("TC-CG-03: booking opens the schedule of that expert", async () => {
  api.getCareerExperts.mockResolvedValue([expert("a", "exact", 1, "finance_economics")]);
  const go = await renderExperts();
  fireEvent.click(screen.getByText("Đặt lịch"));
  expect(go).toHaveBeenCalledWith("/choose-schedule?expert_id=a");
  fireEvent.click(screen.getByText("Hồ sơ"));
  expect(go).toHaveBeenCalledWith("/experts/a");
});

test("TC-CG-04: says so when nobody covers the top family", async () => {
  api.getCareerExperts.mockResolvedValue([expert("b", "related", 1, "business_management")]);
  await renderExperts();
  expect(screen.getByText(/chưa có chuyên gia đúng nhóm/)).toBeInTheDocument();
});

test("TC-CG-05: no experts or a failed request still leaves a way forward", async () => {
  api.getCareerExperts.mockResolvedValue([]);
  const go = await renderExperts();
  expect(screen.getByText(/Hiện chưa có chuyên gia thuộc nhóm Tài chính/)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Xem tất cả/));
  expect(go).toHaveBeenCalledWith("/experts");
});
