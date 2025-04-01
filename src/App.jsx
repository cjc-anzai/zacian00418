import zacian from "./assets/zacian.jfif";
import "./App.css";

function App() {
  // const technique = () => {
  //   alert("きょじゅうざん");
  // };

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