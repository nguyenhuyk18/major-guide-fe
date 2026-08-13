const parseLocalCalendarDate = (dateValue) => {
    if (!dateValue) return null;

    if (typeof dateValue === 'string') {
        const dateOnlyMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (dateOnlyMatch) {
            const [, year, month, day] = dateOnlyMatch;
            return new Date(Number(year), Number(month) - 1, Number(day));
        }
    }

    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const isToday = (dateValue, now = new Date()) => {
    const date = parseLocalCalendarDate(dateValue);
    if (!date) return false;

    return date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate();
};

export const isTodayOrFuture = (dateValue, now = new Date()) => {
    const date = parseLocalCalendarDate(dateValue);
    if (!date) return false;

    date.setHours(0, 0, 0, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return date.getTime() >= today.getTime();
};
