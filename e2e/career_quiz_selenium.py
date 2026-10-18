"""
Selenium E2E: 10 test case dự đoán nhóm ngành (TC1–TC10) của trang /quiz.
Nguồn: docs/TestCase_TracNghiem_HuongNghiep_KetQua.docx (Bảng 1, 2, 3).

Mỗi test case:
  đăng nhập (1 lần) -> /quiz -> "Bắt đầu làm bài" -> chọn đáp án 30 câu theo Bảng 1
  -> bước học lực: "Bỏ qua" hoặc nhập điểm theo Bảng 2 -> "Xem kết quả"
  -> so sánh top 3 nhóm ngành + % và các kiểm tra thêm với Bảng 3.

Yêu cầu trước khi chạy:
  - FE  : http://localhost:3000    (npm start trong major-guide-fe-main)
  - BFF + các service NestJS        (npm run dev trong major-guide)
  - AI service Python cổng 8000     (venv\\Scripts\\python -m uvicorn apps.main:app --port 8000)
  - pip install selenium            (Selenium >= 4.6 tự tải chromedriver)

Chạy:
  python e2e/career_quiz_selenium.py                 # chạy cả 10 TC, có mở trình duyệt
  python e2e/career_quiz_selenium.py --tc 1 8 10     # chỉ chạy TC1, TC8, TC10
  python e2e/career_quiz_selenium.py --headless      # không mở cửa sổ
  python e2e/career_quiz_selenium.py --slow 0.3      # chậm lại để xem (giây/thao tác)

Kết quả: in bảng PASS/FAIL, chụp màn hình trang kết quả từng TC vào e2e/screenshots/,
ghi e2e/reports/career_quiz_<thời gian>.json. Thoát với mã 1 nếu có TC không đạt.
"""
import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent
USERNAME = "nguyenhuy"
PASSWORD = "123"

# Câu thứ i (1..30) thuộc nhóm SCALES[(i-1) % 6]  (Bảng 1).
SCALES = "RIASEC"
QUESTIONS = [
    "Tôi thích lắp ráp hoặc sửa chữa một vật dụng.",
    "Tôi thích tìm bằng chứng trước khi kết luận.",
    "Tôi thích tạo ý tưởng khác cách làm quen thuộc.",
    "Tôi thích giúp người khác tiến bộ.",
    "Tôi thích thuyết phục người khác ủng hộ ý tưởng.",
    "Tôi thích sắp xếp thông tin theo hệ thống.",
    "Tôi thích tạo ra sản phẩm hữu hình.",
    "Tôi thích tìm nguyên nhân phía sau một hiện tượng.",
    "Tôi thích làm việc với hình ảnh, âm thanh hoặc câu chữ.",
    "Tôi thích lắng nghe khi ai đó gặp khó khăn.",
    "Tôi thích đứng ra dẫn dắt khi nhóm thiếu định hướng.",
    "Tôi thích làm việc theo quy trình cụ thể.",
    "Tôi thích học bằng cách trực tiếp thực hành.",
    "Tôi thích phân tích dữ liệu để tìm quy luật.",
    "Tôi thích thể hiện góc nhìn qua sản phẩm.",
    "Tôi thích hướng dẫn một người hiểu vấn đề.",
    "Tôi thích biến ý tưởng thành cơ hội.",
    "Tôi thích kiểm tra chi tiết trước khi hoàn thành.",
    "Tôi thích sử dụng công cụ hoặc thiết bị.",
    "Tôi thích thử nhiều giả thuyết khi giải quyết vấn đề.",
    "Tôi thích sáng tạo trong không gian tự do.",
    "Tôi thích quan tâm cảm xúc của mọi người trong nhóm.",
    "Tôi thích đưa ra quyết định và chịu trách nhiệm.",
    "Tôi thích lập kế hoạch và theo dõi tiến độ.",
    "Tôi thích quan sát kết quả cụ thể từ công việc.",
    "Tôi thích đọc sâu về một chủ đề khó.",
    "Tôi thích chú ý bố cục và cảm xúc của sản phẩm.",
    "Tôi thích tạo tác động tích cực cho cộng đồng.",
    "Tôi thích theo đuổi mục tiêu có tính thử thách.",
    "Tôi thích quản lý hồ sơ hoặc số liệu.",
]

# Mức chọn cho 5 câu của mỗi nhóm, thứ tự R I A S E C (Bảng 1).
PROFILES = {
    "TC1": [3, 5, 2, 2, 1, 3],
    "TC2": [5, 4, 1, 1, 2, 3],
    "TC3": [1, 2, 5, 3, 2, 1],
    "TC4": [1, 2, 3, 5, 2, 2],
    "TC5": [1, 2, 2, 3, 5, 4],
    "TC6": [2, 3, 1, 2, 3, 5],
    "TC7": [3, 3, 3, 3, 3, 3],
}

