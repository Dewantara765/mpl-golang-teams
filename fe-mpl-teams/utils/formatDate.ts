export const formatDate = (date: string) => {
        const formattedDate = date.slice(0,10)
        const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        const [year, monthIndex, day] = formattedDate.split('-');
        return `${day} ${month[parseInt(monthIndex) - 1]} ${year}`;
    }