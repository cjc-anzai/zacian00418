import { motion, AnimatePresence } from "framer-motion";
import { terastalImgList, } from "../../../model/model";

const BattleArea = ({
    isMe,
    battleState,
    battleHandlers,
}) => {

    //インポートする変数や関数の取得
    const { } = battleState;
    const { checkIsTerastal, getBattlePokeStatics, getAreaVisible } = battleHandlers;

    const areaVisible = getAreaVisible(isMe, true);
    const battlePokeStatics = getBattlePokeStatics(isMe);
    const isTerastal = checkIsTerastal(isMe);
    const who = isMe ? "my" : "op";

    return (
        <div className={`${who}-poke-area`}>
            <div className="terastal-img-area">
                {areaVisible.poke && isTerastal && (
                    <img
                        src={terastalImgList[battlePokeStatics.terastal]}
                        alt={`${battlePokeStatics.terastal}テラスタル`}
                        className="terastal-img"
                    />
                )}
            </div>
            <div className="poke-img-area">
                <AnimatePresence>
                    {areaVisible.poke && (
                        <motion.img
                            key={`${who}PokeImg`}
                            src={battlePokeStatics.img}
                            alt="ポケモン画像"
                            className={`${who}-poke-img`}
                            initial={{ clipPath: "circle(0% at 50% 50%)" }}
                            animate={{ clipPath: "circle(75% at 50% 50%)" }}
                            exit={{ clipPath: "circle(0% at 50% 50%)" }}
                            transition={{ duration: 0.5 }}
                        />
                    )}
                </AnimatePresence>
            </div>
            <div className="poke-ground"></div>
        </div>
    );

};

export default BattleArea;