//一般変数========================================================================================================================================

//サウンド
export const soundList = {
  general: {
    decide: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/decideSe.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    start: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/startSe.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    select: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/selectSe.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    terastal: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/terastal.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    cancel: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/cancelSe.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    back: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/backSe.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    statusUp: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/statusUp.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    statusDown: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/statusDown.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    paralyzed: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/paralyzed.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    burned: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/burned.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    poisoned: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/poisoned.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    frozen: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/frozen.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    win: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/winSe.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    lose: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/general/loseSe.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
  },
  bgm: {
    selection: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/bgm/selectionBgm.wav');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    battle: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/bgm/battleBgm.wav');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
  },
  damage: {
    batsugun: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/damage/batsugun.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    toubai: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/damage/toubai.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
    imahitotsu: (() => {
      const a = new Audio('https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/sound/damage/imahitotsu.mp3');
      a.preload = 'auto';
      a.load();
      return a;
    })(),
  }
};

//テラスタル画像
export const terastalImgList = {
  ノーマル: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/normalTerastal.png",
  ほのお: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/honoTerastal.png",
  みず: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/mizuTerastal.png",
  でんき: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/denkiTerastal.png",
  くさ: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/kusaTerastal.png",
  かくとう: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/kakutoTerastal.png",
  こおり: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/koriTerastal.png",
  どく: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/dokuTerastal.png",
  じめん: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/jimenTerastal.png",
  ひこう: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/hikoTerastal.png",
  エスパー: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/esperTerastal.png",
  むし: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/mushiTerastal.png",
  いわ: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/iwaTerastal.png",
  ゴースト: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/ghostTerastal.png",
  ドラゴン: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/dragonTerastal.png",
  あく: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/akuTerastal.png",
  はがね: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/haganeTerastal.png",
  フェアリー: "https://pokemon-battle-bucket.s3.ap-northeast-1.amazonaws.com/img/terastalImg/fairyTerastal.png",
}

//技相性テキスト
export const compatiTexts = {
  batsugun: "効果はバツグンだ",
  toubai: "等倍ダメージ",
  imahitotsu: "効果はいまひとつのようだ",
  mukou: "効果がないようだ"
}

//タイプ相性表 
export const typeChart = {
  ノーマル: { いわ: 0.5, ゴースト: 0, はがね: 0.5 },
  ほのお: { ほのお: 0.5, みず: 0.5, くさ: 2, こおり: 2, むし: 2, いわ: 0.5, ドラゴン: 0.5, はがね: 2 },
  みず: { ほのお: 2, みず: 0.5, くさ: 0.5, じめん: 2, いわ: 2, ドラゴン: 0.5 },
  でんき: { みず: 2, でんき: 0.5, くさ: 0.5, じめん: 0, ひこう: 2, ドラゴン: 0.5 },
  くさ: { ほのお: 0.5, みず: 2, くさ: 0.5, どく: 0.5, じめん: 2, ひこう: 0.5, むし: 0.5, いわ: 2, ドラゴン: 0.5, はがね: 0.5 },
  かくとう: { ノーマル: 2, こおり: 2, どく: 0.5, ひこう: 0.5, エスパー: 0.5, むし: 0.5, いわ: 2, ゴースト: 0, あく: 2, はがね: 2, フェアリー: 0.5 },
  こおり: { ほのお: 0.5, みず: 0.5, くさ: 2, こおり: 0.5, じめん: 2, ひこう: 2, ドラゴン: 2, はがね: 0.5 },
  どく: { くさ: 2, どく: 0.5, じめん: 0.5, いわ: 0.5, ゴースト: 2, はがね: 0, フェアリー: 2 },
  じめん: { ほのお: 2, でんき: 2, くさ: 0.5, どく: 2, ひこう: 0, むし: 0.5, いわ: 2, はがね: 2 },
  ひこう: { でんき: 0.5, くさ: 2, かくとう: 2, むし: 2, いわ: 0.5, はがね: 0.5 },
  エスパー: { かくとう: 2, どく: 2, エスパー: 0.5, あく: 0, はがね: 0.5 },
  むし: { ほのお: 0.5, くさ: 2, かくとう: 0.5, どく: 0.5, ひこう: 0.5, エスパー: 2, ゴースト: 0.5, あく: 2, はがね: 0.5, フェアリー: 0.5 },
  いわ: { ほのお: 2, こおり: 2, かくとう: 0.5, じめん: 0.5, ひこう: 2, むし: 2, はがね: 0.5 },
  ゴースト: { ノーマル: 0, エスパー: 2, ゴースト: 2, あく: 0.5 },
  ドラゴン: { ドラゴン: 2, はがね: 0.5, フェアリー: 0 },
  あく: { かくとう: 0.5, エスパー: 2, ゴースト: 2, あく: 0.5, フェアリー: 0.5 },
  はがね: { ほのお: 0.5, みず: 0.5, でんき: 0.5, こおり: 2, いわ: 2, はがね: 0.5, フェアリー: 2 },
  フェアリー: { ほのお: 0.5, かくとう: 2, どく: 0.5, ドラゴン: 2, あく: 2, はがね: 0.5 },
  なし: {}
};

