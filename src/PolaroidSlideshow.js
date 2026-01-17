import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const IMAGES = [
  "/slideshow/vidhana_soudha.webp",
  "/slideshow/namma_metro.webp",
  "/slideshow/bmtc_bus.webp",
  "/slideshow/bmtc_bus.webp",
  "/slideshow/bengaluru_traffic.webp"
];

const PolaroidSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % IMAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <StyledWrapper>
      <div className="stack">
        <div className="card">
          <div 
            className="image" 
            style={{ backgroundImage: `url(${IMAGES[currentIndex]})` }} 
          />
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 20px; /* Added padding to prevent hover cutoff */

  .stack {
    width: 100%;       /* Takes full width of container */
    max-width: 600px;  /* Increased from 400px to 600px */
    transition: 0.25s ease;
    
    &:hover {
      transform: rotate(5deg) scale(1.05); /* Added slight scale on hover */
      .card:before {
        transform: translatey(-2%) rotate(-4deg);
      }
      .card:after {
        transform: translatey(2%) rotate(4deg);
      }
    }
  }

  .card {
    aspect-ratio: 3 / 2;
    border: 4px solid;
    border-color: #3e1e04ff;
    background-color: #fbf7f7ff;
    position: relative;
    transition: 0.15s ease;
    cursor: pointer;
    padding: 1.5rem 1.5rem 4.5rem 1.5rem; /* Increased padding relative to new size */
    box-shadow: 0 15px 30px rgba(22, 108, 199, 0.65);

    &:before,
    &:after {
      content: "";
      display: block;
      position: absolute;
      height: 100%;
      width: 100%;
      border: 4px solid;
      border-color: #3e1e04ff;
      background-color: #fff;
      transform-origin: center center;
      z-index: -1;
      transition: 0.15s ease;
      top: 0;
      left: 0;
      box-shadow: 0 15px 30px rgba(43, 178, 77, 0.87);
    }

    &:before {
      transform: translatey(-2%) rotate(-6deg);
    }

    &:after {
      transform: translatey(2%) rotate(6deg);
    }
  }

  .image {
    width: 100%;
    height: 100%;
    border: 2px solid #0f0e0eff;
    background-color: #333;
    background-position: center;
    background-size: cover;
    transition: background-image 0.5s ease-in-out;
  }
`;

export default PolaroidSlideshow;