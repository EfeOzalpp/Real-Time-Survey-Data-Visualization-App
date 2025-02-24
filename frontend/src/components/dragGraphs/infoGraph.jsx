const SimpleComponent = () => {
  return (
    <div>
      <div className="text-divider">
        <h1 className="title-divider">Where Do You Belong?</h1>
        <p>Governments set policies. Activists push for urgency. But real <u>change</u>? It happens where our choices shape the future.</p>
        </div>
      <div className="main-graph-divider">
      <div className="divider">
        <div className="dot dot-red"></div>
        <div className="dot-text">
          <h4>Red</h4>
          <p>Living large, wasting more—believe it or not, this adds up.</p>
        </div>
      </div>
      <div className="divider">
        <div className="dot dot-yellow"></div>
        <div className="dot-text">
          <h4>Yellow</h4>
          <p>Trying, but still stuck in old habits-believe in you.</p>
        </div>
      </div>
      <div className="divider">
        <div className="dot dot-green"></div>
        <div className="dot-text">
          <h4>Green</h4>
          <p>Making moves that actually matter, thanks for being mindful.</p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default SimpleComponent;