export const typeColors = {
  ノーマル: "#A8A77A",
  ほのお: "#EE8130",
  みず: "#6390F0",
  でんき: "#F7D02C",
  くさ: "#7AC74C",
  こおり: "#96D9D6",
  かくとう: "#C22E28",
  どく: "#A33EA1",
  じめん: "#E2BF65",
  ひこう: "#A98FF3",
  エスパー: "#F95587",
  むし: "#A6B91A",
  いわ: "#B6A136",
  ゴースト: "#735797",
  ドラゴン: "#6F35FC",
  あく: "#705746",
  はがね: "#B7B7CE",
  フェアリー: "#D685AD",
};

export const conditionColors = {
  まひ: "#FFD700",
  やけど: "#FF4500",
  どく: "#6A0DAD",
  ねむり: "#6699CC",
  こおり: "#99CCFF",
};

//値を返すのみでreactの状態に関与しない関数==================================================================

//相手のポケモン全ての受け/攻め相性と素早さを計算して返す。
export const calcResistanceForAllOpPokes = (myPokeInfos, opPokeInfos) => {
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
};

//相手６体の耐性などをまとめた情報を受け取り、ソートして選出する３体を選ぶ
export const selectBetterOpPokesLogic = (resistanceMap, myPoke1Info) => {
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
      const m1 = calcMultiplier(myPoke1Info.type1, opPoke.type1, opPoke.type2);
      const m2 = myPoke1Info.type2 !== "なし"
        ? calcMultiplier(myPoke1Info.type2, opPoke.type1, opPoke.type2)
        : 0;
      let maxVal = Math.max(m1, m2);

      return maxVal; // 小さい方が耐性高い
    };

    return calcDefenseScore(a) - calcDefenseScore(b); // 昇順（耐性が高い順）
  });

  betterOpPokes = betterOpPokes.map(poke => poke.name);

  console.log(resistanceMap);
  console.log(`相手のポケモン\n１体目：${betterOpPokes[0]}\n２体目：${betterOpPokes[1]}\n３体目：${betterOpPokes[2]}`);

  return betterOpPokes;
};

//ダメージ後のHpを取得する
export const calcNewHp = (currentHp, damage) => {
  const newHp = Math.max(0, currentHp - damage);
  return newHp;
}

//テラスタルテキストを取得する
export const getTerastalText = (isMe, pokeName) => {
  const terastalText = isMe
    ? `${pokeName}！テラスタル！`
    : `相手の${pokeName}はテラスタルした！`;
  return terastalText;
}

//weaponテキストを取得する
export const getWeaponText = (isMe, pokeName, weaponName) => {
  const weaponText = isMe ? `${pokeName}！${weaponName}！` : `相手の${pokeName}の${weaponName}`;
  return weaponText;
}

//getCompatiText()のロジック
export const getCompatiTextLogic = (multiplier) => {
  let compatiText = "";
  if (multiplier >= 2)
    compatiText = compatiTexts.batsugun;
  else if (multiplier === 1)
    compatiText = compatiTexts.toubai;
  else if (multiplier > 0)
    compatiText = compatiTexts.imahitotsu;
  else
    compatiText = compatiTexts.mukou;
  return compatiText;
}

//deadテキストを取得する
export const getDeadText = (isMe, pokeName) => {
  const deadText = isMe ? `${pokeName}は倒れた` : `相手の${pokeName}は倒れた`;
  return deadText;
}

