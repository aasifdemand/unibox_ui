import { DateTime } from "luxon"

export const getNowInTimezone = (tz) => {
    const dt = DateTime.now().setZone(tz);
    return {
        dateStr: dt.toFormat('yyyy-MM-dd'),
        timeStr: dt.toFormat('HH:mm'),
    };
};

export const getSmartDefaults = (tz) => {
    const { dateStr, timeStr } = getNowInTimezone(tz);

    const [h, m] = timeStr.split(':').map(Number);
    let startMins = h * 60 + m + 5; // Start in 5 mins
    let dateFinal = dateStr;

    // If we cross midnight, push to tomorrow 09:00
    if (startMins >= 1440) {
        startMins = 540; // 09:00
        dateFinal = DateTime.now().setZone(tz).plus({ days: 1 }).toFormat('yyyy-MM-dd');
    }

    const endMins = Math.min(startMins + 90, 1435); // End in 90 mins, capped at 23:55
    const fmtTime = (total) => {
        const hh = String(Math.floor(total / 60)).padStart(2, '0');
        const mm = String(total % 60).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    return {
        dateStr: dateFinal,
        startTime: fmtTime(startMins),
        endTime: fmtTime(endMins),
    };
};
export const convertLocalToUTC = (dateStr, timeStr, tz) => {
    try {
        const dt = DateTime.fromFormat(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', { zone: tz });
        return dt.toUTC().toISO();
    } catch (err) {
        console.error('UTC conversion failed:', err);
        return new Date(`${dateStr}T${timeStr}:00`).toISOString();
    }
};

export const detectedTZ = DateTime.now().zoneName;

export const steps = [
    { number: 1, title: 'Import Leads', description: 'Who are you reaching out to?' },
    { number: 2, title: 'Sequences', description: 'Write your emails' },
    { number: 3, title: 'Setup', description: 'Configure sending' },
    { number: 4, title: 'Final Review', description: 'Confirm and launch' },
];