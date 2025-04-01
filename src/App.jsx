import zacian from "./assets/zacian.jfif";
import kyojuzan from "./assets/kyojuzan.gif"; 
import "./App.css";
import React, { useState } from "react";


function App() {
  const [isVisible, setIsVisible] = useState(false);

  const technique = () => {
    setIsVisible(true); 
  };


  return (
    <div className="App">
      <header className="App-header">
      {!isVisible &&<img src={zacian} className="zacian" alt="zacian" onClick={technique}/>}
      {isVisible && <img src={kyojuzan} alt="GIF Animation" className="visible-gif" />}

        <h1>ザシアン</h1>

      </header>
    </div>
  );
}

export default App;