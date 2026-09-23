export const convertDuration = (duration: number) => {
        let seconds = duration % 60;
        let formattedSeconds 
        let formattedMinutes
        const minutes = Math.floor(duration / 60)
        if (seconds < 10) {
            formattedSeconds =  `0${seconds}`
        }else {
            formattedSeconds = seconds;
        }

        if (minutes < 10) {
            formattedMinutes = `0${minutes}`
        }else {
            formattedMinutes = minutes;
        }
        return `${formattedMinutes}:${formattedSeconds}`
    }