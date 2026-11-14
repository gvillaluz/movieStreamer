/** Not out yet: no release/first-air date, or one later than today (same rule as Home's "Coming soon" row). */
export const isComingSoon = (content) => {
    const date = content?.release_date || content?.first_air_date;
    return !date || date > new Date().toISOString().slice(0, 10);
};
