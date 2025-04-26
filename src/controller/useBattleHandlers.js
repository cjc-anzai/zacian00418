import { sounds, pokeInfo, weaponInfo, compatiTexts, typeChart } from "../model/model";

export function useBattleHandlers(battleState) {

  //インポートの取得===========================================================
  const {
    setMyAreaVisible,
    opAreaVisible, setOpAreaVisible,
    setOtherAreaVisible,
    myPokeState, setMyPokeState,
    opPokeState, setOpPokeState,
    setMyPokeStateTrigger,
    setOpPokeStateTrigger,
    selectedOrder, setSelectedOrder,
    myTurn, setMyTurn,
    setMyTurnTrigger,
    skipTurn, setSkipTurn,
    resultText, setResultText,
    loopAudioRef, turnCnt, changePokeName, beforePokeName,
    defaultAreaVisible,
    defaultPokeState,
    defaultPokeStateTrigger,
  } = battleState;

  //クリックイベント===============================================================================================================


  const start = () => {
    playSe("decide");
    playSe("start");
    setBgm(sounds.bgm.selection);
    sounds.general.start.onended = () => {
      setOtherAreaVisible(prev => ({ ...prev, top: false, isSelecting: true }));
      sounds.bgm.selection.play();
    };
  };

  //選出画面のポケモン押下時
  const handleSelect = (pokeName) => {
    playSe("select");
    setSelectedOrder((prev) => {
      if (prev.includes(pokeName)) {
        return prev.filter((name) => name !== pokeName); // クリックで解除
      }
      if (prev.length < 3) {
        return [...prev, pokeName]; // 3体まで選択OK
      }
      return prev; // 3体以上は無視
    });
  };

  //選出確定ボタン
  const confirmSelection = () => {
    playSe("decide");
    stopBgm();
    setBgm(sounds.bgm.battle);
    delay(() => sounds.bgm.battle.play(), 50);

    setOtherAreaVisible(prev => ({ ...prev, isSelecting: false, battle: true }));

    //自分の選出順番をセットし、1番目のポケの名前をセット
    const [p1, p2, p3] = selectedOrder;
    Object.assign(myPokeState, {
      poke1Name: p1, poke2Name: p2, poke3Name: p3,
      poke1FullH: pokeInfo[p1].h, poke2FullH: pokeInfo[p2].h, poke3FullH: pokeInfo[p3].h,
      poke1H: pokeInfo[p1].h, poke2H: pokeInfo[p2].h, poke3H: pokeInfo[p3].h,
    });
    setMyPokeState(prev => ({ ...prev, name: p1 }));

    // 相手の選出順番をランダムに選び、1番目のポケの名前をセット
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
    };

    const opCandidates = ["ディアルガ", "ゲンガー", "リザードン", "ラグラージ", "カイリキー", "サーナイト"]
      .map(name => ({ name, ...pokeInfo[name] }));

    shuffleArray(opCandidates); // Fisher-Yatesアルゴリズムでシャッフル

    // シャッフル後、最初の3体を選ぶ
    const [o1, o2, o3] = opCandidates.slice(0, 3).map(p => p.name);
    Object.assign(opPokeState, {
      poke1Name: o1, poke2Name: o2, poke3Name: o3,
      poke1FullH: pokeInfo[o1].h, poke2FullH: pokeInfo[o2].h, poke3FullH: pokeInfo[o3].h,
      poke1H: pokeInfo[o1].h, poke2H: pokeInfo[o2].h, poke3H: pokeInfo[o3].h,
    });
    setOpPokeState(prev => ({ ...prev, name: o1 }));
    console.log(`相手1体目：${opPokeState.poke1Name}/2体目：${opPokeState.poke2Name}/3体目：${opPokeState.poke3Name}`);
  };


  //たたかうボタン押下時、コマンド表示を切り替える
  const openBattleCmdArea = () => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, weaponCmd: true }));
  };

  //交代ボタン押下時、コマンド表示を切り替える
  const openChangeCmdArea = () => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: false, changeCmd: true }));
  };

  // 戻るボタン押下時、コマンド表示を切り替える
  const backCmd = () => {
    playSe("cancel");
    setOtherAreaVisible(prev => ({ ...prev, actionCmd: true, weaponCmd: false, changeCmd: false }));
  };

  //技名ボタン押下時、選択した技をセット
  const battle = (weaponName) => {
    playSe("decide");
    updateTurnCnt();
    setOtherAreaVisible(prev => ({ ...prev, weaponCmd: false }));
    handleStateChange("myWeapon", weaponName);
  };

  //〇〇に交代ボタン押下時、交代するポケモン名を保存し、交代フラグを立てる
  const changeMyPoke = (changePoke) => {
    playSe("decide");
    updateTurnCnt();
    console.log(`${changePoke}に交代を選択`);
    setOtherAreaVisible(prev => ({ ...prev, changeCmd: false }));
    beforePokeName.current = myPokeState.name;
    changePokeName.current = changePoke;
    setSkipTurn(true);
  }

  //倒れた後、次に出すポケモンボタン押下時、次のポケモン名を保存し、HPをセット
  const nextMyPoke = (nextPoke) => {
    playSe("decide");
    setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: false }));
    changePokeName.current = nextPoke;
    delay(() => setMyPokeState(p => ({ ...p, name: nextPoke })), 1000);
  }

  //トップへ戻るボタン押下時、すべてのステータスを初期化
  const goTop = () => {

    // ポケモン表示制御
    setMyAreaVisible({ ...defaultAreaVisible });
    setOpAreaVisible({ ...defaultAreaVisible });

    // その他表示制御
    setOtherAreaVisible({
      top: true,
      isSelecting: false,
      battle: false,
      text: false,
      actionCmd: false,
      weaponCmd: false,
      changeCmd: false,
      nextPokeCmd: false
    });

    // ポケモンのステータス
    setMyPokeState({ ...defaultPokeState });
    setOpPokeState({ ...defaultPokeState });

    // 強制トリガー
    setMyPokeStateTrigger({ ...defaultPokeStateTrigger });
    setOpPokeStateTrigger({ ...defaultPokeStateTrigger });

    // その他state
    setSelectedOrder([]);
    turnCnt.current = 1;
    setMyTurn("");
    setMyTurnTrigger(0);
    setSkipTurn(false);
    changePokeName.current = "";
    setResultText("");
  }

  //サウンド関係============================================================================================

  //指定したSEを再生
  const playSe = (kind) => {
    const seMap = {
      start: sounds.general.start,
      select: sounds.general.select,
      decide: sounds.general.decide,
      cancel: sounds.general.cancel,
      back: sounds.general.back,
      gameResult:
        resultText === "WIN" ? sounds.general.win
          : resultText === "LOSE" ? sounds.general.lose
            : null,
    };

    const se = seMap[kind];
    if (!se) return;

    if (kind === "start") {
      // onended 仕込みたい音は元のインスタンスで
      se.play().catch(e => console.error('効果音の再生に失敗:', e));
    } else {
      // その他は clone で連続再生対応
      se.cloneNode().play().catch(e => console.error('効果音の再生に失敗:', e));
    }
  };


  //ポケモンの鳴き声再生
  const playPokeVoice = (pokeName, onEnded) => {
    const voice = pokeInfo[pokeName].voice;
    voice.currentTime = 0;
    voice.onended = onEnded || null;
    voice.play().catch(e => {
      console.error('効果音の再生に失敗:', e);
      onEnded?.();
    });
  };

  //各技のSEを再生
  const playWeaponSound = (weaponName, onEnded) => {
    const sound = weaponInfo[weaponName].sound;
    sound.currentTime = 0;
    sound.onended = onEnded || null;
    sound.play().catch(e => {
      console.error('効果音の再生に失敗:', e);
      onEnded?.();
    });
  };

  //技相性にあったダメージSEを再生
  const playDamageSound = (who) => {
    const text = who === "my" ? myPokeState.text : opPokeState.text;
    const sound =
      text.includes(compatiTexts.batsugun) ? sounds.damage.batsugun :
        text.includes(compatiTexts.toubai) ? sounds.damage.toubai :
          text.includes(compatiTexts.imahitotsu) ? sounds.damage.imahitotsu :
            null;

    sound?.play().catch(e => console.error('効果音の再生に失敗:', e));
  };

  //BGM情報をセット
  const setBgm = (kind) => {
    kind.volume = 0.15;
    kind.loop = true;
    loopAudioRef.current = kind;
  }

  // BGMを止める
  const stopBgm = () => {
    if (loopAudioRef.current) {
      loopAudioRef.current.pause();
      loopAudioRef.current.currentTime = 0;
    }
  }

  //toDoWhen()==========================================================================================

  //ポケモンの名前がセットされたimgをセット
  const toDoWhenSetPokeName = (who) => {
    const isMy = who === "my";
    const state = isMy ? myPokeState : opPokeState;
    const setState = isMy ? setMyPokeState : setOpPokeState;
    const getImg = () => pokeInfo[state.name].img;
    setState(prev => ({ ...prev, img: getImg() }));
  };

  //imgがセットされたらHPをセット
  const toDoWhenSetImg = (who) => {
    const isMy = who === "my";
    const state = isMy ? myPokeState : opPokeState;

    const name = state.name;
    let newHp = [state.poke1Name, state.poke2Name, state.poke3Name]
      .findIndex(n => n === name);

    if (newHp !== -1) {
      newHp = state[`poke${newHp + 1}H`];
    }


    const hpBarElem = document.querySelector(isMy ? ".my-hp-bar" : ".op-hp-bar");
    const fullHp = pokeInfo[name].h;
    const hpPercent = Math.round((newHp / fullHp) * 100);
    hpBarElem.style.width = `${hpPercent}%`;

    // 色クラスも付け替え
    hpBarElem.classList.remove("low", "mid");
    if (hpPercent <= 25) {
      hpBarElem.classList.add("low");
    } else if (hpPercent <= 50) {
      hpBarElem.classList.add("mid");
    }

    handleStateChange(isMy ? "myHp" : "opHp", newHp);
  }

  //HPがセットされた時の処理
  const toDoWhenSetHp = (who) => {
    //テキストエリア非表示
    setOtherAreaVisible(prev => ({ ...prev, text: false }));
    const isMy = who === "my";
    const state = isMy ? myPokeState : opPokeState;
    const setText = (text) => handleStateChange(isMy ? "myText" : "opText", text);

    //初期値のセット→はじいてる
    //初登場時のHPセット || 交代してセット→goTextをセット
    if (state.text === "" || state.text.includes("backText") || state.text.includes("deadText")) {
      const name = isMy ? myPokeState.name : opPokeState.name;
      const text = isMy
        ? `ゆけ！${name}！goText`
        : `相手は${name}をくりだした！goText`;
      setText(text);
      return;
    }

    //ダメージを受けてセット→残りＨＰや攻撃順番や交代ターンかどうかで処理を分ける 
    if (state.h > 0) {
      saveHp(who);
      setTimeout(() => {
        if (isMy) {
          //交代したターンはターン終了
          if (skipTurn) {
            setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
            setSkipTurn(false);
            //先攻ならターン終了
          } else if (myTurn === "first") {
            setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
            //後攻なら自分の技テキストをセット
          } else if (myTurn === "after") {
            setText(`${myPokeState.name}！${myPokeState.weapon}！weaponText`);
          }
        } else {
          //後攻ならターン終了
          if (myTurn === "after") {
            setOtherAreaVisible(prev => ({ ...prev, actionCmd: true }));
            //先攻なら相手の技テキストをセット
          } else if (myTurn === "first") {
            setText(`相手の${opPokeState.name}の${opPokeState.weapon}weaponText`);
          }
        }
      }, 1000);
      //死亡時は死亡テキストをセット
    } else {
      saveHp(who);
      const name = isMy ? myPokeState.name : opPokeState.name;
      setText(`${isMy ? "" : "相手の"}${name}は倒れたdeadText`);
    }
  };

  //stateにweaponがセットされたときの処理
  const toDoWhenSetWeapon = (who) => {
    //自分の技がセットされたら、相手の技をセット
    if (who === "my") {
      choiseOpWeapon();
    }
    //相手の技がセットされたら、先攻後攻を決める
    else if (who === "op") {
      const mySpeed = pokeInfo[myPokeState.name].s;
      const opSpeed = pokeInfo[opPokeState.name].s;

      if (skipTurn) {
        handleStateChange("myTurn", "after");
      }
      // 同速の場合ランダムで先攻を決める
      else if (mySpeed === opSpeed) {
        const isMyTurnFirst = Math.random() < 0.5;
        console.log(isMyTurnFirst ? "同速のためランダムで先攻になった" : "同速のためランダムで後攻になった");
        handleStateChange("myTurn", isMyTurnFirst ? "first" : "after");
      } else {
        handleStateChange("myTurn", mySpeed > opSpeed ? "first" : "after");
      }
    }
  };

  //先攻後攻がセットされたら、先攻の技をセットする
  const toDoWhenSetMyturn = () => {
    if (myTurn === "first") {
      const text = `${myPokeState.name}！${myPokeState.weapon}！weaponText`;
      handleStateChange("myText", text);
    } else if (myTurn === "after") {
      const text = `相手の${opPokeState.name}の${opPokeState.weapon}weaponText`;
      handleStateChange("opText", text);
    }
  };

  // テキストがセットされたときの処理
  const toDoWhenSetText = (who) => {
    const isMy = who === "my";
    const state = isMy ? myPokeState : opPokeState;
    const setState = isMy ? setMyPokeState : setOpPokeState;

    const includes = (text) => state.text.includes(text);

    //攻撃倍率によって相性テキストを返す
    const makeCompatiText = (multiplier) => (
      multiplier >= 2 ? compatiTexts.batsugun :
        multiplier === 1 ? compatiTexts.toubai :
          multiplier > 0 ? compatiTexts.imahitotsu :
            compatiTexts.mukou
    );

    const setCompatiText = () => {
      const state = isMy ? myPokeState : opPokeState;
      const defender = isMy ? opPokeState.name : myPokeState.name;
      const textKey = isMy ? "opText" : "myText";

      const attackType = weaponInfo[state.weapon].type;
      const [defType1, defType2] = [pokeInfo[defender].type1, pokeInfo[defender].type2];
      const multiplier = (typeChart[attackType][defType1] ?? 1) * (typeChart[attackType][defType2] ?? 1);
      const text = makeCompatiText(multiplier) + "compatiText" + multiplier;
      handleStateChange(textKey, text);
    };

    //画像を取得して死亡エフェクトのスタイルを付与する
    const deadEffect = (who) => {
      setOtherAreaVisible(prev => ({ ...prev, actionCmd: false }));
      setSkipTurn(false);

      const isMy = who === "my";
      const pokeState = isMy ? myPokeState : opPokeState;
      const setAreaVisible = isMy ? setMyAreaVisible : setOpAreaVisible;
      const setPokeState = isMy ? setMyPokeState : setOpPokeState;
      const imgClass = isMy ? ".my-poke-img" : ".op-poke-img";

      const pokeIMGElm = document.querySelector(imgClass);

      setTimeout(() => {
        setOtherAreaVisible(prev => ({ ...prev, text: true }));
        setAreaVisible(prev => ({ ...prev, text: true }));
        playPokeVoice(pokeState.name);
        pokeIMGElm.classList.add("pokemon-dead");
      }, 1000);

      setTimeout(() => {
        setOtherAreaVisible(prev => ({ ...prev, text: false }));
        setAreaVisible(prev => ({ ...prev, text: false, name: false }));
        setPokeState(prev => ({ ...prev, life: pokeState.life - 1 }));
      }, 3001);
    };

    // --- テキスト内容に応じた分岐処理 ---

    //goTextがセットされたら表示制御
    if (includes("goText")) {
      if (who === "my") {
        //初回登場時と交代時、死亡後の次のポケモンを出すときの共通の表示制御
        showGoSequence(
          [setMyAreaVisible, setMyAreaVisible, playPokeVoice],
          myPokeState.name,
          1000
        );
        //初回登場時のみの表示制御
        if (!opAreaVisible.name) {
          showGoSequence(
            [setOpAreaVisible, setOpAreaVisible, playPokeVoice],
            opPokeState.name,
            3000
          );
          delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 5000);
        }
        //初回登場時以外の表示制御
        else if (!opAreaVisible.name || !skipTurn) {
          delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 3000);    //コマンドエリア表示
        }
        //交代エフェクトが終わったら、相手の技をセット
        else if (skipTurn) {
          console.log(`skipTurn:${skipTurn}`);
          delay(() => choiseOpWeapon(), 3000);
        }
      }
      //２体目以降の相手の画像がセットされたら表示制御
      else if (who === "op" && opPokeState.life < 3 && opPokeState.life > 0) {
        showGoSequence(
          [setOpAreaVisible, setOpAreaVisible, playPokeVoice],
          opPokeState.name,
          1000
        );
        delay(() => setOtherAreaVisible(prev => ({ ...prev, actionCmd: true })), 3000);
      }
      // // 登場時に画像をセット

    } else if (includes("backText") && isMy) {
      // 自分が交代するとき
      playSe("back");
      setOtherAreaVisible(p => ({ ...p, text: true }));
      setMyAreaVisible(p => ({ ...p, text: true }));

      setTimeout(() => {
        setMyAreaVisible(p => ({ ...p, name: false }));
        setMyPokeState(p => ({ ...p, name: changePokeName.current }));
      }, 1000);

    } else if (includes("weaponText")) {
      // 攻撃テキストのあとに相性テキストを表示
      setCompatiText();

    } else if (includes("compatiText")) {
      // 相性テキストのあとにダメージ計算
      const match = state.text.match(/(\d+(\.\d+)?)/);
      const multiplier = match ? Number(match[0]) : 1;
      const damage = 100 * multiplier;   //ダメージ計算  攻撃力は50で固定

      console.log(`${isMy ? "自分" : "相手"}に${damage}ダメージ（50*${multiplier}）`);
      toDoWhenSetDamage(who, damage);

    } else if (includes("deadText")) {
      // 倒されたときの処理
      deadEffect(who);
    }
  };

  // ダメージ数がセットされたとき、技名表示＆鳴き声→攻撃エフェクト＆SE→ダメージエフェクト
  const toDoWhenSetDamage = (who, damagePt) => {

    //ジャンプ
    const junpEffect = (selector) => {
      const elem = document.querySelector(selector);
      if (!elem) return;

      elem.classList.remove("jump"); // ← 一回消しておくと連続ジャンプにも対応
      void elem.offsetWidth;         // ← 再描画を強制するテク（重要）
      elem.classList.add("jump");

      setTimeout(() => {
        elem.classList.remove("jump");
      }, 400); // アニメーション時間と合わせる
    };

    //攻撃エフェクト
    const attackEffect = (selector) => {
      const elem = document.querySelector(selector);
      if (!elem) return;

      const attackClass = selector === ".my-poke-img" ? "my-attack" : "op-attack";

      elem.classList.remove(attackClass);
      void elem.offsetWidth; // 再描画を強制
      elem.classList.add(attackClass);

      setTimeout(() => {
        elem.classList.remove(attackClass); // アニメーション終了後にクラスを削除
      }, 500); // アニメーション時間
    };

    //ダメージエフェクトとダメージの反映
    const damageEffect = (who, damagePt) => {
      const isMy = who === "my";
      const pokeState = isMy ? myPokeState : opPokeState;
      const setAreaVisible = isMy ? setMyAreaVisible : setOpAreaVisible;
      const setOtherTextInvisible = isMy ? setOpAreaVisible : setMyAreaVisible;
      const hpKey = isMy ? "myHp" : "opHp";
      const imgClass = isMy ? ".my-poke-img" : ".op-poke-img";

      setOtherTextInvisible(prev => ({ ...prev, text: false }));
      if (pokeState.text.includes(compatiTexts.toubai)) {
        setOtherAreaVisible(prev => ({ ...prev, text: false }));
      }
      setAreaVisible(prev => ({ ...prev, text: true }));

      const pokeIMGElem = document.querySelector(imgClass);
      const hpBarElem = document.querySelector(isMy ? ".my-hp-bar" : ".op-hp-bar");
      const name = pokeState.name;
      const fullHp = pokeInfo[name].h;
      const newHp = Math.max(0, pokeState.h - damagePt);
      const hpPercent = Math.round((newHp / fullHp) * 100);

      console.log(`最大HP：${fullHp}/残HP：${newHp}/残量${hpPercent}%`);

      // ★HPバーのエフェクトだけ先に独立させる
      hpBarElem.style.width = `${hpPercent}%`;

      // 色クラスも付け替え
      hpBarElem.classList.remove("low", "mid");
      if (hpPercent <= 25) {
        hpBarElem.classList.add("low");
      } else if (hpPercent <= 50) {
        hpBarElem.classList.add("mid");
      }

      // ★実際のステート更新は少し後
      setTimeout(() => {
        handleStateChange(hpKey, newHp);
      }, 600); // transition時間と合わせる

      // ダメージエフェクト（無効でなければ）
      if (pokeIMGElem && !pokeState.text.includes(compatiTexts.mukou)) {
        pokeIMGElem.classList.add("pokemon-damage-effect");
        setTimeout(() => {
          pokeIMGElem.classList.remove("pokemon-damage-effect");
        }, 1000);
      }
    };


    //攻撃の始まりから終わりまでのエフェクトまとめ
    const playAndHandleDamage = (attacker, damageTarget, damage) => {
      const imgClassName = attacker === myPokeState ? ".my-poke-img" : ".op-poke-img";
      junpEffect(imgClassName);
      playPokeVoice(attacker.name, () => {
        attackEffect(imgClassName);
        playWeaponSound(attacker.weapon, () => {
          damageEffect(damageTarget, damage);
          if (!attacker.text.includes(compatiTexts.mukou)) {
            playDamageSound(damageTarget);
          }
        });
      });
    };

    if (who === "my") {
      setOtherAreaVisible(prev => ({ ...prev, text: true }));
      setOpAreaVisible(prev => ({ ...prev, text: true }));
      playAndHandleDamage(opPokeState, "my", damagePt);
    } else if (who === "op") {
      setOtherAreaVisible(prev => ({ ...prev, text: true }));
      setMyAreaVisible(prev => ({ ...prev, text: true }));
      playAndHandleDamage(myPokeState, "op", damagePt);
    }
  };

  //ライフがセットされたときの処理
  const toDoWhenSetLife = (who) => {
    const setWinner = (winner) => {
      stopBgm();
      setResultText(winner === "my" ? "WIN" : "LOSE");
    };

    const selectNextOpPoke = () => {
      const myTypes = [pokeInfo[myPokeState.name].type1, pokeInfo[myPokeState.name].type2];
      const opPokemons = [opPokeState.poke2Name, opPokeState.poke3Name].map(name => ({
        name,
        types: [pokeInfo[name].type1, pokeInfo[name].type2],
        speed: pokeInfo[name].s,
      }));

      const calcMultiplier = (atkTypes, defTypes) =>
        Math.max(...atkTypes.flatMap(atk => defTypes.map(def => typeChart[atk]?.[def] ?? 1)));

      const myToOp = opPokemons.map(op => calcMultiplier(myTypes, op.types));
      const opToMy = opPokemons.map(op => calcMultiplier(op.types, myTypes));

      if (myToOp[0] === myToOp[1]) {
        const target = opToMy[0] !== opToMy[1]
          ? (opToMy[0] > opToMy[1] ? opPokemons[0] : opPokemons[1])
          : (opPokemons[0].speed > opPokemons[1].speed ? opPokemons[0] : opPokemons[1]);
        setOpPokeState(prev => ({ ...prev, name: target.name }));
      } else {
        const worse = myToOp[0] > myToOp[1] ? 0 : 1;
        const better = 1 - worse;
        const mySpeed = pokeInfo[myPokeState.name].s;
        const prefer = (opPokemons[worse].speed > mySpeed && opToMy[worse] >= 2)
          ? (opPokemons[better].speed > mySpeed && opToMy[better] >= 2 ? opPokemons[better] : opPokemons[worse])
          : opPokemons[better];
        setOpPokeState(prev => ({ ...prev, name: prefer.name }));
      }
    };

    const pokeState = who === "my" ? myPokeState : opPokeState;
    const isMy = who === "my";

    if (isMy) {
      if (pokeState.life < 3 && pokeState.life > 0) {
        setOtherAreaVisible(prev => ({ ...prev, nextPokeCmd: true }));
      } else if (pokeState.life <= 0) {
        setWinner("op");
      }
    } else {
      if (pokeState.life === 2) {
        selectNextOpPoke();
      } else if (pokeState.life === 1) {
        const next = opPokeState.poke2H === 0 ? pokeState.poke3Name : pokeState.poke2Name;
        setOpPokeState(prev => ({ ...prev, name: next }));
      } else if (pokeState.life <= 0) {
        setWinner("my");
      }
    }
  };


  //複数の呼び出し先がある関数=================================================================================

  //Stateに同じ値がセットされたときにトリガーを更新して、強制的にuseEffectを発火させる
  const handleStateChange = (stateName, newState) => {
    const updateState = (setter, triggerSetter, key) => {
      setter(prev => {
        if (prev[key] === newState) {
          console.log(`トリガー更新：${stateName}は変わらず「${newState}」`);
          triggerSetter(prev => ({ ...prev, [key]: prev[key] + 1 }));
          return prev;
        } else {
          console.log(`${stateName}を「${newState}」に更新する`);
          return { ...prev, [key]: newState };
        }
      });
    };

    const cases = {
      myWeapon: () => updateState(setMyPokeState, setMyPokeStateTrigger, "weapon"),
      myText: () => updateState(setMyPokeState, setMyPokeStateTrigger, "text"),
      myHp: () => updateState(setMyPokeState, setMyPokeStateTrigger, "h"),
      myTurn: () => {
        setMyTurn(prev => {
          if (prev === newState) {
            console.log(`トリガー更新：${stateName}は変わらず「${newState}」`);
            setMyTurnTrigger(t => t + 1);
            return prev;
          } else {
            console.log(`${stateName}を「${newState}」に更新する`);
            return newState;
          }
        });
      },
      opWeapon: () => updateState(setOpPokeState, setOpPokeStateTrigger, "weapon"),
      opText: () => updateState(setOpPokeState, setOpPokeStateTrigger, "text"),
      opHp: () => updateState(setOpPokeState, setOpPokeStateTrigger, "h"),
    };

    cases[stateName]?.();
  };

  //toDoWhenSetImg()の共通部品
  const showGoSequence = (areaSetters, name, delayBase) => {
    const [setTextVisible, setMainVisible, playVoice] = areaSetters;
    delay(() => setOtherAreaVisible(prev => ({ ...prev, text: true })), delayBase);
    delay(() => setTextVisible(prev => ({ ...prev, text: true })), delayBase);
    delay(() => setMainVisible(prev => ({ ...prev, name: true })), delayBase + 1000);
    delay(() => playPokeVoice(name), delayBase + 1000);
    delay(() => setOtherAreaVisible(prev => ({ ...prev, text: false })), delayBase + 2000);
    delay(() => setTextVisible(prev => ({ ...prev, text: false })), delayBase + 2000);
  };

  //相手が自分のバトル場のポケモンに対して、相性の良い技をセットする
  const choiseOpWeapon = () => {
    const myPoke = skipTurn ? beforePokeName.current : myPokeState.name;
    //２つの技で相手への相性を比較する
    const attackType1 = weaponInfo[pokeInfo[opPokeState.name].weapon1].type;
    const attackType2 = weaponInfo[pokeInfo[opPokeState.name].weapon2].type;
    const [defType1, defType2] = [pokeInfo[myPoke].type1, pokeInfo[myPoke].type2];
    const multiplier1 = (typeChart[attackType1][defType1] ?? 1) * (typeChart[attackType1][defType2] ?? 1);
    const multiplier2 = (typeChart[attackType2][defType1] ?? 1) * (typeChart[attackType2][defType2] ?? 1);

    //相性が良い方をセットする　どちらも同じ場合は技１をセットする
    const weapon = multiplier1 >= multiplier2 ? pokeInfo[opPokeState.name].weapon1 : pokeInfo[opPokeState.name].weapon2;
    handleStateChange("opWeapon", weapon);
  }

  //残りHPを保存
  const saveHp = (who) => {
    const state = who === "my" ? myPokeState : opPokeState;
    const hpKey = ["poke1Name", "poke2Name", "poke3Name"]
      .find(key => state[key] === state.name)
      ?.replace("Name", "H");

    if (hpKey) state[hpKey] = state.h;
  };

  //setTimeout()の簡略化
  const delay = (fn, ms) => setTimeout(fn, ms);

  //ターン数を更新してコンソールに表示する。（デバッグ用）
  const updateTurnCnt = () => {
    console.log(turnCnt.current + "ターン目================================================");
    turnCnt.current++;
  }

  //textから余計な文字を取り除く（UI表示用）
  const getTrueText = (text) => {
    const tags = ["goText", "backText", "weaponText", "compatiText", "deadText"];
    const index = tags.find(tag => text.includes(tag));
    let trueText = index ? text.slice(0, text.indexOf(index)) : text;
    return trueText === compatiTexts.toubai ? "" : trueText;
  };

  return {
    start,
    handleSelect,
    confirmSelection,
    openBattleCmdArea,
    openChangeCmdArea,
    backCmd,
    battle,
    changeMyPoke,
    nextMyPoke,
    goTop,
    playSe,
    playPokeVoice,
    playWeaponSound,
    playDamageSound,
    setBgm,
    stopBgm,
    handleStateChange,
    toDoWhenSetPokeName,
    toDoWhenSetImg,
    toDoWhenSetWeapon,
    toDoWhenSetMyturn,
    toDoWhenSetText,
    toDoWhenSetHp,
    toDoWhenSetLife,
    getTrueText
  };
}
