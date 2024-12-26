import { useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewImg = () => {
  const [imgUrl, setImgUrl] = useState(null);
  const showToast = useShowToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImgUrl(reader.result);
      };

      reader.readAsDataURL(file);
    } else {
      showToast("Invalid file type", " Please select an image file", "error");
      setImgUrl(null);
    }
  };
  return { handleImageChange, imgUrl, setImgUrl };
};

const usePreviewVideo = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const showToast = useShowToast();

  const handleVideoPreview = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setVideoUrl(reader.result);
      };

      reader.readAsDataURL(file);
    } else {
      showToast("Invalid file type", "Please select a video file", "error");
      setVideoUrl(null);
    }
  };

  return { handleVideoPreview, videoUrl, setVideoUrl };
};

export { usePreviewImg, usePreviewVideo };