# Thứ tự 9 ô điểm trên màn hình học lực (AcademicStep.js).
SUBJECT_ORDER = ["toan", "ngu_van", "ngoai_ngu", "vat_li", "hoa_hoc", "sinh_hoc", "lich_su", "dia_li", "gdcd"]
SOURCE_LABEL = {"thi_thu": "Điểm thi thử THPT", "hoc_ba": "Điểm TB học bạ lớp 12"}

CASES = [
    {"id": "TC1", "name": "Hồ sơ Nghiên cứu (I) nổi bật", "answers": "TC1", "academic": None,
     "top3": [("Khoa học sự sống", 26), ("Khoa học tự nhiên & Toán", 20), ("Kỹ thuật", 10)]},
    {"id": "TC2", "name": "Hồ sơ Kỹ thuật (R) nổi bật", "answers": "TC2", "academic": None,
     "top3": [("Kỹ thuật", 47), ("Công nghệ thông tin", 12), ("Kiến trúc & Xây dựng", 12)]},
    {"id": "TC3", "name": "Hồ sơ Nghệ thuật (A) nổi bật", "answers": "TC3", "academic": None,
     "top3": [("Nghệ thuật & Thiết kế", 32), ("Ngôn ngữ & Nhân văn", 18), ("Marketing & Truyền thông", 14)]},
    {"id": "TC4", "name": "Hồ sơ Xã hội (S) nổi bật", "answers": "TC4", "academic": None,
     "top3": [("Tâm lý học", 34), ("Giáo dục", 15), ("Xã hội học & Công tác xã hội", 12)]},
    {"id": "TC5", "name": "Hồ sơ Quản lý (E) nổi bật", "answers": "TC5", "academic": None,
     "top3": [("Kinh doanh & Quản trị", 37), ("Tài chính, Kế toán & Kinh tế", 12), ("Du lịch & Dịch vụ", 10)]},
    {"id": "TC6", "name": "Hồ sơ Nghiệp vụ (C) nổi bật", "answers": "TC6", "academic": None,
     "top3": [("Tài chính, Kế toán & Kinh tế", 25), ("Kinh doanh & Quản trị", 20), ("Công nghệ thông tin", 10)]},
    {"id": "TC7", "name": "Hồ sơ phẳng: trả lời toàn bộ 3", "answers": "TC7", "academic": None,
     "top3": [("Kỹ thuật", 13), ("Kinh doanh & Quản trị", 12), ("Kiến trúc & Xây dựng", 12)],
     "max_percent_below": 20},
    {"id": "TC8", "name": "Nghiên cứu + khối B mạnh", "answers": "TC1",
     "academic": {"source": "thi_thu", "scores": {"toan": 9, "hoa_hoc": 9, "sinh_hoc": 9.25, "ngu_van": 5.5, "ngoai_ngu": 6}},
     "top3": [("Khoa học sự sống", 31), ("Khoa học tự nhiên & Toán", 24), ("Kỹ thuật", 10)],
     "chip": ("B00", "27.25/30"), "alignment": "aligned"},
    {"id": "TC9", "name": "Nghiên cứu + khối tự nhiên yếu, khối xã hội mạnh", "answers": "TC1",
     "academic": {"source": "hoc_ba", "scores": {"toan": 5, "hoa_hoc": 4.5, "sinh_hoc": 5, "ngu_van": 8.5, "lich_su": 8.75, "dia_li": 9}},
     "top3": [("Khoa học sự sống", 16), ("Tâm lý học", 13), ("Khoa học tự nhiên & Toán", 13)],
     "alignment": "mismatch", "ranking_changed": True},
    {"id": "TC10", "name": "Kỹ thuật + khối A00 mạnh", "answers": "TC2",
     "academic": {"source": "thi_thu", "scores": {"toan": 9, "vat_li": 9, "hoa_hoc": 8.5, "ngu_van": 6, "ngoai_ngu": 6.5}},
     "top3": [("Kỹ thuật", 50), ("Công nghệ thông tin", 13), ("Khoa học tự nhiên & Toán", 10)],
     "chip": ("A00", "26.5/30"), "alignment": "aligned"},
]


