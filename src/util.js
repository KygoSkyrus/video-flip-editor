
export const aspectRatios = [
    { label: '9:18', value: 9 / 18 },
    { label: '9:16', value: 9 / 16 },
    { label: '4:3', value: 4 / 3 },
    { label: '3:4', value: 3 / 4 },
    { label: '1:1', value: 1 / 1 },
    { label: '4:5', value: 4 / 5 },
];

export const playbackSpeeds = [0.5, 1, 1.5, 2];


export function getAspectRatio(current) {
    const ratio = aspectRatios.map(x => x.value === current && x.label)
    return ratio;
}

export const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
};


export const downloadPreviewData = (cropperData) => {
    const dataStr = JSON.stringify(cropperData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'previewData.json';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const convertTimestampToSeconds = (timestamp) => {
    const [minutes, seconds] = timestamp.split(":").map(Number);
    return minutes * 60 + seconds;
};