//相手が交代できる控えポケモンを取得する
export const getOpChangePoke = (aliveOpBenchPokes, dangerousType, safeType, IsDangerousTerastal, terastalType) => {
  let opChangePokeName = null

  //相手の控えが自分のバトルポケモンから受けるダメージをまとめる
  const [val21, val22] = dangerousType.length > 0
    ? getCompati(dangerousType[0], (dangerousType[1] ? dangerousType[1] : safeType[0]), aliveOpBenchPokes[0].type1, aliveOpBenchPokes[0].type2)
    : getCompati(safeType[0], (safeType[1] ? safeType[1] : safeType[0]), aliveOpBenchPokes[0].type1, aliveOpBenchPokes[0].type2);
  const val23 = terastalType
    ? calcMultiplier(terastalType, aliveOpBenchPokes[0].type1, aliveOpBenchPokes[0].type2)
    : null;

  let [val31, val32, val33] = [null, null];
  if (aliveOpBenchPokes.length === 2) {
    [val31, val32] = dangerousType.length > 0
      ? getCompati(dangerousType[0], (dangerousType[1] ? dangerousType[1] : safeType[0]), aliveOpBenchPokes[1].type1, aliveOpBenchPokes[1].type2)
      : getCompati(safeType[0], (safeType[1] ? safeType[1] : safeType[0]), aliveOpBenchPokes[1].type1, aliveOpBenchPokes[1].type2);
    val33 = terastalType
      ? calcMultiplier(terastalType, aliveOpBenchPokes[1].type1, aliveOpBenchPokes[1].type2)
      : null;
  }

  if (dangerousType.length === 2) {
    if (IsDangerousTerastal) {
      if ((val21 + val22 + val23) <= 1.5) {
        if (val31 && (val31 + val32 + val33) <= 1.5) {
          if ((val21 + val22 + val23) !== (val31 + val32 + val33))
            opChangePokeName =
              (val21 + val22 + val23) < (val31 + val32 + val33) ? aliveOpBenchPokes[0].name : aliveOpBenchPokes[1].name;
          else
            opChangePokeName =
              aliveOpBenchPokes[0].s > aliveOpBenchPokes[1].s ? aliveOpBenchPokes[0].name : aliveOpBenchPokes[1].name;
        }
        else
          opChangePokeName = aliveOpBenchPokes[0].name;
      }
      else if (val31 && (val31 + val32 + val33) <= 1.5)
        opChangePokeName = aliveOpBenchPokes[1].name;
    }
    else {
      if ((val21 + val22) <= 1) {
        if (val31 && (val31 + val32) <= 1) {
          if ((val21 + val22) !== (val31 + val32))
            opChangePokeName =
              (val21 + val22) < (val31 + val32) ? aliveOpBenchPokes[0].name : aliveOpBenchPokes[1].name;
          else
            opChangePokeName =
              aliveOpBenchPokes[0].s > aliveOpBenchPokes[1].s ? aliveOpBenchPokes[0].name : aliveOpBenchPokes[1].name;
        }
        else
          opChangePokeName = aliveOpBenchPokes[0].name;
      }
      else if (val31 && (val31 + val32) <= 1)
        opChangePokeName = aliveOpBenchPokes[1].name;
    }
  }
  else if (dangerousType.length === 1) {
    if (IsDangerousTerastal) {
      if (val21 <= 0.5 && val22 <= 1 && val23 <= 0.5) {
        if (val31 && val31 <= 0.5 && val32 <= 1 && val33 <= 0.5) {
          if ((val21 + val22 + val23) !== (val31 + val32 + val33))
            opChangePokeName =
              (val21 + val22 + val23) < (val31 + val32 + val33) ? aliveOpBenchPokes[0].name : aliveOpBenchPokes[1].name;
          else
            opChangePokeName =
              aliveOpBenchPokes[0].s > aliveOpBenchPokes[1].s ? aliveOpBenchPokes[0].name : aliveOpBenchPokes[1].name;
        }
        else
          opChangePokeName = aliveOpBenchPokes[0].name;
      }
      else if (val31 && val31 <= 0.5 && val32 <= 1 && val33 <= 0.5)
        opChangePokeName = aliveOpBenchPokes[1].name;
    }
    else {
      if (val21 <= 0.5 && val22 <= 1 && (val23 ? val23 <= 1 : true)) {
        if (val31 && val31 <= 0.5 && val32 <= 1 && (val33 ? val33 <= 1 : true)) {
          if ((val21 + val22 + val23) !== (val31 + val32 + val33))
            opChangePokeName =
              (val21 + val22 + val23) < (val31 + val32 + val33) ? aliveOpBenchPokes[0].name : aliveOpBenchPokes[1].name;
          else
            opChangePokeName =
              aliveOpBenchPokes[0].s > aliveOpBenchPokes[1].s ? aliveOpBenchPokes[0].name : aliveOpBenchPokes[1].name;
        }
        else
          opChangePokeName = aliveOpBenchPokes[0].name;
      }
      else if (val31 && val31 <= 0.5 && val32 <= 1 && (val33 ? val33 <= 1 : true))
        opChangePokeName = aliveOpBenchPokes[1].name;
    }
  }
  else {
    if (val21 <= 1 && val22 <= 1 && val23 <= 0.5) {
      if (val31 && val31 <= 1 && val32 <= 1 && val33 <= 0.5) {
        if (val23 !== val33)
          opChangePokeName = val23 < val33 ? aliveOpBenchPokes[0].name : aliveOpBenchPokes[1].name;
        else
          opChangePokeName =
            aliveOpBenchPokes[0].s > aliveOpBenchPokes[1].s ? aliveOpBenchPokes[0].name : aliveOpBenchPokes[1].name;
      }
      else
        opChangePokeName = aliveOpBenchPokes[0].name;
    }
    else if (val31 && val31 <= 1 && val32 <= 1 && val33 <= 0.5)
      opChangePokeName = aliveOpBenchPokes[1].name;
  }

  return opChangePokeName;
}

