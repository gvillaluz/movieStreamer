export const convertRuntime = (minutes) => {
    const hrs = Math.floor(parseInt(minutes) / 60);
    const mins = parseInt(minutes) % 60;

    if (!hrs)
        return `${mins}m`;

    return `${hrs}h ${mins}m`;
} 