
// ========================================
// LEARNING LOUNGE 4.7 - MAIN SITE SCRIPT
// ========================================

// SITE
function updateClock() {
  const clock = document.getElementById("clock");
  if (clock) clock.textContent = new Date().toLocaleTimeString();
}

setInterval(updateClock, 1000);
updateClock();

function searchGames() {
  const input = document.getElementById("search");
  if (!input) return;

  const q = input.value.toLowerCase();

  document.querySelectorAll(".game-card").forEach(card => {
    card.style.display = card.dataset.name.includes(q) ? "block" : "none";
  });
}

function fullscreen(id) {
  const el = document.getElementById(id);
  if (!el) return;

  if (!document.fullscreenElement) {
    el.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

function closeWindow(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";

  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
  }
}

// ========================================
// NEON CRITTER CLICKER
// ========================================

const SAVE_KEY = "neonCritterSave";

let coins = 0;
let levels = {};

const upgrades = [
  ["Power Click", "+1 coin per click", 25, 1, 0],
  ["Auto Clicker", "+1 coin per second", 50, 0, 1],
  ["Mega Finger", "+3 coins per click", 150, 3, 0],
  ["Coin Magnet", "+3 coins per second", 250, 0, 3],
  ["Super Tap", "+7 coins per click", 500, 7, 0],
  ["Neon Generator", "+8 coins per second", 900, 0, 8],
  ["Crystal Gloves", "+15 coins per click", 1800, 15, 0],
  ["Robot Helper", "+20 coins per second", 3500, 0, 20],
  ["Turbo Touch", "+35 coins per click", 7000, 35, 0],
  ["Power Plant", "+45 coins per second", 14000, 0, 45],
  ["Golden Fingers", "+80 coins per click", 28000, 80, 0],
  ["Coin Factory", "+100 coins per second", 55000, 0, 100],
  ["Galaxy Touch", "+200 coins per click", 110000, 200, 0],
  ["Space Machine", "+250 coins per second", 220000, 0, 250],
  ["Quantum Click", "+500 coins per click", 450000, 500, 0],
  ["Neon Overlord", "+1,000 coins per second", 900000, 0, 1000],
  ["Ultimate Critter", "+2,500 coins per click", 2000000, 2500, 0]
];

function loadGame() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));

    if (s) {
      coins = Number(s.coins) || 0;
      levels = s.levels || {};
    }
  } catch (e) {}

  renderUpgrades();
  updateStats();
}

function saveGame() {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({ coins, levels })
  );
}

function clickPower() {
  return 1 + upgrades.reduce(
    (total, upgrade, i) =>
      total + upgrade[3] * (levels[i] || 0),
    0
  );
}

function autoPower() {
  return upgrades.reduce(
    (total, upgrade, i) =>
      total + upgrade[4] * (levels[i] || 0),
    0
  );
}

function getCost(i) {
  return Math.floor(
    upgrades[i][2] * Math.pow(1.65, levels[i] || 0)
  );
}

function clickCritter() {
  coins += clickPower();
  updateStats();
  saveGame();
}

function renderUpgrades() {
  const el = document.getElementById("upgradeList");
  if (!el) return;

  el.innerHTML = "";

  upgrades.forEach((upgrade, i) => {
    const d = document.createElement("div");
    d.className = "upgrade";

    d.innerHTML =
      "<strong>" + upgrade[0] + "</strong>" +
      "<p>" + upgrade[1] + "</p>" +
      "<p>Level: " + (levels[i] || 0) + "</p>";

    const b = document.createElement("button");

    b.textContent =
      "BUY - " + getCost(i).toLocaleString() + " coins";

    b.disabled = coins < getCost(i);

    b.onclick = () => {
      const cost = getCost(i);

      if (coins >= cost) {
        coins -= cost;
        levels[i] = (levels[i] || 0) + 1;

        updateStats();
        saveGame();

        document.getElementById("gameMessage").textContent =
          upgrade[0] + " upgraded!";
      }
    };

    d.appendChild(b);
    el.appendChild(d);
  });
}

function updateStats() {
  const coinDisplay = document.getElementById("coinCount");
  const powerDisplay = document.getElementById("powerText");

  if (coinDisplay) {
    coinDisplay.textContent =
      "🪙 " + Math.floor(coins).toLocaleString() + " Coins";
  }

  if (powerDisplay) {
    powerDisplay.textContent =
      "Click power: " + clickPower() +
      " | Auto coins: " + autoPower() + "/sec";
  }

  renderUpgrades();
}

function openGame() {
  document.getElementById("clickerGame").style.display = "block";
  renderUpgrades();
}

function resetGame() {
  if (confirm("Reset Neon Critter Clicker?")) {
    coins = 0;
    levels = {};
    saveGame();
    updateStats();
  }
}

setInterval(() => {
  coins += autoPower();
  updateStats();
  saveGame();
}, 1000);


// ========================================
// CARD CLASH
// ========================================

const CARD_SAVE_KEY = "cardClashSave";
const COOLDOWN_KEY = "cardClashFreePackCooldown";

let cardCoins = 500;
let collection = {};
let duelStreak = 0;
let lastPack = [];
let nextFreePackTime = 0;

let duelTeam = [];
let enemyTeam = [];
let playerIndex = 0;
let enemyIndex = 0;
let duelBusy = false;

const creatures = [
  ["embercub", "Ember Cub", "🦊", "Common"],
  ["leafling", "Leafling", "🌱", "Common"],
  ["bubbletoad", "Bubble Toad", "🐸", "Common"],
  ["rockpup", "Rock Pup", "🐶", "Uncommon"],
  ["stormbird", "Storm Bird", "🐦", "Uncommon"],
  ["frostkit", "Frost Kit", "🐱", "Uncommon"],
  ["flamewolf", "Flame Wolf", "🐺", "Rare"],
  ["thunderhorn", "Thunderhorn", "🦏", "Rare"],
  ["coraldragon", "Coral Dragon", "🐉", "Rare"],
  ["shadowfang", "Shadow Fang", "🐈‍⬛", "Epic"],
  ["crystalowl", "Crystal Owl", "🦉", "Epic"],
  ["magmarex", "Magma Rex", "🦖", "Epic"],
  ["sunphoenix", "Sun Phoenix", "🔥", "Legendary"],
  ["moonserpent", "Moon Serpent", "🐍", "Legendary"],
  ["stargriffin", "Star Griffin", "🦅", "Legendary"],
  ["voidtitan", "Void Titan", "👹", "Mythic"],
  ["galaxydrake", "Galaxy Drake", "🐲", "Mythic"],
  ["aurorabeast", "Aurora Beast", "🦄", "Mythic"],
  ["celestialking", "Celestial King", "👑", "Godly"],
  ["goldenhydra", "Golden Hydra", "🐉", "Godly"],
  ["cosmicemperor", "Cosmic Emperor", "🌌", "Godly"],
  ["unknownone", "The Unknown", "👁️", "Secret"],
  ["glitchbeast", "Glitch Beast", "👾", "Secret"],
  ["ancientzero", "Ancient Zero", "💀", "Secret"]
];

