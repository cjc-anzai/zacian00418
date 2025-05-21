import { typeColors, getPokeIndicatorsColor } from "../../../model/model";

const StatusBox = ({
    who,
    battleState,
    battleHandlers,
}) => {

    //インポートする変数や関数の取得
    const { opPokeState, myPokeState, opAreaVisible, myAreaVisible, } = battleState;
    const { getMaxHp } = battleHandlers;

    const isMy = who === "my";
    const areaVisible = isMy ? myAreaVisible : opAreaVisible;
    const pokeState = isMy ? myPokeState : opPokeState;

    const MaxHp = getMaxHp(pokeState);

    return (
        <div className="status-box" style={{ display: areaVisible.poke ? "block" : "none" }}>
            <div className="status-header">
                <h1 className={`${who}-poke`}>
                    <span>{pokeState.name}</span>
                    <span className="type-wrapper">
                        <span
                            className="type-box"
                            style={{ backgroundColor: typeColors[pokeState.type1], borderColor: typeColors[pokeState.type1] }}
                        >
                            {pokeState.type1}
                        </span>
                        {pokeState.type2 !== "なし" && (
                            <span
                                className="type-box"
                                style={{ backgroundColor: typeColors[pokeState.type2], borderColor: typeColors[pokeState.type2] }}
                            >
                                {pokeState.type2}
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
                {isMy && (
                    <span className="hp-text">
                        {Math.round(myPokeState.hp)} / {MaxHp}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatusBox;
