import React, { useEffect, useRef, useState } from 'react'
import { PauseIcon, PlayIcon } from '@heroicons/react/16/solid';

import video from './assets/video.mp4'

const Homepage = () => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const [currentTime, setCurrentTime] = useState('00:00');
    const [duration, setDuration] = useState('00:00');

    const formatTime = (time) => {
        console.log('time', time);
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    };


    const handleLoadedMetadata = () => {
        setDuration(formatTime(videoRef.current.duration));
    };

    useEffect(() => {
        videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => {
            videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, []);


    const togglePlayPause = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(progress);
        console.log('>>>>>>>>>>>>>>>>>',videoRef.current.currentTime)
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

    // Change playback speed
    const handleSpeedChange = (event) => {
        const speed = event.target.value;
        videoRef.current.playbackRate = speed;
        setPlaybackSpeed(speed);
    };

    return (
        <div className='bg-slate-600 h-screen flex flex-col justify-between'>

            {/* Upper half (view) */}
            <div className='p-4'>

                {/* Header */}
                <div className='flex justify-between mb-4'>
                    <section>Cropper</section>
                    <section>
                        Switch btn
                    </section>
                    <section></section>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                    {/* Video */}
                    <div>
                        <video
                            ref={videoRef}
                            onTimeUpdate={handleTimeUpdate}
                            width="100%"
                            height="auto"
                            style={{ display: 'block', marginBottom: '10px' }} className="rounded-lg">
                            <source src={video} type="video/mp4" />
                        </video>

                        <div className="controls">
                            {/* Play/Pause Button */}
                            <section className='flex items-center'>
                                <button onClick={togglePlayPause}>
                                    {isPlaying ? <PauseIcon className="size-6" /> : <PlayIcon className="size-6" />}
                                </button>

                                {/* Progress Slider (Seek To) */}
                                <input type="range" min="0" max="100" value={progress} onChange={handleSeek} class="w-full h-1 bg-gray-400 rounded-lg ms-2 cursor-pointer range-sm dark:bg-gray-700" />
                            </section>

                            {/* Volume Slider */}
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                style={{ margin: '0 10px', width: '100px' }}
                            />

                            <section>
                                {/* Display Current Time and Duration */}
                                <div className="time-info">
                                    <span>{currentTime}</span><span className='text-gray-400'> | {duration}</span>
                                </div>

                            </section>

                            {/* Playback Speed Selector */}
                            <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">Dropdown button <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                            </svg>
                            </button>

                            <div id="dropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                                <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                                    <li>
                                        <span class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">0.5x</span>
                                    </li>
                                    <li>
                                        <span class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">1x</span>
                                    </li>
                                    <li>
                                        <span class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">1.5x</span>
                                    </li>
                                    <li>
                                        <span class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">2x</span>
                                    </li>
                                </ul>
                            </div>

                            {/* <select value={playbackSpeed} onChange={handleSpeedChange} style={{ margin: '0 10px' }} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[100px] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                              <option selected >Playback speed {playbackSpeed}x</option>
                                <option value="0.5">0.5x</option>
                                <option value="1">1x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </select> */}
                        </div>

                    </div>

                    {/* Preview */}
                    <div className='text-center'>
                        {/* <div className="h-64 rounded-lg bg-gray-200"></div> */}
                        <div className='flex flex-col justify-between h-full'>
                            <span>Preview</span>

                            <div className='flex flex-col justify-center h-full'>
                                <section className='flex justify-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 8 6 4-6 4Z" /></svg>
                                </section>
                                <section>Preview not available</section>
                                <section className='text-gray-400'>Please click on "Start Cropper"<br />and then play video</section>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Cropper Buttons */}
            <div className='flex justify-between p-4 border-t border-gray-500'>
                <section className='flex gap-4'>
                    <button className='px-3 py-1 bg-violet-500 rounded-[10px]'>Start Cropper</button>
                    <button className='px-3 py-1 bg-violet-500 rounded-[10px]'>Remove Cropper</button>
                    <button className='px-3 py-1 bg-violet-500 rounded-[10px]'>Generate Preview</button>
                </section>
                <section>
                    <button className='px-3 py-1 bg-gray-500 rounded-[10px]'>Cancel</button>
                </section>
            </div>
        </div>
    )
}

export default Homepage