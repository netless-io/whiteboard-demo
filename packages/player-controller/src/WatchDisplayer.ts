export function displayWatch(seconds: number): string {
    const displaySeconds = seconds % 60;
    const minutes = (seconds - displaySeconds) / 60;

    if (minutes >= 60) {
        const displayMinutes = minutes % 60;
        const hours = (minutes - displayMinutes) / 60;

        return `${updateNumber(hours)} : ${updateNumber(displayMinutes)} : ${updateNumber(displaySeconds)}`;

    } else {
        return `${updateNumber(minutes)} : ${updateNumber(displaySeconds)}`;
    }
}

function updateNumber(time: number): string {
    if (time <= 9) {
        return `0${time}`;
    } else {
        return `${time}`;
    }
}
