/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import video from './assets/video.mp4'
import { convertTimestampToSeconds } from './util';


const AutoFlip = () => {
    const previewVideoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackData, setPlaybackData] = useState([]);

    const handleJSONUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonData = JSON.parse(e.target.result);
            setPlaybackData(jsonData);
        };
        reader.readAsText(file);
    };

    const handleCrop = () => {
        const x = playbackData[0].coordinates[0]
        const width = playbackData[0].coordinates[1] - playbackData[0].coordinates[0]

        const renderedWidth = previewVideoRef.current.clientWidth; // Rendered video width

        const center = ((renderedWidth / 2) - (width / 2)) - x; // half of renderedWidth - half of cropper width
        const clipPathValue = `inset(${0}px ${renderedWidth - (x + width)}px ${0}px ${x}px)`;

        previewVideoRef.current.style.clipPath = clipPathValue;
        previewVideoRef.current.style.transform = `translateX(${center}px)`;
    };


    const handleStart = () => {
        if (previewVideoRef.current) {
            const startTime = convertTimestampToSeconds(playbackData[0].timestamp);
            const endTime = convertTimestampToSeconds(playbackData[1].timestamp);
            previewVideoRef.current.currentTime = startTime;
            previewVideoRef.current.play();
            handleCrop()
            setIsPlaying(true);

            const checkEndTime = () => {
                if (previewVideoRef.current.currentTime >= endTime) {
                    previewVideoRef.current.pause();
                    setIsPlaying(false);
                    previewVideoRef.current.removeEventListener('timeupdate', checkEndTime); // Clean up listener
                }
            };

            previewVideoRef.current.addEventListener('timeupdate', checkEndTime);
        }
    };


    const handlePlaybackChange = (index) => {
        if (previewVideoRef.current) {
            previewVideoRef.current.volume = playbackData[index].volume;
            previewVideoRef.current.playbackRate = playbackData[index].playbackRate;
        }
    };

    useEffect(() => {
        if (isPlaying && previewVideoRef.current) {
            handlePlaybackChange(0); // apply the initial playback rate and volume

            const updatePlaybackSettings = () => {
                const currentTime = previewVideoRef.current.currentTime;
                if (currentTime >= convertTimestampToSeconds(playbackData[1].timestamp)) {
                    handlePlaybackChange(1); // change to second data settings
                }
            };

            previewVideoRef.current.addEventListener('timeupdate', updatePlaybackSettings);

            return () => {
                previewVideoRef.current.removeEventListener('timeupdate', updatePlaybackSettings);
            };
        }
    }, [isPlaying]);

    // const stopPreview = () => {
    //     setIsPlaying(false);
    //     previewVideoRef.current?.pause();
    //     clearInterval(intervalId);
    // };

    return (
        <>
            {/* Upper half (view) */}
            <div className='p-4 px-8 h-[800px] overflow-auto'>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                    {/* JSON */}
                    <div className='me-8'>
                        <div className="video-container">

                            <input type="file" accept=".json" onChange={handleJSONUpload} />

                            {playbackData.length > 0 &&
                                <pre className='bg-gray-300 text-gray-900 rounded-md my-4 h-[300px] overflow-scroll no-scrollbar'>{JSON.stringify(playbackData, null, 2)}</pre>
                            }

                        </div>

                        <div className="controls my-4">
                            <section className='flex gap-4'>
                                <button className='px-3 py-1 bg-violet-500 rounded-[10px]' onClick={handleStart} disabled={isPlaying}>Start Preview</button>
                                {/* <button className='px-3 py-1 bg-violet-500 rounded-[10px]' onClick={stopPreview} disabled={!isPlaying}>Stop Preview</button> */}
                            </section>
                        </div>

                    </div>

                    {/* Preview */}
                    <div className='text-center'>
                        <div className='flex flex-col h-full'>
                            <span className='text-gray-300'>Preview</span>

                            {/* {isPlaying ? */}
                            <div className='flex ms-8'>
                                <video
                                    id='previewpreviewVideoRef'
                                    width="100%"
                                    height="500px" className='mt-4'
                                    ref={previewVideoRef}
                                >
                                    <source src={video} type="video/mp4" />
                                </video>
                            </div>
                            {/* :
                                <div className='flex flex-col justify-center h-full'>
                                    <section className='flex justify-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 8 6 4-6 4Z" /></svg>
                                    </section>
                                    <section>Preview not available</section>
                                    <section className='text-gray-400'>Please click on "Start Cropper"<br />and then play video</section>
                                </div>
                            } */}
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default AutoFlip