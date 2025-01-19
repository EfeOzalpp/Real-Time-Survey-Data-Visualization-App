import React, { useEffect, useState } from 'react';
import '../../styles/gamification.css';

const GamificationPersonalized = ({ userData, percentage }) => {
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
            "I have a backup planet!",
            "Nature? Is it edible?",
            "Sustainability, Who?",
            "Comfort seeker, nature is fine too...",
            "Sry, I just got aware of my bad-nature",
          ],
          "41-60": [
            "Average-Eco Loverzz",
            "Is it trendy to like nature?",
            "Luv Nature <3, (ok, where's my award)",
            "At least, I was honest",
            "Great, I love mediocrity",
          ],
          "61-80": [
            "Green-Blue Superhero",
            "Sustainability Trifecta (Love, nature, life)",
            "Planet Partner-in-crime",
            "A cool person, and a cooling agent",
            "Piece-o-cake, I run this planet",
          ],
          "81-100": [
            "Nature's Holy Savior",
            "Damn! Larger than life habits",
            "The most precious butterfly award goes to...",
            "A reminder to reward yourself",
            "Simply, outstanding...",
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
            "Earth would've needed you, You're ahead of only",
            "Go hug a tree. Effortlessly higher than",
            "Wow, congratz, you accelerated planetary evacuation =). You're ahead of only",
          ],
          "21-40": [
            "Not amazing but not a crime, you're ahead of only",
            "Low-key effort gives low-key results, you're ahead of",
            "Humble beginnings, you're higher than",
          ],
          "41-60": [
            "You're getting there! -Ahead of",
            "Caring is free. You're ahead of",
            "Kind of in the middle, huh? You're higher than",
          ],
          "61-80": [
            "You are doing frenzy! You're higher",
            "Breathing, thriving, ahead of",
            "Right on the spot! You're higher than",
          ],
          "81-100": [
            "You're ahead of almost everyone, higher than",
            "Hi, I'm Nature, I appreciate you. You're higher than",
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

  const { weights } = userData;

  const averageWeight =
    Object.values(weights).reduce((sum, w) => sum + w, 0) / Object.keys(weights).length;

  return (
    <div className="personalized-result">
      {/* First section: Text */}
      <div className="gamification-text">
        <h4 className="gam-title">Based on your habits, you're:</h4>
        <h1 className="personal-title">{selectedTitle}</h1>
        <p>
        {secondaryText} <strong>{percentage}%</strong> people!
        </p>
      </div>

      {/* Second section: SVG */}
      <div className="gamification-knob">
        <div className="percentage-knob">
          <div
            className="knob-arrow"
            style={{ bottom: `${percentage}%` }} // Move the arrow based on percentage
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
