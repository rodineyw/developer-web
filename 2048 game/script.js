// Configuração inicial
const boardSize = 4; // Tabuleiro 4x4
let board = [];
let score = 0;

// Seleção de elementos do DOM
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const gameMessage = document.getElementById('game-message');

// Sons do jogo
const sounds = {
  move: 'assets/move.m4a',
  merge: 'assets/merge.m4a',
  win: 'assets/win.m4a',
  gameover: 'assets/perdeu.m4a',
};

// Função para reproduzir sons
function playSound(soundFile) {
  const audio = new Audio(soundFile);
  audio.play();
}

// Inicializa o tabuleiro
function initBoard() {
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  spawnTile();
  spawnTile();
  updateBoard();
}

// Atualiza o tabuleiro no DOM
function updateBoard() {
  gameBoard.innerHTML = '';
  board.forEach(row => {
    const tableRow = document.createElement('tr');
    row.forEach(cell => {
      const tableCell = document.createElement('td');
      tableCell.className = `tile-${cell}`;
      tableCell.textContent = cell === 0 ? '' : cell;
      tableRow.appendChild(tableCell);
    });
    gameBoard.appendChild(tableRow);
  });
  scoreDisplay.textContent = `Score: ${score}`;
}

// Gera uma nova peça (2 ou 4) em posição vazia
function spawnTile() {
  const emptyCells = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 0) emptyCells.push([i, j]);
    }
  }

  if (emptyCells.length > 0) {
    const [x, y] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[x][y] = Math.random() > 0.9 ? 4 : 2;
  }
}

// Move as peças em uma direção
function move(direction) {
  let moved = false;

  // Compacta uma linha ou coluna (remove zeros)
  function compress(line) {
    return line.filter(num => num !== 0).concat(Array(boardSize).fill(0)).slice(0, boardSize);
  }

  // Combina números iguais
  function merge(line) {
    for (let i = 0; i < line.length - 1; i++) {
      if (line[i] !== 0 && line[i] === line[i + 1]) {
        line[i] *= 2;
        score += line[i];
        line[i + 1] = 0;
      }
    }
    return line;
  }

  for (let i = 0; i < boardSize; i++) {
    let line;
    switch (direction) {
      case 'left':
        line = compress(board[i]);
        line = merge(line);
        line = compress(line);
        if (board[i].toString() !== line.toString()) moved = true;
        board[i] = line;
        break;
      case 'right':
        line = compress(board[i].slice().reverse());
        line = merge(line);
        line = compress(line);
        if (board[i].toString() !== line.slice().reverse().toString()) moved = true;
        board[i] = line.reverse();
        break;
      case 'up':
        line = compress(board.map(row => row[i]));
        line = merge(line);
        line = compress(line);
        for (let j = 0; j < boardSize; j++) {
          if (board[j][i] !== line[j]) moved = true;
          board[j][i] = line[j];
        }
        break;
      case 'down':
        line = compress(board.map(row => row[i]).reverse());
        line = merge(line);
        line = compress(line);
        for (let j = 0; j < boardSize; j++) {
          if (board[j][i] !== line[boardSize - 1 - j]) moved = true;
          board[j][i] = line[boardSize - 1 - j];
        }
        break;
    }
  }

  if (moved) {
    playSound(sounds.move);
    spawnTile();
    updateBoard();

    if (checkWin()) {
      playSound(sounds.win); // Som de vitória
      return;
    }

    if (checkGameOver()) {
      playSound(sounds.gameover); // Som de fim de jogo
      return;
    }
  }
}

// Verifica se o jogador atingiu 2048
function checkWin() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 2048) {
        showMessage('Parabéns! Você atingiu 2048!', true);
        return true;
      }
    }
  }
  return false;
}

