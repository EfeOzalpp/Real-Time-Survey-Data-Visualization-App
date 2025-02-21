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
            "I am Aware of my Bad-nature",
          ],
          "41-60": [
            "Average-Eco Loverzz",
            "Is it trendy to like nature?",
            "Nature <3 (ok, where's my award?)",
            "The least I can do is honesty",
            "I like mediocrity..:)",
          ],
          "61-80": [
            "Humble-Green MF",
            "Sustainability Stuff Luver",
            "Planet Partner in Crime",
            "A cool person for a cool planet",
            "Enjoyable Results, Thanks",
          ],
          "81-100": [
            "Nature's Humble Savior",
            "Damn! Larger than life habits",
            "The Most Precious Award Goes to...",
            "A Reminder to Reward Yourself",
            "Simply, Outstanding...",
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
              textShadow: `0px 0px 12px ${color}, 0px 0px 22px ${color}`
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
            style={{ bottom: `${percentage}%`, borderBottom: `18px solid ${color}` }} // Move the arrow based on percentage
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