class CareerQuizE2E:
    def __init__(self, base_url, headless=False, slow=0.0, timeout=20):
        options = webdriver.ChromeOptions()
        if headless:
            options.add_argument("--headless=new")
        options.add_argument("--window-size=1400,1000")
        options.add_argument("--lang=vi")
        self.driver = webdriver.Chrome(options=options)
        self.base_url = base_url.rstrip("/")
        self.wait = WebDriverWait(self.driver, timeout)
        self.slow = slow

    # ---------- helpers ----------
    def pause(self):
        if self.slow:
            time.sleep(self.slow)

    def find(self, css):
        return self.wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, css)))

    def click(self, css=None, text=None, scope="button"):
        """Click a visible, enabled element by CSS selector or by the text it contains."""
        if text is not None:
            locator = (By.XPATH, f"//{scope}[contains(normalize-space(.), {xpath_literal(text)})]")
        else:
            locator = (By.CSS_SELECTOR, css)
        element = self.wait.until(EC.element_to_be_clickable(locator))
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
        element.click()
        self.pause()
        return element

    def wait_text(self, css, text):
        self.wait.until(EC.text_to_be_present_in_element((By.CSS_SELECTOR, css), text))

    # ---------- steps ----------
    def login(self):
        self.driver.get(self.base_url + "/")
        logged_in = self.driver.execute_script(
            "try { return JSON.parse(localStorage.getItem('authInfo') || '{}').isLogin === true } catch (e) { return false }"
        )
        if logged_in:
            return
        self.click(".client-btn-login")
        username = self.find("#loginClientModal input[name='username']")
        username.send_keys(USERNAME)
        self.find("#loginClientModal input[name='password']").send_keys(PASSWORD)
        self.click("#loginClientModal button[type='submit']")
        self.wait.until(lambda d: d.execute_script(
            "try { return JSON.parse(localStorage.getItem('authInfo') || '{}').isLogin === true } catch (e) { return false }"
        ))

    def start_quiz(self):
        self.driver.get(self.base_url + "/quiz")
        self.click(text="Bắt đầu làm bài")
        self.find(".ct-question h2")

    def answer_all(self, levels):
        for index in range(30):
            number = index + 1
            self.wait_text(".ct-qnum", f"Câu {number}")
            text = self.find(".ct-question h2").text.strip()
            if text != QUESTIONS[index]:
                raise AssertionError(f"Câu {number}: nội dung '{text}' khác Bảng 1 '{QUESTIONS[index]}'")
            value = levels[index % 6]  # nhóm R I A S E C lặp lại
            option = self.wait.until(EC.element_to_be_clickable(
                (By.CSS_SELECTOR, f".ct-options button:nth-child({value})")))
            if option.get_attribute("aria-checked") != "true":
                option.click()
                self.wait.until(lambda d: d.find_element(
                    By.CSS_SELECTOR, f".ct-options button:nth-child({value})").get_attribute("aria-checked") == "true")
            self.pause()
            if number < 30:
                self.click(text="Câu tiếp")
        # every answer saved before going on
        self.wait_text(".ct-topbar-title small", "Đã trả lời 30/30 câu · đã lưu")
        self.click(text="Tiếp tục")
        self.find(".ct-academic")

    def fill_academic(self, academic):
        if academic is None:
            self.click(text="Bỏ qua")
            return
        self.click(text=SOURCE_LABEL[academic["source"]])
        inputs = self.driver.find_elements(By.CSS_SELECTOR, ".ct-subject-groups input")
        assert len(inputs) == len(SUBJECT_ORDER), f"Có {len(inputs)} ô điểm, cần {len(SUBJECT_ORDER)}"
        for code, element in zip(SUBJECT_ORDER, inputs):
            element.send_keys(Keys.CONTROL, "a")
            element.send_keys(Keys.DELETE)
            if code in academic["scores"]:
                element.send_keys(str(academic["scores"][code]))
            self.pause()
        self.click(text="Xem kết quả")

    def read_result(self):
        self.wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, ".ct-result .ct-group")) == 3)
        groups = []
        for card in self.driver.find_elements(By.CSS_SELECTOR, ".ct-result .ct-group"):
            percent = card.find_element(By.CSS_SELECTOR, ".ct-percent strong").text.strip().rstrip("%")
            chip = card.find_elements(By.CSS_SELECTOR, ".ct-combo-chip")
            groups.append({
                "name": card.find_element(By.CSS_SELECTOR, ".ct-group-head h2").text.strip(),
                "percent": int(percent),
                "chip": chip[0].text.replace("\n", " ").strip() if chip else None,
            })
        alignment = self.driver.find_elements(By.CSS_SELECTOR, ".ct-alignment")
        compare = self.driver.find_elements(By.CSS_SELECTOR, ".ct-compare em")
        hero = self.find(".ct-result-hero").text
        return {
            "groups": groups,
            "alignment": next((c for c in ("aligned", "mismatch", "neutral", "unclear")
                               if alignment and c in alignment[0].get_attribute("class").split()), None),
            "ranking_note": compare[0].text.strip() if compare else None,
            "ml": "mô hình học máy" in hero,
        }

    def screenshot(self, name):
        folder = ROOT / "screenshots"
        folder.mkdir(exist_ok=True)
        self.driver.execute_script("window.scrollTo(0, 0)")
        path = folder / f"{name}.png"
        self.driver.save_screenshot(str(path))
        return path

    # ---------- one test case ----------
    def run_case(self, case):
        self.start_quiz()
        self.answer_all(PROFILES[case["answers"]])
        self.fill_academic(case["academic"])
        result = self.read_result()
        self.screenshot(case["id"])
        return result, check(case, result)

    def quit(self):
        self.driver.quit()


