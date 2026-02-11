import React from 'react';

const CSSClassesSimple = () => {
  return (
    <div>
      <style>{`
        .main-red { color: #ff0000; }
        .main-blue { color: #0000ff; }
        .main-green { color: #00ff00; }
        .sub-yellow { color: #ffff00; }
        .sub-purple { color: #800080; }
        .bg-orange { background-color: #ffa500; }
        .bg-cyan { background-color: #00ffff; }
      `}</style>
      <h1>CSS Classes Simple Example</h1>
      <div className="main-red">
        <h2>Main div with red color</h2>
        <div className="sub-yellow">
          <p>Sub div with yellow color</p>
        </div>
        <div className="sub-purple">
          <p>Sub div with purple color</p>
        </div>
      </div>
      <div className="main-blue">
        <h2>Main div with blue color</h2>
        <div className="sub-yellow">
          <p>Sub div with yellow color</p>
        </div>
      </div>
      <div className="main-green">
        <h2>Main div with green color</h2>
        <div className="sub-purple">
          <p>Sub div with purple color</p>
        </div>
      </div>
      <div className="bg-orange">
        <h2>Div with orange background</h2>
        <p>Text inside orange background div</p>
      </div>
      <div className="bg-cyan">
        <h2>Div with cyan background</h2>
        <p>Text inside cyan background div</p>
      </div>
    </div>
  );
};

export default CSSClassesSimple;
