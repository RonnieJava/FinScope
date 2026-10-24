import type { EconomicEvent } from '@/types';

const event = (
  id: string,
  title: string,
  date: string,
  time: string,
  category: EconomicEvent['category'],
  importance: EconomicEvent['importance'],
  description: string,
  previous?: string,
  forecast?: string,
): EconomicEvent => ({
  id,
  title,
  date,
  time,
  category,
  importance,
  description,
  previous,
  forecast,
  isDemo: true,
});

export const CALENDAR_EVENTS: EconomicEvent[] = [
  event('evt-2609-28', 'Demo durable goods orders', '2026-09-28', '08:30 ET', 'Economy', 'medium', 'Synthetic release covering orders for long-lasting manufactured goods.', '+0.4%', '+0.6%'),
  event('evt-2609-30', 'Demo quarter-end index rebalance', '2026-09-30', '16:00 ET', 'Economy', 'low', 'Fictional rebalance window for the FinScope demo indices.'),
  event('evt-2610-01', 'Demo ISM Manufacturing PMI', '2026-10-01', '10:00 ET', 'Economy', 'high', 'A synthetic survey of manufacturing activity used to demonstrate the calendar view.', '48.9', '49.4'),
  event('evt-2610-02', 'Demo employment situation', '2026-10-02', '08:30 ET', 'Economy', 'high', 'Fictional payrolls, unemployment and wage data release.', '148K', '162K'),
  event('evt-2610-05', 'Demo ISM Services PMI', '2026-10-05', '10:00 ET', 'Economy', 'medium', 'Simulated services-sector activity survey.', '52.1', '52.6'),
  event('evt-2610-07', 'Demo FOMC minutes', '2026-10-07', '14:00 ET', 'Central Bank', 'high', 'Minutes from the fictional policy meeting, released in the demo dataset.', undefined, undefined),
  event('evt-2610-09', 'Demo consumer credit', '2026-10-09', '15:00 ET', 'Economy', 'low', 'Synthetic household credit growth release.', '$12.4B', '$13.1B'),
  event('evt-2610-13', 'Demo CPI inflation', '2026-10-13', '08:30 ET', 'Economy', 'high', 'Fictional headline and core consumer price release.', '2.6%', '2.5%'),
  event('evt-2610-14', 'Demo PPI inflation', '2026-10-14', '08:30 ET', 'Economy', 'medium', 'Simulated producer price release.', '1.9%', '2.0%'),
  event('evt-2610-15', 'Demo retail sales', '2026-10-15', '08:30 ET', 'Economy', 'high', 'Fictional monthly retail sales report.', '+0.3%', '+0.5%'),
  event('evt-2610-15e', 'Demo earnings window — large-cap banks', '2026-10-15', '07:00 ET', 'Earnings', 'medium', 'Synthetic earnings window used to demonstrate the calendar. No real company results are shown.'),
  event('evt-2610-16', 'Demo consumer sentiment', '2026-10-16', '10:00 ET', 'Economy', 'medium', 'Simulated University-style sentiment survey.', '68.4', '69.1'),
  event('evt-2610-19', 'Demo housing starts', '2026-10-19', '08:30 ET', 'Economy', 'low', 'Fictional residential construction release.', '1.32M', '1.35M'),
  event('evt-2610-20', 'Demo 10-year Treasury auction', '2026-10-20', '13:00 ET', 'Central Bank', 'medium', 'Synthetic government bond auction in the demo dataset.', undefined, '$42B'),
  event('evt-2610-21', 'Demo existing home sales', '2026-10-21', '10:00 ET', 'Economy', 'low', 'Simulated resale housing activity release.', '3.94M', '3.98M'),
  event('evt-2610-22', 'Demo initial jobless claims', '2026-10-22', '08:30 ET', 'Economy', 'medium', 'Fictional weekly labour-market claims release.', '218K', '221K'),
  event('evt-2610-23', 'Demo flash composite PMI', '2026-10-23', '09:45 ET', 'Economy', 'medium', 'Synthetic flash purchasing managers index for the current demo month.', '52.8', '53.0'),
  event('evt-2610-23e', 'Demo monthly options expiration', '2026-10-23', '16:00 ET', 'Economy', 'low', 'Fictional expiry marker used to demonstrate event density on the calendar.'),
  event('evt-2610-23c', 'Demo bitcoin difficulty adjustment', '2026-10-23', '20:00 ET', 'Crypto', 'low', 'Synthetic network difficulty adjustment in the demo crypto dataset.', '+2.1%', '+1.4%'),
  event('evt-2610-27', 'Demo consumer confidence', '2026-10-27', '10:00 ET', 'Economy', 'medium', 'Fictional sentiment index release.', '94.2', '94.8'),
  event('evt-2610-28', 'Demo FOMC rate decision', '2026-10-28', '14:00 ET', 'Central Bank', 'high', 'Simulated policy decision and press conference. Rates shown are fictional.', '3.75%', '3.50%'),
  event('evt-2610-29', 'Demo advance GDP', '2026-10-29', '08:30 ET', 'Economy', 'high', 'Fictional advance estimate of quarterly output.', '2.1%', '2.3%'),
  event('evt-2610-30', 'Demo PCE price index', '2026-10-30', '08:30 ET', 'Economy', 'high', 'Synthetic preferred inflation measure release.', '2.4%', '2.4%'),
  event('evt-2610-30e', 'Demo earnings window — cloud platforms', '2026-10-30', '16:15 ET', 'Earnings', 'medium', 'Fictional earnings window. No real company figures are included.'),
  event('evt-2611-02', 'Demo ISM Manufacturing PMI', '2026-11-02', '10:00 ET', 'Economy', 'high', 'Synthetic manufacturing survey for the next demo month.', '49.4', '49.8'),
  event('evt-2611-06', 'Demo employment situation', '2026-11-06', '08:30 ET', 'Economy', 'high', 'Fictional payrolls release.', '162K', '155K'),
  event('evt-2611-11', 'Demo CPI inflation', '2026-11-11', '08:30 ET', 'Economy', 'high', 'Synthetic consumer price release.', '2.5%', '2.5%'),
  event('evt-2611-18', 'Demo FOMC minutes', '2026-11-18', '14:00 ET', 'Central Bank', 'high', 'Minutes from the fictional October policy meeting.'),
  event('evt-2611-26', 'Demo Thanksgiving holiday', '2026-11-26', '00:00 ET', 'Holiday', 'low', 'US demo market closed for the holiday.'),
  event('evt-2611-27', 'Demo early market close', '2026-11-27', '13:00 ET', 'Holiday', 'low', 'US demo market closes early at 13:00 ET.'),
];

export function getMockCalendarEvents(): EconomicEvent[] {
  return CALENDAR_EVENTS;
}