def check(case, result):
    """List of failed checks (empty = PASS)."""
    errors = []
    if not result["ml"]:
        errors.append("Kết quả không đến từ mô hình học máy (AI service cổng 8000 chưa chạy?)")
    actual = [(g["name"], g["percent"]) for g in result["groups"]]
    if actual != case["top3"]:
        errors.append(f"Top 3 sai: mong đợi {fmt(case['top3'])} | thực tế {fmt(actual)}")
    if case.get("max_percent_below") and any(p >= case["max_percent_below"] for _, p in actual):
        errors.append(f"Có nhóm vượt {case['max_percent_below']}%")
    if case.get("chip"):
        combo, total = case["chip"]
        chip = result["groups"][0]["chip"] or ""
        if not (chip.startswith(combo) and total in chip):
            errors.append(f"Chip hạng 1 mong đợi '{combo} {total}', thực tế '{chip}'")
    if case.get("alignment") and result["alignment"] != case["alignment"]:
        errors.append(f"Khung đồng thuận mong đợi '{case['alignment']}', thực tế '{result['alignment']}'")
    if case.get("ranking_changed") and "Học lực đã thay đổi thứ tự xếp hạng" not in (result["ranking_note"] or ""):
        errors.append(f"Thiếu dòng 'Học lực đã thay đổi thứ tự xếp hạng' (thực tế: {result['ranking_note']})")
    return errors


def fmt(top3):
    return " · ".join(f"{name} {percent}%" for name, percent in top3)


def xpath_literal(text):
    if "'" not in text:
        return f"'{text}'"
    return "concat('" + "', \"'\", '".join(text.split("'")) + "')"


def main():
    parser = argparse.ArgumentParser(description="Selenium E2E cho 10 test case trắc nghiệm hướng nghiệp")
    parser.add_argument("--base-url", default="http://localhost:3000")
    parser.add_argument("--tc", nargs="*", type=int, help="Số thứ tự TC cần chạy, ví dụ: --tc 1 8 10")
    parser.add_argument("--headless", action="store_true")
    parser.add_argument("--slow", type=float, default=0.0, help="Nghỉ sau mỗi thao tác (giây)")
    args = parser.parse_args()

    cases = [c for c in CASES if not args.tc or int(c["id"][2:]) in args.tc]
    runner = CareerQuizE2E(args.base_url, headless=args.headless, slow=args.slow)
    rows = []
    try:
        runner.login()
        for case in cases:
            started = time.time()
            print(f"\n=== {case['id']} – {case['name']} ===")
            try:
                result, errors = runner.run_case(case)
                status = "PASS" if not errors else "FAIL"
                print("  Thực tế :", fmt([(g["name"], g["percent"]) for g in result["groups"]]))
            except (TimeoutException, AssertionError) as error:
                result, errors, status = None, [f"{type(error).__name__}: {error}".strip()], "ERROR"
                runner.screenshot(f"{case['id']}_error")
            print("  Mong đợi:", fmt(case["top3"]))
            for error in errors:
                print("  !", error)
            print(f"  => {status} ({time.time() - started:.1f}s)")
            rows.append({"id": case["id"], "name": case["name"], "status": status, "expected": case["top3"],
                         "actual": result, "errors": errors})
    finally:
        runner.quit()

    print("\n" + "=" * 60)
    for row in rows:
        print(f"{row['id']:<5} {row['status']:<6} {row['name']}")
    passed = sum(row["status"] == "PASS" for row in rows)
    print(f"Tổng: {passed}/{len(rows)} PASS")

    reports = ROOT / "reports"
    reports.mkdir(exist_ok=True)
    report = reports / f"career_quiz_{datetime.now():%Y%m%d_%H%M%S}.json"
    report.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Báo cáo: {report}\nẢnh chụp: {ROOT / 'screenshots'}")
    sys.exit(0 if passed == len(rows) else 1)


if __name__ == "__main__":
    main()
