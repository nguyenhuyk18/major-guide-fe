import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { instanceCallApi } from '../../services/api.setting';
import '../../assets/css/AccountingPage.css';

const money = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    value || 0
  );
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
};
const initialForm = () => ({
  requestId: crypto.randomUUID(),
  type: 'income',
  date: today(),
  amount: '',
  category: 'Tư vấn',
  counterparty: '',
  description: '',
  reference: '',
});
const CATEGORY_SUGGESTIONS = [
  'Tư vấn',
  'Chi trả chuyên gia',
  'Phí cổng thanh toán',
  'Marketing',
  'Hạ tầng / máy chủ',
  'Lương nhân sự',
  'Khác',
];
export const csvCell = (value) => {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
};

export default function AccountingPage() {
  const user = useSelector((state) => state.authAdminReducer.loggedUser);
  const isAdmin = (user?.role_name || user?.roleName) === 'admin';
  const [tab, setTab] = useState('entries');
  const [filters, setFilters] = useState({
    start: today().slice(0, 7) + '-01',
    end: today(),
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [invoice, setInvoice] = useState(null);
  const request = useRef(0);
  const mutation = useRef(false);
  const load = useCallback(async () => {
    if (!isAdmin) return;
    const id = ++request.current;
    setError('');
    setLoading(true);
    try {
      if (!filters.start || !filters.end || filters.start > filters.end)
        throw new Error('Vui lòng chọn khoảng ngày hợp lệ.');
      const [entries, summary, invoices] = await Promise.all(
        ['entries', 'summary', 'invoices'].map((path) =>
          instanceCallApi.get(`/api/v2/accounting/${path}`, { params: filters })
        )
      );
      if (id === request.current)
        setData({
          entries: entries.data.data,
          summary: summary.data.data,
          invoices: invoices.data.data,
        });
    } catch (e) {
      if (id === request.current) {
        setData(null);
        setError(
          e.response?.data?.message || e.message || 'Không tải được sổ kế toán.'
        );
      }
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, [filters, isAdmin]);
  useEffect(() => {
    load();
    return () => {
      request.current += 1;
    };
  }, [load]);

  const save = async (event) => {
    event.preventDefault();
    if (mutation.current) return;
    mutation.current = true;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const amount = Number(form.amount);
      if (!Number.isSafeInteger(amount) || amount <= 0)
        throw new Error('Số tiền phải là số nguyên VND lớn hơn 0.');
      await instanceCallApi.post('/api/v2/accounting/entries', {
        ...form,
        amount,
      });
      setShowForm(false);
      setForm(initialForm());
      setNotice('Đã ghi nhận giao dịch.');
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || 'Không lưu được giao dịch.'
      );
    } finally {
      mutation.current = false;
      setSaving(false);
    }
  };
  const issue = async (entryId) => {
    if (mutation.current) return;
    mutation.current = true;
    setSaving(true);
    setError('');
    try {
      const result = await instanceCallApi.post('/api/v2/accounting/invoices', {
        entryId,
      });
      setInvoice(result.data.data);
      setNotice('Đã lập hóa đơn nội bộ.');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Không lập được hóa đơn.');
    } finally {
      mutation.current = false;
      setSaving(false);
    }
  };
  const syncBookings = async () => {
    if (mutation.current) return;
    mutation.current = true;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await instanceCallApi.post(
        '/api/v2/accounting/sync-bookings'
      );
      const { created = 0, scanned = 0, failed = 0 } = result.data.data || {};
      setNotice(
        created
          ? `Đã nhập ${created} booking đã thanh toán vào sổ (kiểm tra ${scanned} booking).`
          : `Sổ đã khớp với ${scanned} booking đã thanh toán.`
      );
      if (failed) setError(`${failed} booking chưa nhập được, hãy thử lại.`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Không đồng bộ được booking.');
    } finally {
      mutation.current = false;
      setSaving(false);
    }
  };
  const exportReport = () => {
    if (!data || data.entries.truncated || data.invoices.truncated || loading)
      return;
    const rows =
      tab === 'invoices'
        ? [
            ['Số hóa đơn', 'Ngày', 'Khách hàng', 'Nội dung', 'Số tiền (VND)'],
            ...data.invoices.items.map((r) => [
              r.number,
              r.date,
              r.counterparty,
              r.description,
              r.amount,
            ]),
          ]
        : [
            [
              'Ngày',
              'Loại',
              'Danh mục',
              'Đối tác',
              'Nội dung',
              'Tham chiếu',
              'Số tiền (VND)',
            ],
            ...data.entries.items.map((r) => [
              r.date,
              r.type === 'income' ? 'Thu' : 'Chi',
              r.category,
              r.counterparty,
              r.description,
              r.reference,
              r.amount,
            ]),
            [],
            ['Tổng thu', data.summary.income],
            ['Tổng chi', data.summary.expense],
            ['Chênh lệch thu chi', data.summary.balance],
            ['Tiền thu từ booking', data.summary.booking?.gross],
            ['Doanh thu phí nền tảng', data.summary.booking?.platformRevenue],
            ['Phải trả chuyên gia', data.summary.booking?.expertPayable],
            ['Lợi nhuận nền tảng', data.summary.profit],
          ];
    const url = URL.createObjectURL(
      new Blob(
        ['\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n')],
        { type: 'text/csv;charset=utf-8;' }
      )
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `majorguide-${tab}-${filters.start}-${filters.end}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (!isAdmin)
    return (
      <section className="accounting-page">
        <h1>Không có quyền truy cập</h1>
        <p>Kế toán chỉ dành cho quản trị viên.</p>
      </section>
    );
  const entries = data?.entries?.items || [];
  const invoices = data?.invoices?.items || [];
  const truncated = data?.entries?.truncated || data?.invoices?.truncated;
  return (
    <section className="accounting-page">
      <header className="accounting-heading">
        <div>
          <span className="accounting-eyebrow">MAJORGUIDE / TÀI CHÍNH</span>
          <h1>Sổ thu chi</h1>
          <p>Theo dõi dòng tiền và quản lý chứng từ trong một nơi.</p>
        </div>
        <div className="accounting-actions">
          <button
            onClick={exportReport}
            disabled={!data || loading || truncated}
          >
            <i className="bi bi-download" /> Xuất báo cáo CSV
          </button>
          <button
            onClick={syncBookings}
            disabled={saving}
            title="Nhập các booking đã thanh toán chưa có trong sổ"
          >
            <i className="bi bi-arrow-repeat" /> Đồng bộ booking
          </button>
          <button className="primary" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-lg" /> Ghi nhận thu chi
          </button>
        </div>
      </header>
      {error && (
        <div role="alert" className="accounting-alert">
          {Array.isArray(error) ? error.join('. ') : error}
        </div>
      )}
      {notice && (
        <div role="status" className="accounting-notice">
          {notice}
        </div>
      )}
      <div className="accounting-filters">
        <label>
          Từ ngày
          <input
            type="date"
            value={filters.start}
            onChange={(e) => setFilters({ ...filters, start: e.target.value })}
          />
        </label>
        <span>—</span>
        <label>
          Đến ngày
          <input
            type="date"
            value={filters.end}
            onChange={(e) => setFilters({ ...filters, end: e.target.value })}
          />
        </label>
        <button onClick={load} disabled={loading}>
          <i className="bi bi-arrow-clockwise" /> Làm mới
        </button>
        <span className="accounting-currency">Đơn vị tiền: VND</span>
      </div>
      <div className="accounting-stats">
        {[
          ['Tổng thu', 'income', 'arrow-down-left', 'income'],
          ['Tổng chi', 'expense', 'arrow-up-right', 'expense'],
          ['Chênh lệch thu chi', 'balance', 'wallet2', 'balance'],
        ].map(([label, key, icon, cls]) => (
          <article key={key} className={cls}>
            <span className="stat-icon">
              <i className={`bi bi-${icon}`} />
            </span>
            <div>
              <span>{label}</span>
              <strong>
                {loading ? '…' : data ? money(data.summary[key]) : '—'}
              </strong>
              <small>
                {key === 'balance'
                  ? 'Tổng thu trừ tổng chi trong kỳ'
                  : 'Theo ngày ghi nhận giao dịch'}
              </small>
            </div>
          </article>
        ))}
      </div>
      <div className="accounting-booking">
        <header>
          <div>
            <h2>Doanh thu đặt lịch tư vấn</h2>
            <p>
              Học viên trả phí chuyên gia + phí nền tảng. Chỉ phí nền tảng là
              doanh thu của MajorGuide; phần còn lại là khoản phải trả chuyên
              gia.
            </p>
          </div>
          <span className="accounting-badge auto">
            {data?.summary?.booking?.count ?? 0} booking
          </span>
        </header>
        <div className="accounting-booking-grid">
          {[
            ['Tiền thu từ booking', 'gross', 'Tổng học viên đã thanh toán qua Stripe'],
            ['Doanh thu phí nền tảng', 'platformRevenue', 'Sau khi trừ các khoản hoàn tiền', 'highlight'],
            ['Phải trả chuyên gia', 'expertPayable', null, 'warning'],
            ['Lợi nhuận nền tảng', 'profit', 'Phí nền tảng + thu khác − chi phí vận hành', 'highlight'],
          ].map(([label, key, hint, cls]) => {
            const booking = data?.summary?.booking || {};
            const value = key === 'profit' ? data?.summary?.profit : booking[key];
            return (
              <article key={key} className={cls || ''}>
                <span>{label}</span>
                <strong>{loading ? '…' : data ? money(value) : '—'}</strong>
                <small>
                  {hint ||
                    `Đã chi trả ${money(booking.expertPayouts)} / ${money(
                      booking.expertEarnings
                    )}`}
                </small>
              </article>
            );
          })}
        </div>
      </div>
      <div className="accounting-ledger">
        <div className="accounting-tabs" role="tablist" aria-label="Sổ kế toán">
          <button
            role="tab"
            aria-selected={tab === 'entries'}
            className={tab === 'entries' ? 'selected' : ''}
            onClick={() => setTab('entries')}
          >
            Giao dịch <span>{data?.entries?.total ?? '—'}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'invoices'}
            className={tab === 'invoices' ? 'selected' : ''}
            onClick={() => setTab('invoices')}
          >
            Hóa đơn <span>{data?.invoices?.total ?? '—'}</span>
          </button>
        </div>
        {truncated && (
          <p role="status" className="accounting-alert">
            Kỳ này vượt 1.000 bản ghi. Hãy thu hẹp khoảng ngày để xem và xuất
            đầy đủ báo cáo.
          </p>
        )}
        {loading ? (
          <div className="accounting-empty" role="status">
            Đang tải sổ kế toán…
          </div>
        ) : !data ? (
          <div className="accounting-empty">
            Chưa tải được dữ liệu. Chọn làm mới để thử lại.
          </div>
        ) : (tab === 'entries' ? entries : invoices).length === 0 ? (
          <div className="accounting-empty">
            <i className="bi bi-journal-text" />
            <h2>
              Chưa có {tab === 'entries' ? 'giao dịch' : 'hóa đơn'} trong kỳ
            </h2>
            <p>
              {tab === 'entries'
                ? 'Ghi nhận khoản thu hoặc chi đầu tiên để bắt đầu theo dõi.'
                : 'Lập hóa đơn từ một phiếu thu trong danh sách giao dịch.'}
            </p>
          </div>
        ) : (
          <div className="accounting-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ngày / mã</th>
                  <th>{tab === 'entries' ? 'Giao dịch' : 'Khách hàng'}</th>
                  <th>Nội dung</th>
                  <th className="amount">Số tiền</th>
                  <th>Chứng từ</th>
                </tr>
              </thead>
              <tbody>
                {(tab === 'entries' ? entries : invoices).map((row) => (
                  <tr key={row._id}>
                    <td>
                      {row.date}
                      <small>
                        {tab === 'invoices'
                          ? row.number
                          : row.reference || 'Không có tham chiếu'}
                      </small>
                    </td>
                    <td>
                      {tab === 'entries' && (
                        <span className={`accounting-badge ${row.type}`}>
                          {row.type === 'income' ? 'Thu' : 'Chi'}
                        </span>
                      )}
                      {tab === 'entries' && row.source === 'booking' && (
                        <span
                          className="accounting-badge auto"
                          title={`Phí nền tảng ${money(row.platformFee)} · Chuyên gia ${money(row.expertAmount)}`}
                        >
                          Tự động
                        </span>
                      )}
                      {row.counterparty}
                      <small>{row.category}</small>
                    </td>
                    <td>{row.description}</td>
                    <td className={`amount ${row.type || ''}`}>
                      {money(row.amount)}
                    </td>
                    <td>
                      {tab === 'invoices' ? (
                        <button onClick={() => setInvoice(row)}>
                          Xem / In
                        </button>
                      ) : row.type === 'income' ? (
                        <button
                          disabled={saving}
                          onClick={() => issue(row._id)}
                        >
                          Hóa đơn
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="accounting-footnote">
        Booking thanh toán qua Stripe được ghi sổ tự động (kèm hoàn tiền nếu
        có). Khi chi trả cho chuyên gia, hãy tạo phiếu chi với danh mục “Chi
        trả chuyên gia”. Hóa đơn nội bộ là chứng từ quản lý, chưa phải hóa đơn
        điện tử thuế.
      </p>
      {showForm && (
        <div className="accounting-overlay">
          <form
            className="accounting-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-title"
            onSubmit={save}
          >
            <div className="accounting-dialog-heading">
              <div>
                <span className="accounting-eyebrow">GIAO DỊCH MỚI</span>
                <h2 id="entry-title">Ghi nhận thu chi</h2>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                disabled={saving}
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <div className="accounting-form-grid">
              <label>
                Loại giao dịch
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="income">Phiếu thu</option>
                  <option value="expense">Phiếu chi</option>
                </select>
              </label>
              <label>
                Ngày ghi nhận
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label>
                Số tiền (VND)
                <input
                  required
                  type="number"
                  min="1"
                  max="1000000000000"
                  step="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </label>
              <label>
                Danh mục
                <input
                  required
                  maxLength={100}
                  list="accounting-categories"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </label>
              <datalist id="accounting-categories">
                {CATEGORY_SUGGESTIONS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              <label className="wide">
                Khách hàng / đối tác
                <input
                  required
                  maxLength={200}
                  value={form.counterparty}
                  onChange={(e) =>
                    setForm({ ...form, counterparty: e.target.value })
                  }
                />
              </label>
              <label className="wide">
                Nội dung
                <textarea
                  required
                  maxLength={1000}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <label className="wide">
                Mã tham chiếu (không bắt buộc)
                <input
                  maxLength={100}
                  value={form.reference}
                  onChange={(e) =>
                    setForm({ ...form, reference: e.target.value })
                  }
                />
              </label>
            </div>
            {error && (
              <p role="alert" className="accounting-alert">
                {Array.isArray(error) ? error.join('. ') : error}
              </p>
            )}
            <footer>
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowForm(false)}
              >
                Hủy
              </button>
              <button className="primary" disabled={saving}>
                {saving ? 'Đang lưu…' : 'Lưu giao dịch'}
              </button>
            </footer>
          </form>
        </div>
      )}
      {invoice && (
        <div className="accounting-overlay invoice-overlay">
          <article
            className="accounting-dialog invoice-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-title"
          >
            <span className="accounting-eyebrow">MAJORGUIDE</span>
            <h2 id="invoice-title">HÓA ĐƠN NỘI BỘ</h2>
            <p>
              {invoice.number} · {invoice.date}
            </p>
            <hr />
            <p>
              Khách hàng: <strong>{invoice.counterparty}</strong>
            </p>
            <p>{invoice.description}</p>
            <div className="invoice-total">
              <span>Đã thu · VND</span>
              <strong>{money(invoice.amount)}</strong>
            </div>
            <p className="accounting-footnote">
              Chứng từ quản lý nội bộ, không thay thế hóa đơn điện tử thuế.
            </p>
            <footer>
              <button onClick={() => setInvoice(null)}>Đóng</button>
              <button className="primary" onClick={() => window.print()}>
                <i className="bi bi-printer" /> In / Lưu PDF
              </button>
            </footer>
          </article>
        </div>
      )}
    </section>
  );
}
