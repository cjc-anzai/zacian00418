import React from "react";

const CommandArea = ({
  otherAreaVisible,
  opAreaVisible,
  myAreaVisible,
  opPokeState,
  myPokeState,
  getTrueText,
  pokeInfo,
  openBattleCmdArea,
  openChangeCmdArea,
  backCmd,
  battle,
  changeMyPoke,
  nextMyPoke,
}) => {
  return (
    <div className="cmd-text-area">
      {otherAreaVisible.text && (
        <div className="text-area">
          {opAreaVisible.text && <p>{getTrueText(opPokeState.text)}</p>}
          {myAreaVisible.text && <p>{getTrueText(myPokeState.text)}</p>}
        </div>
      )}

      {otherAreaVisible.actionCmd && (
        <div className="cmd-area">
          <button className="weapon-cmd-btn" onClick={openBattleCmdArea}>たたかう</button>
          {myPokeState.life !== 1 && (
            <button className="change-cmd-btn" onClick={openChangeCmdArea}>交代</button>
          )}
        </div>
      )}

      {otherAreaVisible.weaponCmd && (
        <div className="cmd-area">
          <button
            className="weapon-cmd-btn"
            onClick={() => battle(pokeInfo[myPokeState.name].weapon1)}
          >
            {pokeInfo[myPokeState.name].weapon1}
          </button>
          <button
            className="weapon-cmd-btn"
            onClick={() => battle(pokeInfo[myPokeState.name].weapon2)}
          >
            {pokeInfo[myPokeState.name].weapon2}
          </button>
          <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
        </div>
      )}

      {otherAreaVisible.changeCmd && (
        <div className="cmd-area">
          {myPokeState.name !== myPokeState.poke1Name && myPokeState.poke1H > 0 && (
            <button className="change-cmd-btn" onClick={() => changeMyPoke(myPokeState.poke1Name)}>
              {myPokeState.poke1Name}
            </button>
          )}
          {myPokeState.name !== myPokeState.poke2Name && myPokeState.poke2H > 0 && (
            <button className="change-cmd-btn" onClick={() => changeMyPoke(myPokeState.poke2Name)}>
              {myPokeState.poke2Name}
            </button>
          )}
          {myPokeState.name !== myPokeState.poke3Name && myPokeState.poke3H > 0 && (
            <button className="change-cmd-btn" onClick={() => changeMyPoke(myPokeState.poke3Name)}>
              {myPokeState.poke3Name}
            </button>
          )}
          <button className="cancel-cmd-btn" onClick={backCmd}>戻る</button>
        </div>
      )}

      {otherAreaVisible.nextPokeCmd && (
        <div className="cmd-area">
          {myPokeState.name !== myPokeState.poke1Name && myPokeState.poke1H > 0 && (
            <button className="change-cmd-btn" onClick={() => nextMyPoke(myPokeState.poke1Name)}>
              {myPokeState.poke1Name}
            </button>
          )}
          {myPokeState.name !== myPokeState.poke2Name && myPokeState.poke2H > 0 && (
            <button className="change-cmd-btn" onClick={() => nextMyPoke(myPokeState.poke2Name)}>
              {myPokeState.poke2Name}
            </button>
          )}
          {myPokeState.name !== myPokeState.poke3Name && myPokeState.poke3H > 0 && (
            <button className="change-cmd-btn" onClick={() => nextMyPoke(myPokeState.poke3Name)}>
              {myPokeState.poke3Name}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommandArea;
