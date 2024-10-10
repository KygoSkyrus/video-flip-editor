import { cloudinary } from './Homepage';

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

export const getCroppedVideoUrl = (publicId, cropX, cropY, cropWidth, cropHeight, videoWidth, videoHeight) => {
    return cloudinary.url(publicId, {
        resource_type: 'video',
        transformation: [
            {
                crop: 'crop',
                x: cropX,
                y: cropY,
                width: cropWidth,
                height: cropHeight,
            },
            {
                width: videoWidth, // Optional scaling after crop
                height: videoHeight,
                crop: 'scale',
            },
        ],
    });
};


