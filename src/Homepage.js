/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import { CheckIcon, PauseIcon, PlayIcon, SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/16/solid';
import Draggable from 'react-draggable';
import { Cloudinary } from 'cloudinary-core';

import video from './assets/video.mp4'
import { aspectRatios, formatTime, getAspectRatio, playbackSpeeds } from './util';
import './VideoCropper.css';

const cloud_name = 'dbxybtpmk'
export const cloudinary = new Cloudinary({ cloud_name, secure: true });

const Homepage = () => {
    const videoRef = useRef(null);
    const previewRef = useRef(null)
    const [autoFlip, setAutoFlip] = useState(true)
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

    const [croppedVideoUrl, setCroppedVideoUrl] = useState(null);
    const originalVideoSize = { width: 960, height: 540 };


    const handleUpload = async () => {
        const publicId = 'u76r9ftgxcdewphqiddv';
        const { x, y, width } = getCropperData();

        const cropHeight = 540 //fixed height
        const renderedWidth = videoRef.current.clientWidth; // Rendered video width

        // Calculate the corresponding X coordinate in the actual video
        const actualX = Math.round((x / renderedWidth) * originalVideoSize.width);

        // Calculate the corresponding cropWidth in the actual video
        const cropWidth = Math.round((width / renderedWidth) * originalVideoSize.width);

        const cloudinaryUrl = `https://res.cloudinary.com/${cloud_name}/video/upload/c_crop,x_${actualX},y_${y},w_${cropWidth},h_${cropHeight}/${publicId}.mp4`;

        if (croppedVideoUrl) {
            const video = document.createElement('video');
            video.width = '100%';
            video.height = 500;
            video.className = 'mt-4 w-full';
            video.id = 'previewVideoRef'
            video.autoplay = true;

            const source = document.createElement('source');
            source.src = cloudinaryUrl; // Set the video URL
            source.type = 'video/mp4';

            video.appendChild(source);

            video.addEventListener('loadedmetadata', () => {
                previewRef.current.innerHTML = ''; // Clear old content
                previewRef.current.appendChild(video); // Append new video
                video.play().catch((error) => console.log('Preview video play error:', error));
            });

            // Clear previous content and append the video to previewRef
            // previewRef.current.innerHTML = ''; // Clear any existing preview
            // previewRef.current.appendChild(video);
        }
        setCroppedVideoUrl(cloudinaryUrl);
    };

    const handleLoadedMetadata = () => {
        setDuration(formatTime(videoRef.current.duration));
    };

    useEffect(() => {
        if (videoRef.current) setCropperSizePosition()
        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [aspectRatio]);

    useEffect(() => {
        if (croppedVideoUrl) previewRef.current.style.height = cropperSize.height + 'px'
    }, [croppedVideoUrl])


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
        setCroppedVideoUrl(null);
        setShowCropper(false)
    }

    const togglePlayPause = () => {
        try {
            const previewVideo = document.getElementById('previewVideoRef');
            const mainVideo = videoRef.current;

            if (mainVideo.paused) {
                // Check if the video exists in the DOM before playing
                if (showCropper) handleUpload(); // Trigger upload/crop before playing

                if (previewVideo && previewVideo.readyState >= 3) { // Make sure video is loaded
                    previewVideo.currentTime = mainVideo.currentTime;
                    previewVideo.play().catch((error) => console.log('Preview play error', error));
                }

                mainVideo.play().catch((error) => console.log('Main video play error', error));
                setIsPlaying(true);
            } else {
                mainVideo.pause();
                if (previewVideo) {
                    previewVideo.currentTime = mainVideo.currentTime;
                    previewVideo.pause();
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
        setProgress(event.target.value);
    };

    const handleVolumeChange = (event) => {
        const volume = event.target.value;
        videoRef.current.volume = volume;
        setVolume(volume);
    };

    const handleSpeedChange = (speed) => {
        videoRef.current.playbackRate = speed;
        setPlaybackSpeed(speed);
    };

    const handleAspectRatioChange = (selectedAspectRatio) => {
        setCroppedVideoUrl(null)
        setAspectRatio(selectedAspectRatio);
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

    const downloadCropData = () => {
        const { x, y, width, height } = getCropperData();
        const data = {
            "timestamp": currentTime,
            "coordinates": [x, x + width, y, originalVideoSize.height],
            "volume": volume,
            "playbackRate": playbackSpeed,
        }

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'previewData.json';

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
    };

    return (
        <div className='bg-[#37393f] min-h-screen flex flex-col justify-between'>

            {/* Upper half (view) */}
            <div className='p-4 px-8'>

                {/* Header */}
                <div className='flex justify-between items-center mb-4'>
                    <section>Dynamic Flip</section>

                    <section>
                        <label htmlFor="filter" className="switch" aria-label="Toggle Filter">
                            <input type="checkbox" id="filter" checked={!autoFlip} onChange={() => console.log('')} />
                            <span >Auto Flip</span>
                            <span className="flex aitems-center">Dynamic Flip
                            </span>
                        </label>
                    </section>

                    <section>
                        <XMarkIcon className='size-6 font-thin text-gray-500' />
                    </section>
                </div>

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
                                        <div className="line vertical" />
                                        <div className="line horizontal" />
                                        <div className="backdrop" />
                                    </div>
                                </Draggable>
                            }

                        </div>

                        <div className="controls">
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
                            <span>Preview</span>

                            {croppedVideoUrl ?
                                <div className='flex' ref={previewRef}>
                                    <video
                                        id='previewVideoRef'
                                        width="100%"
                                        height="500px" className='mt-4' autoPlay >
                                        <source src={croppedVideoUrl} type="video/mp4" />
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
                    <button className='px-3 py-1 bg-violet-500 rounded-[10px]' onClick={downloadCropData}>Generate Preview</button>
                </section>
                <section>
                    <button className='px-3 py-1 bg-gray-500 rounded-[10px]'>Cancel</button>
                </section>
            </div>
        </div>
    )
}

export default Homepage