const rarityValues = {
  Common: [1, 5],
  Uncommon: [5, 15],
  Rare: [15, 50],
  Epic: [50, 150],
  Legendary: [150, 500],
  Mythic: [500, 2000],
  Godly: [2000, 10000],
  Secret: [10000, 50000]
};

const packTypes = {
  super: {
    cost: 0,
    odds: [100, 0, 0, 0, 0, 0, 0, 0]
  },
  common: {
    cost: 50,
    odds: [75, 20, 5, 0, 0, 0, 0, 0]
  },
  uncommon: {
    cost: 100,
    odds: [45, 40, 12, 3, 0, 0, 0, 0]
  },
  rare: {
    cost: 200,
    odds: [25, 35, 25, 12, 3, 0, 0, 0]
  },
  legendary: {
    cost: 500,
    odds: [10, 20, 30, 22, 14, 3, 1, 0]
  },
  mystery: {
    cost: 2000,
    odds: [5, 10, 20, 25, 20, 12, 6, 2]
  }
};

const rarityNames = Object.keys(rarityValues);

function saveCards() {
  localStorage.setItem(
    CARD_SAVE_KEY,
    JSON.stringify({ cardCoins, collection, duelStreak })
  );
}

function loadCardGame() {
  try {
    const s = JSON.parse(localStorage.getItem(CARD_SAVE_KEY));

    if (s) {
      cardCoins = Number(s.cardCoins) || 0;
      collection = s.collection || {};
      duelStreak = Number(s.duelStreak) || 0;
    }
  } catch (e) {}

  try {
    nextFreePackTime =
      Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
  } catch (e) {}

  updateCardCoins();
  renderCollection();
  renderPackShop();
  updateFreePack();
}

function updateCardCoins() {
  const el = document.getElementById("cardCoins");
  if (el) {
    el.textContent = "🪙 " + cardCoins.toLocaleString() + " COINS";
  }
}

function openCardClash() {
  document.getElementById("cardGame").style.display = "block";
  updateCardCoins();
  renderCollection();
  updateFreePack();
}

function showCardTab(tab, btn) {
  document.querySelectorAll("#cardGame .card-panel")
    .forEach(p => p.classList.remove("active"));

  document.querySelectorAll("#cardGame .card-tabs button")
    .forEach(b => b.classList.remove("active"));

  const panel = document.getElementById(
    "card" + tab[0].toUpperCase() + tab.slice(1)
  );

  if (panel) panel.classList.add("active");
  btn.classList.add("active");

  if (tab === "duel") renderDuelChoices();
}

function renderPackShop() {
  const el = document.getElementById("packShop");
  if (!el) return;

  el.innerHTML = "";

  Object.entries(packTypes).forEach(([id, pack]) => {
    const d = document.createElement("div");
    d.className = "collect-card";

    const icons = {
      super: "🟢",
      common: "📦",
      uncommon: "🍀",
      rare: "💎",
      legendary: "🔥",
      mystery: "👁️"
    };

    d.innerHTML =
      "<div class=creature-art>" + icons[id] + "</div>" +
      "<h3>" + id.toUpperCase() + " PACK</h3>" +
      "<p>" +
      (id === "super"
        ? "Free • 1 card • 60 sec cooldown"
        : pack.cost + " coins • 5 cards") +
      "</p>";

    const b = document.createElement("button");

    b.textContent = id === "super" ? "CLAIM FREE" : "BUY - " + pack.cost;
    b.onclick = () => openPack(id);

    d.appendChild(b);
    el.appendChild(d);
  });

  updateFreePack();
}

function updateFreePack() {
  const b = document.querySelector("#packShop .collect-card button");
  if (!b) return;

  const left = nextFreePackTime - Date.now();

  b.disabled = left > 0;

  b.textContent = left > 0
    ? "WAIT " + Math.ceil(left / 1000) + "s"
    : "CLAIM FREE PACK";

  const timer = document.getElementById("superPackTimer");

  if (timer) {
    timer.textContent = left > 0
      ? "Free pack cooldown: " + Math.ceil(left / 1000) + " seconds"
      : "Free pack ready!";
  }
}

setInterval(updateFreePack, 1000);

function rollCardRarity(pack) {
  const r = Math.random() * 100;
  let total = 0;

  for (let i = 0; i < 8; i++) {
    total += pack.odds[i];
    if (r < total) return rarityNames[i];
  }

  return "Common";
}

function openPack(id) {
  const pack = packTypes[id];
  if (!pack) return;

  // Free pack cannot be claimed again until cooldown ends.
  if (id === "super" && Date.now() < nextFreePackTime) {
    updateFreePack();
    return;
  }

  if (id !== "super" && cardCoins < pack.cost) {
    document.getElementById("packMessage").textContent =
      "Not enough coins!";
    return;
  }

  if (id === "super") {
    nextFreePackTime = Date.now() + 60000;
    localStorage.setItem(COOLDOWN_KEY, nextFreePackTime);
  } else {
    cardCoins -= pack.cost;
  }

  lastPack = [];

  for (let i = 0; i < (id === "super" ? 1 : 5); i++) {
    const rarity = rollCardRarity(pack);
    const pool = creatures.filter(c => c[3] === rarity);
    const creature = pool[Math.floor(Math.random() * pool.length)];

    const range = rarityValues[rarity];

    const value = id === "super"
      ? 0
      : Math.floor(
          range[0] + Math.random() * (range[1] - range[0] + 1)
        );

    lastPack.push({
      id: creature[0],
      name: creature[1],
      emoji: creature[2],
      rarity,
      sellValue: value
    });

    if (!collection[creature[0]]) {
      collection[creature[0]] = {
        id: creature[0],
        name: creature[1],
        emoji: creature[2],
        rarity,
        count: 0,
        sellableCount: 0,
        freeCount: 0,
        sellValue: value
      };
    }

    const owned = collection[creature[0]];

    owned.count++;

    if (id === "super") {
      owned.freeCount++;
    } else {
      owned.sellableCount++;
      owned.sellValue = value;
    }
  }

  renderPackResults();
  renderCollection();
  updateCardCoins();
  saveCards();
  updateFreePack();

  document.getElementById("packMessage").textContent =
    "Pack opened! You got " + lastPack.length + " card(s)!";
}

