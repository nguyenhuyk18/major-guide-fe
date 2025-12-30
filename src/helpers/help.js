export const convertVietnamese = (key) => {
    const val = {
        'monday': "Thứ 2",
        'tuesday': "Thứ 3",
        'wednesday': "Thứ 4",
        'thursday': "Thứ 5",
        'friday': "Thứ 6",
        'saturday': "Thứ 7"
    }

    return val[key];
}


export const getCurrentWeek = (date = new Date()) => {
    const current = new Date(date);
    const day = current.getDay(); // 0 (CN) -> 6 (T7)

    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + diff);

    // Lấy 7 ngày trong tuần
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

export const getWeekNumber = (date = new Date()) => {
    const d = new Date(date);

    d.setHours(0, 0, 0, 0);

    const day = d.getDay() || 7;

    d.setDate(d.getDate() + 4 - day);

    const yearStart = new Date(d.getFullYear(), 0, 1);

    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);

    return weekNo;
}