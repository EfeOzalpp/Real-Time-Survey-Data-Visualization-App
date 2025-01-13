import client from './sanityClient';

// Define rewiring rules for each question
const answerRewiring = {
  question1: { A: 0, B: 0.5, C: 1 }, // A = good, B = neutral, C = bad
  question2: { C: 0, A: 0.5, B: 1 }, // C = good, A = neutral, B = bad
  question3: { C: 0, A: 0.5, B: 1 }, // C = good, A = neutral, B = bad
  question4: { A: 0, B: 0.5, C: 1 }, // A = good, B = neutral, C = bad
  question5: { A: 0, B: 0.5, C: 1 }, // A = good, B = neutral, C = bad
};

// Normalize the answers using rewiring rules
const normalizeAnswers = (response) => {
  const normalized = {};
  Object.keys(answerRewiring).forEach((questionKey) => {
    const answer = response[questionKey];
    normalized[questionKey] = answerRewiring[questionKey][answer] ?? 0.5; // Default to neutral if undefined
  });
  return normalized;
};

// Fetch and process survey data from Sanity
export const fetchSurveyData = (callback) => {
  const query = `
    *[_type == "userResponse"] | order(_createdAt desc) {
      _id,
      question1,
      question2,
      question3,
      question4,
      question5, // Include question5 in the query
      submittedAt
    }
  `;

  let subscription;

  client.fetch(query).then((initialData) => {
    const processedData = initialData.map((response) => ({
      ...response,
      weights: normalizeAnswers(response), // Add rewired weights
    }));

    callback(processedData);

    // Subscribe for real-time updates
    subscription = client.listen(query).subscribe({
      next: (update) => {
        const { transition, result, documentId } = update;

        if (transition === 'appear' && result) {
          const normalizedResult = {
            ...result,
            weights: normalizeAnswers(result), // Normalize the new result
          };

          callback((prevData) => {
            const exists = prevData.some((doc) => doc._id === normalizedResult._id);
            if (!exists) {
              return [normalizedResult, ...prevData];
            }
            return prevData;
          });
        } else if (transition === 'disappear') {
          callback((prevData) => prevData.filter((doc) => doc._id !== documentId));
        } else if (transition === 'update' && result) {
          const normalizedResult = {
            ...result,
            weights: normalizeAnswers(result), // Normalize the updated result
          };

          callback((prevData) =>
            prevData.map((doc) => (doc._id === documentId ? normalizedResult : doc))
          );
        }
      },
      error: (err) => console.error('Error listening for updates:', err),
    });
  });

  return () => {
    if (subscription) {
      subscription.unsubscribe();
    }
  };
};