function renderPackResults() {
  const el = document.getElementById("packResults");
  if (!el) return;

  el.innerHTML = "";

  lastPack.forEach(card => {
    const d = document.createElement("div");
    d.className = "pack-result-card";

    d.innerHTML =
      "<div class=creature-art>" + card.emoji + "</div>" +
      "<h3>" + card.name + "</h3>" +
      "<p>" + card.rarity + "</p>" +
      "<p>Sell value: " + card.sellValue + "</p>";

    el.appendChild(d);
  });
}

function renderCollection() {
  const el = document.getElementById("collectionGrid");
  if (!el) return;

  el.innerHTML = "";

  const cards = Object.values(collection).filter(c => c.count > 0);

  document.getElementById("collectionStats").textContent =
    cards.length + " different creatures • " +
    cards.reduce((a, c) => a + c.count, 0) +
    " total cards.";

  cards.forEach(card => {
    const d = document.createElement("div");
    d.className = "collect-card";

    d.innerHTML =
      "<div class=creature-art>" + card.emoji + "</div>" +
      "<h3>" + card.name + "</h3>" +
      "<p>" + card.rarity + " • Owned: " + card.count + "</p>" +
      "<p>Paid copies: " + card.sellableCount +
      " • Free copies: " + card.freeCount + "</p>";

    const b = document.createElement("button");
    b.textContent = "SELL ONE";
    b.onclick = () => sellCard(card.id);

    d.appendChild(b);
    el.appendChild(d);
  });
}

function sellCard(id) {
  const card = collection[id];
  if (!card || !card.count) return;

  let earned = 0;

  if (card.sellableCount > 0) {
    card.sellableCount--;
    earned = card.sellValue || 0;
  } else if (card.freeCount > 0) {
    card.freeCount--;
  }

  card.count--;
  cardCoins += earned;

  updateCardCoins();
  renderCollection();
  saveCards();
}

function sellDuplicates() {
  let earned = 0;

  Object.values(collection).forEach(card => {
    const extra = Math.max(0, card.count - 1);
    const paid = Math.min(extra, card.sellableCount);

    earned += paid * (card.sellValue || 0);

    const free = Math.min(
      extra - paid,
      card.freeCount
    );

    card.sellableCount -= paid;
    card.freeCount -= free;
    card.count -= paid + free;
  });

  cardCoins += earned;

  updateCardCoins();
  renderCollection();
  saveCards();
}


// ========================================
// CARD CLASH DUELS
// ========================================

const stats = {
  Common: [80, 15],
  Uncommon: [100, 22],
  Rare: [120, 30],
  Epic: [145, 38],
  Legendary: [170, 48],
  Mythic: [210, 60],
  Godly: [260, 75],
  Secret: [320, 90]
};

function monsterStats(card) {
  const s = stats[card.rarity] || stats.Common;

  return {
    maxHP: s[0],
    hp: s[0],
    attack: s[1]
  };
}

function renderDuelChoices() {
  const el = document.getElementById("duelPickGrid");
  if (!el) return;

  el.innerHTML = "";

  document.getElementById("duelStreak").textContent =
    "🔥 Win streak: " + duelStreak;

  document.getElementById("duelSelectionText").textContent =
    "Selected " + duelTeam.length + " / 3 monsters";

  Object.values(collection)
    .filter(card => card.count > 0)
    .forEach(card => {
      const b = document.createElement("button");

      b.className =
        "duel-pick" +
        (duelTeam.some(x => x.id === card.id) ? " selected" : "");

      b.innerHTML =
        "<div class=creature-art>" + card.emoji + "</div>" +
        card.name + "<p>" + card.rarity + "</p>";

      b.onclick = () => {
        const i = duelTeam.findIndex(x => x.id === card.id);

        if (i >= 0) {
          duelTeam.splice(i, 1);
        } else if (duelTeam.length < 3) {
          duelTeam.push(card);
        }

        renderDuelChoices();
      };

      el.appendChild(b);
    });
}

function startDuel() {
  if (duelTeam.length !== 3) {
    document.getElementById("duelMessage").textContent =
      "Choose exactly 3 monsters!";
    return;
  }

  enemyTeam = [...creatures]
    .sort(() => Math.random() - .5)
    .slice(0, 3)
    .map(c => ({
      id: c[0],
      name: c[1],
      emoji: c[2],
      rarity: c[3],
      ...monsterStats({ rarity: c[3] })
    }));

  duelTeam = duelTeam.map(c => ({
    ...c,
    ...monsterStats(c)
  }));

  playerIndex = 0;
  enemyIndex = 0;

  document.getElementById("duelSetup").style.display = "none";
  document.getElementById("duelBattle").style.display = "block";
  document.getElementById("duelMessage").textContent = "";

  updateDuel();
}

function updateDuel() {
  const p = duelTeam[playerIndex];
  const e = enemyTeam[enemyIndex];

  if (!p || !e) return;

  document.getElementById("playerName").textContent = p.name;
  document.getElementById("playerEmoji").textContent = p.emoji;
  document.getElementById("playerHPText").textContent =
    p.hp + " / " + p.maxHP + " HP";
  document.getElementById("playerHPBar").style.width =
    100 * p.hp / p.maxHP + "%";

  document.getElementById("enemyName").textContent = e.name;
  document.getElementById("enemyEmoji").textContent = e.emoji;
  document.getElementById("enemyHPText").textContent =
    e.hp + " / " + e.maxHP + " HP";
  document.getElementById("enemyHPBar").style.width =
    100 * e.hp / e.maxHP + "%";
}

function duelAttack() {
  duelMove(1);
}

function duelSpecial() {
  duelMove(1.8);
}