// Verifica se o jogo acabou
function checkGameOver() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 0) return false;
      if (i > 0 && board[i][j] === board[i - 1][j]) return false;
      if (i < boardSize - 1 && board[i][j] === board[i + 1][j]) return false;
      if (j > 0 && board[i][j] === board[i][j - 1]) return false;
      if (j < boardSize - 1 && board[i][j] === board[i][j + 1]) return false;
    }
  }
  showMessage('Fim de Jogo! Não há mais movimentos!', true);
  return true;
}

// Mostra uma mensagem com animação
function showMessage(text, showRestartButton = false) {
  gameMessage.textContent = text;

  if (showRestartButton) {
    const restartButton = document.createElement('button');
    restartButton.textContent = "Reiniciar";
    restartButton.addEventListener('click', resetGame);
    gameMessage.appendChild(restartButton);
  }
}

// Reseta o jogo
function resetGame() {
  score = 0;
  gameMessage.textContent = '';
  initBoard();
}

// Detecta teclas pressionadas
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowLeft':
      move('left');
      break;
    case 'ArrowRight':
      move('right');
      break;
    case 'ArrowUp':
      move('up');
      break;
    case 'ArrowDown':
      move('down');
      break;
  }
});


// Variáveis para capturar o início e o fim do toque
let startX, startY, endX, endY;

// Detecta início do toque
document.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

// Detecta fim do toque
document.addEventListener('touchend', (e) => {
  endX = e.changedTouches[0].clientX;
  endY = e.changedTouches[0].clientY;

  handleSwipe();
});

// Calcula o swipe com base na direção
function handleSwipe() {
  const diffX = endX - startX;
  const diffY = endY - startY;

  // Verifica se o swipe foi mais na horizontal ou vertical
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 50) {
      move('right'); // Swipe para a direita
    } else if (diffX < -50) {
      move('left'); // Swipe para a esquerda
    }
  } else {
    if (diffY > 50) {
      move('down'); // Swipe para baixo
    } else if (diffY < -50) {
      move('up'); // Swipe para cima
    }
  }
}

// Seleciona o elemento de instruções
const instructions = document.getElementById('instructions');

// Detecta se o dispositivo é móvel
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Atualiza as instruções com base no dispositivo
if (isMobile) {
  instructions.textContent = "Instruções: Deslize para cima, para baixo e para os lados para jogar. Atualize a página para reiniciar.";
} else {
  instructions.textContent = "Instruções: Use as setas do teclado para jogar. Atualize a página para reiniciar.";
}


// Seleciona o contêiner de mensagens
const messageBox = document.getElementById('message');

// Mostra uma mensagem com animação
function showMessage(text, showRestartButton = false) {
  messageBox.textContent = ''; // Limpa mensagens anteriores
  const messageText = document.createElement('p');
  messageText.textContent = text;
  messageBox.appendChild(messageText);

  // Adiciona um botão de reinício, se necessário
  if (showRestartButton) {
    const restartButton = document.createElement('span');
    restartButton.textContent = "Reiniciar Jogo";
    restartButton.addEventListener('click', resetGame);
    messageBox.appendChild(restartButton);
  }

  // Exibe o contêiner
  messageBox.classList.remove('hidden');
}

// Verifica se o jogador atingiu 2048
function checkWin() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 2048) {
        showMessage('Parabéns! Você atingiu 2048!', true);
        return true; // O jogo pode continuar se o jogador quiser
      }
    }
  }
  return false;
}

// Verifica se o jogo terminou
function checkGameOver() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 0) return false; // Ainda há espaços vazios
      if (i > 0 && board[i][j] === board[i - 1][j]) return false; // Mesclar vertical
      if (i < boardSize - 1 && board[i][j] === board[i + 1][j]) return false;
      if (j > 0 && board[i][j] === board[i][j - 1]) return false; // Mesclar horizontal
      if (j < boardSize - 1 && board[i][j] === board[i][j + 1]) return false;
    }
  }

  // Se nenhuma condição foi atendida, o jogo acabou
  showMessage('Fim de Jogo! Não há mais movimentos!', true);
  return true;
}


// Inicializa o jogo
initBoard();