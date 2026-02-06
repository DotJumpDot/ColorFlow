import React from 'react';

const CSSClassesSimple: React.FC = () => {
  return (
    <div>
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
