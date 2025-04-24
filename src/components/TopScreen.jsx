const TopScreen = ({ onStart }) => {
    return (
      <div className="top-screen">
        <h1>ポケモンバトル</h1>
        <button onClick={onStart}>スタート</button>
      </div>
    );
  };
  
  export default TopScreen;