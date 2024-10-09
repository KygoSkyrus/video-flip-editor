import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CheckIcon, PauseIcon, PlayIcon, SpeakerWaveIcon } from '@heroicons/react/16/solid';
import Cropper from 'react-easy-crop';

import video from './assets/video.mp4'
import { getCroppedVid } from './cropVideo';

const aspectRatios = {
    '9:18': 9 / 18,
    '9:16': 9 / 16,
    '4:3': 4 / 3,
    '3:4': 3 / 4,
    '1:1': 1 / 1,
    '4:5': 4 / 5,
};

const Homepage = () => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const [currentTime, setCurrentTime] = useState('00:00');
    const [duration, setDuration] = useState('00:00');

    // const [crop, setCrop] = useState({ x: 0, y: 0 });
    // const [zoom, setZoom] = useState(1);
    // const [croppedArea, setCroppedArea] = useState(null);
    // const [croppedPreview, setCroppedPreview] = useState(null);
    // const [aspectRatio, setAspectRatio] = useState(aspectRatios['9:16']);

    // const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    //     setCroppedArea(croppedAreaPixels);
    // }, []);

    // const generatePreview = useCallback(async () => {
    //     console.log('generatePreview')
    //     const croppedImage = await getCroppedVid(
    //         videoRef.current,
    //         croppedArea
    //     );
    //     console.log('croppedImage', croppedImage)
    //     setCroppedPreview(croppedImage);
    // }, [croppedArea]);

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
    const handleSpeedChange = (speed) => {
        // const speed = event.target.value;
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
                        <div style={{ position: 'relative', }}>
                            <video
                                ref={videoRef}
                                onTimeUpdate={handleTimeUpdate}
                                width="100%"
                                height="auto"
                                style={{ display: 'block', marginBottom: '10px' }} className="rounded-lg">
                                <source src={video} type="video/mp4" />
                            </video>

                            {/* Cropper Layer */}
                            {/* <Cropper
                                video={videoRef.current}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                onImageLoaded={res => {
                                    console.log(res)
                                }}
                            /> */}
                        </div>

                        <div className="controls">
                            <section className='flex items-center'>
                                {/* Play/Pause Button */}
                                <button onClick={togglePlayPause}>
                                    {isPlaying ? <PauseIcon className="size-6" /> : <PlayIcon className="size-6" />}
                                </button>

                                {/* Progress Slider (Seek To) */}
                                <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="w-full h-1 bg-gray-400 rounded-lg ms-2 cursor-pointer range-sm dark:bg-gray-700" />
                            </section>

                            <section className='flex justify-between my-2'>
                                {/* Display Current Time and Duration */}
                                <div className="time-info">
                                    <span>{currentTime}</span><span className='text-gray-400'> | {duration}</span>
                                </div>

                                {/* Volume Slider */}
                                <section className='flex items-center'>
                                    <SpeakerWaveIcon className="size-5" />
                                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-[140px] h-1 bg-gray-400 rounded-lg ms-2 cursor-pointer range-sm dark:bg-gray-700 accent-gray-800" />
                                </section>
                            </section>

                            <section className='flex gap-4 my-4'>
                                {/* Playback Speed Selector */}
                                <button id="playbackSpeedButton" data-dropdown-toggle="playbackSpeedDropdown" className="text-white hover:bg-gray-900 border border-gray-900 focus:ring-0 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" type="button">Playback speed <span className='text-gray-400 ms-2'>{playbackSpeed}x</span>
                                    <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                    </svg>
                                </button>

                                <div id="playbackSpeedDropdown" className="z-10 hidden bg-slate-600 divide-y divide-gray-100 rounded-lg shadow-md w-44 dark:bg-gray-700">
                                    <ul className="py-2 text-sm  dark:text-gray-200" aria-labelledby="playbackSpeedButton">
                                        <li>
                                            <span className=" px-4 py-2 hover:bg-gray-500 cursor-pointer flex justify-between" onClick={() => handleSpeedChange(0.5)}>
                                                <span>0.5x</span>
                                                {playbackSpeed === 0.5 && <span><CheckIcon className='size-6 text-gray-400' /></span>}
                                            </span>
                                        </li>
                                        <li>
                                            <span className="block px-4 py-2 hover:bg-gray-500 cursor-pointer" onClick={() => handleSpeedChange(1)}>1x</span>
                                        </li>
                                        <li>
                                            <span className="block px-4 py-2 hover:bg-gray-500 cursor-pointer" onClick={() => handleSpeedChange(1.5)}>1.5x</span>
                                        </li>
                                        <li>
                                            <span className="block px-4 py-2 hover:bg-gray-500 cursor-pointer" onClick={() => handleSpeedChange(2)}>2x</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* <select value={playbackSpeed} onChange={handleSpeedChange} style={{ margin: '0 10px' }} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[100px] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                              <option selected >Playback speed {playbackSpeed}x</option>
                                <option value="0.5">0.5x</option>
                                <option value="1">1x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </select> */}

                                {/* Cropper Aspect Ratio */}
                                <button id="ratioButton" data-dropdown-toggle="ratioDropdown" className="text-white hover:bg-gray-900 border border-gray-900 focus:ring-0 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" type="button">Cropper Aspect Ratio <span className='text-gray-400 ms-2'>{playbackSpeed}x</span>
                                    <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                    </svg>
                                </button>

                                <div id="ratioDropdown" className="z-10 hidden bg-slate-600 divide-y divide-gray-100 rounded-lg shadow-md w-44 dark:bg-gray-700">
                                    <ul className="py-2 text-sm  dark:text-gray-200" aria-labelledby="ratioButton">
                                        <li>
                                            <span className="block px-4 py-2 hover:bg-gray-500 cursor-pointer" onClick={() => handleSpeedChange(0.5)}>0.5x</span>
                                        </li>
                                        <li>
                                            <span className="block px-4 py-2 hover:bg-gray-500 cursor-pointer" onClick={() => handleSpeedChange(1)}>1x</span>
                                        </li>
                                        <li>
                                            <span className="block px-4 py-2 hover:bg-gray-500 cursor-pointer" onClick={() => handleSpeedChange(1.5)}>1.5x</span>
                                        </li>
                                        <li>
                                            <span className="block px-4 py-2 hover:bg-gray-500 cursor-pointer" onClick={() => handleSpeedChange(2)}>2x</span>
                                        </li>
                                    </ul>
                                </div>
                            </section>

                        </div>

                    </div>

                    {/* Preview */}
                    <div className='text-center'>
                        {/* <div className="h-64 rounded-lg bg-gray-200"></div> */}
                        <div className='flex flex-col justify-between h-full'>
                            <span>Preview</span>

                            <div className='flex flex-col justify-center h-full'>


                                {/* <div className="controls">
                                    <label>Aspect Ratio:</label>
                                    <select onChange={(e) => setAspectRatio(aspectRatios[e.target.value])}>
                                        {Object.keys(aspectRatios).map((ratio) => (
                                            <option key={ratio} value={ratio}>
                                                {ratio}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={generatePreview}>Generate Preview.</button>
                                </div> */}

                                {/* Dynamic Preview */}
                                {/* {croppedPreview && (
                                    <div className="preview-container" style={{ width: '300px', height: '300px' }}>
                                        <img src={croppedPreview} alt="Cropped preview" style={{ width: '100%', height: 'auto' }} />
                                    </div>
                                )} */}


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