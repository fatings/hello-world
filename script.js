const BOARD_SIZE = 8;
const FLEET = [4, 3, 3, 2, 2];
const TOTAL_SHIP_CELLS = FLEET.reduce((sum, size) => sum + size, 0);

const appState = {
  mode: "computer",
  difficulty: "easy",
  stage: "setup",
  currentTurn: 1,
  winner: null,
  modalAction: null,
  players: [],
  aiState: createAiState(),
};

const elements = {
  modeSelector: document.getElementById("mode-selector"),
  difficultyGroup: document.getElementById("difficulty-group"),
  difficultySelector: document.getElementById("difficulty-selector"),
  randomizeCurrentBtn: document.getElementById("randomize-current-btn"),
  startBtn: document.getElementById("start-btn"),
  newGameBtn: document.getElementById("new-game-btn"),
  statusTitle: document.getElementById("status-title"),
  statusText: document.getElementById("status-text"),
  turnIndicator: document.getElementById("turn-indicator"),
  turnSubtitle: document.getElementById("turn-subtitle"),
  player1Fleet: document.getElementById("player1-fleet"),
  player2Fleet: document.getElementById("player2-fleet"),
  player1Board: document.getElementById("player1-board"),
  player2Board: document.getElementById("player2-board"),
  player1BoardTitle: document.getElementById("player1-board-title"),
  player1BoardNote: document.getElementById("player1-board-note"),
  opponentBoardTitle: document.getElementById("opponent-board-title"),
  opponentBoardNote: document.getElementById("opponent-board-note"),
  opponentFleetLabel: document.getElementById("opponent-fleet-label"),
  roundModal: document.getElementById("round-modal"),
  modalTitle: document.getElementById("modal-title"),
  modalText: document.getElementById("modal-text"),
  modalConfirmBtn: document.getElementById("modal-confirm-btn"),
};

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({
      shipId: null,
      hit: false,
      miss: false,
    }))
  );
}

function createPlayer(name, type) {
  return {
    name,
    type,
    board: createEmptyBoard(),
    ships: [],
    hits: 0,
    shots: new Set(),
  };
}

function createAiState() {
  return {
    availableShots: buildCoordinateList(),
    targetQueue: [],
    targetHits: [],
  };
}

function buildCoordinateList() {
  const list = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      list.push({ row, col });
    }
  }
  return list;
}

function coordKey(row, col) {
  return `${row}-${col}`;
}

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function randomizeFleet(player) {
  player.board = createEmptyBoard();
  player.ships = [];
  player.hits = 0;
  player.shots = new Set();

  FLEET.forEach((size, shipIndex) => {
    let placed = false;

    while (!placed) {
      const horizontal = Math.random() > 0.5;
      const maxRow = horizontal ? BOARD_SIZE - 1 : BOARD_SIZE - size;
      const maxCol = horizontal ? BOARD_SIZE - size : BOARD_SIZE - 1;
      const startRow = Math.floor(Math.random() * (maxRow + 1));
      const startCol = Math.floor(Math.random() * (maxCol + 1));
      const cells = [];

      for (let offset = 0; offset < size; offset += 1) {
        const row = startRow + (horizontal ? 0 : offset);
        const col = startCol + (horizontal ? offset : 0);
        cells.push({ row, col });
      }

      const overlaps = cells.some(({ row, col }) => player.board[row][col].shipId !== null);
      if (overlaps) {
        continue;
      }

      const ship = {
        id: shipIndex,
        size,
        hits: 0,
        sunk: false,
        cells,
      };

      cells.forEach(({ row, col }) => {
        player.board[row][col].shipId = ship.id;
      });

      player.ships.push(ship);
      placed = true;
    }
  });
}

function resetPlayers() {
  appState.players = [
    createPlayer("Jogador 1", "human"),
    createPlayer(appState.mode === "computer" ? "Computador" : "Jogador 2", appState.mode === "computer" ? "ai" : "human"),
  ];

  appState.players.forEach(randomizeFleet);
  appState.aiState = createAiState();
  appState.stage = "setup";
  appState.currentTurn = 1;
  appState.winner = null;
}

function updateModeButtons() {
  Array.from(elements.modeSelector.querySelectorAll(".segment")).forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === appState.mode);
  });

  Array.from(elements.difficultySelector.querySelectorAll(".segment")).forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === appState.difficulty);
  });
}

function updateLabels() {
  const isComputer = appState.mode === "computer";
  elements.difficultyGroup.style.display = isComputer ? "block" : "none";
  elements.opponentFleetLabel.textContent = isComputer ? "Computador" : "Jogador 2";
}

