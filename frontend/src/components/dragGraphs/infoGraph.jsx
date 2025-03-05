const SimpleComponent = () => {
  return (
    <div>
      <div className="text-divider">
        <h1 className="title-divider">Where Do You Belong?</h1>
        <p>Governments may set policies. But <u>change</u> happens in the choices we make every day.</p>
        </div>
      <div className="main-graph-divider">
      <div className="divider">
        <div className="dot dot-red"></div>
        <div className="dot-text">
          <h4>Red</h4>
          <p>Maybe there's room to throw in a little green?</p>
        </div>
      </div>
      <div className="divider">
        <div className="dot dot-yellow"></div>
        <div className="dot-text">
          <h4>Yellow</h4>
          <p>Old habits die hard. It's realistic thought.</p>
        </div>
      </div>
      <div className="divider">
        <div className="dot dot-green"></div>
        <div className="dot-text">
          <h4>Green</h4>
          <p>Well, you're a natural, keep at it.</p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default SimpleComponent;
