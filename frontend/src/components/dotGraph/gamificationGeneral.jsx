import React, { useEffect, useState } from 'react';
import '../../styles/gamification.css';

const GamificationGeneral = ({ hoveredDot }) => {
  const [secondaryText, setSecondaryText] = useState('');
  const [primaryTitle, setPrimaryTitle] = useState('');

  // Generate unique text and title for each dot
  useEffect(() => {
    if (hoveredDot) {
      const { percentage } = hoveredDot;

      const getRandomSecondaryText = (percentage) => {
        const texts = {
          "0-20": [
            "Barely lifting the weight.",
            "A lot of room for improvement.",
            "Just starting your journey.",
            "Keep pushing forward!",
          ],
          "21-40": [
            "Getting there, keep it up.",
            "A steady pace towards the top.",
            "Better than some, still work to do.",
            "You’re on the right path!",
          ],
          "41-60": [
            "Halfway there, great progress!",
            "Good effort so far.",
            "You’re doing well, keep going!",
            "The balance is tipping in your favor.",
          ],
          "61-80": [
            "Impressive work, keep it going.",
            "You’re in the top ranks.",
            "Nature is appreciating your efforts.",
            "A true champion in the making.",
          ],
          "81-100": [
            "Outstanding performance!",
            "You’re at the top of the game.",
            "An inspiration for others.",
            "Nature’s favorite ally!",
          ],
        };

        if (percentage <= 20) {
          return texts["0-20"][Math.floor(Math.random() * texts["0-20"].length)];
        } else if (percentage <= 40) {
          return texts["21-40"][Math.floor(Math.random() * texts["21-40"].length)];
        } else if (percentage <= 60) {
          return texts["41-60"][Math.floor(Math.random() * texts["41-60"].length)];
        } else if (percentage <= 80) {
          return texts["61-80"][Math.floor(Math.random() * texts["61-80"].length)];
        } else {
          return texts["81-100"][Math.floor(Math.random() * texts["81-100"].length)];
        }
      };

      const getRandomPrimaryTitle = () => {
        const titles = [
          "Nature's Protector", "Eco Warrior", "Green Guardian", "Planet's Ally", "Sustainability Hero",
          "The Earth Whisperer", "Harmony Seeker", "Nature's Champion", "Environmental Architect", "Earth Healer",
          "Eco Revolutionary", "Planet Enthusiast", "Future Builder", "Eco Mastermind", "Climate Hero",
          "Eco Pioneer", "Sustainability Advocate", "Eco Visionary", "Green Crusader", "Nature's Friend",
          "Environmental Magician", "Planet Lover", "Earth Advocate", "Eco Genius", "Sustainability Star",
          "Green Luminary", "Nature Enthusiast", "Planet Protector", "Eco Inspirer", "Climate Enthusiast",
        ];

        // Weight the first 5 options more likely to show up
        const weightedTitles = [
          ...Array(5).fill("Nature's Protector"),
          ...Array(5).fill("Eco Warrior"),
          ...Array(5).fill("Green Guardian"),
          ...Array(5).fill("Planet's Ally"),
          ...Array(5).fill("Sustainability Hero"),
          ...titles, // Include the rest with equal probability
        ];

        return weightedTitles[Math.floor(Math.random() * weightedTitles.length)];
      };

      setSecondaryText(getRandomSecondaryText(percentage));
      setPrimaryTitle(getRandomPrimaryTitle());
    }
  }, [hoveredDot]); // Trigger only when hoveredDot changes

  if (!hoveredDot) {
    return null; // Avoid rendering if no dot is hovered
  }

  const { percentage, color } = hoveredDot;

  return (
    <div className="generalized-result">
      {/* Title and description */}
      <h4 className="gam-general-title">This individual:</h4>
      <div className="gam-general">
        <div className="gam-general-description">
          <div className="gam-description-title">
            <h2>{primaryTitle}</h2>
          </div>
          <div className="gam-description-text">
            <p>
              {secondaryText} <strong>{percentage}%</strong> of other people.
            </p>
          </div>
        </div>

        <div className="gam-visualization">
          {/* Knob Visualization */}
          <div className="gam-percentage-knob">
            <div
              className="gam-knob-arrow"
              style={{
                bottom: `${percentage}%`, // Adjust arrow position dynamically
                borderBottom: `15px solid ${color}`, // Apply color dynamically
              }}
            ></div>
          </div>

          {/* Bar Visualization */}
          <div className="gam-percentage-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default GamificationGeneral;