function duelMove(mult) {
  if (duelBusy) return;

  duelBusy = true;

  const p = duelTeam[playerIndex];
  const e = enemyTeam[enemyIndex];

  const damage = Math.floor(
    p.attack * mult * (.85 + Math.random() * .3)
  );

  e.hp = Math.max(0, e.hp - damage);

  document.getElementById("duelLog").textContent =
    p.name + " dealt " + damage + " damage!";

  if (e.hp <= 0) {
    enemyIndex++;

    if (enemyIndex >= 3) {
      return finishDuel(true);
    }
  }

  updateDuel();

  setTimeout(() => {
    if (enemyIndex >= 3) return;

    const player = duelTeam[playerIndex];
    const enemy = enemyTeam[enemyIndex];

    const damageTaken = Math.floor(
      enemy.attack * (.8 + Math.random() * .4)
    );

    player.hp = Math.max(0, player.hp - damageTaken);

    document.getElementById("duelLog").textContent +=
      " Enemy dealt " + damageTaken + " damage!";

    if (player.hp <= 0) {
      playerIndex++;

      if (playerIndex >= 3) {
        return finishDuel(false);
      }
    }

    updateDuel();
    duelBusy = false;
  }, 700);
}

function finishDuel(win) {
  duelBusy = true;

  if (win) {
    duelStreak++;
    cardCoins += 150;

    document.getElementById("duelMessage").textContent =
      "🏆 Victory! +150 coins!";

    if (duelStreak === 3) {
      cardCoins += 300;

      document.getElementById("duelMessage").textContent +=
        " 3-win bonus +300!";
    }
  } else {
    duelStreak = 0;
    cardCoins += 25;

    document.getElementById("duelMessage").textContent =
      "Battle over! +25 coins.";
  }

  updateCardCoins();
  saveCards();

  document.getElementById("duelLog").textContent =
    win ? "You won!" : "Your team was defeated.";

  setTimeout(() => {
    document.getElementById("duelBattle").style.display = "none";
    document.getElementById("duelSetup").style.display = "block";

    duelTeam = [];
    duelBusy = false;

    renderDuelChoices();
  }, 2200);
}


// ========================================
// DUNGEON RUSH - 50 ROOM GAME ENGINE
// ========================================

const DUNGEON_SAVE_KEY = "dungeonRushSave";
const canvas = document.getElementById("dungeonCanvas");
const ctx = canvas.getContext("2d");

const TILE = 48;
const MW = 16;
const MH = 10;

let dungeonOpen = false;
let raf = 0;
let lastTime = 0;
let time = 0;

let room = 1;
let dCoins = 0;
let weapon = 1;
let maxHP = 100;
let hp = 100;
let potions = 1;

let enemies = [];
let chests = [];
let map = [];
let boss = null;

let doorOpen = false;
let dead = false;
let won = false;

let player = {
  x: 2.5,
  y: 2.5,
  dir: "down",
  swing: 0,
  invuln: 0,
  walk: 0
};

let keys = {};
let touch = {};
let attackCooldown = 0;

let dungeonUpgrades = {
  armor: 0,
  crit: 0,
  speed: 0,
  regen: 0,
  magnet: 0,
  fortune: 0,
  heavy: 0,
  swift: 0,
  life: 0,
  blast: 0
};

const enemyTypes = {
  slime: {
    hp: 35, damage: 7, speed: .62, reward: 9, color: "#48d879"
  },
  bat: {
    hp: 25, damage: 6, speed: 1.05, reward: 10, color: "#a77aff"
  },
  skeleton: {
    hp: 58, damage: 12, speed: .5, reward: 15, color: "#e4d8bc"
  },
  goblin: {
    hp: 75, damage: 15, speed: .8, reward: 20, color: "#8dc84b"
  },
  spider: {
    hp: 95, damage: 17, speed: 1.12, reward: 25, color: "#bb62c9"
  },
  orc: {
    hp: 155, damage: 24, speed: .48, reward: 35, color: "#7bba45"
  },
  ghost: {
    hp: 130, damage: 21, speed: .9, reward: 40, color: "#82dce8"
  },
  demon: {
    hp: 230, damage: 32, speed: .7, reward: 60, color: "#e34e64"
  },
  darkknight: {
    hp: 340, damage: 42, speed: .55, reward: 85, color: "#7580bd"
  },
  voidbeast: {
    hp: 480, damage: 55, speed: .75, reward: 120, color: "#b34be8"
  }
};

const enemyOrder = [
  "slime", "bat", "skeleton", "goblin", "spider",
  "orc", "ghost", "demon", "darkknight", "voidbeast"
];

const bossNames = [
  "Cave Brute",
  "Bone King",
  "Web Matriarch",
  "Orc Warlord",
  "Frost Horror",
  "Demon General",
  "Phantom Lord",
  "Infernal Dragon",
  "Void Guardian",
  "THE DUNGEON OVERLORD"
];

function saveDungeon() {
  try {
    localStorage.setItem(
      DUNGEON_SAVE_KEY,
      JSON.stringify({
        room,
        coins: dCoins,
        weapon,
        maxHP,
        potions,
        upgrades: dungeonUpgrades
      })
    );
  } catch (e) {}
}

function loadDungeon() {
  try {
    const s = JSON.parse(localStorage.getItem(DUNGEON_SAVE_KEY));

    if (s) {
      room = Math.max(1, Math.min(50, Number(s.room) || 1));
      dCoins = Math.max(0, Number(s.coins) || 0);
      weapon = Math.max(1, Number(s.weapon) || 1);
      maxHP = Math.max(100, Number(s.maxHP) || 100);
      potions = Math.max(0, Number(s.potions) || 0);

      dungeonUpgrades = {
        ...dungeonUpgrades,
        ...(s.upgrades || {})
      };
    }
  } catch (e) {}

  hp = maxHP;
}

function openDungeon() {
  document.getElementById("dungeonGame").style.display = "block";

  dungeonOpen = true;

  loadDungeon();

  dead = false;
  won = false;

  buildRoom();
  updateHUD();
  renderDungeonShop();

  if (!raf) {
    lastTime = 0;
    raf = requestAnimationFrame(loop);
  }
}

function closeDungeon() {
  dungeonOpen = false;

  if (raf) cancelAnimationFrame(raf);

  raf = 0;
  keys = {};
  touch = {};

  document.getElementById("dungeonGame").style.display = "none";

  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
  }
}

function dungeonFullscreen() {
  fullscreen("dungeonGame");
}