function renderFleet() {
  appState.players.forEach((player, index) => {
    const target = index === 0 ? elements.player1Fleet : elements.player2Fleet;
    target.innerHTML = "";

    player.ships
      .slice()
      .sort((left, right) => right.size - left.size)
      .forEach((ship, shipIndex) => {
        const item = document.createElement("li");
        const state = ship.sunk ? "Afundado" : `${ship.hits}/${ship.size} impactos`;
        item.textContent = `Navio ${shipIndex + 1} - ${ship.size} casas - ${state}`;
        target.appendChild(item);
      });
  });
}

function ownBoardState(playerIndex, row, col) {
  const player = appState.players[playerIndex];
  const cell = player.board[row][col];

  if (cell.hit) {
    return "hit";
  }

  if (cell.miss) {
    return "miss";
  }

  if (cell.shipId !== null) {
    return "ship";
  }

  return "water";
}

function targetBoardState(playerIndex, row, col) {
  const player = appState.players[playerIndex];
  const cell = player.board[row][col];

  if (cell.hit) {
    return "hit";
  }

  if (cell.miss) {
    return "miss";
  }

  if (appState.winner && cell.shipId !== null) {
    return "ship";
  }

  return "water";
}

function renderOwnBoard(boardElement, playerIndex) {
  boardElement.innerHTML = "";

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const state = ownBoardState(playerIndex, row, col);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell disabled";

      if (state === "ship") {
        button.classList.add("revealed-ship");
      }
      if (state === "hit") {
        button.classList.add("hit");
        button.textContent = "X";
      }
      if (state === "miss") {
        button.classList.add("miss");
        button.textContent = ".";
      }

      boardElement.appendChild(button);
    }
  }
}

function renderTargetBoard(boardElement, attackerIndex, defenderIndex) {
  boardElement.innerHTML = "";
  const defender = appState.players[defenderIndex];
  const canShoot =
    appState.stage === "playing" &&
    !appState.winner &&
    (appState.mode === "player" || appState.currentTurn === 1);

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const state = targetBoardState(defenderIndex, row, col);
      const cell = defender.board[row][col];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cell";

      if (state === "ship") {
        button.classList.add("revealed-ship");
      }
      if (state === "hit") {
        button.classList.add("hit");
        button.textContent = "X";
      }
      if (state === "miss") {
        button.classList.add("miss");
        button.textContent = ".";
      }

      if (canShoot && !cell.hit && !cell.miss) {
        button.classList.add("targetable");
        button.addEventListener("click", () => handleShot(attackerIndex, defenderIndex, row, col));
      } else {
        button.classList.add("disabled");
      }

      boardElement.appendChild(button);
    }
  }
}

function renderBoards() {
  if (appState.mode === "computer") {
    elements.player1BoardTitle.textContent = "Tabuleiro do Jogador 1";
    elements.player1BoardNote.textContent = "A tua frota";
    elements.opponentBoardTitle.textContent = "Tabuleiro do Computador";
    elements.opponentBoardNote.textContent = "Ataca aqui";
    renderOwnBoard(elements.player1Board, 0);
    renderTargetBoard(elements.player2Board, 0, 1);
    return;
  }

  if (appState.stage === "setup") {
    elements.player1BoardTitle.textContent = "Tabuleiro do Jogador 1";
    elements.player1BoardNote.textContent = "Frota pronta";
    elements.opponentBoardTitle.textContent = "Tabuleiro do Jogador 2";
    elements.opponentBoardNote.textContent = "Frota pronta";
    renderOwnBoard(elements.player1Board, 0);
    renderOwnBoard(elements.player2Board, 1);
    return;
  }

  const ownIndex = appState.currentTurn - 1;
  const targetIndex = ownIndex === 0 ? 1 : 0;

  elements.player1BoardTitle.textContent = `Tabuleiro de ${appState.players[ownIndex].name}`;
  elements.player1BoardNote.textContent = "A tua frota";
  elements.opponentBoardTitle.textContent = `Tabuleiro de ${appState.players[targetIndex].name}`;
  elements.opponentBoardNote.textContent = "Ataca aqui";
  renderOwnBoard(elements.player1Board, ownIndex);
  renderTargetBoard(elements.player2Board, ownIndex, targetIndex);
}

function setStatus(title, text) {
  elements.statusTitle.textContent = title;
  elements.statusText.textContent = text;
}

function difficultyLabel(value) {
  return {
    easy: "facil",
    medium: "media",
    hard: "alta",
  }[value];
}

