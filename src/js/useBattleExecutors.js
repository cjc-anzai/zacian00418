import { soundList, compatiTexts, typeChart } from "./constants";

export function useBattleExecutors(battleState) {

    //インポートの取得===========================================================
    const {
        setAreaVisible,
        mySelectedOrder,
        isTerastalActive,
        myTextRef, opTextRef, otherTextRef, textAreaRef,
        myLife, opLife,
        opTerastalFlg,
        mySelectedWeaponInfo, opSelectedWeaponInfo,
        burned, poisoned,
        myPoisonedCnt, opPoisonedCnt,
        healHp,
        iAmFirst, myChangeTurn, opChangeTurn,
        turnCnt,
        loopAudioRef,
        cantMoveFlg,
        myPokeStatics, opPokeStatics,
        myWeapons, opWeapons,
        myBattlePokeIndex, setMyBattlePokeIndex,
        opBattlePokeIndex, setOpBattlePokeIndex,
        myPokeDynamics, opPokeDynamics,
        setMyPokeDynamics, setOpPokeDynamics,
        damage, newHp,
        myTerastalState, opTerastalState,
        setMyTerastalState, setOpTerastalState,
        myChangePokeIndex, opChangePokeIndex,
        isIncident,
        myPokeBuff, opPokeBuff, setMyPokeBuff, setOpPokeBuff,
        moveFailed,
        atcPokeInfo, defPokeInfo,
        secondaryTextRef, newBuff,
        multiplierRef,
        setMySelectedOrder,
        setIsTerastalActive,
        defaultBattlePokeInfo,
    } = battleState;

    const playBgm = (kind) => {
        if (loopAudioRef.current) stopBgm();
        const bgm = soundList.bgm[kind];
        bgm.volume = 0.25;
        bgm.loop = true;
        loopAudioRef.current = bgm;
        loopAudioRef.current.play();
    }

    //選出順の配列を更新する関数
    const selectMyPokeOrder = (pokeName) => {
        setMySelectedOrder((prev) => {
            if (prev.includes(pokeName)) {
                return prev.filter((name) => name !== pokeName);
            }
            if (prev.length < 3) {
                return [...prev, pokeName];
            }
            return prev;
        });
    }

    //相手の選出を返す
    const selectOpPokeOrder = async (opPokeNames, how) => {
        let opSelectedOrder = [];
        if (how === "hard") {
            //ハードモード(相手は自分が選択した３体に対して相性の良い３体を選ぶ)
            const [myPokeInfos, opPokeInfos] = await Promise.all([
                Promise.all(mySelectedOrder.map(name => getPokeInfo(name))),
                Promise.all(opPokeNames.map(name => getPokeInfo(name)))
            ]);
            opSelectedOrder = selectOpPokeOrderLogic(myPokeInfos, opPokeInfos);
        } else {
            //テスト用で相手の選出を固定  
            opSelectedOrder = ["エレキブル", "グライオン", "ラプラス"];
        }
        return opSelectedOrder;
    }

    const setBattleStartData = async (opPokesKanaName) => {
        const opSelectedOrder = await selectOpPokeOrder(opPokesKanaName, "hard");
        const { myPokeInfos, opPokeInfos } = await getPokeInfos(opSelectedOrder);
        const { myWeaponInfos, opWeaponInfos } = await getWeaponInfos(myPokeInfos, opPokeInfos);
        setPokeInfos(myPokeInfos, opPokeInfos);
        setWeaponInfos(myWeaponInfos, opWeaponInfos);
        setBattlePokeIndex(true, 0);
    }

    const getWeaponInfoList = (weaponIndex) => {
        const [type, kind, power, hitrate, priority] = [
            myWeapons.current[myBattlePokeIndex][weaponIndex].type,
            myWeapons.current[myBattlePokeIndex][weaponIndex].kind,
            myWeapons.current[myBattlePokeIndex][weaponIndex].power,
            myWeapons.current[myBattlePokeIndex][weaponIndex].hitrate,
            myWeapons.current[myBattlePokeIndex][weaponIndex].priority,
        ];
        return { type, kind, power, hitrate, priority };
    }

    // 相性倍率を求めて、相性テキストを返す
    const getCompatiTextForWeaponInfoList = (weaponType, defType1, defType2) => {
        const multiplier = calcMultiplier(weaponType, defType1, defType2)
        let compatiText = "";
        if (!multiplier) {
            compatiText = "効果なし";
        } else if (multiplier < 1) {
            compatiText = "いまひとつ";
        } else if (multiplier === 1) {
            compatiText = "効果あり";
        } else {
            compatiText = "効果ばつぐん";
        }
        return compatiText;
    }

    //ポケインジケータの色を取得する
    const getPokeIndicatorsColor = (currentHp, MaxHp) => {
        let color = "gray";
        if (currentHp === MaxHp) {
            color = "green";
        } else if (currentHp > 0) {
            color = "yellow";
        }
        return color;
    }

    const playTerastalBtnSound = () => {
        if (isTerastalActive) {
            soundList.general.cancel.cloneNode().play();
        } else {
            soundList.general.terastal.cloneNode().play();
        }
    }

    //素早さ等を比較して先攻後攻を決める
    const setIAmFirst = () => {
        const [myPokeSpeed, opPokeSpeed] = [calcActualStatus(true, "s"), calcActualStatus(false, "s")];

        if (!myChangeTurn.current && !opChangeTurn.current) {
            const [myWeaponPriority, opWeaponPriority] = [mySelectedWeaponInfo.current.priority, opSelectedWeaponInfo.current.priority];
            if (myWeaponPriority === opWeaponPriority) {
                if (myPokeSpeed !== opPokeSpeed) {
                    iAmFirst.current = myPokeSpeed > opPokeSpeed;
                } else {
                    iAmFirst.current = Math.random() < 0.5;
                    console.log(`同速のためランダムで${iAmFirst.current ? "先攻" : "後攻"}になった`);
                }
            } else {
                iAmFirst.current = myWeaponPriority > opWeaponPriority;
                console.log(`技の優先度差で${iAmFirst.current ? "先攻" : "後攻"}`);
            }
        } else {
            if (myChangeTurn.current !== opChangeTurn.current) {
                iAmFirst.current = myChangeTurn.current;
            } else {
                iAmFirst.current = myPokeSpeed >= opPokeSpeed;
            }
        }
        console.log(`${myPokeStatics.current[myBattlePokeIndex].name}の素早さ：${myPokeSpeed}\n${opPokeStatics.current[opBattlePokeIndex].name}の素早さ：${opPokeSpeed}\n`);
    }

    const setChangeTurn = (isMe, index) => {
        const changeTurn = isMe ? myChangeTurn : opChangeTurn;
        const changePokeIndex = isMe ? myChangePokeIndex : opChangePokeIndex;
        changeTurn.current = true;
        changePokeIndex.current = index;
    }

    const initializePokeBuff = (isMe) => {
        const setPokeBuff = isMe ? setMyPokeBuff : setOpPokeBuff;
        setPokeBuff({ a: 0, b: 0, c: 0, d: 0, s: 0 });
    }

    const initializePoisonedCnt = (isMe) => {
        const poisonedCnt = isMe ? myPoisonedCnt : opPoisonedCnt;
        poisonedCnt.current = 1;
    }

    //ポケモン登場の表示制御
    const processPokeAppearance = async (isMe) => {
        const textRef = getTextRef(isMe);
        setTextRef(isMe, "go");
        setAreaVisible(prev => ({ ...prev, textArea: true }));                                          //Goテキストの表示
        delay(() => textAreaRef.current.textContent = textRef.current.content, 1);
        delay(() => setAreaVisible(prev => ({ ...prev, [isMe ? "myPoke" : "opPoke"]: true })), 1000);   //ポケモンの表示
        delay(async () => await playPokeVoice(isMe), 1000);                                             //鳴き声再生
        await stopProcessing(2000);
    };

    const initializeChangePokeIndex = (isMe) => {
        if (isMe) {
            myChangePokeIndex.current = null;
        } else {
            opChangePokeIndex.current = null;
        }
    }

    const setBattlePokeIndex = (isMe, pokeIndex) => {
        const setBattlePokeIndex = isMe ? setMyBattlePokeIndex : setOpBattlePokeIndex;
        setBattlePokeIndex(pokeIndex);
    }

    const processPokeChange = async (isMe) => {
        const changePokeIndex = isMe ? myChangePokeIndex : opChangePokeIndex;
        setTextRef(isMe, "back");
        soundList.general.back.cloneNode().play();
        await displayTextArea(isMe, 1000);
        setAreaVisible(prev => ({ ...prev, [isMe ? "myPoke" : "opPoke"]: false }));
        await stopProcessing(1000);
        setBattlePokeIndex(isMe, changePokeIndex.current);
    }

    //HPバーの幅や色の制御
    const adjustHpBar = (isMe, kind) => {
        const maxHp = getBattlePokeStatics(isMe).hp;
        const currentHp = getBattlePokeDynamics(isMe).currentHp;
        if (kind === "appearance") {
            newHp.current = Math.max(currentHp);
        } else if (kind === "damage") {
            newHp.current = Math.max(0, currentHp - damage.current);
        } else if (kind === "heal") {
            newHp.current = Math.min(maxHp, currentHp + healHp.current);
        }
        const hpBarElem = document.querySelector(isMe ? ".my-hp-bar" : ".op-hp-bar");
        const hpPrcent = Math.round((newHp.current / maxHp) * 100);
        hpBarElem.style.width = `${hpPrcent}%`;
        hpBarElem.classList.remove("low", "mid");
        if (hpPrcent <= 25) {
            hpBarElem.classList.add("low");
        } else if (hpPrcent <= 50) {
            hpBarElem.classList.add("mid");
        }
    }

    const processTerastal = async (isMe) => {
        setTextRef(isMe, "terastal");
        const battlePokeIndex = getBattlePokeIndex(isMe);
        const setTerastalState = isMe ? setMyTerastalState : setOpTerastalState;
        await displayTextArea(isMe, 1000);
        setTerastalState(prev => ({ ...prev, canTerastal: false, terastalPokeNum: battlePokeIndex }));
    }

    const processTurnEnd = async () => {
        await stopProcessing(2000);
        await setConstantDamage();

        if (!burned.current && !poisoned.current &&
            myPokeDynamics[myBattlePokeIndex].currentHp > 0 && opPokeDynamics[opBattlePokeIndex].currentHp > 0) {
            initializeTurnEnd();
            setAreaVisible(prev => ({ ...prev, textArea: false, actionCmd: true }));
        }
    }

    const consolePokeHp = (isMe) => {
        const battlePokeStatics = getBattlePokeStatics(isMe);
        const battlePokeDynamics = getBattlePokeDynamics(isMe);
        console.log(`${battlePokeStatics.name}\n残HP：${battlePokeDynamics.currentHp}\n最大HP：${battlePokeStatics.hp}`);
    }

    //指定した時間、テキストエリアを表示する
    const displayTextArea = async (who, stopTime) => {
        const textRef = who === "other" ? otherTextRef : getTextRef(who);

        await stopProcessing(100);
        setAreaVisible(prev => ({ ...prev, textArea: true }));
        delay(() => textAreaRef.current.textContent = textRef.current.content, 1);
        await stopProcessing(stopTime);
    };

    const processConstantDamageText = async (isMe) => {
        const pokeName = getBattlePokeStatics(isMe).name;
        const word = burned.current ? "やけど" : "毒";
        const text = `${pokeName}は${word}のダメージを受けた`;
        otherTextRef.current = { kind: "constant", content: text };
        await displayTextArea("other", 1500);
    }

    const stopProcessing = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 相手が、自分のタイプ一致技で抜群をとられるかの真偽と危険/安全タイプを返す
    const checkDangerous = () => {
        const myBattlePokeStatics = myPokeStatics.current[myBattlePokeIndex];
        const opBattlePokeStatics = opPokeStatics.current[opBattlePokeIndex];
        const [myPokeType1, myPokeType2, myTerastal] = [myBattlePokeStatics.type1, myBattlePokeStatics.type2, myBattlePokeStatics.terastal];
        const [opPokeType1, opPokeType2, opTerastal] = [opBattlePokeStatics.type1, opBattlePokeStatics.type2, opBattlePokeStatics.terastal];
        const [myTerastalFlg, opTerastalFlg] = [checkIsTerastal(true), checkIsTerastal(false)];
        const terastalType = myTerastalFlg ? myTerastal : null;

        const [val11, val12] = opTerastalFlg
            ? getCompati(myPokeType1, myPokeType2, opTerastal, "なし")
            : getCompati(myPokeType1, myPokeType2, opPokeType1, opPokeType2);
        const val13 = myTerastalFlg
            ? calcMultiplier(terastalType, opPokeType1, opPokeType2) : null;

        // 自分のポケモンのタイプを相手目線で危険と安全に仕分け
        const [dangerousType, safeType] = [[], []];
        if (val11 >= 2) {
            dangerousType.push(myPokeType1);
        } else {
            safeType.push(myPokeType1);
        }
        if (val12 >= 2) {
            dangerousType.push(myPokeType2);
        } else {
            safeType.push(myPokeType2);
        }
        const IsDangerousTerastal = val13 >= 2;

        return { dangerousType, safeType, terastalType, IsDangerousTerastal };
    };

    //相手はバトルポケモンを交換する場合、refにセットする
    const checkOpChanging = (dangerousType, safeType, IsDangerousTerastal, terastalType) => {
        //生存している相手の控えポケモン情報を取得する
        const aliveBenchPokeIndex = getAliveBenchPokeIndex(false);
        if (!aliveBenchPokeIndex.length) return;
        selectOpChangePoke(aliveBenchPokeIndex, dangerousType, safeType, IsDangerousTerastal, terastalType);
        opChangeTurn.current = opChangePokeIndex.current !== null;
        console.log(`相手は相性が悪い${opChangePokeIndex.current ? "ため交代する" : "が交代できるポケモンがいない"}`);
    }

    //テラス判断　テラスする場合フラグを立てる
    const checkOpTerastal = async (isDangerous) => {
        const opBattlePokeStatics = opPokeStatics.current[opBattlePokeIndex];
        let debugText = "";
        if (isDangerous && !opChangeTurn.current) {
            const { cnt1, cnt2 } = await calcDefinitelyEndureHits();    //テラス前後の確定耐え数
            if (cnt1 < cnt2) {
                opTerastalFlg.current = true;
                debugText = "相手は耐性を強めるためにテラスタルする";
            }
        } else if (!isDangerous) {
            const { cnt1, cnt2 } = await calcDefinitelyDefeatHits();    //テラス前後の確定数

            //相手がテラスタルしたときの、自分のポケモンのタイプ一致技を受けた時の相性を取得
            const { strongType, anotherType } = await getMyStrongType();
            const [compati11, compati12] = getCompati(strongType, anotherType, opBattlePokeStatics.terastal, "なし");

            //テラスすることで確定数を減らせる場合 || 自分の最大打点の技を無効化できる場合　テラスタルフラグを立てる
            if ((cnt1 > cnt2) || (compati11 === 0 && compati12 <= 1)) {
                const aliveMyBenchPokes = getAliveBenchPokeIndex(true);
                if (aliveMyBenchPokes.length > 0) {
                    //テラス後に自分の控えポケモンからの相性を取得
                    const [compati21Teras, compati22Teras] = getCompati(myPokeStatics.current[aliveMyBenchPokes[0]].type1, myPokeStatics.current[aliveMyBenchPokes[0]].type2, opBattlePokeStatics.terastal, "なし");
                    const [compati31Teras, compati32Teras] = aliveMyBenchPokes.length === 2
                        ? getCompati(myPokeStatics.current[aliveMyBenchPokes[1]].type1, myPokeStatics.current[aliveMyBenchPokes[1]].type2, opBattlePokeStatics.terastal, "なし")
                        : [null, null];

                    //テラス前後の確定耐え数を取得
                    const { cnt2: cnt4 } = await calcDefinitelyEndureHits();
                    const cantWin = calcActualStatus(true, "s") > calcActualStatus(false, "s") && (cnt4 === 0 || cnt2 !== 1 && cnt4 <= 2);

                    //テラスしても、自分の控えから抜群を取られない場合で、自分の攻撃の前に倒される場合以外、テラスタルフラグを立てる
                    if (Math.max(compati21Teras, compati22Teras) <= 1 && (compati31Teras ? (Math.max(compati31Teras, compati32Teras) <= 1) : true) && !cantWin) {
                        opTerastalFlg.current = true;
                        debugText = (cnt1 > cnt2) ? "相手は攻撃力上昇のためにテラスタルする" : "相手は自分の攻撃を無効化するためにテラスタルする";
                    } else {
                        //テラスすると、自分の控えから抜群を取られる場合 && テラスせずとも抜群とられる場合、テラスタルフラグを立てる
                        const [compati21, compati22] = getCompati(myPokeStatics.current[aliveMyBenchPokes[0]].type1, myPokeStatics.current[aliveMyBenchPokes[0]].type2, opBattlePokeStatics.type1, opBattlePokeStatics.type2);
                        const [compati31, compati32] = aliveMyBenchPokes.length === 2
                            ? getCompati(myPokeStatics.current[aliveMyBenchPokes[1]].type1, myPokeStatics.current[aliveMyBenchPokes[1]].type2, opBattlePokeStatics.type1, opBattlePokeStatics.type2)
                            : [null, null];
                        if (Math.max(compati21, compati22) >= 2 || (compati31 ? (Math.max(compati31, compati32) >= 2) : true)) {
                            opTerastalFlg.current = true;
                            debugText = (cnt1 > cnt2) ? "相手は攻撃力上昇のためにテラスタルする" : "相手は自分の攻撃を無効化するためにテラスタルする";
                        }
                    }
                } else {
                    opTerastalFlg.current = true;
                    debugText = (cnt1 > cnt2) ? "相手は攻撃力上昇のためにテラスタルする" : "相手は自分の攻撃を無効化するためにテラスタルする";
                }
            }
        }
        console.log(opTerastalFlg.current ? debugText : "相手はテラスタルしない");
    }

    //相手目線で合理的な技を選択して返す
    const setOpBetterWeapon = async () => {
        const { strongestWeaponIndex, strongestWeaponDamage, strongestHighPriorityWeaponIndex, strongestHighPriorityWeaponDamage } = await getMostEffectiveWeapon();
        const myMaxDamage = await predictMyAction(1);
        const [myPokeHp, opPokeHp] = [myPokeDynamics[myBattlePokeIndex].currentHp, opPokeDynamics[opBattlePokeIndex].currentHp]
        const [myPokeSpeed, opPokeSpeed] = [calcActualStatus(true, "s"), calcActualStatus(false, "s")];

        if (strongestHighPriorityWeaponIndex) {
            //相手の方が遅く、自分の攻撃の最低乱数で、相手が倒れる時は先制技を選択する(無効の場合を除く)
            if (myPokeSpeed > opPokeSpeed && opPokeHp <= myMaxDamage && strongestHighPriorityWeaponDamage !== 0) {
                opSelectedWeaponInfo.current = opWeapons.current[opBattlePokeIndex][strongestHighPriorityWeaponIndex];
            } else if (strongestHighPriorityWeaponDamage >= myPokeHp) {
                //先制技(最低乱数)で自分を倒せる場合は先制技を選択する
                opSelectedWeaponInfo.current = opWeapons.current[opBattlePokeIndex][strongestHighPriorityWeaponIndex];
            } else {
                opSelectedWeaponInfo.current = opWeapons.current[opBattlePokeIndex][strongestWeaponIndex];
            }
        } else {
            opSelectedWeaponInfo.current = opWeapons.current[opBattlePokeIndex][strongestWeaponIndex];
        }
    }

    //バフ込みの実数値を取得する
    const calcActualStatus = (isMe, status) => {
        const battlePokeStatics = getBattlePokeStatics(isMe);
        const beforeStatus = battlePokeStatics[status];
        const pokeBuff = isMe ? myPokeBuff : opPokeBuff;
        const buff = pokeBuff[status];
        const buffMultiplier = buff > 0 ? buff * 0.5 + 1 : 2 / (2 - buff);
        let actualStatus = beforeStatus * buffMultiplier;

        const pokeCondition = getBattlePokeDynamics(isMe).condition;
        if (status === "s" && pokeCondition === "まひ") {
            actualStatus = Math.floor(actualStatus * 0.5);
        }
        return actualStatus;
    }

    const processTurnStart = async (atcIsMe) => {
        await stopProcessing(2000);
        setAtcDefPokeInfo(atcIsMe);
        setIsTerastalActive(false);
        opTerastalFlg.current = false;
        myTextRef.current = { kind: "", content: "" };
        opTextRef.current = { kind: "", content: "" };
        otherTextRef.current = { kind: "", content: "" };
        secondaryTextRef.current = { kind: "", content: "" };
        cantMoveFlg.current = false;
        moveFailed.current = false;
        multiplierRef.current = 1;
        damage.current = 0;
        newHp.current = 0;
        isIncident.current = false;
        newBuff.current = null;
        healHp.current = 0;
    }

    //状況ごとのテキストをセットする
    const setTextRef = (isMe, kind) => {
        const pokeName = getBattlePokeStatics(isMe).name;
        const textRef = getTextRef(isMe);
        let text = "";
        if (kind === "go") {
            text = isMe ? `ゆけ！${pokeName}！` : `相手は${pokeName}をくりだした！`;
        } else if (kind === "back") {
            text = `戻れ！${pokeName}！`;
        } else if (kind === "terastal") {
            text = isMe ? `${pokeName}！かがやけ！テラスタル！` : `相手の${pokeName}はテラスタルした！`;
        } else if (kind === "weapon") {
            const weaponName = atcPokeInfo.current.selectedWeapon.name;
            text = isMe ? `${pokeName}！${weaponName}！` : `相手の${pokeName}の${weaponName}`;
        } else if (kind === "compati") {
            const weaponType = (checkIsTerastal(!isMe) && atcPokeInfo.current.selectedWeapon.name === "テラバースト")
                ? atcPokeInfo.current.terastal
                : atcPokeInfo.current.selectedWeapon.type;
            const [defType1, defType2] = checkIsTerastal(isMe)
                ? [defPokeInfo.current.terastal, "なし"]
                : [defPokeInfo.current.type1, defPokeInfo.current.type2];
            multiplierRef.current = calcMultiplier(weaponType, defType1, defType2);
            if (atcPokeInfo.current.selectedWeapon.kind !== "変化") {
                text = multiplierRef.current >= 2 ? compatiTexts.batsugun
                    : multiplierRef.current === 1 ? ""
                        : multiplierRef.current > 0 ? compatiTexts.imahitotsu
                            : compatiTexts.mukou;
            } else {
                text = "";
            }
        } else if (kind === "dead") {
            text = isMe ? `${pokeName}は倒れた` : `相手の${pokeName}は倒れた`;
        }
        textRef.current = { kind, content: text };
    }

    const playConditionSe = (pokeCondition) => {
        let conditionSe = "";
        if (pokeCondition === "まひ") {
            conditionSe = "paralyzed";
        } else if (pokeCondition === "こおり") {
            conditionSe = "frozen";
        }
        soundList.general[conditionSe].play();
    }

    //ダメージ計算　ダメージ数/命中判定/急所判定　を返す
    const calcTrueDamage = (weaponInfo, atcInfo, defInfo) => {
        let trueDamage = 0;
        let realDamage = 0;
        const isHit = weaponInfo.hitRate ? Math.random() * 100 < weaponInfo.hitRate : true;    //命中判定
        let isCritical = false;

        if (weaponInfo.kind !== "変化") {
            if (isHit) {
                let { pureDamage, basicDamage, isSameTerastal, isSameType, multiplier, atcBuffMultiplier, defBuffMultiplier } = calcPureDamage(weaponInfo, atcInfo, defInfo);
                multiplierRef.current = multiplier;
                const randomMultiplier = Math.floor((Math.random() * 0.16 + 0.85) * 100) / 100;    //乱数 0.85~1.00
                isCritical = Math.random() < 0.0417 && multiplierRef.current;   //急所フラグ 4.17%で急所にあたる
                // isCritical = true;   //テスト用

                //急所に当たった際には攻撃系のデバフと防御系のバフを無視する
                if (isCritical) {
                    atcBuffMultiplier = atcBuffMultiplier >= 1 ? 1 : atcBuffMultiplier;
                    defBuffMultiplier = defBuffMultiplier <= 1 ? 1 : defBuffMultiplier
                    pureDamage = (pureDamage - 2) / atcBuffMultiplier * defBuffMultiplier + 2;
                    atcInfo.isBurned = false;
                }

                trueDamage = Math.floor(pureDamage * randomMultiplier);    // 乱数
                trueDamage = Math.floor(trueDamage * (isCritical ? 1.5 : 1));   //急所
                trueDamage = weaponInfo.kind === "物理" && atcInfo.isBurned ? Math.floor(trueDamage * 0.5) : trueDamage;  //やけど補正
                realDamage = trueDamage > defPokeInfo.current.currentHp ? defPokeInfo.current.currentHp : trueDamage;
                damage.current = realDamage;
                console.log(`${defPokeInfo.current.name}に${realDamage}ダメージ(${trueDamage})\n基礎ダメージ：${basicDamage}\n乱数：${randomMultiplier}\nタイプ一致：${isSameTerastal ? 2 : (isSameType ? 1.5 : 1)}\n相性：${multiplier}\n急所：${isCritical ? 1.5 : 1}\nやけど：${weaponInfo.kind === "物理" && atcInfo.isBurned ? 0.5 : 1}`);
            }
        }
        return { isHit, isCritical };
    }

    //追加効果を確認する
    const checkSecondaryEffect = (atcIsMe) => {
        const isSelfEffect = atcPokeInfo.current.selectedWeapon.effTarget === "自分";
        const isAtcWeapon = atcPokeInfo.current.selectedWeapon.kind !== "変化";
        const isAlive = defPokeInfo.current.currentHp - damage.current > 0;
        const isGameSet = (atcIsMe ? opLife : myLife).current === 1 && !isAlive;

        if (isIncident.current) {
            let effectiveness = atcPokeInfo.current.selectedWeapon.effectiveness;
            if (isSelfEffect) {
                effectiveness = isGameSet ? null : effectiveness;
                isIncident.current = !isGameSet;
            } else {
                effectiveness = isAlive ? effectiveness : null;
                isIncident.current = isAlive;
            }

            if (effectiveness) {
                const myEffectiveness = atcIsMe === isSelfEffect;
                const effTargetName = isSelfEffect ? atcPokeInfo.current.name : defPokeInfo.current.name;

                if (effectiveness.includes("buff")) {
                    const pokeBuff = myEffectiveness ? myPokeBuff : opPokeBuff;
                    const statusTextMap = { a: "攻撃", b: "防御", c: "特攻", d: "特防", s: "素早さ" };
                    let newBuffState = { ...pokeBuff };
                    let textArray = [`${effTargetName}の`];

                    effectiveness = effectiveness.slice(5);
                    for (let i = 0; i < effectiveness.length; i += 3) {
                        const status = effectiveness[i];
                        const buff = Number(effectiveness.slice(i + 1, i + 3));
                        const currentBuff = pokeBuff[status] ?? 0;
                        const clampedBuff = Math.max(-6, Math.min(6, currentBuff + buff));
                        const actualChange = clampedBuff - currentBuff;

                        let text1 = statusTextMap[status] || "不明";
                        let text2 = "";
                        if (actualChange !== 0) {
                            newBuffState[status] = clampedBuff;
                            text2 = actualChange > 0
                                ? actualChange >= 2 ? "がぐーんと上がった" : "が上がった"
                                : actualChange <= -2 ? "ががくっと下がった" : "が下がった"
                        } else {
                            text2 = buff > 0 ? "はこれ以上上がらない" : "はこれ以上下がらない";
                        }
                        textArray.push(`${text1}${text2}`);
                    }
                    const buffText = textArray.join("\n");
                    secondaryTextRef.current = { kind: "buff", content: buffText };
                    newBuff.current = newBuffState;

                } else if (effectiveness.includes("heal")) {
                    effectiveness = effectiveness.slice(5);
                    const target = effectiveness.slice(0, 1);
                    const ratio = effectiveness.slice(1);
                    const maxHp = atcPokeInfo.current.hp;
                    const currentHp = atcPokeInfo.current.currentHp;
                    const base = target === "h" ? maxHp : damage.current;
                    healHp.current = Math.floor(base * ratio);
                    healHp.current = currentHp + healHp.current < maxHp ? healHp.current : maxHp - currentHp;
                    const healText = healHp.current ? `${atcPokeInfo.current.name}の体力が回復した` : `しかしうまく決まらなかった`;
                    secondaryTextRef.current = { kind: "heal", content: healText };
                    moveFailed.current = target === "h" && healHp.current === 0;
                    isIncident.current = !(target === "d" && healHp.current === 0);

                } else if (effectiveness.includes("condition")) {
                    const condition = effectiveness.slice(10);

                    //既に状態異常になっているなら他の状態異常にならない
                    if (defPokeInfo.current.condition) {
                        moveFailed.current = true;
                        secondaryTextRef.current = { kind: "condition", content: isAtcWeapon ? "" : `しかしうまく決まらなかった` };
                    } else if (!multiplierRef.current) {
                        //無効タイプなら状態異常にならない。
                        secondaryTextRef.current = { kind: "condition", content: `${effTargetName}には効果がないようだ` };
                    } else if (condition === "まひ") {
                        if (checkIsTerastal(!atcIsMe) ? defPokeInfo.current.terastal === "でんき" : defPokeInfo.current.type1 === "でんき" || defPokeInfo.current.type2 === "でんき") {
                            moveFailed.current = true;
                            secondaryTextRef.current = { kind: "condition", content: `${effTargetName}には効果がないようだ` };
                        } else {
                            secondaryTextRef.current = { kind: "condition", content: `${defPokeInfo.current.name}はまひして技が出にくくなった` };
                        }
                    } else if (condition === "やけど") {
                        if (checkIsTerastal(!atcIsMe) ? defPokeInfo.current.terastal === "ほのお" : defPokeInfo.current.type1 === "ほのお" || defPokeInfo.current.type2 === "ほのお") {
                            moveFailed.current = true;
                            secondaryTextRef.current = { kind: "condition", content: `${effTargetName}には効果がないようだ` };

                        } else {
                            secondaryTextRef.current = { kind: "condition", content: `${effTargetName}はやけどを負った` };
                        }
                    } else if (condition.includes("どく")) {
                        const isBadlyPoisoned = condition === "もうどく";
                        if (checkIsTerastal(!atcIsMe) ? defPokeInfo.current.terastal === "どく" : defPokeInfo.current.type1 === "どく" || defPokeInfo.current.type2 === "どく" || defPokeInfo.current.type1 === "はがね" || defPokeInfo.current.type2 === "はがね") {
                            moveFailed.current = true;
                            secondaryTextRef.current = { kind: "condition", content: `${effTargetName}には効果がないようだ` };
                        } else {
                            secondaryTextRef.current = { kind: "condition", content: `${effTargetName}は${isBadlyPoisoned ? "猛" : ""}毒をあびた` };
                        }
                    } else if (condition === "こおり") {
                        if (checkIsTerastal(!atcIsMe) ? defPokeInfo.current.terastal !== "こおり" : defPokeInfo.current.type1 !== "こおり" || defPokeInfo.current.type2 !== "こおり") {
                            secondaryTextRef.current = { kind: "condition", content: `${effTargetName}は凍ってしまった` };
                        }
                    }

                    if (moveFailed.current && isAtcWeapon) {
                        isIncident.current = false;
                        moveFailed.current = false;
                        secondaryTextRef.current = { kind: "", content: "" };
                    }
                } else if (effectiveness === "ひるみ") {
                    if (atcIsMe === iAmFirst.current) {
                        secondaryTextRef.current = { kind: "cantMove", content: `${effTargetName}はひるんで動けない` };
                    } else {
                        isIncident.current = false;
                    }
                }
            }
        }
    }

    const jumpEffect = (isMe) => {
        const elem = getEffectElem(isMe);
        elem.classList.remove("jump");
        void elem.offsetWidth;
        elem.classList.add("jump");
        delay(() => elem.classList.remove("jump"), 400);
    }

    const attackEffectLogic = (isMe) => {
        const elem = getEffectElem(isMe);
        const attackClass = isMe ? "my-attack" : "op-attack";
        elem.classList.remove(attackClass);
        void elem.offsetWidth;
        elem.classList.add(attackClass);
        delay(() => elem.classList.remove(attackClass), 500);
    }

    const damageEffect = async (isMe) => {
        const elem = getEffectElem(isMe);
        elem.classList.add("pokemon-damage-effect");
        adjustHpBar(isMe, "damage");
        delay(() => elem.classList.remove("pokemon-damage-effect"), 1000);
        await new Promise((resolve) => {
            playDamageSound(resolve);
        });
    };

    const stopBgm = () => {
        loopAudioRef.current.pause();
        loopAudioRef.current.currentTime = 0;
    }

    //相手は自分のポケモンとの相性を考慮した、最適なポケモンを選択して返す
    const setNextOpPoke = () => {
        if (opLife.current === 2) {
            const myBattlePokeStatics = myPokeStatics.current[myBattlePokeIndex];
            const terastalType = checkIsTerastal(true) ? myBattlePokeStatics.terastal : null;
            const myPokeSpeed = calcActualStatus(true, "s");
            const opAliveBenchPokeIndex = getAliveBenchPokeIndex(false);

            console.log(`相手の残りのポケモンは\n${opPokeStatics.current[opAliveBenchPokeIndex[0]].name}と${opPokeStatics.current[opAliveBenchPokeIndex[1]].name}`);

            //お互いの相性を取得する
            const myToOp = opAliveBenchPokeIndex.map(op =>
                Math.max(
                    calcMultiplier(myBattlePokeStatics.type1, opPokeStatics.current[op].type1, opPokeStatics.current[op].type2),
                    calcMultiplier(myBattlePokeStatics.type2, opPokeStatics.current[op].type1, opPokeStatics.current[op].type2),
                    terastalType ? calcMultiplier(terastalType, opPokeStatics.current[op].type1, opPokeStatics.current[op].type2) : 0
                )
            );
            const opToMy = opAliveBenchPokeIndex.map(op =>
                Math.max(
                    terastalType
                        ? calcMultiplier(opPokeStatics.current[op].type1, terastalType, "なし")
                        : calcMultiplier(opPokeStatics.current[op].type1, myBattlePokeStatics.type1, myBattlePokeStatics.type2),
                    terastalType
                        ? calcMultiplier(opPokeStatics.current[op].type2, terastalType, "なし")
                        : calcMultiplier(opPokeStatics.current[op].type2, myBattlePokeStatics.type1, myBattlePokeStatics.type2),
                )
            );

            //自分から相手への相性が2体目も３体目も同じ場合、
            // 相手から自分への相性が良い方を選択する　相手から自分への相性がどちらも同じなら速い方を選択する
            if (myToOp[0] === myToOp[1]) {
                if (opToMy[0] !== opToMy[1]) {
                    opChangePokeIndex.current = opToMy[0] > opToMy[1] ? opAliveBenchPokeIndex[0] : opAliveBenchPokeIndex[1];
                } else {
                    const poke0Speed = opPokeStatics.current[opAliveBenchPokeIndex[0]].s;
                    const poke1Speed = opPokeStatics.current[opAliveBenchPokeIndex[1]].s;
                    opChangePokeIndex.current = poke0Speed > poke1Speed ? opAliveBenchPokeIndex[0] : opAliveBenchPokeIndex[1];
                }

                console.log(`自分のポケモンの${myBattlePokeStatics.name}に対しての受け相性はどちらも同じ
      ${opToMy[0] === opToMy[1] ? myBattlePokeStatics.name + "への攻め相性も同じため、より速い" + opPokeStatics.current[opChangePokeIndex.current].name + "を選択する" :
                        myBattlePokeStatics.name + "への攻め相性がより良い" + opPokeStatics.current[opChangePokeIndex.current].name + "を選択する"
                    }`
                );
            }

            //自分から相手への相性に差があるとき
            //相性が悪い方の速さが自分よりも速くて、自分に弱点をつけるとき
            //相性がましな方の速さも自分よりも速くて、自分に弱点を付けるなら、ましな方を選択する
            else {
                const worse = myToOp[0] > myToOp[1] ? 0 : 1;
                const better = 1 - worse;
                console.log(`自分のポケモンの${myBattlePokeStatics.name}に対しての受け相性は${opPokeStatics.current[opAliveBenchPokeIndex[better]].name}の方が良い`);

                if (opPokeStatics.current[opAliveBenchPokeIndex[worse]].s > myPokeSpeed.s && opToMy[worse] >= 2) {
                    opChangePokeIndex.current = opPokeStatics.current[opAliveBenchPokeIndex[better]].s > myPokeSpeed && opToMy[better] >= 2 ? better : worse;
                } else {
                    opChangePokeIndex.current = opAliveBenchPokeIndex[better];
                }

                console.log(`${opChangePokeIndex.current === opAliveBenchPokeIndex[better] ?
                    opPokeStatics.current[opAliveBenchPokeIndex[worse]].name + "は" + myBattlePokeStatics.name + "よりも遅くて弱点をつけないため、" + opPokeStatics.current[opAliveBenchPokeIndex[better]].name + "を選択する" :
                    opPokeStatics.current[opAliveBenchPokeIndex[worse]].name + "は受け相性は悪いが、" + myBattlePokeStatics.name + "よりも速くて弱点を突けるため、" + opPokeStatics.current[opAliveBenchPokeIndex[worse]].name + "を選択する"}`);
            }
        } else {
            opChangePokeIndex.current = opPokeDynamics[0].currentHp ? 0
                : opPokeDynamics[1].currentHp ? 1
                    : opPokeDynamics[2].currentHp ? 2
                        : null;
        }
        setBattlePokeIndex(false, opChangePokeIndex.current);
    }

    const getBattlePokeDynamics = (isMe) => {
        const pokeDynamics = getPokeDynamics(isMe);
        const battlePokeIndex = getBattlePokeIndex(isMe);
        const battlePokeDynamics = pokeDynamics[battlePokeIndex];
        return battlePokeDynamics;
    }

    const setBattlePokeDynamics = (isMe, key, value) => {
        const battlePokeIndex = getBattlePokeIndex(isMe);
        const setBattlePokeDynamics = isMe ? setMyPokeDynamics : setOpPokeDynamics;
        setBattlePokeDynamics(prev => {
            const newArray = [...prev];
            newArray[battlePokeIndex] = { ...newArray[battlePokeIndex], [key]: value };
            return newArray;
        });
    }

    const getEffectElem = (isMe) => {
        const atcImgElem = document.querySelector(isMe ? `.my-poke-img` : `.op-poke-img`);
        return atcImgElem;
    }

    //ポケモンの鳴き声再生
    const playPokeVoice = async (isMe, onEnded) => {
        const battlePokeStatics = getBattlePokeStatics(isMe);
        try {
            const pokeVoice = battlePokeStatics.voice;
            pokeVoice.currentTime = 0;
            if (onEnded) pokeVoice.onended = onEnded;
            await pokeVoice.play();
        } catch (e) {
            console.error(`鳴き声の再生に失敗: ${battlePokeStatics.name}`, e);
            onEnded?.();
        }
    }

    const playWeaponSound = async (isMe, onEnded) => {
        try {
            atcPokeInfo.current.selectedWeapon.sound.currentTime = 0;
            if (onEnded) {
                atcPokeInfo.current.selectedWeapon.sound.onended = onEnded;
            }
            await atcPokeInfo.current.selectedWeapon.sound.play();
        } catch (e) {
            console.error(`技SEの再生に失敗: ${atcPokeInfo.current.selectedWeapon.name}`, e);
            onEnded?.();
        }
    }

    const getBattlePokeStatics = (isMe) => {
        const pokeStatics = getPokeStatics(isMe);
        const battlePokeIndex = getBattlePokeIndex(isMe);
        const battlePokeStatics = pokeStatics[battlePokeIndex];
        return battlePokeStatics;
    }

    const checkIsTerastal = (isMe) => {
        const battlePokeIndex = getBattlePokeIndex(isMe);
        const terastalState = isMe ? myTerastalState : opTerastalState;
        const isTerastal = terastalState.terastalPokeNum === battlePokeIndex;
        return isTerastal;
    }

    //指定した技番号のダメ計に必要な情報を取得して返す
    const getUseInCalcDamageInfo = (atcIsMe, weaponIndex, terastalCheckFlg) => {
        const atcBattlePokeIndex = getBattlePokeIndex(atcIsMe);
        const atcBattlePokeStatics = getBattlePokeStatics(atcIsMe);
        const weapons = (atcIsMe ? myWeapons : opWeapons).current;
        const selectedWeaponInfo = getSelectedWeaponInfo(atcIsMe);
        const weaponInfo = weaponIndex != null ? weapons[atcBattlePokeIndex][weaponIndex] : selectedWeaponInfo;
        // const { atcPower, defPower } = getAtcDefPower(atcIsMe, weaponInfo);
        // const { atcBuff, defBuff } = getAtcDefBuff(atcIsMe, weaponInfo);
        const isBurned = atcPokeInfo.current.condition === "やけど" && (weaponInfo.kind === "物理" || (weaponInfo.name === "テラバースト" && atcPokeInfo.current.a > atcPokeInfo.current.c));
        let isTerastalAtc = checkIsTerastal(atcIsMe) || (!atcIsMe && opTerastalFlg.current);
        let isTerastalDef = checkIsTerastal(!atcIsMe);

        //相手のテラス判断のための値変更
        if (atcIsMe && terastalCheckFlg) {
            isTerastalDef = true;
        } else if (!atcIsMe && terastalCheckFlg) {
            isTerastalAtc = true;
        }

        if (weaponInfo.name === "テラバースト") {
            weaponInfo.type = isTerastalAtc ? atcBattlePokeStatics.terastal : weaponInfo.type;
        }

        const atcInfo = { isTerastalAtc, isBurned };
        const defInfo = { isTerastalDef };
        return { weaponInfo, atcInfo, defInfo };
    }

    const getTextRef = (isMe) => {
        const textRef = isMe ? myTextRef : opTextRef;
        return textRef;
    }

    const initializeTurnEnd = () => {
        atcPokeInfo.current = { ...defaultBattlePokeInfo };
        defPokeInfo.current = { ...defaultBattlePokeInfo };
        mySelectedWeaponInfo.current = null;
        opSelectedWeaponInfo.current = null;
        myChangeTurn.current = false;
        opChangeTurn.current = false;
        myChangePokeIndex.current = null;
        opChangePokeIndex.current = null;
        iAmFirst.current = false;
        burned.current = false;
        poisoned.current = false;
        turnCnt.current++;
        console.log(turnCnt.current + "ターン目================================================");
    }

    //当ファイル内のみで使用========================================================================================================

    //タイプ一致攻撃技の相性を返す
    const getCompati = (atcType1, atcType2, defType1, defType2) => {
        const val1 = calcMultiplier(atcType1, defType1, defType2);
        const val2 = calcMultiplier(atcType2, defType1, defType2);
        return [val1, val2];
    }

    //相性倍率を取得する
    const calcMultiplier = (weaponType, defType1, defType2) => {
        const multiplier = (typeChart[weaponType][defType1] ?? 1) * (typeChart[weaponType][defType2] ?? 1);
        return multiplier;
    }

    //生存している控えポケモン情報を取得する
    const getAliveBenchPokeIndex = (isMe) => {
        const pokeDynamics = getPokeDynamics(isMe);
        const battlePokeIndex = getBattlePokeIndex(isMe);
        let aliveBenchPokeIndex = [];
        for (let i = 0; i < 3; i++) {
            if (i !== battlePokeIndex && pokeDynamics[i].currentHp > 0) {
                aliveBenchPokeIndex.push(i);
            }
        }
        return aliveBenchPokeIndex;
    }

    //相手が交代できる控えポケモンを取得する
    const selectOpChangePoke = (aliveBenchPokeIndex, dangerousType, safeType, IsDangerousTerastal, terastalType) => {
        const opPoke0 = opPokeStatics.current[aliveBenchPokeIndex[0]];
        const opPoke1 = aliveBenchPokeIndex.length === 2 ? opPokeStatics.current[aliveBenchPokeIndex[1]] : null;
        //相手の控えが自分のバトルポケモンから受けるダメージをまとめる
        const [val21, val22] = dangerousType.length > 0
            ? getCompati(dangerousType[0], (dangerousType[1] ? dangerousType[1] : safeType[0]), opPoke0.type1, opPoke0.type2)
            : getCompati(safeType[0], (safeType[1] ? safeType[1] : safeType[0]), opPoke0.type1, opPoke0.type2);
        const val23 = terastalType
            ? calcMultiplier(terastalType, opPoke0.type1, opPoke0.type2)
            : null;

        let [val31, val32, val33] = [null, null];
        if (aliveBenchPokeIndex.length === 2) {
            [val31, val32] = dangerousType.length > 0
                ? getCompati(dangerousType[0], (dangerousType[1] ? dangerousType[1] : safeType[0]), opPoke0.type1, opPoke0.type2)
                : getCompati(safeType[0], (safeType[1] ? safeType[1] : safeType[0]), opPoke1.type1, opPoke1.type2);
            val33 = terastalType
                ? calcMultiplier(terastalType, opPoke1.type1, opPoke1.type2)
                : null;
        }
        if (dangerousType.length === 2) {
            if (IsDangerousTerastal) {
                if ((val21 + val22 + val23) <= 1.5) {
                    if (val31 && (val31 + val32 + val33) <= 1.5) {
                        if ((val21 + val22 + val23) !== (val31 + val32 + val33)) {
                            opChangePokeIndex.current = (val21 + val22 + val23) < (val31 + val32 + val33) ? aliveBenchPokeIndex[0] : aliveBenchPokeIndex[1];
                        } else {
                            opChangePokeIndex.current = opPoke0.s > opPoke1.s ? aliveBenchPokeIndex[0] : aliveBenchPokeIndex[1];
                        }
                    } else {
                        opChangePokeIndex.current = aliveBenchPokeIndex[0];
                    }
                } else if (val31 && (val31 + val32 + val33) <= 1.5) {
                    opChangePokeIndex.current = aliveBenchPokeIndex[1];
                }
            } else {
                if ((val21 + val22) <= 1) {
                    if (val31 && (val31 + val32) <= 1) {
                        if ((val21 + val22) !== (val31 + val32)) {
                            opChangePokeIndex.current = (val21 + val22) < (val31 + val32) ? aliveBenchPokeIndex[0] : aliveBenchPokeIndex[1];
                        } else {
                            opChangePokeIndex.current = opPoke0.s > opPoke1.s ? aliveBenchPokeIndex[0] : aliveBenchPokeIndex[1];
                        }
                    } else {
                        opChangePokeIndex.current = aliveBenchPokeIndex[0];
                    }
                } else if (val31 && (val31 + val32) <= 1) {
                    opChangePokeIndex.current = aliveBenchPokeIndex[1];
                }
            }
        } else if (dangerousType.length === 1) {
            if (IsDangerousTerastal) {
                if (val21 <= 0.5 && val22 <= 1 && val23 <= 0.5) {
                    if (val31 && val31 <= 0.5 && val32 <= 1 && val33 <= 0.5) {
                        if ((val21 + val22 + val23) !== (val31 + val32 + val33)) {
                            opChangePokeIndex.current = (val21 + val22 + val23) < (val31 + val32 + val33) ? aliveBenchPokeIndex[0] : aliveBenchPokeIndex[1];
                        } else {
                            opChangePokeIndex.current = opPoke0.s > opPoke1.s ? aliveBenchPokeIndex[0] : aliveBenchPokeIndex[1];
                        }
                    } else {
                        opChangePokeIndex.current = aliveBenchPokeIndex[0];
                    }
                } else if (val31 && val31 <= 0.5 && val32 <= 1 && val33 <= 0.5) {
                    opChangePokeIndex.current = aliveBenchPokeIndex[1];
                }
            } else {
                if (val21 <= 0.5 && val22 <= 1 && (val23 ? val23 <= 1 : true)) {
                    if (val31 && val31 <= 0.5 && val32 <= 1 && (val33 ? val33 <= 1 : true)) {
                        if ((val21 + val22 + val23) !== (val31 + val32 + val33)) {
                            opChangePokeIndex.current = (val21 + val22 + val23) < (val31 + val32 + val33) ? aliveBenchPokeIndex[0] : aliveBenchPokeIndex[1];
                        } else {
                            opChangePokeIndex.current = opPoke0.s > opPoke1.s ? aliveBenchPokeIndex[0] : aliveBenchPokeIndex[1];
                        }
                    } else {
                        opChangePokeIndex.current = aliveBenchPokeIndex[0];
                    }
                } else if (val31 && val31 <= 0.5 && val32 <= 1 && (val33 ? val33 <= 1 : true)) {
                    opChangePokeIndex.current = aliveBenchPokeIndex[1];
                }
            }
        } else {
            if (val21 <= 1 && val22 <= 1 && val23 <= 0.5) {
                if (val31 && val31 <= 1 && val32 <= 1 && val33 <= 0.5) {
                    if (val23 !== val33) {
                        opChangePokeIndex.current = val23 < val33 ? aliveBenchPokeIndex[0] : aliveBenchPokeIndex[1];
                    } else {
                        opChangePokeIndex.current = opPoke0.s > opPoke1.s ? aliveBenchPokeIndex[0] : aliveBenchPokeIndex[1];
                    }
                } else {
                    opChangePokeIndex.current = aliveBenchPokeIndex[0];
                }
            } else if (val31 && val31 <= 1 && val32 <= 1 && val33 <= 0.5) {
                opChangePokeIndex.current = aliveBenchPokeIndex[1];
            }
        }
    }

    //テラス前後の確定耐え数を計算する(相手目線)
    const calcDefinitelyEndureHits = async () => {
        //未テラス状態で自分からの最大打点の技名とダメージ数を取得
        const { myStrongestWeaponIndex, myMaxDamage: maxDamage1 } = await predictMyAction(1);
        //テラス状態で、未テラス状態時の最大打点の技を受けた際の被ダメージを計算する
        const { weaponInfo, atcInfo, defInfo } = getUseInCalcDamageInfo(true, myStrongestWeaponIndex, true);
        const { pureDamage: damage1 } = calcPureDamage(weaponInfo, atcInfo, defInfo, false);
        //テラス状態の相手への自分の最大打点のダメージを計算する。
        const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(true, true);
        const { myMaxDamage: damage2 } = predictMyActionLogic(weaponInfos, atcInfos, defInfos, 1);
        //テラス前後の確定耐え数
        const cnt1 = Math.floor(opPokeDynamics[opBattlePokeIndex].currentHp / maxDamage1);
        const cnt2 = opPokeDynamics[opBattlePokeIndex].currentHp - damage1 > 0
            ? Math.floor((opPokeDynamics[opBattlePokeIndex].currentHp - damage1) / damage2) + 1 : 0;

        return { cnt1, cnt2 };
    }

    //自分が相手に最大ダメージを与えらられる技の中乱数ダメージを返す
    const predictMyAction = async (randomMultiplier) => {
        const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(true);
        const { myStrongestWeaponIndex, myMaxDamageWeaponType, myMaxDamage } = predictMyActionLogic(weaponInfos, atcInfos, defInfos, randomMultiplier);
        return { myStrongestWeaponIndex, myMaxDamageWeaponType, myMaxDamage };
    }

    //相手が次のポケモンを選択するために、お互いのポケモンや技情報を取得する。
    const getUseInCalcDamageInfos = async (atcIsMe, terastalCheckFlg) => {
        const weaponKeys = [0, 1, 2, 3];
        const results = await Promise.all(
            weaponKeys.map(key => getUseInCalcDamageInfo(atcIsMe, key, terastalCheckFlg))
        );
        const weaponInfos = results.map(r => r.weaponInfo);
        const atcInfos = results.map(r => r.atcInfo);
        const defInfos = results.map(r => r.defInfo);
        return { weaponInfos, atcInfos, defInfos };
    }

    const predictMyActionLogic = (weaponInfos, atcInfos, defInfos, randomMultiplier) => {
        const damageList = [
            calcPureDamage(weaponInfos[0], atcInfos[0], defInfos[0], false).pureDamage,
            calcPureDamage(weaponInfos[1], atcInfos[1], defInfos[1], false).pureDamage,
            calcPureDamage(weaponInfos[2], atcInfos[2], defInfos[2], false).pureDamage,
            calcPureDamage(weaponInfos[3], atcInfos[3], defInfos[3], false).pureDamage,
        ];

        // 最大ダメージのインデックスを取得
        const myStrongestWeaponIndex = damageList.reduce((maxIdx, current, idx, arr) =>
            current > arr[maxIdx] ? idx : maxIdx, 0
        );

        const myMaxDamage = damageList[myStrongestWeaponIndex] * randomMultiplier;
        const myMaxDamageWeaponType = weaponInfos[myStrongestWeaponIndex].type;

        return { myStrongestWeaponIndex, myMaxDamageWeaponType, myMaxDamage };
    }

    //乱数と急所を考慮しないダメージ数と、基礎ダメージを返す
    const calcPureDamage = (weaponInfo, atcInfo, defInfo, atcTestFlg) => {

        if (atcTestFlg !== undefined) {
            setAtcDefPokeInfo(!atcTestFlg);
        }

        // 基本値
        let [atcPower, defPower] = weaponInfo.kind === "物理" ? [atcPokeInfo.current.a, defPokeInfo.current.b] : [atcPokeInfo.current.c, defPokeInfo.current.d];
        let [atcBuff, defBuff] = weaponInfo.kind === "物理" ? [atcPokeInfo.current.aBuff, defPokeInfo.current.bBuff] : [atcPokeInfo.current.cBuff, defPokeInfo.current.dBuff];
        let [atcPokeTerastal, atcPokeType1, atcPokeType2] = [atcInfo.isTerastalAtc ? atcPokeInfo.current.terastal : null, atcPokeInfo.current.type1, atcPokeInfo.current.type2];
        let [defPokeTerastal, defPokeType1, defPokeType2] = [defInfo.isTerastalDef ? defPokeInfo.current.terastal : null, defPokeInfo.current.type1, defPokeInfo.current.type2];

        // テラバースト補正
        if (weaponInfo.name === "テラバースト") {
            const strongA = atcPokeInfo.current.a > atcPokeInfo.current.c;
            atcPower = strongA ? atcPokeInfo.current.a : atcPokeInfo.current.c;
            atcBuff = strongA ? atcPokeInfo.current.aBuff : atcPokeInfo.current.cBuff;
            defPower = strongA ? defPokeInfo.current.b : defPokeInfo.current.d;
            defBuff = strongA ? defPokeInfo.current.bBuff : defPokeInfo.current.dBuff;
        }

        const isSameTerastal =
            (atcInfo.isTerastalAtc && weaponInfo.type === atcPokeTerastal && weaponInfo.type === atcPokeType1)
            || (atcInfo.isTerastalAtc && weaponInfo.type === atcPokeTerastal && weaponInfo.type === atcPokeType2);
        const isSameType =
            (weaponInfo.type === atcPokeType1) || (weaponInfo.type === atcPokeType2)
            || (weaponInfo.type === atcPokeTerastal && atcInfo.isTerastalAtc);
        const [defType1, defType2] = defInfo.isTerastalDef
            ? [defPokeTerastal, "なし"]
            : [defPokeType1, defPokeType2];
        const multiplier = calcMultiplier(weaponInfo.type, defType1, defType2);

        const atcBuffMultiplier = atcBuff > 0
            ? atcBuff * 0.5 + 1 : 2 / (2 - atcBuff);
        const defBuffMultiplier = defBuff > 0
            ? defBuff * 0.5 + 1 : 2 / (2 - defBuff);

        //ダメージ計算　22 * 技威力 * (AorC / BorD) / 50 + 2 * ダメージ補正(* 乱数　* タイプ一致 * 相性 * 急所)
        let pureDamage = Math.floor(22 * weaponInfo.power * ((atcPower * atcBuffMultiplier) / (defPower * defBuffMultiplier)));
        pureDamage = Math.floor(pureDamage / 50 + 2);   //基礎ダメージ
        const basicDamage = pureDamage;   //デバッグ用
        pureDamage = Math.floor(pureDamage * (isSameTerastal ? 2 : (isSameType ? 1.5 : 1)));    // タイプ一致補正
        pureDamage = Math.floor(pureDamage * multiplier);   //相性補正

        return { pureDamage, basicDamage, isSameTerastal, isSameType, multiplier, atcBuffMultiplier, defBuffMultiplier };
    }


    //自分のポケモンが相手に対して打点が強い方のタイプと、もう一方のタイプを取得して返す
    const getMyStrongType = async () => {
        const myBattlePokeStatics = myPokeStatics.current[myBattlePokeIndex];
        //相手のテラス前タイプに対して自分の最大打点の技タイプ
        const { myMaxDamageWeaponType: strongestWeaponType } = await predictMyAction(1);

        //相手のポケモンに対して、自分のポケモンのタイプ一致技で強い方ともう一方のタイプを取得
        let [strongType, anotherType] = [null, null];
        if (strongestWeaponType === myBattlePokeStatics.type1 || strongestWeaponType === myBattlePokeStatics.type2) {
            const strongTypeNum = strongestWeaponType === myBattlePokeStatics.type1 ? 1 : 2;
            const otherTypeNum = strongTypeNum === 1 ? 2 : 1;
            strongType = myBattlePokeStatics[`type${strongTypeNum}`];
            anotherType = myBattlePokeStatics[`type${otherTypeNum}`];
        }
        return { strongType, anotherType };
    }

    //最も与えるダメージが大きい技・最も与えるダメージが大きい先制技・最も与えるダメージが大きい先制技の最低乱数ダメージ　を返す
    const getMostEffectiveWeapon = async () => {
        const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(false);
        const { strongestWeaponIndex, strongestWeaponDamage, strongestHighPriorityWeaponIndex, strongestHighPriorityWeaponDamage }
            = getMostEffectiveWeaponLogic(weaponInfos, atcInfos, defInfos);
        return { strongestWeaponIndex, strongestWeaponDamage, strongestHighPriorityWeaponIndex, strongestHighPriorityWeaponDamage }
    }

    const getMostEffectiveWeaponLogic = (weaponInfos, atcInfos, defInfos) => {
        //相手の全ての攻撃技で、自分のポケモンに与えるダメージを取得
        // 技とダメージ・優先度をまとめる
        const opWeapons = weaponInfos.map((w, i) => ({
            name: w.name,
            damage: calcPureDamage(weaponInfos[i], atcInfos[i], defInfos[i], true).pureDamage,
            priority: w.priority,
        }));

        //与えるダメージが最も大きい技のインデックスを取得
        const strongestWeaponIndex = opWeapons
            .map((w, i) => ({ ...w, index: i }))
            .reduce((max, w) => w.damage > max.damage ? w : max)
            .index;

        // 優先度1以上の技の中で最もダメージが大きい技のインデックス（なければ null）
        const highPriorityWeapons = opWeapons
            .map((w, i) => ({ ...w, index: i }))
            .filter(w => w.priority >= 1);

        const strongestHighPriorityWeaponIndex =
            highPriorityWeapons.length > 0
                ? highPriorityWeapons.reduce((max, w) => w.damage > max.damage ? w : max).index
                : null;

        //最も与えるダメージが大きい技のダメージ(最低乱数)
        const strongestWeaponDamage = Math.floor(opWeapons[strongestWeaponIndex].damage * 0.85);
        //最も与えるダメージが大きい先制技(最低乱数)
        let strongestHighPriorityWeaponDamage = null;
        if (strongestHighPriorityWeaponIndex) {
            strongestHighPriorityWeaponDamage = Math.round(opWeapons[strongestHighPriorityWeaponIndex].damage * 0.85);
        }

        console.log(`最大火力\n${opWeapons[0].name}：${opWeapons[0].damage}\n${opWeapons[1].name}：${opWeapons[1].damage}\n${opWeapons[2].name}：${opWeapons[2].damage}\n${opWeapons[3].name}：${opWeapons[3].damage}`);

        return { strongestWeaponIndex, strongestWeaponDamage, strongestHighPriorityWeaponIndex, strongestHighPriorityWeaponDamage }
    }

    //相手６体の耐性などをまとめた情報を受け取り、ソートして選出する３体を選ぶ
    const selectOpPokeOrderLogic = (myPokeInfos, opPokeInfos) => {
        const resistanceMap = calcResistanceForAllOpPokes(myPokeInfos, opPokeInfos);

        const sortedResistanceList = Object.entries(resistanceMap)
            .sort((a, b) => {
                const ra = a[1].resistance;
                const rb = b[1].resistance;
                if (ra !== rb) return ra - rb;

                const ea = a[1].effectiveness;
                const eb = b[1].effectiveness;
                if (ea !== eb) return eb - ea;
                return b[1].s - a[1].s;
            })
            .map(([key, value]) => ({ key, ...value }));

        // まずは3体を選出
        let betterOpPokes = sortedResistanceList.slice(0, 3);

        //ハードモード
        //自分の1体目に対して「最も耐性が高い（受けが良い）相手」を先頭にする
        betterOpPokes.sort((a, b) => {
            const calcDefenseScore = (opPoke) => {
                const m1 = calcMultiplier(myPokeInfos[0].type1, opPoke.type1, opPoke.type2);
                const m2 = myPokeInfos[0].type2 !== "なし"
                    ? calcMultiplier(myPokeInfos[0].type2, opPoke.type1, opPoke.type2)
                    : 0;
                let maxVal = Math.max(m1, m2);
                return maxVal; // 小さい方が耐性高い
            };
            return calcDefenseScore(a) - calcDefenseScore(b); // 昇順（耐性が高い順）
        });
        betterOpPokes = betterOpPokes.map(poke => poke.name);
        console.log(`相手のポケモン\n１体目：${betterOpPokes[0]}\n２体目：${betterOpPokes[1]}\n３体目：${betterOpPokes[2]}`);
        return betterOpPokes;
    }

    //相手のポケモン全ての受け/攻め相性と素早さを計算して返す。
    const calcResistanceForAllOpPokes = (myPokeInfos, opPokeInfos) => {
        const result = {};
        opPokeInfos.forEach((opPoke, index) => {
            const [name, type1, type2] = [opPoke.name, opPoke.type1, opPoke.type2];

            // resistance（自分6体 → 相手1体）
            const resistance = myPokeInfos.reduce((total, myPoke) => {
                let maxVal = Math.max(
                    calcMultiplier(myPoke.type1, opPoke.type1, opPoke.type2),
                    myPoke.type2 !== "なし"
                        ? calcMultiplier(myPoke.type2, opPoke.type1, opPoke.type2) : 0
                );
                if (maxVal === 4) maxVal = 2;
                else if (maxVal === 0.25) maxVal = 0.5;
                return total + maxVal;
            }, 0);

            // effectiveness（相手1体 → 自分6体）
            const effectiveness = myPokeInfos.reduce((total, myPoke) => {
                let maxVal = Math.max(
                    calcMultiplier(opPoke.type1, myPoke.type1, myPoke.type2),
                    opPoke.type2 !== "なし"
                        ? calcMultiplier(opPoke.type2, myPoke.type1, myPoke.type2) : 0
                );
                if (maxVal === 4) maxVal = 2;
                else if (maxVal === 0.25) maxVal = 0.5;
                return total + maxVal;
            }, 0);
            result[`opPoke${index + 1}`] = {
                name, type1, type2, resistance, effectiveness, s: opPoke.s
            };
        });
        return result;
    }

    //DBのPokeInfoから指定したポケモンに紐づく全てのデータを返す
    const getPokeInfo = async (pokeName) => {
        try {
            const url = `https://1aazl41gyk.execute-api.ap-northeast-1.amazonaws.com/prod/getPokeInfo?id=${encodeURIComponent(pokeName)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            const result = await res.json();
            const keys = ["Img", "Voice", "Type1", "Type2", "Terastal", "HP", "A", "B", "C", "D", "S", "Weapon1", "Weapon2", "Weapon3", "Weapon4"];
            const pokeInfo = { name: pokeName };
            keys.forEach(k => {
                pokeInfo[k.toLowerCase()] = result.data?.[k] ?? null;
            });
            return pokeInfo;
        } catch (err) {
            console.error(`エラー発生: ${pokeName}`, err);
            return null;
        }
    };

    //DBのWeaponInfoから指定した技に紐づく全てのデータを返す
    const getWeaponInfo = async (weaponName) => {
        try {
            const url = `https://1aazl41gyk.execute-api.ap-northeast-1.amazonaws.com/prod/getWeaponInfo?id=${encodeURIComponent(weaponName)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            const result = await res.json();
            const keys = ["Type", "Kind", "Power", "HitRate", "Priority", "Sound", "AtcTarget", "EffTarget", "IncidenceRate", "Effectiveness"];
            const weaponInfo = { name: weaponName };
            keys.forEach(k => {
                weaponInfo[k.toLowerCase()] = result.data?.[k] ?? null;
            });
            return weaponInfo;
        } catch (err) {
            console.error(`エラー発生: ${weaponName}`, err);
            return null;
        }
    };

    //お互いが選出したポケモン情報を取得して返す
    const getPokeInfos = async (opSelectedOrder) => {
        const [myPokeInfos, opPokeInfos] = await Promise.all([
            Promise.all(mySelectedOrder.map(getPokeInfo)),
            Promise.all(opSelectedOrder.map(getPokeInfo))
        ]);
        return { myPokeInfos, opPokeInfos };
    }

    //お互いのポケモン３体の技情報を取得して返す
    const getWeaponInfos = async (myPokeInfos, opPokeInfos) => {
        const myWeaponInfos = await Promise.all(
            myPokeInfos.map(poke =>
                Promise.all([
                    getWeaponInfo(poke.weapon1),
                    getWeaponInfo(poke.weapon2),
                    getWeaponInfo(poke.weapon3),
                    getWeaponInfo(poke.weapon4),
                ])
            )
        );
        const opWeaponInfos = await Promise.all(
            opPokeInfos.map(poke =>
                Promise.all([
                    getWeaponInfo(poke.weapon1),
                    getWeaponInfo(poke.weapon2),
                    getWeaponInfo(poke.weapon3),
                    getWeaponInfo(poke.weapon4),
                ])
            )
        );
        return { myWeaponInfos, opWeaponInfos };
    }

    const setPokeInfos = (myPokeInfos, opPokeInfos) => {
        myPokeInfos.forEach((poke, index) => {
            myPokeStatics.current[index].name = poke.name;
            myPokeStatics.current[index].img = poke.img;
            myPokeStatics.current[index].voice = preloadSound(poke.voice);
            myPokeStatics.current[index].type1 = poke.type1;
            myPokeStatics.current[index].type2 = poke.type2;
            myPokeStatics.current[index].terastal = poke.terastal;
            myPokeStatics.current[index].hp = poke.hp;
            myPokeStatics.current[index].a = poke.a;
            myPokeStatics.current[index].b = poke.b;
            myPokeStatics.current[index].c = poke.c;
            myPokeStatics.current[index].d = poke.d;
            myPokeStatics.current[index].s = poke.s;
            myPokeStatics.current[index].weapon1 = poke.weapon1;
            myPokeStatics.current[index].weapon2 = poke.weapon2;
            myPokeStatics.current[index].weapon3 = poke.weapon3;
            myPokeStatics.current[index].weapon4 = poke.weapon4;
        });
        setMyPokeDynamics(prev => prev.map((poke, index) => ({ ...poke, currentHp: myPokeInfos[index].hp })));

        opPokeInfos.forEach((poke, index) => {
            opPokeStatics.current[index].name = poke.name;
            opPokeStatics.current[index].img = poke.img;
            opPokeStatics.current[index].voice = preloadSound(poke.voice);
            opPokeStatics.current[index].type1 = poke.type1;
            opPokeStatics.current[index].type2 = poke.type2;
            opPokeStatics.current[index].terastal = poke.terastal;
            opPokeStatics.current[index].hp = poke.hp;
            opPokeStatics.current[index].a = poke.a;
            opPokeStatics.current[index].b = poke.b;
            opPokeStatics.current[index].c = poke.c;
            opPokeStatics.current[index].d = poke.d;
            opPokeStatics.current[index].s = poke.s;
            opPokeStatics.current[index].weapon1 = poke.weapon1;
            opPokeStatics.current[index].weapon2 = poke.weapon2;
            opPokeStatics.current[index].weapon3 = poke.weapon3;
            opPokeStatics.current[index].weapon4 = poke.weapon4;
        });
        setOpPokeDynamics(prev => prev.map((poke, index) => ({ ...poke, currentHp: opPokeInfos[index].hp })));
    };

    const setWeaponInfos = (myWeaponInfos, opWeaponInfos) => {
        myWeaponInfos.forEach((pokeWeapons, pokeIndex) => {
            pokeWeapons.forEach((weapon, weaponIndex) => {
                myWeapons.current[pokeIndex][weaponIndex].name = weapon.name;
                myWeapons.current[pokeIndex][weaponIndex].type = weapon.type;
                myWeapons.current[pokeIndex][weaponIndex].kind = weapon.kind;
                myWeapons.current[pokeIndex][weaponIndex].sound = preloadSound(weapon.sound);
                myWeapons.current[pokeIndex][weaponIndex].power = weapon.power;
                myWeapons.current[pokeIndex][weaponIndex].hitRate = weapon.hitrate;
                myWeapons.current[pokeIndex][weaponIndex].priority = weapon.priority;
                myWeapons.current[pokeIndex][weaponIndex].atcTarget = weapon.atctarget;
                myWeapons.current[pokeIndex][weaponIndex].effTarget = weapon.efftarget;
                myWeapons.current[pokeIndex][weaponIndex].incidenceRate = weapon.incidencerate;
                myWeapons.current[pokeIndex][weaponIndex].effectiveness = weapon.effectiveness;
            });
        });

        opWeaponInfos.forEach((pokeWeapons, pokeIndex) => {
            pokeWeapons.forEach((weapon, weaponIndex) => {
                opWeapons.current[pokeIndex][weaponIndex].name = weapon.name;
                opWeapons.current[pokeIndex][weaponIndex].type = weapon.type;
                opWeapons.current[pokeIndex][weaponIndex].kind = weapon.kind;
                opWeapons.current[pokeIndex][weaponIndex].sound = preloadSound(weapon.sound);
                opWeapons.current[pokeIndex][weaponIndex].power = weapon.power;
                opWeapons.current[pokeIndex][weaponIndex].hitRate = weapon.hitrate;
                opWeapons.current[pokeIndex][weaponIndex].priority = weapon.priority;
                opWeapons.current[pokeIndex][weaponIndex].atcTarget = weapon.atctarget;
                opWeapons.current[pokeIndex][weaponIndex].effTarget = weapon.efftarget;
                opWeapons.current[pokeIndex][weaponIndex].incidenceRate = weapon.incidencerate;
                opWeapons.current[pokeIndex][weaponIndex].effectiveness = weapon.effectiveness;
            });
        });
    };

    //定数ダメージ処理（火傷/毒）
    const setConstantDamage = async () => {
        for (const isMe of [true, false]) {
            const battlePokeDynamics = getBattlePokeDynamics(isMe);
            const currentHp = battlePokeDynamics.currentHp;
            const pokeCondition = battlePokeDynamics.condition;
            const kind = pokeCondition === "やけど" ? "burned"
                : pokeCondition?.includes("どく") ? "poisoned" : null;

            //火傷・毒チェック
            if ((pokeCondition === "やけど" || pokeCondition?.includes("どく")) && currentHp > 0) {
                (kind === "burned" ? burned : poisoned).current = true;
                damage.current = calcConstantDamage(isMe, pokeCondition);
                soundList.general[kind].play();
                adjustHpBar(isMe, "damage");
                setBattlePokeDynamics(isMe, "currentHp", newHp.current);
                // await stopProcessing(1500);
            }
        }
    }

    //定数ダメージ計算(火傷・毒)
    const calcConstantDamage = (isMe, condition) => {
        const maxHp = getBattlePokeStatics(isMe).hp;
        let constantDamage = 0;
        if (condition === "やけど") {
            constantDamage = Math.floor(maxHp / 16);
        } else if (condition.includes("どく")) {
            if (condition === "もうどく") {
                const cnt = isMe ? myPoisonedCnt : opPoisonedCnt;
                const ratio = Math.min(cnt.current, 15) / 16;
                constantDamage = Math.floor(maxHp * ratio);
                cnt.current++;
            } else {
                constantDamage = Math.floor(maxHp / 8);
            }
        }
        return constantDamage;
    }

    //技相性にあったダメージSEを再生
    const playDamageSound = (onEnded) => {
        const multiplierWord = multiplierRef.current >= 2 ? "batsugun"
            : multiplierRef.current === 1 ? "toubai"
                : multiplierRef.current <= 0.5 ? "imahitotsu"
                    : null;
        const sound = soundList.damage[multiplierWord];

        if (sound) {
            sound.play().catch(e => console.error("効果音エラー", e));
            sound.addEventListener("ended", () => {
                if (onEnded) onEnded();
            });
        } else {
            if (onEnded) onEnded();
        }
    }

    const preloadSound = (url) => {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.load();
        return audio;
    }

    //テラス前後の確定数を計算する(相手目線)
    const calcDefinitelyDefeatHits = async () => {
        //テラス前後の相手からの最大与ダメージ
        const { strongestWeaponDamage: maxDamage1 } = await getMostEffectiveWeapon();
        const { weaponInfos, atcInfos, defInfos } = await getUseInCalcDamageInfos(false, true);
        const { strongestWeaponDamage: maxDamage2 } = getMostEffectiveWeaponLogic(weaponInfos, atcInfos, defInfos);
        //テラス前後の確定数
        const cnt1 = Math.floor(myPokeDynamics[myBattlePokeIndex].currentHp / maxDamage1) + 1;
        const cnt2 = Math.floor(myPokeDynamics[myBattlePokeIndex].currentHp / maxDamage2) + 1;

        return { cnt1, cnt2 };
    }

    const getPokeStatics = (isMe) => {
        const pokeStatics = (isMe ? myPokeStatics : opPokeStatics).current;
        return pokeStatics;
    }

    const getPokeDynamics = (isMe) => {
        const pokeDynamics = isMe ? myPokeDynamics : opPokeDynamics;
        return pokeDynamics;
    }

    const getBattlePokeIndex = (isMe) => {
        const battlePokeIndex = isMe ? myBattlePokeIndex : opBattlePokeIndex;
        return battlePokeIndex;
    }

    const getSelectedWeaponInfo = (isMe) => {
        const selectedWeaponInfo = (isMe ? mySelectedWeaponInfo : opSelectedWeaponInfo).current;
        return selectedWeaponInfo;
    }

    const delay = (fn, ms) => setTimeout(fn, ms);

    const setAtcDefPokeInfo = (atcIsMe) => {
        const [atcPokeSt, atcPokeDy, atcPokeBuff] = atcIsMe ? [myPokeStatics.current[myBattlePokeIndex], myPokeDynamics[myBattlePokeIndex], myPokeBuff] : [opPokeStatics.current[opBattlePokeIndex], opPokeDynamics[opBattlePokeIndex], opPokeBuff];
        const [defPokeSt, defPokeDy, defPokeBuff] = atcIsMe ? [opPokeStatics.current[opBattlePokeIndex], opPokeDynamics[opBattlePokeIndex], opPokeBuff] : [myPokeStatics.current[myBattlePokeIndex], myPokeDynamics[myBattlePokeIndex], myPokeBuff];
        atcPokeInfo.current = {
            name: atcPokeSt.name, img: atcPokeSt.img, voice: atcPokeSt.voice,
            type1: atcPokeSt.type1, type2: atcPokeSt.type2, terastal: atcPokeSt.terastal,
            hp: atcPokeSt.hp, a: atcPokeSt.a, b: atcPokeSt.b, c: atcPokeSt.c, d: atcPokeSt.d, s: atcPokeSt.s,
            currentHp: atcPokeDy.currentHp, condition: atcPokeDy.condition,
            aBuff: atcPokeBuff.a, bBuff: atcPokeBuff.b, cBuff: atcPokeBuff.c, dBuff: atcPokeBuff.d, sBuff: atcPokeBuff.s,
            selectedWeapon: getSelectedWeaponInfo(atcIsMe),
        };
        defPokeInfo.current = {
            name: defPokeSt.name, img: defPokeSt.img, voice: defPokeSt.voice,
            type1: defPokeSt.type1, type2: defPokeSt.type2, terastal: defPokeSt.terastal,
            hp: defPokeSt.hp, a: defPokeSt.a, b: defPokeSt.b, c: defPokeSt.c, d: defPokeSt.d, s: defPokeSt.s,
            currentHp: defPokeDy.currentHp, condition: defPokeDy.condition,
            aBuff: defPokeBuff.a, bBuff: defPokeBuff.b, cBuff: defPokeBuff.c, dBuff: defPokeBuff.d, sBuff: defPokeBuff.s,
            selectedWeapon: getSelectedWeaponInfo(!atcIsMe),
        };
    }


    return {
        playBgm,
        selectMyPokeOrder,
        selectOpPokeOrder,
        setBattleStartData,

        getWeaponInfoList,
        getCompatiTextForWeaponInfoList,
        getPokeIndicatorsColor,

        playTerastalBtnSound,
        setIAmFirst,
        setChangeTurn,

        initializePokeBuff,
        initializePoisonedCnt,
        processPokeAppearance,
        initializeChangePokeIndex,
        processTerastal,
        setBattlePokeIndex,
        processPokeChange,
        adjustHpBar,
        processTurnEnd,
        consolePokeHp,
        displayTextArea,
        processConstantDamageText,
        stopProcessing,
        checkDangerous,
        checkOpChanging,
        checkOpTerastal,
        setOpBetterWeapon,
        calcActualStatus,
        processTurnStart,
        setTextRef,
        playConditionSe,
        calcTrueDamage,
        checkSecondaryEffect,
        jumpEffect,
        attackEffectLogic,
        damageEffect,
        setNextOpPoke,
        stopBgm,
        getBattlePokeDynamics,
        setBattlePokeDynamics,
        getEffectElem,
        playPokeVoice,
        playWeaponSound,
        getBattlePokeStatics,
        checkIsTerastal,
        getUseInCalcDamageInfo,
        getTextRef,
        initializeTurnEnd,
    };
}