function message(s) {
  document.getElementById("dungeonMessage").textContent = s;
}

function tile(x, y) {
  if (x < 0 || y < 0 || x >= MW || y >= MH) return 1;
  return map[y]?.[x] ?? 1;
}

function walkable(x, y) {
  return tile(Math.floor(x), Math.floor(y)) === 0;
}

function addEnemy(type, x, y) {
  const s = enemyTypes[type];
  const scale = 1 + (room - 1) * .085;

  enemies.push({
    type,
    x,
    y,
    hp: Math.round(s.hp * scale),
    maxHP: Math.round(s.hp * scale),
    damage: Math.round(s.damage * (1 + (room - 1) * .045)),
    speed: s.speed * (1 + Math.min(room, 30) * .008),
    reward: Math.round(s.reward * (1 + room * .035)),
    flash: 0,
    timer: 0,
    phase: Math.random() * 6
  });
}

function buildRoom() {
  map = Array.from(
    { length: MH },
    (_, y) => Array.from(
      { length: MW },
      (_, x) =>
        (x === 0 || y === 0 || x === MW - 1 || y === MH - 1)
          ? 1
          : 0
    )
  );

  const pattern = room % 5;

  if (pattern === 1) {
    for (let y = 2; y < 8; y++) {
      if (y !== 4 && y !== 5) map[y][5] = 1;
    }

    for (let y = 2; y < 8; y++) {
      if (y !== 3 && y !== 6) map[y][10] = 1;
    }
  }

  if (pattern === 2) {
    for (let x = 3; x < 13; x++) {
      if (x !== 7 && x !== 8) map[4][x] = 1;
    }

    for (let x = 3; x < 13; x++) {
      if (x !== 5 && x !== 10) map[7][x] = 1;
    }
  }

  if (pattern === 3) {
    for (let y = 2; y < 8; y++) {
      if (y !== 3) map[y][4] = 1;
      if (y !== 6) map[y][11] = 1;
    }

    map[3][8] = 1;
    map[6][8] = 1;
  }

  if (pattern === 4) {
    for (let x = 3; x < 13; x += 2) {
      map[3][x] = 1;
      map[6][x] = 1;
    }
  }

  player = {
    x: 2.5,
    y: 2.5,
    dir: "down",
    swing: 0,
    invuln: 0,
    walk: 0
  };

  enemies = [];
  chests = [];
  boss = null;
  doorOpen = false;
  dead = false;
  won = false;

  const bossRoom = room % 5 === 0;
  const tier = Math.min(9, Math.floor((room - 1) / 5));
  const count = Math.min(3 + Math.floor(room / 2), 13);

  for (let i = 0; i < count; i++) {
    const type = enemyOrder[
      Math.min(
        9,
        Math.max(0, tier + (Math.random() < .25 ? 1 : 0))
      )
    ];

    let x = 7 + Math.random() * 6;
    let y = 2 + Math.random() * 6;

    if (!walkable(x, y)) {
      x = 12.5;
      y = 6.5;
    }

    addEnemy(type, x, y);
  }

  if (bossRoom) {
    const bossTier = room / 5 - 1;
    const type = enemyOrder[Math.min(9, bossTier)];
    const s = enemyTypes[type];
    const scale = 2.5 + room * .12;

    boss = {
      x: 11.5,
      y: 5.5,
      hp: Math.round(s.hp * scale * 2),
      maxHP: Math.round(s.hp * scale * 2),
      damage: Math.round(s.damage * 1.7 + room * 1.4),
      speed: .35 + room * .004,
      flash: 0,
      timer: 0,
      name: bossNames[bossTier]
    };

    message("BOSS ROOM " + room + "! " + boss.name + " is waiting!");
  } else {
    message(
      "Room " + room +
      "! Defeat every monster to unlock the exit."
    );
  }

  const chestCount = room < 5 ? 1 : 2 + Math.floor(room / 12);

  for (let i = 0; i < chestCount; i++) {
    const x = 3 + Math.floor(Math.random() * 10);
    const y = 2 + Math.floor(Math.random() * 6);

    chests.push({
      x: x + .5,
      y: y + .5,
      opened: false
    });
  }

  updateHUD();
  saveDungeon();
}

function movePlayer(dx, dy) {
  if (dead || won) return;

  const speed = .12 + dungeonUpgrades.speed * .009;

  const nx = player.x + dx * speed;
  const ny = player.y + dy * speed;

  if (dx < 0) player.dir = "left";
  if (dx > 0) player.dir = "right";
  if (dy < 0) player.dir = "up";
  if (dy > 0) player.dir = "down";

  if (walkable(nx, player.y)) player.x = nx;
  if (walkable(player.x, ny)) player.y = ny;

  if (dx || dy) player.walk += .25;

  chests.forEach(chest => {
    if (
      !chest.opened &&
      Math.hypot(chest.x - player.x, chest.y - player.y) < .8
    ) {
      chest.opened = true;

      const reward = Math.floor(
        (25 + Math.random() * 35) *
        (1 + dungeonUpgrades.fortune * .12)
      );

      dCoins += reward;
      potions++;

      message(
        "TREASURE! +" + reward + " coins and +1 potion!"
      );

      saveDungeon();
      updateHUD();
    }
  });

  if (
    doorOpen &&
    Math.hypot(player.x - 13.5, player.y - 8.5) < .8
  ) {
    nextRoom();
  }
}

function nextRoom() {
  if (room >= 50) {
    won = true;
    dCoins += 5000;

    message(
      "🏆 YOU CONQUERED ALL 50 ROOMS! +5,000 BONUS COINS!"
    );

    saveDungeon();
    updateHUD();
    return;
  }

  room++;

  hp = Math.min(maxHP, hp + Math.ceil(maxHP * .12));
  dCoins += room * 3;

  buildRoom();

  message(
    "Room " + room + " unlocked! You recovered some health."
  );
}

