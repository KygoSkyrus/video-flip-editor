/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useRef, useState } from 'react'
import video from './assets/video.mp4'


const AutoFlip = () => {
    const previewVideoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackData, setPlaybackData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    console.log('--------------------')

    // Function to handle JSON file upload
    const handleJSONUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonData = JSON.parse(e.target.result);
            setPlaybackData(jsonData);
        };
        reader.readAsText(file);
    };

    // Convert timestamp "MM:SS" to seconds
    const convertTimestampToSeconds = (timestamp) => {
        const [minutes, seconds] = timestamp.split(":").map(Number);
        console.log('minutes * 60 + seconds',minutes * 60 + seconds)
        return minutes * 60 + seconds;
    };

    // Function to start video preview based on JSON data
    const startPreview = () => {
        if (playbackData.length === 0) {
            console.error("No playback data available.");
            return;
        }
        setIsPlaying(true);
        setCurrentIndex(0);
        const video = previewVideoRef.current;

        
        if (video) {
            console.log('hereee')
            video.currentTime = convertTimestampToSeconds(playbackData[0].timestamp);
            video.volume = playbackData[0].volume;
            video.playbackRate = playbackData[0].playbackRate;
            video.play();
        }

        // Set an interval to check for updates based on timestamp in JSON
        const id = setInterval(() => {
            handlePlaybackUpdate();
        }, 1000);
        setIntervalId(id);
    };

    // Function to stop video playback
    const stopPreview = () => {
        setIsPlaying(false);
        previewVideoRef.current?.pause();
        clearInterval(intervalId);
    };

    // Function to update video playback based on current timestamp and JSON data
    const handlePlaybackUpdate = () => {
        const video = previewVideoRef.current;
        if (currentIndex >= playbackData.length) {
            clearInterval(intervalId);
            return;
        }

        const nextEntry = playbackData[currentIndex];
        console.log('nextEntry',nextEntry)
        const nextTimestampInSeconds = convertTimestampToSeconds(nextEntry.timestamp);

        // If video time reaches the next timestamp, update video state
        if (Math.floor(video.currentTime) === nextTimestampInSeconds) {
            video.volume = nextEntry.volume;
            video.playbackRate = nextEntry.playbackRate;

            // Update to next timestamp and coordinates (you can add cropping logic here)
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }

        // Pause video if the JSON contains timestamps where the video should be paused
        if (currentIndex > 0 && video.currentTime >= nextTimestampInSeconds) {
            video.pause();
        }
    };






    return (
        <>
            {/* Upper half (view) */}
            <div className='p-4 px-8 h-[800px] overflow-auto'>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                    {/* Video */}
                    <div className='me-8'>
                        <div className="video-container">

                            <input type="file" accept=".json" onChange={handleJSONUpload} />

                            {playbackData.length > 0 &&
                                <pre className='bg-gray-300 text-gray-900 rounded-md my-4 h-[300px] overflow-scroll no-scrollbar'>{JSON.stringify(playbackData, null, 2)}</pre>
                            }

                        </div>

                        <div className="controls my-4">
                            <section className='flex gap-4'>
                                <button className='px-3 py-1 bg-violet-500 rounded-[10px]' onClick={startPreview} disabled={isPlaying}>Start Preview</button>
                                <button className='px-3 py-1 bg-violet-500 rounded-[10px]' onClick={stopPreview} disabled={!isPlaying}>Stop Preview</button>
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