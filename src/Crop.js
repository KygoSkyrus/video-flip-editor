import React, { useRef, useEffect } from "react";

import video from './assets/video.mp4'


const CroppedVideoPlayer = () => {
    const x = 50; // x-coordinate to start cropping from
    const y = 30; // y-coordinate to start cropping from
    const width = 200; // Width of the cropping area
    const height = 100; // Height of the cropping area
  
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
        console.log('videoRef.current',videoRef.current)
      // Start playing the video when the component mounts
    //   videoRef.current.play();
    }
  }, []);

  return (
    <>
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: width,
        height: height,
        border: "2px solid black", // Optional: border for the cropped area
      }}
    >
      <video
        ref={videoRef}
        src={video}
        style={{
          position: "absolute",
          top: -y, // Adjust video position based on y
          left: -x, // Adjust video position based on x
          minWidth: "100%", // Ensures video fills the width
          minHeight: "100%", // Ensures video fills the height
          objectFit: "cover", // Crop the video to cover the specified area
        }}
        // autoPlay
        controls
        muted
        // loop // Optional: loop the video
      />



    </div>


<div>
<video
                                ref={videoRef}
                                // onTimeUpdate={handleTimeUpdate}
                                width="100%"
                                height="auto"
                                controls
                                style={{ display: 'block', marginBottom: '10px' }} className="rounded-lg">
                                <source src={video} type="video/mp4" />
                            </video>
</div>
</>
  );
};

export default CroppedVideoPlayer;
