import client from '../components/sanityClient'; // Adjust the path if sanityClient is in a different folder

export const fetchSurveyData = async () => {
    const query = `
      *[_type == "userResponse"] | order(_createdAt desc) {
        question1,
        question2,
        question3,
        question4,
        question5
      }
    `;
  
    const rawData = await client.fetch(query);
  
    const questionValueMap = {
      question1: { A: 1, B: 0.5, C: 0 },
      question2: { C: 1, A: 0.5, B: 0 },
      question3: { C: 1, A: 0.5, B: 0 },
      question4: { A: 1, B: 0.5, C: 0 },
      question5: { A: 1, B: 0.5, C: 0 },
    };
  
    const interpolateColor = (weight) => {
      const green = { r: 0, g: 255, b: 0 };
      const yellow = { r: 255, g: 255, b: 0 };
      const red = { r: 255, g: 0, b: 0 };
  
      let startColor, endColor;
  
      if (weight > 0.5) {
        startColor = yellow;
        endColor = green;
        weight = (weight - 0.5) / 0.5;
      } else {
        startColor = red;
        endColor = yellow;
        weight = weight / 0.5;
      }
  
      const r = Math.round(startColor.r + (endColor.r - startColor.r) * weight);
      const g = Math.round(startColor.g + (endColor.g - startColor.g) * weight);
      const b = Math.round(startColor.b + (endColor.b - startColor.b) * weight);
  
      return `rgb(${r}, ${g}, ${b})`;
    };
  
    const results = rawData.map((response, index) => {
      const weights = [];
      for (const question in response) {
        if (questionValueMap[question]) {
          weights.push(questionValueMap[question][response[question]]);
        }
      }
  
      const averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
      const color = interpolateColor(averageWeight);
  
      return { ...response, color, isLatest: index === 0 }; // Mark the first instance as the latest
    });
  
    return results;
  };
  