//先攻後攻を決めるロジック
export const checkIsFirst = (myPokeSpeed, opPokeSpeed, myWeaponPriority, opWeaponPriority) => {
  let isFirst = false;

  //優先度が同じ場合、素早さが速い方が先攻
  if (myWeaponPriority === opWeaponPriority) {
    if (myPokeSpeed !== opPokeSpeed)
      isFirst = myPokeSpeed > opPokeSpeed;
    // 同速の場合ランダムで先攻を決める
    else {
      isFirst = Math.random() < 0.5;
      console.log(`同速のためランダムで${isFirst ? "先攻" : "後攻"}になった`);
    }
  }
  //優先度が異なる場合、優先度が高い方が先攻
  else {
    isFirst = myWeaponPriority > opWeaponPriority;
    console.log(`技の優先度差で${isFirst ? "先攻" : "後攻"}`);
  }

  return isFirst;
}

// 相性倍率を求めて、相性テキストを返す
export const getCompatiTextForWeaponInfoList = (weaponType, defType1, defType2) => {
  const multiplier = calcMultiplier(weaponType, defType1, defType2)
  let compatiText = "";
  if (multiplier >= 2)
    compatiText = "効果ばつぐん";
  else if (multiplier === 1)
    compatiText = "効果あり";
  else if (multiplier < 1 && multiplier > 0)
    compatiText = "いまひとつ";
  else
    compatiText = "効果なし";
  return compatiText;
};

//相性倍率を取得する
export const calcMultiplier = (weaponType, defType1, defType2) => {
  const multiplier = (typeChart[weaponType][defType1] ?? 1) * (typeChart[weaponType][defType2] ?? 1);
  return multiplier;
}

//getMostEffectiveWeapon()のロジック
export const getMostEffectiveWeaponLogic = (weaponInfos, atcInfos, defInfos) => {
  //相手の全ての攻撃技で、自分のポケモンに与えるダメージを取得
  const [opW1Damage, opW2Damage, opW3Damage, opW4Damage] = [0, 1, 2, 3].map(
    i => calcPureDamage(weaponInfos[i], atcInfos[i], defInfos[i]).pureDamage
  );

  //相手の全ての技の優先度を取得
  const [opW1Priority, opW2Priority, opW3Priority, opW4Priority] = weaponInfos.map(w => w.priority);

  // 技とダメージ・優先度をまとめる
  const opWeapons = weaponInfos.map((w, i) => ({
    name: w.name,
    damage: [opW1Damage, opW2Damage, opW3Damage, opW4Damage][i],
    priority: [opW1Priority, opW2Priority, opW3Priority, opW4Priority][i],
  }));

  //与えるダメージが最も大きい技のインデックスを取得
  const opStrongestWeaponIndex = opWeapons
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

  //最も与えるダメージが大きい技のダメージ
  const strongestWeaponDamage = Math.floor(opWeapons[opStrongestWeaponIndex].damage * 0.85);
  //最も与えるダメージが大きい先制技, 最も与えるダメージが大きい先制技(最低乱数)
  let strongestHighPriorityWeaponDamage = null;
  if (strongestHighPriorityWeaponIndex) {
    strongestHighPriorityWeaponDamage = Math.round(opWeapons[strongestHighPriorityWeaponIndex].damage * 0.85);
  }

  console.log(`最大火力\n${opWeapons[0].name}：${opWeapons[0].damage}\n${opWeapons[1].name}：${opWeapons[1].damage}\n${opWeapons[2].name}：${opWeapons[2].damage}\n${opWeapons[3].name}：${opWeapons[3].damage}`);

  return { opStrongestWeaponIndex, strongestWeaponDamage, strongestHighPriorityWeaponIndex, strongestHighPriorityWeaponDamage }
}

