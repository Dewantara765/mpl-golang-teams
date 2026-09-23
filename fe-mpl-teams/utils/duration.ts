export const convertDuration = (duration: number) => {
        const seconds = duration % 60;
        const minutes = Math.floor(duration / 60)
        return `${minutes}:${seconds}`
    }