import { typeColors, conditionColors, getPokeIndicatorsColor } from "../../../model/model";

const StatusBox = ({
    isMe,
    battleState,
    battleHandlers,
}) => {

    //インポートする変数や関数の取得
    const { myPokeState,} = battleState;
    const { getMaxHp, getPokeState, getAreaVisible, getPokeCondition } = battleHandlers;

    const [pokeState, areaVisible] = [getPokeState(isMe, true), getAreaVisible(isMe, true)];
    const MaxHp = getMaxHp(pokeState, pokeState.name);
    const who = isMe ? "my" : "op";
    const pokeCondition = getPokeCondition(isMe);
    

    return (
        <div className="status-box" style={{ display: areaVisible.poke ? "block" : "none" }}>
            <div className="status-header">
                <h1 className={`${who}-poke`}>
                    <span>{pokeState.name}</span>
                    <span className="type-wrapper">
                        {pokeCondition !== "" && (
                            <span
                                className="condition"
                                style={{ backgroundColor: conditionColors[pokeCondition], borderColor: conditionColors[pokeCondition] }}
                            >
                                {pokeCondition}
                            </span>
                        )}
                    </span>
                </h1>
                <div className="poke-indicators">
                    {[0, 1, 2].map((index) => {
                        const currentHp = pokeState[`poke${index + 1}Hp`];
                        const MaxHp = pokeState[`poke${index + 1}MaxHp`];
                        const color = getPokeIndicatorsColor(currentHp, MaxHp);
                        return <div key={index} className={`poke-circle ${color}`}></div>;
                    })}
                </div>
            </div>
            <div className={`${who}-hp-container`}>
                <div className={`${who}-hp-bar`}></div>
                {isMe && (
                    <span className="hp-text">
                        {Math.round(myPokeState.hp)} / {MaxHp}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatusBox;
