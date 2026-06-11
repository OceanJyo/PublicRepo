class GobangGame {
    constructor(boardSize = 19) {
        this.boardSize = boardSize;
        this.cellSize = 0; // Will be calculated in draw()
        this.offsetX = 0; // Will be set by draw()
        this.offsetY = 0; // Will be set by draw()
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1; // 1 for black, 2 for white
        this.gameOver = false;
        this.moveHistory = [];
        
        this.gameMode = 'humanVsAI'; // Default mode
        this.playerColor = 1; // 1 (black) or 2 (white) for human player in AI mode
        this.aiThinking = false;
        this.aiTimeoutId = null; // Track AI timeout to clear on reset
        this.winnerMessage = null; // Store winner/draw message for display on board
        this.hoverPos = null; // Track mouse hover position for placement indicator
        
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        
        // Setup event listeners that persist
        this.setupEventListeners();
        
        // Draw initial board
        this.draw();
    }

    initializeBoard() {
        // Clear any pending AI timeouts from previous game
        if (this.aiTimeoutId !== null) {
            clearTimeout(this.aiTimeoutId);
            this.aiTimeoutId = null;
        }
        
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.moveHistory = [];
        this.hoverPos = null;
        this.winnerMessage = null;
        this.aiThinking = false;
        
        this.updatePlayerLabels();
        this.updateStatus(this.currentPlayer === 1 ? "Black's Turn" : "White's Turn");
        this.updatePlayerHighlight();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleBoardClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.hoverPos = null;
            this.draw();
        });
        if (document.getElementById('resetBtn')) {
            document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        }
        if (document.getElementById('undoBtn')) {
            document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.round((x - this.offsetX) / this.cellSize);
        const row = Math.round((y - this.offsetY) / this.cellSize);

        if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
            this.hoverPos = { row, col };
        } else {
            this.hoverPos = null;
        }
        this.draw();
    }
    
    updatePlayerLabels() {
        if (this.gameMode === 'humanVsHuman') {
            document.getElementById('blackPlayer').innerHTML = '';
            document.getElementById('blackPlayer').innerHTML = '<div class="player-stone black-stone"></div> <div><div class="player-name">Player 1 (Black)</div></div>';
            document.getElementById('whitePlayer').innerHTML = '';
            document.getElementById('whitePlayer').innerHTML = '<div class="player-stone white-stone"></div> <div><div class="player-name">Player 2 (White)</div></div>';
        } else {
            document.getElementById('blackPlayer').innerHTML = '';
            document.getElementById('blackPlayer').innerHTML = '<div class="player-stone black-stone"></div> <div><div class="player-name">You (Black)</div></div>';
            document.getElementById('whitePlayer').innerHTML = '';
            document.getElementById('whitePlayer').innerHTML = '<div class="player-stone white-stone"></div> <div><div class="player-name">AI (White)</div></div>';
        }
    }

    handleBoardClick(event) {
        if (this.gameOver || this.aiThinking) return;
        
        // In AI mode, only allow human player to click
        if (this.gameMode === 'humanVsAI' && this.currentPlayer !== this.playerColor) {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.round((x - this.offsetX) / this.cellSize);
        const row = Math.round((y - this.offsetY) / this.cellSize);

        if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
            this.makeMove(row, col);
        }
    }

    makeMove(row, col) {
        if (this.board[row][col] === 0) {
            this.board[row][col] = this.currentPlayer;
            this.moveHistory.push({ row, col, player: this.currentPlayer });

            if (this.checkWin(row, col)) {
                this.gameOver = true;
                if (this.gameMode === 'humanVsAI' && this.currentPlayer === 2) {
                    this.winnerMessage = 'AI WINS!';
                    this.updateStatus('AI wins!');
                } else if (this.gameMode === 'humanVsAI') {
                    this.winnerMessage = 'YOU WIN!';
                    this.updateStatus('You win!');
                } else {
                    const playerName = this.currentPlayer === 1 ? 'Black' : 'White';
                    this.winnerMessage = `${playerName.toUpperCase()} WINS!`;
                    this.updateStatus(`${playerName} wins!`);
                }
            } else if (this.isBoardFull()) {
                this.gameOver = true;
                this.winnerMessage = "DRAW!";
                this.updateStatus("It's a draw!");
            } else {
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                this.updateStatus(this.currentPlayer === 1 ? "Black's Turn" : "White's Turn");
                
                // AI move in AI mode
                if (this.gameMode === 'humanVsAI' && this.currentPlayer !== this.playerColor && !this.gameOver) {
                    this.aiThinking = true;
                    this.aiTimeoutId = setTimeout(() => this.makeAIMove(), 800);
                }
            }

            this.updatePlayerHighlight();
            this.draw();
        }
    }
    
    makeAIMove() {
        const move = this.getAIMove();
        if (move) {
            this.makeMove(move.row, move.col);
        }
        this.aiTimeoutId = null;  // Clear the timeout ID
        this.aiThinking = false;
    }
    
    getAIMove() {
        const moves = [];
        
        // Priority 0: Check if we can win immediately
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0) {
                    this.board[row][col] = 2;
                    if (this.checkWin(row, col)) {
                        this.board[row][col] = 0;
                        return { row, col };
                    }
                    this.board[row][col] = 0;
                }
            }
        }
        
        // Priority 1: Block player from winning immediately
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0) {
                    this.board[row][col] = 1;
                    if (this.checkWin(row, col)) {
                        this.board[row][col] = 0;
                        return { row, col };
                    }
                    this.board[row][col] = 0;
                }
            }
        }
        
        // Priority 2: Create unstoppable double threat (two winning moves)
        let bestDoubleThreatMove = null;
        let maxThreats = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0 && this.isNearExistingStone(row, col)) {
                    // Simulate the move
                    this.board[row][col] = 2;
                    
                    // Count how many ways we can win next move
                    let winningMoves = 0;
                    for (let r = 0; r < this.boardSize; r++) {
                        for (let c = 0; c < this.boardSize; c++) {
                            if (this.board[r][c] === 0) {
                                this.board[r][c] = 2;
                                if (this.checkWin(r, c)) {
                                    winningMoves++;
                                }
                                this.board[r][c] = 0;
                            }
                        }
                    }
                    
                    if (winningMoves > maxThreats) {
                        maxThreats = winningMoves;
                        bestDoubleThreatMove = { row, col, threats: winningMoves };
                    }
                    
                    this.board[row][col] = 0;
                }
            }
        }
        
        // If we found a move with 2+ winning opportunities, use it
        if (bestDoubleThreatMove && maxThreats >= 2) {
            return bestDoubleThreatMove;
        }
        
        // Priority 3: Block opponent's double threat
        let bestBlockMove = null;
        let maxOpponentThreats = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0 && this.isNearExistingStone(row, col)) {
                    // Simulate opponent's move
                    this.board[row][col] = 1;
                    
                    // Count how many ways they can win
                    let opponentWinningMoves = 0;
                    for (let r = 0; r < this.boardSize; r++) {
                        for (let c = 0; c < this.boardSize; c++) {
                            if (this.board[r][c] === 0) {
                                this.board[r][c] = 1;
                                if (this.checkWin(r, c)) {
                                    opponentWinningMoves++;
                                }
                                this.board[r][c] = 0;
                            }
                        }
                    }
                    
                    if (opponentWinningMoves > maxOpponentThreats) {
                        maxOpponentThreats = opponentWinningMoves;
                        bestBlockMove = { row, col };
                    }
                    
                    this.board[row][col] = 0;
                }
            }
        }
        
        // Block opponent's double threat if critical
        if (bestBlockMove && maxOpponentThreats >= 2) {
            return bestBlockMove;
        }
        
        // Priority 4: Create strong position with high-value threats
        let bestMove = null;
        let bestPositionScore = -Infinity;
        
        const candidateMoves = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0 && this.isNearExistingStone(row, col)) {
                    candidateMoves.push({ row, col });
                }
            }
        }
        
        // Sort candidates by position quality to reduce computation
        candidateMoves.sort((a, b) => {
            const scoreA = this.evaluatePosition(a.row, a.col);
            const scoreB = this.evaluatePosition(b.row, b.col);
            return scoreB - scoreA;
        });
        
        // Evaluate top candidates with deeper analysis
        for (const move of candidateMoves.slice(0, Math.min(20, candidateMoves.length))) {
            this.board[move.row][move.col] = 2;
            
            let score = this.evaluatePosition(move.row, move.col);
            
            // Additional bonus for creating threats
            const aiThreats = this.countThreats(move.row, move.col, 2);
            score += aiThreats * 1000;
            
            // Penalty for allowing opponent threats
            const playerThreats = this.countThreats(move.row, move.col, 1);
            score -= playerThreats * 600;
            
            // Check if this creates a follow-up advantage
            const followUpScore = this.evaluateFollowUpPotential(move.row, move.col);
            score += followUpScore;
            
            this.board[move.row][move.col] = 0;
            
            if (score > bestPositionScore) {
                bestPositionScore = score;
                bestMove = move;
            }
        }
        
        return bestMove || this.getRandomValidMove();
    }

    evaluateFollowUpPotential(row, col) {
        let score = 0;
        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 }
        ];
        
        // Look ahead to see if this move creates good follow-up positions
        for (let dir of directions) {
            // Check adjacent empty positions for follow-up
            for (let offset = 1; offset <= 2; offset++) {
                const nextRow = row + (dir.dr * offset);
                const nextCol = col + (dir.dc * offset);
                
                if (nextRow >= 0 && nextRow < this.boardSize && 
                    nextCol >= 0 && nextCol < this.boardSize &&
                    this.board[nextRow][nextCol] === 0) {
                    
                    // Simulate follow-up move
                    this.board[nextRow][nextCol] = 2;
                    const followUpScore = this.evaluatePosition(nextRow, nextCol);
                    this.board[nextRow][nextCol] = 0;
                    
                    if (followUpScore > 1000) {
                        score += 200;
                    }
                }
            }
        }
        
        return score;
    }
    
    countThreats(row, col, player) {
        let threatCount = 0;
        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 }
        ];
        
        for (let dir of directions) {
            let consecutiveCount = 1;
            
            // Check positive direction
            let r = row + dir.dr;
            let c = col + dir.dc;
            while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
                consecutiveCount++;
                r += dir.dr;
                c += dir.dc;
            }
            
            // Check negative direction
            r = row - dir.dr;
            c = col - dir.dc;
            while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
                consecutiveCount++;
                r -= dir.dr;
                c -= dir.dc;
            }
            
            // Count as threat if 3 or 4 in a row
            if (consecutiveCount >= 3) {
                threatCount++;
            }
        }
        
        return threatCount;
    }
    
    evaluatePosition(row, col) {
        let score = 0;
        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 }
        ];
        
        // Evaluate for both AI and player across all directions
        for (let dir of directions) {
            let aiConsec = this.countConsecutive(row, col, 2, dir);
            let playerConsec = this.countConsecutive(row, col, 1, dir);
            
            // AI patterns with enhanced scoring
            switch(aiConsec) {
                case 5: score += 500000; break;  // Winning position
                case 4: score += 100000; break;  // 4-in-a-row setup
                case 3: 
                    // 3-in-a-row with open ends is more valuable
                    const openThreeScore = this.isOpenThree(row, col, 2, dir) ? 8000 : 5000;
                    score += openThreeScore;
                    break;
                case 2: 
                    // 2-in-a-row with potential
                    const openTwoScore = this.isOpenTwo(row, col, 2, dir) ? 800 : 500;
                    score += openTwoScore;
                    break;
                case 1: score += 50; break;
            }
            
            // Opponent patterns - block them heavily
            switch(playerConsec) {
                case 4: score += 90000; break;  // Critical block
                case 3:
                    const blockThreeScore = this.isOpenThree(row, col, 1, dir) ? 6000 : 4000;
                    score += blockThreeScore;
                    break;
                case 2: 
                    const blockTwoScore = this.isOpenTwo(row, col, 1, dir) ? 600 : 300;
                    score += blockTwoScore;
                    break;
            }
        }
        
        // Strategic positioning bonus - adaptive to board size
        const center = Math.floor(this.boardSize / 2);
        const centerDist = Math.abs(row - center) + Math.abs(col - center);
        const maxDist = Math.floor(this.boardSize / 2);
        score += (maxDist - centerDist) * 20;
        
        // Connection bonus - encourage building
        let connectedStones = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === 2) {
                    connectedStones++;
                }
            }
        }
        score += connectedStones * 100;
        
        return score;
    }

    isOpenThree(row, col, player, direction) {
        // Check if a 3-in-a-row has open ends (not blocked)
        const consecutive = this.countConsecutive(row, col, player, direction);
        
        if (consecutive !== 3) return false;
        
        // Check if both sides are open
        const isLeftOpen = this.isDirectionOpen(row, col, player, direction, true);
        const isRightOpen = this.isDirectionOpen(row, col, player, direction, false);
        
        return isLeftOpen && isRightOpen;
    }

    isOpenTwo(row, col, player, direction) {
        // Check if a 2-in-a-row has open ends
        const consecutive = this.countConsecutive(row, col, player, direction);
        
        if (consecutive !== 2) return false;
        
        return this.isDirectionOpen(row, col, player, direction, true) && 
               this.isDirectionOpen(row, col, player, direction, false);
    }

    isDirectionOpen(row, col, player, direction, isNegative) {
        const r = isNegative ? row - direction.dr : row + direction.dr;
        const c = isNegative ? col - direction.dc : col + direction.dc;
        
        if (r < 0 || r >= this.boardSize || c < 0 || c >= this.boardSize) {
            return false; // Blocked by board edge
        }
        
        return this.board[r][c] === 0; // Open if empty
    }
    
    countConsecutive(row, col, player, direction) {
        let count = 1;
        
        // Check positive direction
        let r = row + direction.dr;
        let c = col + direction.dc;
        while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
            count++;
            r += direction.dr;
            c += direction.dc;
        }
        
        // Check negative direction
        r = row - direction.dr;
        c = col - direction.dc;
        while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
            count++;
            r -= direction.dr;
            c -= direction.dc;
        }
        
        return count;
    }
    
    getRandomValidMove() {
        // First move - play center
        let stoneCount = 0;
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== 0) stoneCount++;
            }
        }
        
        const center = Math.floor(this.boardSize / 2);
        
        if (stoneCount <= 2) {
            return { row: center, col: center };
        }
        
        // Find moves near existing stones, prioritizing better positions
        const validMoves = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0 && this.isNearExistingStone(row, col)) {
                    const distToCenter = Math.abs(row - center) + Math.abs(col - center);
                    validMoves.push({ row, col, priority: distToCenter });
                }
            }
        }
        
        if (validMoves.length === 0) {
            return { row: center, col: center };
        }
        
        // Sort by priority (closer to center is better) and pick one of the top candidates
        validMoves.sort((a, b) => a.priority - b.priority);
        return validMoves[Math.floor(Math.random() * Math.min(3, validMoves.length))];
    }
    
    isNearExistingStone(row, col) {
        for (let r = Math.max(0, row - 2); r <= Math.min(this.boardSize - 1, row + 2); r++) {
            for (let c = Math.max(0, col - 2); c <= Math.min(this.boardSize - 1, col + 2); c++) {
                if (this.board[r][c] !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            { dr: 0, dc: 1 },  // horizontal
            { dr: 1, dc: 0 },  // vertical
            { dr: 1, dc: 1 },  // diagonal
            { dr: 1, dc: -1 }  // anti-diagonal
        ];

        for (let direction of directions) {
            let count = 1;
            
            // Check in positive direction
            let r = row + direction.dr;
            let c = col + direction.dc;
            while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
                count++;
                r += direction.dr;
                c += direction.dc;
            }

            // Check in negative direction
            r = row - direction.dr;
            c = col - direction.dc;
            while (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
                count++;
                r -= direction.dr;
                c -= direction.dc;
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    }

    isBoardFull() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    undo() {
        if (this.moveHistory.length === 0) return;

        const move = this.moveHistory.pop();
        this.board[move.row][move.col] = 0;
        this.currentPlayer = move.player;
        this.gameOver = false;
        
        this.updateStatus(this.currentPlayer === 1 ? "Black's Turn" : "White's Turn");
        this.updatePlayerHighlight();
        this.draw();
    }

    reset() {
        // Clear any pending AI timeouts from previous game
        if (this.aiTimeoutId !== null) {
            clearTimeout(this.aiTimeoutId);
            this.aiTimeoutId = null;
        }
        
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.moveHistory = [];
        this.aiThinking = false;
        this.winnerMessage = null;
        
        this.updateStatus("Black's Turn");
        this.updatePlayerHighlight();
        this.draw();
    }

    updateStatus(text) {
        document.getElementById('gameStatus').textContent = text;
    }

    updatePlayerHighlight() {
        const blackPlayer = document.getElementById('blackPlayer');
        const whitePlayer = document.getElementById('whitePlayer');

        blackPlayer.classList.remove('active');
        whitePlayer.classList.remove('active');

        if (!this.gameOver) {
            if (this.currentPlayer === 1) {
                blackPlayer.classList.add('active');
            } else {
                whitePlayer.classList.add('active');
            }
        }
    }

    draw() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Calculate adaptive cellSize based on canvas dimensions
        // Use 40 pixel margin for size 19, 80 pixels for smaller sizes
        const margin = this.boardSize === 19 ? 40 : 80;
        const availableWidth = width - margin;
        const availableHeight = height - margin;
        const maxCellSize = Math.min(availableWidth, availableHeight) / (this.boardSize - 1);
        const cellSize = Math.floor(maxCellSize);
        
        const boardSize = (this.boardSize - 1) * cellSize;
        
        this.cellSize = cellSize;
        this.offsetX = (width - boardSize) / 2;
        this.offsetY = (height - boardSize) / 2;
        
        this.ctx.fillStyle = '#d4af37';
        this.ctx.fillRect(0, 0, width, height);

        // Calculate proper board bounds and store as instance variables
        const boardWidth = boardSize;
        const boardHeight = boardSize;

        // Draw grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.boardSize; i++) {
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX, this.offsetY + i * this.cellSize);
            this.ctx.lineTo(this.offsetX + boardSize, this.offsetY + i * this.cellSize);
            this.ctx.stroke();

            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX + i * this.cellSize, this.offsetY);
            this.ctx.lineTo(this.offsetX + i * this.cellSize, this.offsetY + boardSize);
            this.ctx.stroke();
        }

        // Draw grid points (star points) - adaptive to board size
        this.ctx.fillStyle = '#333';
        const starPoints = this.getStarPoints();
        for (let point of starPoints) {
            if (point[0] < this.boardSize && point[1] < this.boardSize) {
                this.ctx.beginPath();
                this.ctx.arc(
                    this.offsetX + point[1] * this.cellSize,
                    this.offsetY + point[0] * this.cellSize,
                    3,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        }

        // Draw stones
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== 0) {
                    this.drawStone(row, col, this.board[row][col]);
                }
            }
        }

        // Highlight the last move
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(
                this.offsetX + lastMove.col * this.cellSize,
                this.offsetY + lastMove.row * this.cellSize,
                this.cellSize * 0.35,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
        }

        // Show placement indicator on hover
        if (this.hoverPos && this.board[this.hoverPos.row][this.hoverPos.col] === 0) {
            this.drawPlacementIndicator(this.hoverPos.row, this.hoverPos.col);
        }
        
        // Display winner message on board
        if (this.gameOver && this.winnerMessage) {
            this.drawWinnerMessage();
        }
    }

    getStarPoints() {
        // Return adaptive star points based on board size
        if (this.boardSize === 9) {
            return [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]];
        } else if (this.boardSize === 13) {
            return [[3, 3], [3, 9], [9, 3], [9, 9], [6, 6]];
        } else {
            // 19x19
            return [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]];
        }
    }
    
    drawWinnerMessage() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw text background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const boxWidth = 300;
        const boxHeight = 120;
        this.ctx.fillRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight);
        
        // Draw border
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(centerX - boxWidth / 2, centerY - boxHeight / 2, boxWidth, boxHeight);
        
        // Draw winner text
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.winnerMessage, centerX, centerY);
    }

    drawPlacementIndicator(row, col) {
        const x = this.offsetX + col * this.cellSize;
        const y = this.offsetY + row * this.cellSize;
        const radius = this.cellSize * 0.4 * 0.8; // Slightly smaller than stone
        
        this.ctx.strokeStyle = this.currentPlayer === 1 ? '#333' : '#999';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawStone(row, col, player) {
        const x = this.offsetX + col * this.cellSize;
        const y = this.offsetY + row * this.cellSize;
        const radius = this.cellSize * 0.4;

        // Draw shadow (3D effect)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 3, y + 4, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw stone with gradient for 3D effect
        const gradient = this.ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
        
        if (player === 1) {
            // Black stone
            gradient.addColorStop(0, '#4a4a4a');     // Light highlight
            gradient.addColorStop(0.4, '#1a1a1a');   // Mid tone
            gradient.addColorStop(1, '#000000');     // Dark edge
        } else {
            // White stone
            gradient.addColorStop(0, '#ffffff');     // Light highlight
            gradient.addColorStop(0.6, '#f0f0f0');   // Mid tone
            gradient.addColorStop(1, '#d0d0d0');     // Dark edge
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw glossy highlight for 3D effect
        this.ctx.fillStyle = player === 1 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.25, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw stone border
        this.ctx.strokeStyle = player === 1 ? '#1a1a1a' : '#999999';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
}

// Global game instance
let gobangGame = null;

// Change board size - called from onchange handler (matches Go game pattern)
export function changeBoardSize() {
    const size = parseInt(document.getElementById('boardSize').value);
    gobangGame.boardSize = size;
    //gobangGame.cellSize = gobangGame.calculateCellSize(size);
    //gobangGame.updateCanvasSize();
    gobangGame.initializeBoard();
    gobangGame.draw();
}

// Select game mode - called from onclick handlers in HTML
export function selectGameMode(mode) {
    if (!gobangGame) return;
    
    gobangGame.gameMode = mode;
    if (mode === 'humanVsAI') {
        gobangGame.playerColor = 1; // Human plays as black (first)
    } else {
        gobangGame.playerColor = null;
    }
    
    // Update button active states
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => btn.classList.remove('active'));
    
    if (mode === 'humanVsHuman') {
        //document.querySelector('[onclick*="humanVsHuman"]').classList.add('active');
        document.querySelector('#humanVsHumanBtn').classList.add('active');
    } else {
        //document.querySelector('[onclick*="humanVsAI"]').classList.add('active');
        document.querySelector('#humanVsAIBtn').classList.add('active');
    }
    
    gobangGame.updatePlayerLabels();
    gobangGame.reset();
    gobangGame.draw();
}

// Initialize the game when the page loads
export function initializeGobang() {
    //document.addEventListener('DOMContentLoaded', () => {
        // Get initial board size from selector
        const boardSizeSelect = document.getElementById('boardSize');
        const initialBoardSize = boardSizeSelect ? parseInt(boardSizeSelect.value) : 19;
        
        gobangGame = new GobangGame(initialBoardSize);
    
    // Update player labels to match the default mode (humanVsAI)
    gobangGame.updatePlayerLabels();
    
    // Set initial active button to match default mode (humanVsAI)
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => btn.classList.remove('active'));
    //document.querySelector('[onclick*="humanVsAI"]').classList.add('active');
    document.querySelector('#humanVsAIBtn').classList.add('active');
    
    // Sidebar menu initialization
    // const toggleBtn = document.getElementById('toggleSidebarBtn');
    // const sidebar = document.querySelector('.sidebar');
    // const menuItems = document.querySelectorAll('.menu-item');
    
    // // Toggle sidebar on mobile
    // if (toggleBtn) {
    //     toggleBtn.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         sidebar.classList.toggle('active');
    //     });
    // }
    
    // Handle menu item clicks
    // menuItems.forEach(item => {
    //     item.addEventListener('click', (e) => {
    //         const href = item.getAttribute('href');
            
    //         // Don't prevent default if it's an external navigation
    //         if (href && href !== '#' && !href.startsWith('javascript:')) {
    //             // Just allow normal link navigation
    //             return true;
    //         }
            
    //         e.preventDefault();
    //         e.stopPropagation();
            
    //         // Remove active class from all items
    //         menuItems.forEach(i => i.classList.remove('active'));
            
    //         // Add active class to clicked item
    //         item.classList.add('active');
            
    //         // Close sidebar on mobile
    //         if (window.innerWidth <= 768) {
    //             sidebar.classList.remove('active');
    //         }
    //     });
    // });
    
    // Close sidebar when clicking outside on mobile
    // document.addEventListener('click', (e) => {
    //     if (window.innerWidth <= 768) {
    //         const isClickInside = sidebar.contains(e.target) || (toggleBtn && toggleBtn.contains(e.target));
    //         if (!isClickInside) {
    //             sidebar.classList.remove('active');
    //         }
    //     }
    // });
    //});

}