function attack() {
  if (!dungeonOpen || dead || won || attackCooldown > 0) return;

  attackCooldown = .38;
  player.swing = .22;

  const direction = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
  }[player.dir];

  let hits = 0;

  function hit(target) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const distance = Math.hypot(dx, dy);

    return (
      distance < 1.65 &&
      distance > .01 &&
      (dx * direction[0] + dy * direction[1]) / distance > .05
    );
  }

  function damageTarget(target) {
    const crit = Math.random() <
      Math.min(.65, .05 + dungeonUpgrades.crit * .035);

    const damage = Math.floor(
      (18 + weapon * 9 + dungeonUpgrades.heavy * 7) *
      (crit ? 2 : 1)
    );

    target.hp = Math.max(0, target.hp - damage);
    target.flash = .2;
    hits++;

    if (crit) {
      message("CRITICAL HIT! " + damage + " damage!");
    }

    return damage;
  }

  enemies.forEach(enemy => {
    if (enemy.hp > 0 && hit(enemy)) {
      damageTarget(enemy);

      if (enemy.hp === 0) {
        const reward = enemy.reward;
        dCoins += reward;

        message(
          enemy.type.toUpperCase() +
          " defeated! +" + reward + " coins."
        );
      }
    }
  });

  if (boss && boss.hp > 0 && hit(boss)) {
    damageTarget(boss);

    if (boss.hp === 0) {
      message("BOSS DEFEATED! The exit is open!");

      doorOpen = true;
      dCoins += room * 30;
    }
  }

  if (!hits) {
    message("Your sword swings through the air!");
  }

  checkClear();
  updateHUD();
  saveDungeon();
}

function checkClear() {
  if (
    enemies.every(enemy => enemy.hp <= 0) &&
    (!boss || boss.hp <= 0)
  ) {
    if (!doorOpen) {
      doorOpen = true;

      const reward = 40 + room * 18;
      dCoins += reward;

      message(
        "ROOM CLEAR! Exit unlocked! +" + reward + " coins."
      );
    }
  }
}

function hurt(amount) {
  if (player.invuln > 0 || dead || won) return;

  const reduced = Math.max(
    1,
    Math.round(amount * (1 - dungeonUpgrades.armor * .055))
  );

  hp = Math.max(0, hp - reduced);
  player.invuln = .7;

  if (hp <= 0) {
    dead = true;
    message("You were defeated! Restart this room to try again.");
  }

  updateHUD();
}

function updateEnemies(dt) {
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;

    enemy.phase += dt * 4;
    enemy.flash = Math.max(0, enemy.flash - dt);
    enemy.timer -= dt;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy);

    if (distance > .65) {
      const nx =
        enemy.x + dx / Math.max(distance, .01) * enemy.speed * dt;

      const ny =
        enemy.y + dy / Math.max(distance, .01) * enemy.speed * dt;

      if (walkable(nx, enemy.y)) enemy.x = nx;
      if (walkable(enemy.x, ny)) enemy.y = ny;
    } else if (enemy.timer <= 0) {
      hurt(enemy.damage);

      enemy.timer = Math.max(
        .65,
        1.25 - dungeonUpgrades.swift * .04
      );
    }
  });

  if (boss && boss.hp > 0) {
    boss.timer -= dt;
    boss.flash = Math.max(0, boss.flash - dt);

    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 1.25) {
      const nx =
        boss.x + dx / Math.max(distance, .01) * boss.speed * dt;

      const ny =
        boss.y + dy / Math.max(distance, .01) * boss.speed * dt;

      if (walkable(nx, boss.y)) boss.x = nx;
      if (walkable(boss.x, ny)) boss.y = ny;
    } else if (boss.timer <= 0) {
      hurt(boss.damage);
      boss.timer = 1.3;
    }
  }

  checkClear();
}

function loop(ts) {
  if (!dungeonOpen) {
    raf = 0;
    return;
  }

  const dt = lastTime
    ? Math.min(.04, (ts - lastTime) / 1000)
    : 0;

  lastTime = ts;
  time += dt;

  if (!dead && !won) {
    let dx = 0;
    let dy = 0;

    if (keys.ArrowLeft || keys.a || touch.left) dx--;
    if (keys.ArrowRight || keys.d || touch.right) dx++;
    if (keys.ArrowUp || keys.w || touch.up) dy--;
    if (keys.ArrowDown || keys.s || touch.down) dy++;

    if (dx || dy) {
      const length = Math.hypot(dx, dy);
      movePlayer(dx / length, dy / length);
    }

    if (keys[" "] || touch.attack) attack();

    player.invuln = Math.max(0, player.invuln - dt);
    player.swing = Math.max(0, player.swing - dt);
    attackCooldown = Math.max(0, attackCooldown - dt);

    updateEnemies(dt);

    if (
      dungeonUpgrades.regen &&
      Math.random() < dt * .35 &&
      hp < maxHP
    ) {
      hp = Math.min(maxHP, hp + 1);
    }
  }

  draw();
  updateHUD();

  raf = requestAnimationFrame(loop);
}