//predictMyAction()のロジック
export const predictMyActionLogic = (weaponInfos, atcInfos, defInfos, randomMultiplier) => {
  // 各技のダメージを計算して配列にする
  const damageList = [
    calcPureDamage(weaponInfos[0], atcInfos[0], defInfos[0]).pureDamage,
    calcPureDamage(weaponInfos[1], atcInfos[1], defInfos[1]).pureDamage,
    calcPureDamage(weaponInfos[2], atcInfos[2], defInfos[2]).pureDamage,
    calcPureDamage(weaponInfos[3], atcInfos[3], defInfos[3]).pureDamage,
  ];

  // 最大ダメージのインデックスを取得
  const myStrongestWeaponIndex = damageList.reduce((maxIdx, current, idx, arr) =>
    current > arr[maxIdx] ? idx : maxIdx, 0
  );
  
  const myMaxDamage = damageList[myStrongestWeaponIndex] * randomMultiplier;
  const myMaxDamageWeaponType = weaponInfos[myStrongestWeaponIndex].type;

  return { myStrongestWeaponIndex, myMaxDamageWeaponType, myMaxDamage };
}


//相手目線で合理的な技を選択して返す
export const choiseBetterWeapon = (strongestWeaponIndex, strongestHighPriorityWeaponIndex, strongestHighPriorityWeaponDamage, myMaxDamage, myPokeSpeed, opPokeSpeed, myPokeHp, opPokeHp) => {
  let betterWeapon = "";
  //先制技を持っていているとき
  if (strongestHighPriorityWeaponIndex) {
    //相手の方が遅く、自分の攻撃の最低乱数で、相手が倒れる時は先制技を選択する(無効の場合を除く)
    if (myPokeSpeed > opPokeSpeed && opPokeHp <= myMaxDamage && strongestHighPriorityWeaponDamage !== 0)
      betterWeapon = strongestHighPriorityWeaponIndex;
    //先制技(最低乱数)で自分を倒せる場合は先制技を選択する
    else
      betterWeapon = strongestHighPriorityWeaponDamage >= myPokeHp ? strongestHighPriorityWeaponIndex : strongestWeaponIndex;
  }
  //通常は一番与えるダメージが大きい技を選択する
  else
    betterWeapon = strongestWeaponIndex;

  return betterWeapon;
}

// 攻め側のエレメントを取得する
export const getAttackEffectElem = (atcIsMe) => {
  const atcImgElem = document.querySelector(atcIsMe ? `.my-poke-img` : `.op-poke-img`);
  return atcImgElem;
}

// 受け側のエレメントを取得する
export const getDamageEffectElem = (isMe) => {
  const defImgElem = document.querySelector(isMe ? `.my-poke-img` : `.op-poke-img`);
  return defImgElem;
}

//ジャンプエフェクト
export const jumpEffect = (isMe) => {
  const elem = getAttackEffectElem(isMe);
  elem.classList.remove("jump"); // ← 一回消しておくと連続ジャンプにも対応
  void elem.offsetWidth;         // ← 再描画を強制するテク（重要）
  elem.classList.add("jump");
  delay(() => elem.classList.remove("jump"), 400);
}

//attackEffect()のロジック
export const attackEffectLogic = (isMe) => {
  const elem = getAttackEffectElem(isMe);
  const attackClass = isMe ? "my-attack" : "op-attack";
  elem.classList.remove(attackClass);
  void elem.offsetWidth; // 再描画を強制
  elem.classList.add(attackClass);
  delay(() => elem.classList.remove(attackClass), 500);
}

