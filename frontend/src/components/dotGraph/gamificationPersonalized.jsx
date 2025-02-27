import React, { useEffect, useState } from 'react';
import '../../styles/gamification.css';

const GamificationPersonalized = ({ userData, percentage, color }) => {
const [selectedTitle, setSelectedTitle] = useState('');
const [secondaryText, setSecondaryText] = useState('');

  // Ensure the useEffect hook is always called
useEffect(() => {
  if (percentage !== undefined && userData) {
    const getRandomTitle = (percentage) => {
      const titles = {
        "0-20": [
          "Carbon Culprit",
          "Planet Polluter",
          "Sustainability Enemy",
          "I thrive in environmental hazard",
          "I'm a burden for Earth",
          "Sustainability Sinner",
          "Green isn't my favorite color",
        ],
        "21-40": [
          "I Have a Backup Planet!",
          "Nature? Is it Edible?",
          "Sustainability, Who?",
          "Comfort Seeker, Earth is Ok Too",
          "I am Aware of My Bad-nature",
        ],
        "41-60": [
          "Middle Spot is Yours",
          "Is it trendy to like nature?",
          "Nature <3 (ok, where's my award?)",
          "The Least I Can Do Is Honesty",
          "I Like Mediocrity..:) (not really)",
        ],
        "61-80": [
          "Humble-Green MF",
          "Sustainability and Whatnot",
          "Planet Partner in Crime",
          "A cool person for a cool planet",
          "Enjoyable Results, Thanks",
        ],
        "81-100": [
          "Nature's Humble Savior",
          "Damn! Larger than life habits",
          "The Most Precious Award Goes to...",
          "A Reminder to Reward Yourself",
          "Good Results, Keep It Up",
        ],
      };

      if (percentage <= 20) {
        return titles["0-20"][Math.floor(Math.random() * titles["0-20"].length)];
      } else if (percentage <= 40) {
        return titles["21-40"][Math.floor(Math.random() * titles["21-40"].length)];
      } else if (percentage <= 60) {
        return titles["41-60"][Math.floor(Math.random() * titles["41-60"].length)];
      } else if (percentage <= 80) {
        return titles["61-80"][Math.floor(Math.random() * titles["61-80"].length)];
      } else {
        return titles["81-100"][Math.floor(Math.random() * titles["81-100"].length)];
      }
    };

    const getRandomSecondaryText = (percentage) => {
      const secondaryText = {
        "0-20": [
          "Earth would've needed you, You're surpass only",
          "Hug a tree. Effortlessly higher than only",
          "Planetary evacuation! You're ahead of only",
        ],
        "21-40": [
          "Hands down, it's not a crime, you surpass only",
          "Low-effort gives-key results, you're ahead of",
          "Humble beginnings, you're higher than",
        ],
        "41-60": [
          "You're getting there! -Ahead of",
          "I mean... You do you. You're ahead of",
          "Kind of in the middle, huh? You're higher than",
        ],
        "61-80": [
          "Spectacular and frenzy! You're higher",
          "Breathing, thriving, cooking. Ahead of",
          "Right on, left off, You're higher than",
        ],
        "81-100": [
          "You're ahead of almost everyone, higher than",
          "I'm Nature, appreciate ya' You're higher than",
          "WOW, that's rad. You're ahead of",
        ],
      };

      if (percentage <= 20) {
        return secondaryText["0-20"][Math.floor(Math.random() * secondaryText["0-20"].length)];
      } else if (percentage <= 40) {
        return secondaryText["21-40"][Math.floor(Math.random() * secondaryText["21-40"].length)];
      } else if (percentage <= 60) {
        return secondaryText["41-60"][Math.floor(Math.random() * secondaryText["41-60"].length)];
      } else if (percentage <= 80) {
        return secondaryText["61-80"][Math.floor(Math.random() * secondaryText["61-80"].length)];
      } else {
        return secondaryText["81-100"][Math.floor(Math.random() * secondaryText["81-100"].length)];
      }
    };

    const title = getRandomTitle(percentage);
    const secondary = getRandomSecondaryText(percentage);

    setSelectedTitle(title);
    setSecondaryText(secondary);
  }
}, [percentage, userData]); // Include userData in dependencies

if (!userData) {
  console.log('No user data available');
  return null;
}

const cubicBezier = (t, p0, p1, p2, p3) => {
  const c = (1 - t), c2 = c * c, c3 = c2 * c;
  const t2 = t * t, t3 = t2 * t;
  return (c3 * p0) + (3 * c2 * t * p1) + (3 * c * t2 * p2) + (t3 * p3);
};

const skewPercentage = (percentage) => {
  return cubicBezier(percentage / 100, 0, 0.6, 0.85, 1) * 100;
};

const interpolateColor = (t, color1, color2) => {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * t),
    g: Math.round(color1.g + (color2.g - color1.g) * t),
    b: Math.round(color1.b + (color2.b - color1.b) * t),
  };
};

const getSkewedColor = (percentage) => {
  const skewedT = skewPercentage(percentage) / 100;

  const colorStops = [
    { stop: 0.0, color: { r: 249, g: 14, b: 33 } },      // Red
    { stop: 0.46, color: { r: 252, g: 159, b: 29 } },   // Orange
    { stop: 0.64, color: { r: 245, g: 252, b: 95 } },    // Yellow
    { stop: 0.8, color: { r: 0, g: 253, b: 156 } },   // Lime-Yellow
    { stop: 1.0, color: { r: 1, g: 238, b: 0 } }       // Green
  ];

  let lower = colorStops[0], upper = colorStops[colorStops.length - 1];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (skewedT >= colorStops[i].stop && skewedT <= colorStops[i + 1].stop) {
      lower = colorStops[i];
      upper = colorStops[i + 1];
      break;
    }
  }

  const range = upper.stop - lower.stop;
  const t = range === 0 ? 0 : (skewedT - lower.stop) / range;

  const finalColor = interpolateColor(t, lower.color, upper.color);
  return `rgb(${finalColor.r}, ${finalColor.g}, ${finalColor.b})`;
};

const skewedColor = getSkewedColor(percentage);


const { weights } = userData;

return (
  <div className="personalized-result">
    {/* First section: Text */}
    <div className="gamification-text">
      <h4 className="gam-title">Based on your habits, you're:</h4>
      <h1 className="personal-title">{selectedTitle}</h1>
      <p>
        {secondaryText}{" "}
        <strong 
          style={{ 
            textShadow: `0px 0px 12px ${color}, 0px 0px 22px ${skewedColor}`
          }}
        >
          {percentage}%
        </strong>{" "}
        people!
      </p>
    </div>

    {/* Second section: SVG */}
    <div className="gamification-knob">
      <div className="percentage-knob">
        <div
          className="knob-arrow"
          style={{ bottom: `${percentage}%`, borderBottom: `18px solid ${skewedColor}` }} // Move the arrow based on percentage
        />
      </div>
    </div>

    {/* Third section: Bar */}
    <div className="gamification-bar">
      <div className="percentage-bar" />
    </div>
  </div>
);
};

export default GamificationPersonalized;