function draw() {
  const c = ctx;

  c.clearRect(0, 0, 768, 512);

  // FLOOR AND WALLS
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) {
      const px = x * TILE;
      const py = y * TILE;
      const wall = map[y][x] === 1;

      if (wall) {
        c.fillStyle = "#29243c";
        c.fillRect(px, py, 48, 48);

        c.fillStyle = "#48405a";
        c.fillRect(px + 2, py + 2, 44, 5);

        c.fillStyle = "#171426";
        c.fillRect(px + 3, py + 41, 42, 5);
      } else {
        c.fillStyle =
          (x + y) % 2 ? "#242139" : "#211e35";

        c.fillRect(px, py, 48, 48);

        c.strokeStyle = "#302a43";
        c.strokeRect(px + .5, py + .5, 47, 47);
      }
    }
  }

  // TORCHES
  for (const t of [[1, 1], [14, 1], [1, 8], [14, 8]]) {
    const x = t[0] * 48 + 24;
    const y = t[1] * 48 + 22;

    c.fillStyle = "#ff9c47";
    c.shadowColor = "#ff702b";
    c.shadowBlur = 18;
    c.fillRect(x - 4, y - 7, 8, 12);
    c.shadowBlur = 0;

    c.fillStyle = "#ffe5a0";
    c.fillRect(x - 2, y - 5, 4, 5);
  }

  // DECORATIONS
  for (const t of [[3, 2], [12, 2], [3, 7], [12, 7]]) {
    const x = t[0] * 48 + 24;
    const y = t[1] * 48 + 25;

    c.fillStyle = "#a64cff";
    c.shadowColor = "#a64cff";
    c.shadowBlur = 14;

    c.beginPath();
    c.moveTo(x, y - 13);
    c.lineTo(x + 8, y);
    c.lineTo(x, y + 12);
    c.lineTo(x - 8, y);
    c.fill();

    c.shadowBlur = 0;
  }

  // TREASURE CHESTS
  chests.forEach(chest => {
    const x = chest.x * 48;
    const y = chest.y * 48;

    c.fillStyle = chest.opened ? "#49324b" : "#8c4d21";
    c.fillRect(x - 13, y - 8, 26, 17);

    c.fillStyle = "#e5a73d";
    c.fillRect(x - 13, y - 8, 26, 5);

    if (!chest.opened) {
      c.fillStyle = "#ffe78b";
      c.fillRect(x - 3, y - 3, 6, 7);
    }
  });

  // EXIT
  c.fillStyle = doorOpen ? "#35dca2" : "#603a74";
  c.shadowColor = doorOpen ? "#42ffbd" : "#b34cff";
  c.shadowBlur = 15;

  c.fillRect(13 * 48 + 7, 8 * 48 + 3, 34, 43);

  c.shadowBlur = 0;

  c.fillStyle = "#171124";
  c.fillRect(13 * 48 + 12, 8 * 48 + 8, 24, 38);

  // ENEMIES
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;

    const x = enemy.x * 48;
    const y = enemy.y * 48 + Math.sin(enemy.phase) * 2;

    c.save();
    c.translate(x, y);

    c.fillStyle =
      enemy.flash > 0 ? "#fff" : enemyTypes[enemy.type].color;

    if (enemy.type === "bat") {
      c.fillRect(-9, -10, 18, 18);
      c.fillRect(-20, -5, 11, 9);
      c.fillRect(9, -5, 11, 9);
    } else if (
      enemy.type === "skeleton" ||
      enemy.type === "darkknight"
    ) {
      c.fillRect(-11, -13, 22, 24);

      c.fillStyle = "#514b56";
      c.fillRect(-9, -18, 18, 9);
    } else {
      c.fillRect(-15, -12, 30, 24);
      c.fillRect(-11, -17, 22, 8);
    }

    c.fillStyle = "#ff557c";
    c.fillRect(-7, -5, 4, 4);
    c.fillRect(4, -5, 4, 4);

    c.restore();

    c.fillStyle = "#120e1c";
    c.fillRect(x - 16, y - 24, 32, 4);

    c.fillStyle = "#f35b67";
    c.fillRect(
      x - 16,
      y - 24,
      32 * enemy.hp / enemy.maxHP,
      4
    );
  });

  // BOSS
  if (boss && boss.hp > 0) {
    const x = boss.x * 48;
    const y = boss.y * 48 + Math.sin(time * 3) * 3;

    c.fillStyle = boss.flash > 0 ? "#fff" : "#702b85";
    c.fillRect(x - 25, y - 25, 50, 50);

    c.fillStyle = "#ffcc55";
    c.fillRect(x - 14, y - 15, 8, 7);
    c.fillRect(x + 7, y - 15, 8, 7);

    c.fillStyle = "#f04d73";
    c.fillRect(x - 35, y - 43, 70, 7);

    c.fillStyle = "#160e22";
    c.fillRect(x - 35, y - 43, 70, 7);

    c.fillStyle = "#f04d73";
    c.fillRect(
      x - 35,
      y - 43,
      70 * boss.hp / boss.maxHP,
      7
    );

    c.fillStyle = "#ffe0a5";
    c.font = "12px Arial";
    c.textAlign = "center";
    c.fillText(boss.name, x, y - 50);
    c.textAlign = "left";
  }

  // PLAYER
  const p = player;
  const x = p.x * 48;
  const y = p.y * 48 + Math.sin(p.walk) * 2;

  c.save();
  c.translate(x, y);

  if (p.invuln > 0 && Math.floor(time * 18) % 2 === 0) {
    c.globalAlpha = .4;
  }

  c.fillStyle = "#090713";
  c.beginPath();
  c.ellipse(0, 13, 15, 6, 0, 0, 7);
  c.fill();

  c.fillStyle = "#49305a";
  c.fillRect(-10, 4, 8, 10);
  c.fillRect(3, 4, 8, 10);

  c.fillStyle = "#3d65a5";
  c.fillRect(-12, -12, 24, 19);

  c.fillStyle = "#68a7ed";
  c.fillRect(-9, -11, 18, 5);

  c.fillStyle = "#e6b98f";
  c.fillRect(-10, -26, 20, 16);

  c.fillStyle = "#58304a";
  c.fillRect(-11, -29, 22, 7);

  c.fillStyle = "#21152b";
  c.fillRect(-6, -20, 3, 3);
  c.fillRect(4, -20, 3, 3);

  c.fillStyle = "#d9e9ff";

  if (p.swing > 0) {
    c.fillRect(12, -28, 5, 29);
  } else {
    c.fillRect(p.dir === "left" ? -18 : 12, 0, 4, 22);
  }

  c.restore();

  // END SCREEN
  if (dead || won) {
    c.fillStyle = "rgba(5,3,15,.75)";
    c.fillRect(0, 0, 768, 512);

    c.textAlign = "center";
    c.font = "bold 30px Orbitron";

    c.fillStyle = won ? "#ffe28c" : "#ff8495";

    c.fillText(
      won ? "50 ROOMS COMPLETE!" : "YOU WERE DEFEATED",
      384,
      230
    );

    c.font = "16px Orbitron";
    c.fillStyle = "white";

    c.fillText(
      won
        ? "You conquered the dungeon!"
        : "Tap RESTART ROOM to try again.",
      384,
      270
    );

    c.textAlign = "left";
  }
}

function updateHUD() {
  document.getElementById("dungeonRoom").textContent =
    "ROOM " + room + " / 50";

  document.getElementById("dungeonHealth").textContent =
    "❤️ " + hp + " / " + maxHP;

  document.getElementById("dungeonCoins").textContent =
    "🪙 " + dCoins;

  document.getElementById("dungeonEnemies").textContent =
    "MONSTERS: " +
    (
      enemies.filter(enemy => enemy.hp > 0).length +
      (boss && boss.hp > 0 ? 1 : 0)
    );

  document.getElementById("dungeonWeapon").textContent =
    "SWORD LV. " + weapon;
}

function dungeonRestartRoom() {
  hp = maxHP;
  buildRoom();
  message("Room restarted!");
}