//damageEffect()のロジック
export const damageEffectLogic = (isMe) => {
  const elem = getDamageEffectElem(isMe);
  elem.classList.add("pokemon-damage-effect");
  delay(() => elem.classList.remove("pokemon-damage-effect"), 1000);
}

//ダメージ計算　ダメージ数/命中判定/急所判定　を返す
export const calcTrueDamage = (weaponInfo, atcInfo, defInfo) => {
  let trueDamage = 0;
  let realDamage = 0;
  const isHit = weaponInfo.hitRate ? Math.random() * 100 < weaponInfo.hitRate : true;    //命中判定
  let isCritical = false;   //急所フラグ

  //命中時のみダメージ計算する
  if (isHit && weaponInfo.kind !== "変化") {
    let { pureDamage, basicDamage, isSameTerastal, isSameType, multiplier, atcBuffMultiplier, defBuffMultiplier } = calcPureDamage(weaponInfo, atcInfo, defInfo);
    const randomMultiplier = Math.floor((Math.random() * 0.16 + 0.85) * 100) / 100;    //乱数 0.85~1.00
    isCritical = Math.random() < 0.0417 && multiplier !== 0;;   //急所フラグ 4.17%で急所にあたる
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
    realDamage = trueDamage > defInfo.currentHp ? defInfo.currentHp : trueDamage;

    console.log(`${defInfo.name}に${realDamage}ダメージ(${trueDamage})\n基礎ダメージ：${basicDamage}\n乱数：${randomMultiplier}\nタイプ一致：${isSameTerastal ? 2 : (isSameType ? 1.5 : 1)}\n相性：${multiplier}\n急所：${isCritical ? 1.5 : 1}\nやけど：${weaponInfo.kind === "物理" && atcInfo.isBurned ? 0.5 : 1}`);
  }
  else if (!isHit && weaponInfo.kind !== "変化")
    console.log(`${atcInfo.name}の攻撃は当たらなかった`);

  return { realDamage, isHit, isCritical };
}

//adjustHpBar()のロジック HPバーの制御
export const adjustHpBarLogic = (isMe, newHp, MaxHp) => {
  const hpBarElem = document.querySelector(isMe ? ".my-hp-bar" : ".op-hp-bar");
  const HpPrcent = Math.round((newHp / MaxHp) * 100);
  hpBarElem.style.width = `${HpPrcent}%`;
  hpBarElem.classList.remove("low", "mid");
  if (HpPrcent <= 25)
    hpBarElem.classList.add("low");
  else if (HpPrcent <= 50)
    hpBarElem.classList.add("mid");
}

//ポケインジケータの色を取得する
export const getPokeIndicatorsColor = (currentHp, MaxHp) => {
  let color = "gray";
  if (currentHp === MaxHp)
    color = "green";
  else if (currentHp > 0)
    color = "yellow";
  return color;
}

