import "./App.css";
import TopScreen from './components/TopScreen';
import SelectScreen from "./components/SelectScreen";
import BattleArea from "./components/BattleArea";
import CommandArea from "./components/CommandArea";
import ResultScreen from "./components/ResultScreen";
import { useBattleState } from "./controller/useBattleState";
import { useBattleHandlers } from "./controller/useBattleHandlers";
import { useBattleEffects } from "./controller/useBattleEffects";
import { pokeImgs, pokeInfo } from "./model/model";

function App() {

  const battleState = useBattleState();
  const battleHandlers = useBattleHandlers(battleState);
  useBattleEffects(battleState); 

  //HTML==========================================================================================================================
  return (
    <div className="App">
      <header className="App-header">
        {battleState.otherAreaVisible.top && <TopScreen onStart={battleHandlers.start} />}
        {battleState.otherAreaVisible.isSelecting && (
          <SelectScreen
            pokeImgs={pokeImgs}
            selectedOrder={battleState.selectedOrder}
            handleSelect={battleHandlers.handleSelect}
            confirmSelection={battleHandlers.confirmSelection}
          />
        )}
        {battleState.otherAreaVisible.battle && (
          <div className="battle-area-wrap">
            <BattleArea
              opPokeState={battleState.opPokeState}
              myPokeState={battleState.myPokeState}
              opAreaVisible={battleState.opAreaVisible}
              myAreaVisible={battleState.myAreaVisible}
            />
            <CommandArea
              otherAreaVisible={battleState.otherAreaVisible}
              opAreaVisible={battleState.opAreaVisible}
              myAreaVisible={battleState.myAreaVisible}
              opPokeState={battleState.opPokeState}
              myPokeState={battleState.myPokeState}
              getTrueText={battleHandlers.getTrueText}
              pokeInfo={pokeInfo}
              openBattleCmdArea={battleHandlers.openBattleCmdArea}
              openChangeCmdArea={battleHandlers.openChangeCmdArea}
              backCmd={battleHandlers.backCmd}
              battle={battleHandlers.battle}
              changeMyPoke={battleHandlers.changeMyPoke}
              nextMyPoke={battleHandlers.nextMyPoke}
            />
          </div>
        )}
        {!battleState.otherAreaVisible.top && !battleState.otherAreaVisible.isSelecting && !battleState.otherAreaVisible.battle && (
          <ResultScreen resultText={battleState.resultText} goTop={battleHandlers.goTop} />
        )}
      </header>
    </div>
  );
}

export default App;