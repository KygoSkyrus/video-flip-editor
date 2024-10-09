export const getCroppedVid = (video, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = video.videoWidth / video.clientWidth;
    const scaleY = video.videoHeight / video.clientHeight;
  
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
  
    ctx.drawImage(
      video,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
  
    return new Promise((resolve, reject) => {
      canvas.toDataURL('image/jpeg', (err, url) => {
        if (err) return reject(err);
        resolve(url);
      });
    });
  };
  