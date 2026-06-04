export const getGreetingText = () => {
    const currentHour = new Date().getHours(); // gets the current hour (0-23)
    if (currentHour < 12) {
        return 'home.good_morning';
    }
    if (currentHour < 17) {
        return 'home.good_afternoon';
    }
    return 'home.good_evening';
};
