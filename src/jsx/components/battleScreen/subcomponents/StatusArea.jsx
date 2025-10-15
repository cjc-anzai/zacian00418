import { typeColors } from "../../../../js/constants";

const StatusArea = ({
  isMe, battleStates, battleExecutors
}) => {

  const { myPokeBuff, opPokeBuff } = battleStates;
  const { getBattlePokeStatics } = battleExecutors;

  const battlePokeStatics = getBattlePokeStatics(isMe);
  const pokeBuff = isMe ? myPokeBuff : opPokeBuff;

  //ステータス画面の表示内容
  const StatusRow = ({ label, value }) => (
    <div className="status-row">
      <p className="label">{label}</p>
      <p className="colon">：</p>
      <div className="buff-row">
        {renderBuffShapes(value)}
      </div>
    </div>
  );

  //ステータス状況をUIに反映させる
  const renderBuffShapes = (value) => {
    const max = 6;
    const up = Math.max(0, value);
    const down = Math.max(0, -value);
    const neutral = max - up - down;
    const shapes = [];
    for (let i = 0; i < up; i++) {
      shapes.push(<span className="shape up" key={`up-${i}`}></span>);
    }
    for (let i = 0; i < down; i++) {
      shapes.push(<span className="shape down" key={`down-${i}`}></span>);
    }
    for (let i = 0; i < neutral; i++) {
      shapes.push(<span className="shape neutral" key={`neutral-${i}`}></span>);
    }
    return shapes;
  }

  return (
    <div className="status">
      <div className="poke-name-type">
        <p className="poke-name">{battlePokeStatics.name}</p>
        <p
          className="type"
          style={{ backgroundColor: typeColors[battlePokeStatics.type1], borderColor: typeColors[battlePokeStatics.type1] }}
        >
          {battlePokeStatics.type1}
        </p>
        {battlePokeStatics.type2 !== "なし" && (
          <p
            className="type"
            style={{ backgroundColor: typeColors[battlePokeStatics.type2], borderColor: typeColors[battlePokeStatics.type2] }}
          >
            {battlePokeStatics.type2}
          </p>
        )}
      </div>
      <StatusRow label="攻撃" value={pokeBuff.a} />
      <StatusRow label="防御" value={pokeBuff.b} />
      <StatusRow label="特攻" value={pokeBuff.c} />
      <StatusRow label="特防" value={pokeBuff.d} />
      <StatusRow label="素早さ" value={pokeBuff.s} />
    </div>
  );
};

export default StatusArea;
