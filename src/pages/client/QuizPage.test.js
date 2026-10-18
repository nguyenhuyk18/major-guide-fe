import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { toast } from "react-toastify";
import QuizPage from "./QuizPage";
import * as api from "../../services/careerAssessment.api";

// react-router-dom v7 is ESM-only and cannot be loaded by this Jest setup.
jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock("react-toastify", () => ({ toast: { info: jest.fn(), error: jest.fn(), warning: jest.fn() } }));
jest.mock("../../services/careerAssessment.api", () => ({
  startCareerAssessment: jest.fn(),
  answerCareerQuestion: jest.fn(),
  completeCareerAssessment: jest.fn(),
  saveCareerAcademic: jest.fn(),
  getCareerExperts: jest.fn(),
}));

const questions = Array.from({ length: 30 }, (_, i) => ({ number: i + 1, code: `Q${i}`, text: `Câu hỏi số ${i + 1}` }));
const options = ["Rất không thích", "Không thích", "Bình thường", "Thích", "Rất thích"].map((label, i) => ({ value: i + 1, label }));
const subjects = ["toan", "ngu_van", "ngoai_ngu", "vat_li", "hoa_hoc", "sinh_hoc", "lich_su", "dia_li", "gdcd"].map((code) => ({ code, label: code }));
const combinations = { B00: ["toan", "hoa_hoc", "sinh_hoc"], D01: ["ngu_van", "toan", "ngoai_ngu"] };
const careerMatch = { source: "ml", academicUsed: false, percentMeaning: "x", riasecCode: "IRC", riasecLabels: {}, riasec: {}, groups: [] };

const session = (answered = 0) => ({
  id: "s1",
  questions,
  options,
  subjects,
  combinations,
  academic: null,
  answers: questions.slice(0, answered).map((q) => ({ code: q.code, value: 4 })),
});
const store = createStore(() => ({ authClientReducer: { isLogin: true } }));
const start = async (answered = 0) => {
  api.startCareerAssessment.mockResolvedValue(session(answered));
  render(
    <Provider store={store}>
      <QuizPage />
    </Provider>
  );
  await act(async () => {
    fireEvent.click(screen.getByText(/Bắt đầu làm bài/));
  });
};
const click = async (element) => {
  await act(async () => {
    fireEvent.click(element);
  });
};
const scoreInputs = () => document.querySelectorAll(".ct-subject-groups input");

beforeEach(() => {
  jest.clearAllMocks();
  api.answerCareerQuestion.mockResolvedValue({});
  api.saveCareerAcademic.mockImplementation(async () => session(30));
  api.completeCareerAssessment.mockResolvedValue({ careerMatch });
  api.getCareerExperts.mockResolvedValue([]);
});

test("TC-TL-01: choosing an answer saves it and stays on the same question", async () => {
  await start();
  await click(screen.getByText("Thích"));
  expect(api.answerCareerQuestion).toHaveBeenCalledWith("s1", expect.objectContaining({ code: "Q0", value: 4 }));
  expect(screen.getByText("Câu hỏi số 1")).toBeInTheDocument();
  expect(screen.getByText(/Đã trả lời 1\/30/)).toBeInTheDocument();
});

test("TC-TL-07: a failed save reverts the answer and tells the user", async () => {
  api.answerCareerQuestion.mockRejectedValue(new Error("network"));
  await start();
  await click(screen.getByText("Thích"));
  expect(toast.error).toHaveBeenCalledWith("Chưa lưu được câu trả lời, vui lòng chọn lại");
  expect(screen.getByText(/Đã trả lời 0\/30/)).toBeInTheDocument();
});

test("TC-BD-05: resuming opens the first unanswered question", async () => {
  await start(12);
  expect(toast.info).toHaveBeenCalledWith("Tiếp tục bài đang làm (12/30 câu)");
  expect(screen.getByText("Câu hỏi số 13")).toBeInTheDocument();
});

test("TC-SD-02: the question map jumps to a question", async () => {
  await start();
  await click(screen.getByTitle("Câu 20: chưa trả lời"));
  expect(screen.getByText("Câu hỏi số 20")).toBeInTheDocument();
});

test("TC-SD-03: finishing with unanswered questions flags them and stays", async () => {
  await start(12);
  await click(screen.getByText(/Hoàn thành \(còn 18 câu\)/));
  expect(toast.warning).toHaveBeenCalledWith(expect.stringContaining("Còn 18 câu chưa trả lời"));
  expect(document.querySelectorAll(".ct-grid button.missing")).toHaveLength(18);
  expect(screen.queryByText("Học lực của bạn")).not.toBeInTheDocument();
});

test("TC-HL-02/03: results unlock only once a combination is complete", async () => {
  await start(30);
  await click(screen.getByText(/Hoàn thành phần sở thích/));
  const submitButton = () => screen.getByText(/Xem kết quả/).closest("button");
  fireEvent.change(scoreInputs()[0], { target: { value: "9" } }); // toan
  fireEvent.change(scoreInputs()[4], { target: { value: "9" } }); // hoa_hoc
  expect(submitButton()).toBeDisabled();
  fireEvent.change(scoreInputs()[5], { target: { value: "9.25" } }); // sinh_hoc
  expect(screen.getByText("B00 · 27.25")).toBeInTheDocument();
  expect(submitButton()).toBeEnabled();
});

test("TC-HL-04: an out-of-range score blocks the results", async () => {
  await start(30);
  await click(screen.getByText(/Hoàn thành phần sở thích/));
  ["11", "", "", "", "9", "9"].forEach((value, i) => fireEvent.change(scoreInputs()[i], { target: { value } }));
  expect(screen.getByText("Điểm mỗi môn phải từ 0 đến 10.")).toBeInTheDocument();
  expect(screen.getByText(/Xem kết quả/).closest("button")).toBeDisabled();
});

test("TC-HL-06: scores typed in are kept after going back to the questions", async () => {
  await start(30);
  await click(screen.getByText(/Hoàn thành phần sở thích/));
  await click(screen.getByText("Điểm TB học bạ lớp 12"));
  fireEvent.change(scoreInputs()[0], { target: { value: "8.5" } });
  await click(screen.getByText(/Xem lại câu trả lời/));
  await click(screen.getByText(/Hoàn thành phần sở thích/));
  expect(scoreInputs()[0]).toHaveValue(8.5);
  expect(screen.getByText("Điểm TB học bạ lớp 12").closest("button")).toHaveAttribute("aria-checked", "true");
});

test("TC-HL-05: skipping completes without sending grades", async () => {
  await start(30);
  await click(screen.getByText(/Hoàn thành phần sở thích/));
  await click(screen.getByText("Bỏ qua"));
  expect(api.saveCareerAcademic).not.toHaveBeenCalled();
  expect(api.completeCareerAssessment).toHaveBeenCalledWith("s1");
  expect(screen.getByText("3 nhóm ngành phù hợp nhất với bạn")).toBeInTheDocument();
});

test("submitting grades saves them before completing", async () => {
  await start(30);
  await click(screen.getByText(/Hoàn thành phần sở thích/));
  ["9", "6", "7"].forEach((value, i) => fireEvent.change(scoreInputs()[i], { target: { value } }));
  await click(screen.getByText(/Xem kết quả/));
  expect(api.saveCareerAcademic).toHaveBeenCalledWith("s1", { source: "thi_thu", scores: { toan: 9, ngu_van: 6, ngoai_ngu: 7 } });
  expect(api.completeCareerAssessment.mock.invocationCallOrder[0]).toBeGreaterThan(api.saveCareerAcademic.mock.invocationCallOrder[0]);
});
