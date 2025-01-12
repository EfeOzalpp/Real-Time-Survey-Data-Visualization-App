import client from './sanityClient'; 

export const fetchSurveyData = (callback) => {
  const query = `
    *[_type == "userResponseTest"] | order(_createdAt desc) {
      _id,
      question1,
      question2,
      question3,
      question4,
      question5
    }
  `;

  let subscription;

  client.fetch(query).then((initialData) => {
    callback([...initialData]);

    subscription = client.listen(query).subscribe({
      next: (update) => {
        const { transition, result, documentId } = update;

        if (transition === 'appear' && result) {
          callback((prevData) => [result, ...prevData]);
        } else if (transition === 'disappear') {
          callback((prevData) =>
            prevData.filter((doc) => doc._id !== documentId)
          );
        } else if (transition === 'update' && result) {
          callback((prevData) =>
            prevData.map((doc) => (doc._id === documentId ? result : doc))
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
