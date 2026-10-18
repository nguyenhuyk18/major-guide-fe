import { csvCell } from './AccountingPage';

jest.mock('../../services/api.setting', () => ({ instanceCallApi: {} }));

test('CSV escapes quotes and prevents spreadsheet formulas', () => {
  expect(csvCell('Khách "A"')).toBe('"Khách ""A"""');
  expect(csvCell('=SUM(A1:A2)')).toBe('"\'=SUM(A1:A2)"');
  expect(csvCell('  @SUM(1)')).toBe('"\'  @SUM(1)"');
  expect(csvCell(200000)).toBe('"200000"');
});
