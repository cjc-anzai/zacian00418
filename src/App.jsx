import "./App.css";
import TopScreen from './components/TopScreen';
import SelectScreen from "./components/SelectScreen";
import BattleArea from "./components/battleArea/BattleArea";
import ResultScreen from "./components/ResultScreen";
import { useBattleState } from "./controller/useBattleState";
import { useBattleEffects } from "./controller/useBattleEffects";
import { useBattleHandlers } from "./controller/useBattleHandlers";

function App() {

  const battleState = useBattleState();
  useBattleEffects(battleState);
  const battleHandlers = useBattleHandlers(battleState);

  return (
    <div className="App">
      <header className="App-header">
        {battleState.otherAreaVisible.top && (
          <TopScreen
            battleHandlers={battleHandlers}
            setOtherAreaVisible={battleState.setOtherAreaVisible}
          />
        )}
        {battleState.otherAreaVisible.select && (
          <SelectScreen
            battleState={battleState}
            battleHandlers={battleHandlers}
          />
        )}
        {battleState.otherAreaVisible.battle && (
          <div className="battle-area-wrap">
            <BattleArea
              battleState={battleState}
              battleHandlers={battleHandlers}
            />
          </div>
        )}
        {!battleState.otherAreaVisible.top && !battleState.otherAreaVisible.select && !battleState.otherAreaVisible.battle && (
          <ResultScreen
            resultText={battleState.resultText}
            initializeState={battleHandlers.initializeState}
          />
        )}
      </header>
    </div>
  );
}

export default App;