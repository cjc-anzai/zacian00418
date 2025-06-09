import PokeArea from "./subcomponents/PokeArea";
import StatusBox from "./subcomponents/StatusBox";
import CommandArea from "./subcomponents/CommandArea";

const BattleArea = ({
  battleState,
  battleHandlers,
}) => {

  return (
    <div className="battle-area-wrap">
      <div className="battle-area" style={{ display: "flex" }}>
        {/* 相手のポケモンエリア */}
        <div className="op-poke-area-wrap">
          <PokeArea
            isMe={false}
            battleState={battleState}
            battleHandlers={battleHandlers}
          />
          <StatusBox
            isMe={false}
            battleState={battleState}
            battleHandlers={battleHandlers}
          />
        </div>

        {/* 自分のポケモンエリア */}
        <div className="my-poke-area-wrap">
          <PokeArea
            isMe={true}
            battleState={battleState}
            battleHandlers={battleHandlers}
          />
          <StatusBox
            isMe={true}
            battleState={battleState}
            battleHandlers={battleHandlers}
          />
        </div>
      </div>
      <CommandArea
        battleState={battleState}
        battleHandlers={battleHandlers}
      />
    </div>
  );
};

export default BattleArea;