function updateTurnCopy() {
  if (appState.stage === "setup") {
    elements.turnIndicator.textContent = "Fase de preparacao";
    elements.turnSubtitle.textContent = "Os tabuleiros estao prontos para ser reorganizados.";
    setStatus("Configura a partida", "Seleciona o modo de jogo e reorganiza as frotas antes de comecar.");
    return;
  }

  if (appState.winner) {
    elements.turnIndicator.textContent = `${appState.winner} venceu`;
    elements.turnSubtitle.textContent = "Todos os navios adversarios foram afundados.";
    setStatus("Partida terminada", `${appState.winner} destruiu a frota adversaria.`);
    return;
  }

  const currentPlayer = appState.players[appState.currentTurn - 1];
  elements.turnIndicator.textContent = `Turno de ${currentPlayer.name}`;

  if (appState.mode === "computer" && appState.currentTurn === 1) {
    elements.turnSubtitle.textContent = "Seleciona uma casa no tabuleiro do Computador.";
    setStatus("Ataque em curso", "Dispara sobre o tabuleiro do Computador e tenta encontrar a frota.");
    return;
  }

  if (appState.mode === "computer") {
    elements.turnSubtitle.textContent = "O Computador esta a analisar o melhor disparo.";
    setStatus("Turno do Computador", `IA em dificuldade ${difficultyLabel(appState.difficulty)}.`);
    return;
  }

  elements.turnSubtitle.textContent = "Confirma o round e ataca o tabuleiro adversario.";
  setStatus(`Round de ${currentPlayer.name}`, "O dispositivo deve passar para o jogador ativo antes de cada jogada.");
}

function showModal(title, text, action) {
  appState.modalAction = action;
  elements.modalTitle.textContent = title;
  elements.modalText.textContent = text;
  elements.roundModal.classList.remove("hidden");
  elements.roundModal.setAttribute("aria-hidden", "false");
}

function hideModal() {
  elements.roundModal.classList.add("hidden");
  elements.roundModal.setAttribute("aria-hidden", "true");
}

function markShipIfSunk(defender, shipId) {
  const ship = defender.ships.find((entry) => entry.id === shipId);
  if (!ship) {
    return null;
  }

  ship.sunk = ship.hits >= ship.size;
  return ship.sunk ? ship : null;
}

function attackCell(attackerIndex, defenderIndex, row, col) {
  const attacker = appState.players[attackerIndex];
  const defender = appState.players[defenderIndex];
  const cell = defender.board[row][col];

  if (cell.hit || cell.miss) {
    return null;
  }

  attacker.shots.add(coordKey(row, col));

  if (cell.shipId !== null) {
    cell.hit = true;
    defender.hits += 1;
    const ship = defender.ships.find((entry) => entry.id === cell.shipId);
    ship.hits += 1;
    const sunkShip = markShipIfSunk(defender, cell.shipId);

    if (defender.hits === TOTAL_SHIP_CELLS) {
      appState.winner = attacker.name;
    }

    return { hit: true, sunkShip };
  }

  cell.miss = true;
  return { hit: false, sunkShip: null };
}

function switchTurn() {
  appState.currentTurn = appState.currentTurn === 1 ? 2 : 1;
  updateTurnCopy();
  renderBoards();

  if (appState.winner) {
    return;
  }

  if (appState.mode === "player") {
    const player = appState.players[appState.currentTurn - 1];
    showModal(
      `Round de ${player.name}`,
      `${player.name}, confirma quando estiveres pronto. O adversario nao deve ver este tabuleiro.`,
      () => {
        hideModal();
        renderBoards();
      }
    );
    return;
  }

  if (appState.mode === "computer" && appState.currentTurn === 2) {
    window.setTimeout(executeComputerTurn, 650);
  }
}

function handleShot(attackerIndex, defenderIndex, row, col) {
  if (appState.winner || appState.stage !== "playing") {
    return;
  }

  const result = attackCell(attackerIndex, defenderIndex, row, col);
  if (!result) {
    return;
  }

  renderFleet();
  updateTurnCopy();
  renderBoards();

  if (appState.winner) {
    return;
  }

  switchTurn();
}

function getAdjacentShots(row, col) {
  return [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ].filter(({ row: nextRow, col: nextCol }) => nextRow >= 0 && nextRow < BOARD_SIZE && nextCol >= 0 && nextCol < BOARD_SIZE);
}

function takeAiShotFromQueue(queue, availableKeys) {
  while (queue.length) {
    const next = queue.shift();
    if (availableKeys.has(coordKey(next.row, next.col))) {
      return next;
    }
  }
  return null;
}

