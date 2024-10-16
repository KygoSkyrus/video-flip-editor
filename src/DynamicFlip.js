/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import { CheckIcon, PauseIcon, PlayIcon, SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/16/solid';
import Draggable from 'react-draggable';

import video from './assets/video.mp4'
import { aspectRatios, downloadPreviewData, formatTime, getAspectRatio, playbackSpeeds } from './util';
import './VideoCropper.css';


const DynamicFlip = () => {
    const videoRef = useRef(null);
    const previewVideo = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const [currentTime, setCurrentTime] = useState('00:00');
    const [duration, setDuration] = useState('00:00');

    const [aspectRatio, setAspectRatio] = useState(9 / 18);
    const [cropperSize, setCropperSize] = useState({ width: 0, height: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [showCropper, setShowCropper] = useState(false);

    const [cropperData, setCropperData] = useState([]);


    const handleCrop = () => {
        const { x, width } = getCropperData();
        const renderedWidth = videoRef.current.clientWidth; // Rendered video width

        const center = ((renderedWidth / 2) - (width / 2)) - x; // half of renderedWidth - half of cropper width
        const clipPathValue = `inset(${0}px ${renderedWidth - (x + width)}px ${0}px ${x}px)`;

        previewVideo.current.style.clipPath = clipPathValue;
        previewVideo.current.style.transform = `translateX(${center}px)`;
    };

    const saveCropperData = (val) => {
        const { x, width } = getCropperData();

        const newCropperData = {
            "timestamp": currentTime,
            "coordinates": [x, x + width, x, x + width],
            "volume": volume,
            "playbackRate": playbackSpeed,
        }

        const lastEntry = cropperData[cropperData.length - 1];
        if (
            !lastEntry ||
            lastEntry.timestamp !== newCropperData.timestamp ||
            lastEntry.coordinates.toString() !== newCropperData.coordinates.toString() ||
            lastEntry.volume !== newCropperData.volume ||
            lastEntry.playbackRate !== newCropperData.playbackRate
        ) {
            val ?
                // Clear existing entries and start fresh if there are two entries
                setCropperData([newCropperData])
                :
                setCropperData((prevData) => [...prevData, newCropperData]);
        }
    }

    const handleLoadedMetadata = () => {
        setDuration(formatTime(videoRef.current.duration));
    };

    useEffect(() => {
        if (videoRef.current) setCropperSizePosition()
        videoRef.current?.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [aspectRatio]);


    function setCropperSizePosition() {
        const video = videoRef.current;
        const videoHeight = video.clientHeight;
        const videoWidth = video.clientWidth;

        // set cropper width and height based on the aspect ratio
        const cropperHeight = videoHeight;
        const cropperWidth = cropperHeight * aspectRatio;

        // Ensure the cropper doesn't overflow the video width
        setCropperSize({
            width: Math.min(cropperWidth, videoWidth),
            height: videoHeight,
        });

        setPosition({ x: 0, y: 0 });
    }

    const startCropper = () => {
        setCropperSizePosition()
        setShowCropper(true)
    }

    const removeCropper = () => {
        setShowCropper(false)
    }

    const togglePlayPause = () => {
        try {
            if (videoRef.current.paused) {
                if (showCropper) handleCrop(); // Trigger crop before playing

                if (previewVideo.current) {
                    previewVideo.current.currentTime = videoRef.current.currentTime;
                    previewVideo.current.play().catch((error) => console.log('Preview play error', error));
                    saveCropperData(true);
                }

                videoRef.current.play().catch((error) => console.log('Main video play error', error));
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                if (previewVideo.current) {
                    previewVideo.current.currentTime = videoRef.current.currentTime;
                    previewVideo.current.pause();
                    saveCropperData(false);
                }
                setIsPlaying(false);
            }
        } catch (error) {
            console.log('Error while toggling play/pause:', error);
        }
    };

    const handleTimeUpdate = () => {
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(progress);
        setCurrentTime(formatTime(videoRef.current.currentTime));
    };

    const handleSeek = (event) => {
        const seekTime = (event.target.value / 100) * videoRef.current.duration;
        videoRef.current.currentTime = seekTime;
        // if (previewVideo.current) previewVideo.current.currentTime = seekTime;
        setProgress(event.target.value);
    };

    const handleVolumeChange = (event) => {
        const volume = event.target.value;
        videoRef.current.volume = volume;
        if (previewVideo.current) previewVideo.current.volume = volume;
        setVolume(volume);
    };

    const handleSpeedChange = (speed) => {
        videoRef.current.playbackRate = speed;
        if (previewVideo.current) previewVideo.current.playbackRate = speed;
        setPlaybackSpeed(speed);
    };

    const handleAspectRatioChange = (selectedAspectRatio) => {
        setAspectRatio(selectedAspectRatio);
        if (showCropper) {
            videoRef.current.pause()
            previewVideo.current?.pause()
            // togglePlayPause()
        }
    };

    // Handle dragging event to ensure cropper stays within the player
    const handleDrag = (e, data) => {
        const video = videoRef.current;

        const maxX = video.clientWidth - cropperSize.width;
        const maxY = video.clientHeight - cropperSize.height;

        let newX = Math.max(0, Math.min(data.x, maxX));
        let newY = Math.max(0, Math.min(data.y, maxY));

        setPosition({ x: newX, y: newY });
    };


    const getCropperData = () => {
        const cropData = {
            x: position.x,
            y: position.y,
            width: cropperSize.width,
            height: cropperSize.height,
        };
        return cropData;
    };


    return (
        <>
            {/* Upper half (view) */}
            <div className='p-4 px-8'>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                    {/* Video */}
                    <div className='me-8'>
                        <div className="video-container">
                            <video
                                ref={videoRef}
                                onTimeUpdate={handleTimeUpdate}
                                width="100%"
                                height="auto"
                                style={{ display: 'block', marginBottom: '10px' }} className="rounded-lg">
                                <source src={video} type="video/mp4" />
                            </video>

                            {/* Draggable Cropper */}
                            {showCropper &&
                                <Draggable
                                    position={position}
                                    onDrag={handleDrag}
                                    bounds="parent"
                                >
                                    <div
                                        className="cropper"
                                        style={{
                                            width: `${cropperSize.width}px`,
                                            height: `${cropperSize.height}px`,
                                        }}
                                    >
                                        <div className="line vertical left-1/3 translate-x-1/3" />
                                        <div className="line vertical left-2/3 translate-x-2/3" />
                                        <div className="line horizontal top-1/3 translate-y-1/3" />
                                        <div className="line horizontal top-2/3 translate-y-2/3" />
                                        <div className="backdrop" />
                                    </div>
                                </Draggable>
                            }

                        </div>

                        <div className="controls mb-[10px]">
                            <section className='flex items-center'>
                                {/* Play/Pause Button */}
                                <button onClick={togglePlayPause}>
                                    {isPlaying ? <PauseIcon className="size-6" /> : <PlayIcon className="size-6" />}
                                </button>

                                {/* Progress Slider (Seek To) */}
                                <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="w-full h-1 bg-gray-400 rounded-lg ms-2 cursor-pointer range-sm accent-[#878787]" />
                            </section>

                            <section className='flex justify-between my-2'>
                                {/* Display Current Time and Duration */}
                                <div className="time-info">
                                    <span>{currentTime}</span><span className='text-gray-400'> | {duration}</span>
                                </div>

                                {/* Volume Slider */}
                                <section className='flex items-center'>
                                    <SpeakerWaveIcon className="size-5" />
                                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-[140px] h-1 bg-gray-400 rounded-lg ms-2 cursor-pointer range-sm accent-[#878787]" />
                                </section>
                            </section>

                            <section className='flex gap-4 mt-4'>
                                {/* Playback Speed Selector */}
                                <button id="playbackSpeedButton" data-dropdown-toggle="playbackSpeedDropdown" className="text-white border border-gray-900 focus:ring-0 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" type="button">Playback speed <span className='text-gray-400 ms-2'>{playbackSpeed}x</span>
                                    <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                    </svg>
                                </button>

                                <div id="playbackSpeedDropdown" className="z-10 hidden bg-[#37393f] divide-y divide-gray-100 rounded-lg shadow-md w-44 dark:bg-gray-700">
                                    <ul className="py-2 text-sm  dark:text-gray-200" aria-labelledby="playbackSpeedButton">
                                        {playbackSpeeds.map((speed) => (
                                            <li key={speed}>
                                                <span className="px-4 py-2 hover:bg-gray-500 cursor-pointer flex justify-between" onClick={() => handleSpeedChange(speed)}>
                                                    <span>{speed}</span>
                                                    {playbackSpeed === speed && <span><CheckIcon className='size-6 text-gray-400' /></span>}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Cropper Aspect Ratio */}
                                <button id="ratioButton" data-dropdown-toggle="ratioDropdown" className="text-white border border-gray-900 focus:ring-0 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" type="button">Cropper Aspect Ratio <span className='text-gray-400 ms-2'>{getAspectRatio(aspectRatio)}</span>
                                    <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                    </svg>
                                </button>

                                <div id="ratioDropdown" className="z-10 hidden bg-[#37393f]  divide-y divide-gray-100 rounded-lg shadow-md w-56">
                                    <ul className="py-2 text-sm" aria-labelledby="ratioButton">
                                        {aspectRatios.map((ratio) => (
                                            <li key={ratio.value}>
                                                <span className="px-4 py-2 hover:bg-gray-500 cursor-pointer flex justify-between" onClick={() => handleAspectRatioChange(ratio.value)}>
                                                    <span>{ratio.label}</span>
                                                    {aspectRatio === ratio.value && <span><CheckIcon className='size-6 text-gray-400' /></span>}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>
                        </div>

                    </div>

                    {/* Preview */}
                    <div className='text-center'>
                        <div className='flex flex-col h-full'>
                            <span className='text-gray-300'>Preview</span>

                            {showCropper ?
                                <div className='flex ms-8'>
                                    <video
                                        id='previewVideoRef'
                                        width="100%"
                                        height="500px" className='mt-4'
                                        ref={previewVideo}
                                    >
                                        <source src={video} type="video/mp4" />
                                    </video>
                                </div>
                                :
                                <div className='flex flex-col justify-center h-full'>
                                    <section className='flex justify-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 8 6 4-6 4Z" /></svg>
                                    </section>
                                    <section>Preview not available</section>
                                    <section className='text-gray-400'>Please click on "Start Cropper"<br />and then play video</section>
                                </div>
                            }
                        </div>

                    </div>
                </div>
            </div>

            {/* Cropper Buttons */}
            <div className='flex justify-between p-4 px-8 border-t border-gray-500'>
                <section className='flex gap-4'>
                    <button className='px-3 py-1 bg-violet-500 rounded-[10px]' onClick={() => startCropper()}>Start Cropper</button>
                    <button className='px-3 py-1 bg-violet-500 rounded-[10px]' onClick={() => removeCropper()}>Remove Cropper</button>
                    <button className='px-3 py-1 bg-violet-500 rounded-[10px]' onClick={() => downloadPreviewData(cropperData)}>Generate Preview</button>
                </section>
                <section>
                    <button className='px-3 py-1 bg-gray-500 rounded-[10px]'>Cancel</button>
                </section>
            </div>
        </>
    )
}

export default DynamicFlip