function dungeonHeal() {
  if (potions <= 0) {
    message("No potions! Buy one or find a chest.");
    return;
  }

  if (hp >= maxHP) {
    message("Your health is already full!");
    return;
  }

  potions--;

  hp = Math.min(
    maxHP,
    hp + Math.ceil(maxHP * .45)
  );

  saveDungeon();
  message("Potion used! Health restored.");
  updateHUD();
}

const shopItems = [
  ["sword", "⚔️ Sword Damage", "Increase damage dealt with every sword attack."],
  ["heart", "❤️ Maximum Health", "Increase your maximum health by 25."],
  ["armor", "🛡️ Armour", "Reduce damage received from enemies."],
  ["crit", "💥 Critical Hits", "Increase your chance of dealing double damage."],
  ["speed", "👟 Movement Speed", "Move around rooms faster."],
  ["regen", "💚 Regeneration", "Slowly recover health over time."],
  ["magnet", "🧲 Treasure Magnet", "Improve treasure rewards."],
  ["fortune", "💰 Fortune", "Earn more coins from chests."],
  ["heavy", "🔨 Heavy Strike", "Add extra damage to sword attacks."],
  ["swift", "⚡ Quick Recovery", "Enemies have less time between attacks."],
  ["life", "🌟 Potion Master", "Potions restore more health."],
  ["blast", "✨ Power Surge", "Increase your critical-hit power."]
];

function renderDungeonShop() {
  const el = document.getElementById("dungeonShop");
  if (!el) return;

  el.innerHTML = "";

  shopItems.forEach(([id, name, description]) => {
    const level =
      id === "sword"
        ? weapon - 1
        : id === "heart"
          ? Math.round((maxHP - 100) / 25)
          : dungeonUpgrades[id] || 0;

    const cost =
      id === "sword"
        ? 100 * weapon
        : id === "heart"
          ? 150 + Math.round((maxHP - 100) * 2)
          : Math.round(100 * Math.pow(1.65, level));

    const d = document.createElement("div");
    d.className = "dungeon-upgrade";

    d.innerHTML =
      "<strong>" + name + "</strong>" +
      "<p>" + description + "</p>" +
      "<p>Level: " + level + "</p>";

    const b = document.createElement("button");

    b.textContent =
      "UPGRADE - " + cost + " COINS";

    b.disabled =
      dCoins < cost ||
      (id === "sword" && weapon >= 30) ||
      (id === "heart" && maxHP >= 500);

    b.onclick = () => buyDungeonUpgrade(id, cost);

    d.appendChild(b);
    el.appendChild(d);
  });
}

function buyDungeonUpgrade(id, cost) {
  if (dCoins < cost) return;

  dCoins -= cost;

  if (id === "sword") {
    weapon++;
  } else if (id === "heart") {
    maxHP += 25;
    hp += 25;
  } else {
    dungeonUpgrades[id]++;
  }

  saveDungeon();
  renderDungeonShop();
  updateHUD();

  message("Upgrade purchased! " + id.toUpperCase() + " improved!");
}

function buyDungeonPotion() {
  if (dCoins < 30) {
    message("You need 30 coins for a potion.");
    return;
  }

  dCoins -= 30;
  potions++;

  saveDungeon();
  updateHUD();

  message("Potion purchased!");
}

// KEYBOARD CONTROLS
function dungeonLoopKey(e, down) {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;

  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]
      .includes(k) &&
    dungeonOpen
  ) {
    e.preventDefault();
  }

  keys[k] = down;
}

window.addEventListener("keydown", e => dungeonLoopKey(e, true));
window.addEventListener("keyup", e => dungeonLoopKey(e, false));

// TOUCH MOVEMENT
document.querySelectorAll("[data-move]").forEach(button => {
  const direction = button.dataset.move;

  const start = e => {
    e.preventDefault();
    touch[direction] = true;
  };

  const end = e => {
    e.preventDefault();
    touch[direction] = false;
  };

  button.addEventListener("pointerdown", start);
  button.addEventListener("pointerup", end);
  button.addEventListener("pointerleave", end);
  button.addEventListener("pointercancel", end);
});

// TOUCH ATTACK
const attackButton = document.getElementById("dungeonAttack");

attackButton.addEventListener("pointerdown", e => {
  e.preventDefault();
  touch.attack = true;
  attack();
});

["pointerup", "pointerleave", "pointercancel"].forEach(eventName => {
  attackButton.addEventListener(eventName, e => {
    e.preventDefault();
    touch.attack = false;
  });
});


// ========================================
// RESET ALL ORIGINAL GAME PROGRESS
// ========================================

function resetProgress() {
  if (!confirm(
    "Reset ALL Learning Lounge progress? " +
    "This erases Clicker, Card Clash, Duel and Dungeon Rush saves. " +
    "This cannot be undone."
  )) return;

  // CLICKER
  coins = 0;
  levels = {};

  // CARD CLASH
  cardCoins = 500;
  collection = {};
  duelStreak = 0;
  duelTeam = [];
  enemyTeam = [];
  lastPack = [];
  nextFreePackTime = 0;

  // DUNGEON
  room = 1;
  dCoins = 0;
  weapon = 1;
  maxHP = 100;
  hp = 100;
  potions = 1;

  dungeonUpgrades = {
    armor: 0,
    crit: 0,
    speed: 0,
    regen: 0,
    magnet: 0,
    fortune: 0,
    heavy: 0,
    swift: 0,
    life: 0,
    blast: 0
  };

  try {
    [
      SAVE_KEY,
      CARD_SAVE_KEY,
      COOLDOWN_KEY,
      DUNGEON_SAVE_KEY
    ].forEach(key => localStorage.removeItem(key));
  } catch (e) {}

  saveGame();
  saveCards();
  saveDungeon();

  updateStats();
  updateCardCoins();
  renderCollection();
  renderPackShop();
  renderDuelChoices();
  renderDungeonShop();

  document.getElementById("packResults").innerHTML = "";
  document.getElementById("packMessage").textContent =
    "Progress reset!";

  document.getElementById("duelBattle").style.display = "none";
  document.getElementById("duelSetup").style.display = "block";

  if (dungeonOpen) {
    buildRoom();
    message("Fresh start! Your 50-room adventure begins again.");
  }

  alert("All Learning Lounge progress has been reset!");
}


// ========================================
// START ORIGINAL GAMES
// ========================================

loadGame();
loadCardGame();
loadDungeon();
renderDungeonShop();
renderPackShop();

