import { z } from 'zod';
const s = z.string().datetime({ offset: true });
const cases = ['2026-10-20T10:00:00Z','2026-10-20T10:00:00+02:00','2026-10-20T10:00:00+0200','2026-10-20T10:00:00','2026-10-20T10:00:00.500Z','2026-10-20T10:00:00+02:00'];
for (const c of cases) { const r = s.safeParse(c); console.log(c, '=>', r.success ? 'ACCEPT' : 'REJECT'); }
