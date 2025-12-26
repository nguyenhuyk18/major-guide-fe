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