//相手は自分のポケモンとの相性を考慮した、最適なポケモンを選択肢て返す
export const selectNextOpPokeLogic = (myPoke, opPokes) => {
  console.log(`相手の残りのポケモンは\n${opPokes[0].name}と${opPokes[1].name}`);

  //お互いの相性を取得する
  const myToOp = opPokes.map(op =>
    Math.max(
      calcMultiplier(myPoke.type1, op.type1, op.type2),
      calcMultiplier(myPoke.type2, op.type1, op.type2),
      myPoke.terastalType ? calcMultiplier(myPoke.terastalType, op.type1, op.type2) : 0
    )
  );
  const opToMy = opPokes.map(op =>
    Math.max(
      myPoke.terastalType
        ? calcMultiplier(op.type1, myPoke.terastalType, "なし")
        : calcMultiplier(op.type1, myPoke.type1, myPoke.type2),
      myPoke.terastalType
        ? calcMultiplier(op.type2, myPoke.terastalType, "なし")
        : calcMultiplier(op.type2, myPoke.type1, myPoke.type2),
    )
  );

  //相性や素早さを考慮して次に出すポケモンを決める
  let nextOpPoke = "";

  //自分から相手への相性が2体目も３体目も同じなら、
  // 相手から自分への相性が良い方を選択する　相手から自分への相性がどちらも同じなら速い方を選択する
  if (myToOp[0] === myToOp[1]) {
    if (opToMy[0] !== opToMy[1]) {
      nextOpPoke = (opToMy[0] > opToMy[1] ? opPokes[0] : opPokes[1]).name;
    }
    else
      nextOpPoke = (opPokes[0].s > opPokes[1].s ? opPokes[0] : opPokes[1]).name;

    console.log(`自分のポケモンの${myPoke.name}に対しての受け相性はどちらも同じ
      ${opToMy[0] === opToMy[1] ? myPoke.name + "への攻め相性も同じため、より速い" + nextOpPoke + "を選択する" :
        myPoke.name + "への攻め相性がより良い" + nextOpPoke + "を選択する"
      }`
    );
  }

  //自分から相手への相性に差があるとき
  //相性が悪い方の速さが自分よりも速くて、自分に弱点をつけるとき
  //相性がましな方の速さも自分よりも速くて、自分に弱点を付けるなら、ましな方を選択する
  else {
    const worse = myToOp[0] > myToOp[1] ? 0 : 1;
    const better = 1 - worse;
    console.log(`自分のポケモンの${myPoke.name}に対しての受け相性は${opPokes[better].name}の方が良い`);

    if (opPokes[worse].s > myPoke.s && opToMy[worse] >= 2)
      nextOpPoke = (opPokes[better].s > myPoke.s && opToMy[better] >= 2 ? opPokes[better] : opPokes[worse]).name;
    else nextOpPoke = opPokes[better].name;

    console.log(`${nextOpPoke === opPokes[better].name ?
      opPokes[worse].name + "は" + myPoke.name + "よりも遅くて弱点をつけないため、" + opPokes[better].name + "を選択する" :
      opPokes[worse].name + "は受け相性は悪いが、" + myPoke.name + "よりも速くて弱点を突けるため、" + opPokes[worse].name + "を選択する"}`);
  }
  return nextOpPoke;
};

//setTimeout()の簡略化
export const delay = (fn, ms) => setTimeout(fn, ms);


//乱数と急所を考慮しないダメージ数と、基礎ダメージを返す
export const calcPureDamage = (weaponInfo, atcInfo, defInfo) => {
  const isSameTerastal = atcInfo.isTerastalAtc
    ? (weaponInfo.type === atcInfo.terastal && weaponInfo.type === atcInfo.type1)
    || (weaponInfo.type === atcInfo.terastal && weaponInfo.type === atcInfo.type2)
    : false;
  const isSameType =
    (weaponInfo.type === atcInfo.type1) || (weaponInfo.type === atcInfo.type2)
    || (weaponInfo.type === atcInfo.terastal && atcInfo.isTerastalAtc);    //タイプ一致フラグ
  const [defType1, defType2] = defInfo.isTerastalDef
    ? [defInfo.terastal, "なし"]
    : [defInfo.type1, defInfo.type2];
  const multiplier = calcMultiplier(weaponInfo.type, defType1, defType2);
  const atcBuffMultiplier = atcInfo.buff > 0
    ? atcInfo.buff * 0.5 + 1 : 2 / (2 - atcInfo.buff);
  const defBuffMultiplier = defInfo.buff > 0
    ? defInfo.buff * 0.5 + 1 : 2 / (2 - defInfo.buff);

  //ダメージ計算　22 * 技威力 * (AorC / BorD) / 50 + 2 * ダメージ補正(* 乱数　* タイプ一致 * 相性 * 急所)
  let pureDamage = Math.floor(22 * weaponInfo.power * ((atcInfo.power * atcBuffMultiplier) / (defInfo.power * defBuffMultiplier)));
  pureDamage = Math.floor(pureDamage / 50 + 2);   //基礎ダメージ
  const basicDamage = pureDamage;   //デバッグ用
  pureDamage = Math.floor(pureDamage * (isSameTerastal ? 2 : (isSameType ? 1.5 : 1)));    // タイプ一致補正
  pureDamage = Math.floor(pureDamage * multiplier);   //相性補正

  return { pureDamage, basicDamage, isSameTerastal, isSameType, multiplier, atcBuffMultiplier, defBuffMultiplier };
}

//相手がテラスした後に自分のポケモンからの相性を取得して返す
export const getCompati = (atcType1, atcType2, defType1, defType2) => {
  const [val1, val2] = atcType1
    ? [
      calcMultiplier(atcType1, defType1, defType2),
      calcMultiplier((atcType2 ? atcType2 : atcType1), defType1, defType2)
    ] : [null, null];
  return [val1, val2];
}