function pickComputerShot() {
  const available = appState.aiState.availableShots;
  const availableKeys = new Set(available.map(({ row, col }) => coordKey(row, col)));
  const queuedShot = takeAiShotFromQueue(appState.aiState.targetQueue, availableKeys);
  if (queuedShot) {
    return queuedShot;
  }

  if (appState.difficulty === "easy") {
    return available[Math.floor(Math.random() * available.length)];
  }

  if (appState.difficulty === "medium") {
    const parityPool = available.filter(({ row, col }) => (row + col) % 2 === 0);
    const pool = parityPool.length ? parityPool : available;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const weighted = available.filter(({ row, col }) => (row + col) % 2 === 0);
  const central = weighted
    .slice()
    .sort((left, right) => {
      const leftScore = Math.abs(left.row - 3.5) + Math.abs(left.col - 3.5);
      const rightScore = Math.abs(right.row - 3.5) + Math.abs(right.col - 3.5);
      return leftScore - rightScore;
    });
  const pool = central.length ? central : available;
  return pool[0];
}

function updateAiStrategy(shot, result) {
  appState.aiState.availableShots = appState.aiState.availableShots.filter(
    ({ row, col }) => !(row === shot.row && col === shot.col)
  );

  if (!result || !result.hit) {
    return;
  }

  if (result.sunkShip) {
    appState.aiState.targetQueue = [];
    appState.aiState.targetHits = [];
    return;
  }

  appState.aiState.targetHits.push(shot);
  const adjacent = getAdjacentShots(shot.row, shot.col);

  if (appState.difficulty === "easy") {
    return;
  }

  if (appState.difficulty === "medium") {
    shuffle(adjacent).forEach((candidate) => {
      appState.aiState.targetQueue.push(candidate);
    });
    return;
  }

  const [firstHit, secondHit] = appState.aiState.targetHits;
  if (firstHit && secondHit) {
    const sameRow = firstHit.row === secondHit.row;
    const sameCol = firstHit.col === secondHit.col;

    if (sameRow) {
      const cols = appState.aiState.targetHits.map(({ col }) => col).sort((a, b) => a - b);
      appState.aiState.targetQueue.unshift(
        { row: firstHit.row, col: cols[0] - 1 },
        { row: firstHit.row, col: cols[cols.length - 1] + 1 }
      );
      return;
    }

    if (sameCol) {
      const rows = appState.aiState.targetHits.map(({ row }) => row).sort((a, b) => a - b);
      appState.aiState.targetQueue.unshift(
        { row: rows[0] - 1, col: firstHit.col },
        { row: rows[rows.length - 1] + 1, col: firstHit.col }
      );
      return;
    }
  }

  shuffle(adjacent).forEach((candidate) => {
    appState.aiState.targetQueue.push(candidate);
  });
}

function executeComputerTurn() {
  if (appState.mode !== "computer" || appState.currentTurn !== 2 || appState.winner) {
    return;
  }

  const shot = pickComputerShot();
  const result = attackCell(1, 0, shot.row, shot.col);
  updateAiStrategy(shot, result);
  renderFleet();
  updateTurnCopy();
  renderBoards();

  if (appState.winner) {
    return;
  }

  switchTurn();
}

function startGame() {
  appState.stage = "playing";
  appState.currentTurn = 1;
  appState.winner = null;
  appState.aiState = createAiState();
  updateTurnCopy();
  renderFleet();
  renderBoards();

  if (appState.mode === "player") {
    showModal(
      "Round de Jogador 1",
      "Jogador 1, confirma quando estiveres pronto. O dispositivo deve estar fora da vista do adversario.",
      () => {
        hideModal();
        renderBoards();
      }
    );
  }
}

function initializeGame() {
  resetPlayers();
  updateModeButtons();
  updateLabels();
  updateTurnCopy();
  renderFleet();
  renderBoards();
  hideModal();
}

elements.modeSelector.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mode]");
  if (!button) {
    return;
  }

  appState.mode = button.dataset.mode;
  initializeGame();
});

elements.difficultySelector.addEventListener("click", (event) => {
  const button = event.target.closest("[data-difficulty]");
  if (!button) {
    return;
  }

  appState.difficulty = button.dataset.difficulty;
  updateModeButtons();
  updateTurnCopy();
});

elements.randomizeCurrentBtn.addEventListener("click", () => {
  appState.players.forEach(randomizeFleet);
  appState.aiState = createAiState();
  appState.currentTurn = 1;
  appState.winner = null;
  appState.stage = "setup";
  updateTurnCopy();
  renderFleet();
  renderBoards();
});

elements.startBtn.addEventListener("click", startGame);
elements.newGameBtn.addEventListener("click", initializeGame);
elements.modalConfirmBtn.addEventListener("click", () => {
  if (typeof appState.modalAction === "function") {
    const action = appState.modalAction;
    appState.modalAction = null;
    action();
    return;
  }

  hideModal();
});

initializeGame();
