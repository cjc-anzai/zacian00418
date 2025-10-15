
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

