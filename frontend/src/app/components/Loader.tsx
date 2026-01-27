// src/app/components/Loader.tsx
import Lottie from "lottie-react";
import animationData from "../../assets/Loading Fish Animation.json"; 

export function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Lottie
        animationData={animationData}
        loop
        className="w-48 h-48"
      />
    </div>
  );
}
