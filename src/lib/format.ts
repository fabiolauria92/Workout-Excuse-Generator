import { format, parseISO } from 'date-fns';

/** History dates are stored as local `yyyy-MM-dd`; parse them as local days, not UTC. */
export const formatDay = (isoDay: string, pattern = 'MMM d, yyyy') => format(parseISO(isoDay), pattern);
