import React from "react";
import Lottie from "lottie-react";
import animationData from "../assets/animations/loader.json";

const Preloader = () => {
  return (
    <div className="pre-wrapper">
      <div class="wrapper">
      <div class="ball"></div>
      <div class="ball"></div>
      <div class="ball"></div>
      <div class="shadow"></div>
      <div class="shadow"></div>
      <div class="shadow"></div>
    </div>
    </div>
  );
};

export default Preloader;
