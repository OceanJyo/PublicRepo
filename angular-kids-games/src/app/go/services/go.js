// Go Game Engine
class GoGame {
    constructor(boardSize = 19) {
        this.boardSize = boardSize;
        this.board = [];
        this.previousBoard = null; // For Ko rule detection
        this.moveHistory = [];
        this.lastMove = null;
        this.capturedBlack = 0;
        this.capturedWhite = 0;
        this.currentPlayer = 'black';
        this.gameMode = 'ai'; // 'ai' or 'twoPlayer'
        this.gameOver = false;
        this.passCount = 0;
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.aiDifficulty = 'medium';
        this.aiThinking = false;
        this.aiTimeoutId = null; // Track AI timeout to clear on reset
        
        this.initializeBoard();
        this.setupEventListeners();
        this.draw();
        this.updateUI();
    }

    initializeBoard() {
        // Clear any pending AI timeouts from previous game
        if (this.aiTimeoutId !== null) {
            clearTimeout(this.aiTimeoutId);
            this.aiTimeoutId = null;
        }
        
        this.board = Array(this.boardSize).fill(null).map(() => 
            Array(this.boardSize).fill(null)
        );
        this.previousBoard = null;
        this.moveHistory = [];
        this.lastMove = null;
        this.capturedBlack = 0;
        this.capturedWhite = 0;
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.passCount = 0;
        this.aiThinking = false;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.round((x - this.offsetX) / this.cellSize);
        const row = Math.round((y - this.offsetY) / this.cellSize);
        
        return { row, col, x, y };
    }

    handleClick(e) {
        if (this.gameOver || this.aiThinking) return;
        
        const { row, col } = this.getCanvasCoordinates(e);
        
        if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
            return;
        }

        if (this.board[row][col] === null && this.isLegalMove(row, col, this.currentPlayer)) {
            this.makeMove(row, col, this.currentPlayer);
            
            // AI move in single player mode
            if (this.gameMode === 'ai' && this.currentPlayer === 'white' && !this.gameOver) {
                this.aiThinking = true;
                document.getElementById('status').textContent = 'AI is thinking...';
                this.aiTimeoutId = setTimeout(() => this.makeAIMove(), 500);
            }
        } else if (this.board[row][col] === null) {
            document.getElementById('status').textContent = 'Illegal move - no liberties!';
        }
    }

    handleRightClick(e) {
        // Stone removal disabled - right-click does nothing
    }

    handleMouseMove(e) {
        const { row, col } = this.getCanvasCoordinates(e);
        
        if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
            this.draw();
            if (this.board[row][col] === null) {
                this.drawPlacementIndicator(row, col, this.currentPlayer);
            }
        } else {
            this.draw();
        }
    }

    makeMove(row, col, player) {
        // Save board state for Ko rule detection
        this.previousBoard = this.board.map(r => [...r]);
        
        this.board[row][col] = player;
        this.moveHistory.push({ row, col, player });
        this.lastMove = { row, col, player };
        
        // Check and capture opponent stones
        const opponent = player === 'black' ? 'white' : 'black';
        this.checkAndCapture(opponent);
        
        // Add the placed stone to captured count if no liberties
        this.checkAndCapture(player);
        
        // Switch player
        this.currentPlayer = opponent;
        this.passCount = 0;
        
        this.draw();
        this.updateUI();
    }

    checkAndCapture(player) {
        const captured = [];
        const checked = new Set();
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === player) {
                    const key = `${row},${col}`;
                    if (checked.has(key)) continue;
                    
                    const group = this.getConnectedGroup(row, col);
                    group.forEach(pos => checked.add(`${pos.row},${pos.col}`));
                    
                    const groupLiberties = this.getGroupLiberties(group);
                    if (groupLiberties.length === 0) {
                        group.forEach(pos => {
                            this.board[pos.row][pos.col] = null;
                            captured.push(pos);
                        });
                    }
                }
            }
        }
        
        // Update captured stones count
        if (captured.length > 0) {
            if (player === 'black') {
                this.capturedBlack += captured.length;
            } else {
                this.capturedWhite += captured.length;
            }
        }
        
        return captured;
    }

    getGroupLiberties(group) {
        const liberties = new Set();
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const { row, col } of group) {
            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize && 
                    this.board[newRow][newCol] === null) {
                    liberties.add(`${newRow},${newCol}`);
                }
            }
        }
        
        return Array.from(liberties).map(key => {
            const [row, col] = key.split(',').map(Number);
            return { row, col };
        });
    }

    getConnectedGroup(row, col) {
        const player = this.board[row][col];
        const group = [];
        const visited = new Set();
        const queue = [{ row, col }];
        
        while (queue.length > 0) {
            const { row: r, col: c } = queue.shift();
            const key = `${r},${c}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (this.board[r][c] === player) {
                group.push({ row: r, col: c });
                
                const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    
                    if (nr >= 0 && nr < this.boardSize && 
                        nc >= 0 && nc < this.boardSize) {
                        queue.push({ row: nr, col: nc });
                    }
                }
            }
        }
        
        return group;
    }

    makeAIMove() {
        const move = this.getAIMove();
        
        if (move) {
            this.aiTimeoutId = null;  // Clear the timeout ID
            this.makeMove(move.row, move.col, 'white');
            document.getElementById('status').textContent = 'Your turn';
            this.aiThinking = false;
        } else {
            const passingPlayer = this.currentPlayer === 'black' ? 'Black' : 'White';
            this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
            this.passCount++;
            
            if (this.passCount >= 2) {
                this.gameOver = true;
                document.getElementById('status').textContent = 'Game Over - Both players passed';
                this.aiThinking = false;
                this.aiTimeoutId = null;
                endGame();
            } else {
                document.getElementById('status').textContent = 
                    `${passingPlayer} passed - Your turn`;
                
                if (this.gameMode === 'ai' && this.currentPlayer === 'white') {
                    this.aiThinking = true;
                    this.aiTimeoutId = setTimeout(() => this.makeAIMove(), 500);
                } else {
                    this.aiThinking = false;
                    this.aiTimeoutId = null;
                }
            }
            
            this.updateUI();
        }
    }

    getAIMove() {
        const validMoves = this.getValidMoves();
        
        if (validMoves.length === 0) return null;
        
        // Filter out suicidal moves
        const nonSuicidalMoves = validMoves.filter(move => !this.isSuicideMove(move));
        const movesToConsider = nonSuicidalMoves.length > 0 ? nonSuicidalMoves : validMoves;
        
        let move;
        
        if (this.aiDifficulty === 'easy') {
            move = movesToConsider[Math.floor(Math.random() * movesToConsider.length)];
        } else if (this.aiDifficulty === 'medium') {
            move = this.getMediumAIMove(movesToConsider);
        } else {
            move = this.getHardAIMove(movesToConsider);
        }
        
        return move;
    }

    isSuicideMove(move) {
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        // Check if any enemy stones would be captured
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        let wouldCapture = false;
        
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'black') {
                const group = this.getConnectedGroup(r, c);
                const groupLiberties = this.getGroupLiberties(group);
                if (groupLiberties.length === 0) {
                    wouldCapture = true;
                    break;
                }
            }
        }
        
        // Check if the placed stone would have liberties
        const group = this.getConnectedGroup(move.row, move.col);
        const groupLiberties = this.getGroupLiberties(group);
        const hasSafeLiberties = groupLiberties.length > 0;
        
        this.board = tempBoard;
        
        // Suicide = no liberties AND no captures
        return !hasSafeLiberties && !wouldCapture;
    }

    getMediumAIMove(validMoves) {
        // Priority 1: Capture enemy stones (high value)
        for (const move of validMoves) {
            const tempBoard = this.board.map(row => [...row]);
            this.board[move.row][move.col] = 'white';
            
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of directions) {
                const r = move.row + dr;
                const c = move.col + dc;
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                    this.board[r][c] === 'black') {
                    const group = this.getConnectedGroup(r, c);
                    const groupLiberties = this.getGroupLiberties(group);
                    if (groupLiberties.length === 0) {
                        this.board = tempBoard;
                        return move;
                    }
                }
            }
            
            this.board = tempBoard;
        }
        
        // Priority 2: Put enemy stones in atari (1 liberty)
        for (const move of validMoves) {
            const tempBoard = this.board.map(row => [...row]);
            this.board[move.row][move.col] = 'white';
            
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of directions) {
                const r = move.row + dr;
                const c = move.col + dc;
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                    this.board[r][c] === 'black') {
                    const group = this.getConnectedGroup(r, c);
                    const groupLiberties = this.getGroupLiberties(group);
                    if (groupLiberties.length === 1) {
                        this.board = tempBoard;
                        return move;
                    }
                }
            }
            
            this.board = tempBoard;
        }
        
        // Priority 3: Defend own stones in danger (2 or fewer liberties)
        for (const move of validMoves) {
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of directions) {
                const r = move.row + dr;
                const c = move.col + dc;
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                    this.board[r][c] === 'white') {
                    const group = this.getConnectedGroup(r, c);
                    const groupLiberties = this.getGroupLiberties(group);
                    if (groupLiberties.length <= 2) {
                        return move;
                    }
                }
            }
        }
        
        // Priority 4: Play near existing stones (building territory)
        for (const move of validMoves) {
            const neighbors = this.countNeighbors(move.row, move.col);
            if (neighbors > 0) return move;
        }
        
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    getHardAIMove(validMoves) {
        let bestMove = null;
        let bestScore = -Infinity;
        
        // Preserve the original board state before evaluation
        const originalBoard = this.board.map(row => [...row]);
        
        // Opening strategy for early game positions (first 8 moves)
        if (this.moveHistory.length < 8) {
            const openingMove = this.getOpeningMove();
            if (openingMove && validMoves.some(m => m.row === openingMove.row && m.col === openingMove.col)) {
                return openingMove;
            }
        }
        
        for (const move of validMoves) {
            let score = 0;
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            const moveCount = this.moveHistory.length;
            
            // 1. CRITICAL: Immediate capture wins
            const captureScore = this.evaluateCaptureOpportunity(move);
            if (captureScore > 0) {
                score += captureScore * 100;
            }
            
            // 2. CRITICAL: Defend critical groups
            const defenseScore = this.evaluateDefense(move, directions);
            score += defenseScore;
            
            // 3. Create threats and setup for future captures
            const threatScore = this.evaluateOffensiveThreats(move, directions);
            score += threatScore;
            
            // 4. Eye formation bonus - stones that help form secure territory
            const eyeScore = this.evaluateEyeFormation(move);
            score += eyeScore * 8;
            
            // 4.5 Build live territory - actively create sealed safe regions
            const buildTerritoryScore = this.evaluateBuildLiveTerritory(move);
            score += buildTerritoryScore;
            
            // 5. Territory influence with extended reach
            const territoryScore = this.evaluateTerritoryInfluence(move);
            score += territoryScore;
            
            // 6. IMPORTANT (Mid/Late game): Prioritize securing live territory
            // In later game, focus heavily on consolidating safe territory
            if (moveCount > 30) {
                const liveTerrScore = this.evaluateLiveTerritory(move);
                const deadTerritoryPenalty = this.evaluateDeadTerritory(move);
                
                // Weight increases with game progression
                const terrWeightMultiplier = Math.min(2.0, 1.0 + (moveCount - 30) / 50);
                score += liveTerrScore * terrWeightMultiplier;
                score -= deadTerritoryPenalty * terrWeightMultiplier;
            }
            
            // 6.5 CRITICAL: Don't kill own live territory
            const ownTerritoryDamage = this.evaluateOwnTerritoryDamage(move, directions);
            score -= ownTerritoryDamage;
            
            // 7. Connection and strengthening patterns
            const connectionScore = this.evaluateConnections(move, directions);
            score += connectionScore;
            
            // 8. Block opponent's expansion
            const blockScore = this.evaluateBlockingMoves(move);
            score += blockScore;
            
            // 9. Ladder detection - avoid bad moves in ladders
            const ladderPenalty = this.evaluateLadderSafety(move);
            score += ladderPenalty;
            
            // 10. Center influence keeps options open (more important early game)
            if (moveCount < 50) {
                const centerDist = Math.abs(move.row - this.boardSize/2) + 
                                  Math.abs(move.col - this.boardSize/2);
                const centerBonus = Math.max(0, this.boardSize - centerDist) * 0.4;
                score += centerBonus;
            }
            
            // 11. Deep lookahead evaluation - check if move leads to good follow-ups
            const lookaheadScore = this.evaluateLookahead(move, 2);
            score += lookaheadScore;
            
            // 12. Reduce spread penalty - avoid overextending without support
            const spreadPenalty = this.evaluateSpreadPenalty(move);
            score += spreadPenalty;
            
            // Much lower randomness for stronger, more consistent play
            score += Math.random() * 0.5;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        // Restore original board state after evaluation to prevent board corruption
        this.board = originalBoard;
        
        return bestMove || validMoves[0];
    }
    
    evaluateSpreadPenalty(move) {
        // Penalize moves that spread out stones without purpose
        let penalty = 0;
        
        // Check how many white stones are nearby
        let nearbyWhite = 0;
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = move.row + dr;
                const c = move.col + dc;
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                    this.board[r][c] === 'white') {
                    nearbyWhite++;
                }
            }
        }
        
        // Penalty if spreading too far from existing stones
        if (nearbyWhite === 0 && this.moveHistory.length > 10) {
            penalty = -15;  // Strong penalty for isolated plays mid-game
        } else if (nearbyWhite === 1 && this.moveHistory.length > 20) {
            penalty = -8;   // Moderate penalty for sparse plays later
        }
        
        return penalty;
    }
    
    evaluateOwnTerritoryDamage(move, directions) {
        // Detect and penalize moves that would damage or kill own groups/territory
        let damage = 0;
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        // Check if placing this stone would damage any adjacent white groups
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'white') {
                
                const group = this.getConnectedGroup(r, c);
                const liberties = this.getGroupLiberties(group);
                
                // Check if connecting to this group reduces it to critical state
                if (liberties.length === 1) {
                    // Only 1 liberty left - this is very dangerous
                    damage += group.length * 20;  // Heavy penalty
                } else if (liberties.length === 2) {
                    // 2 liberties - vulnerable
                    damage += group.length * 5;
                }
            }
        }
        
        // Check if this move creates a group that's immediately threatened
        const newGroup = this.getConnectedGroup(move.row, move.col);
        const newGroupLiberties = this.getGroupLiberties(newGroup);
        
        if (newGroupLiberties.length === 1) {
            // Created a group with only 1 liberty - very risky
            damage += newGroup.length * 15;
        }
        
        // Check if move ruins existing territory by disrupting eye formation
        // If surrounded by white stones with empty space, disrupting it is bad
        let surroundingWhite = 0;
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'white') {
                surroundingWhite++;
            }
        }
        
        // If this move is in the middle of white territory (surrounded by white)
        // it's usually bad as it ruins potential eyes
        if (surroundingWhite >= 3) {
            damage += 8;  // Penalty for filling own territory
        }
        
        this.board = tempBoard;
        return damage;
    }

    getOpeningMove() {
        const moveCount = this.moveHistory.length;
        const centerPos = Math.floor(this.boardSize / 2);
        
        // First move - play strong opening position (closer to center for better territory)
        if (moveCount === 0) {
            const offset = Math.floor(this.boardSize / 3);
            return { row: offset, col: offset };
        }
        
        // Second move - counter in opposite corner with tactical spacing
        if (moveCount === 2) {
            const firstMove = this.moveHistory[0];
            const offset = Math.floor(this.boardSize / 3);
            const oppositeRow = this.boardSize - 1 - firstMove.row;
            const oppositeCol = this.boardSize - 1 - firstMove.col;
            
            // Adjust to nearby star point for stability
            return { 
                row: Math.max(offset, Math.min(this.boardSize - 1 - offset, oppositeRow)), 
                col: Math.max(offset, Math.min(this.boardSize - 1 - offset, oppositeCol))
            };
        }
        
        return null;
    }

    evaluateCaptureOpportunity(move) {
        let captureValue = 0;
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        // Check if any adjacent black groups would be captured
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'black') {
                const group = this.getConnectedGroup(r, c);
                const groupLiberties = this.getGroupLiberties(group);
                
                if (groupLiberties.length === 0) {
                    // Immediate capture!
                    captureValue += group.length * 10;
                } else if (groupLiberties.length === 1) {
                    // Atari - worth significant value
                    captureValue += group.length * 3;
                }
            }
        }
        
        this.board = tempBoard;
        return captureValue;
    }

    evaluateDefense(move, directions) {
        let defenseScore = 0;
        
        // Check own white stones near the move
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'white') {
                const group = this.getConnectedGroup(r, c);
                const groupLiberties = this.getGroupLiberties(group);
                
                if (groupLiberties.length === 1) {
                    // Critical defense - save a group with 1 liberty
                    defenseScore += 50 * group.length;
                } else if (groupLiberties.length === 2) {
                    // Important defense - strengthen a weak group
                    defenseScore += 20 * group.length;
                }
            }
        }
        
        // Also defend important central groups that aren't adjacent
        const allWhiteGroups = this.getPercentageControlledByPlayer('white');
        if (allWhiteGroups > 0) {
            defenseScore += allWhiteGroups * 2;
        }
        
        return defenseScore;
    }

    evaluateOffensiveThreats(move, directions) {
        let threatScore = 0;
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        // Count how many black groups we're putting into dangerous positions
        const threatenedGroups = new Set();
        
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'black') {
                const group = this.getConnectedGroup(r, c);
                const groupKey = group.map(p => `${p.row},${p.col}`).sort().join('|');
                
                if (!threatenedGroups.has(groupKey)) {
                    threatenedGroups.add(groupKey);
                    const groupLiberties = this.getGroupLiberties(group);
                    
                    if (groupLiberties.length <= 2) {
                        // Score based on severity
                        if (groupLiberties.length === 1) {
                            threatScore += Math.min(group.length, 5) * 20;  // Atari on large groups is very valuable
                        } else if (groupLiberties.length === 2) {
                            threatScore += group.length * 8;
                        }
                    }
                }
            }
        }
        
        // Also look for opportunities to create multiple threats with one move
        let threatCount = 0;
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'black') {
                const group = this.getConnectedGroup(r, c);
                const groupLiberties = this.getGroupLiberties(group);
                if (groupLiberties.length === 1) {
                    threatCount++;
                }
            }
        }
        
        // Bonus for creating multiple threats (ladder-like patterns)
        if (threatCount >= 2) {
            threatScore += 30;
        }
        
        this.board = tempBoard;
        return threatScore;
    }

    evaluateEyeFormation(move) {
        let eyeScore = 0;
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        // Check if move helps form eyes (safe territory) - sophisticated analysis
        const moveRow = move.row;
        const moveCol = move.col;
        
        // 1. Direct corner eye formation (classic pattern)
        let whiteCorners = 0;
        const corners = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dr, dc] of corners) {
            const r = moveRow + dr;
            const c = moveCol + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'white') {
                whiteCorners++;
            }
        }
        
        // 2. Diagonal eye potential (two white stones on opposite diagonal)
        if (whiteCorners >= 2) {
            eyeScore += 8;  // Increased from 5
        } else if (whiteCorners === 1) {
            eyeScore += 2;
        }
        
        // 3. Edge eye formation (move creates eye-like space on board edge)
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        let adjacentWhite = 0;
        let adjacentEmpty = 0;
        
        for (const [dr, dc] of directions) {
            const r = moveRow + dr;
            const c = moveCol + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
                if (this.board[r][c] === 'white') adjacentWhite++;
                if (this.board[r][c] === null) adjacentEmpty++;
            }
        }
        
        // Creating breathing room for territory
        if (adjacentWhite >= 2 && adjacentEmpty >= 1) {
            eyeScore += 4;
        }
        
        // 4. Evaluate if move secures an actual eye (single empty point surrounded by white)
        for (const [dr, dc] of directions) {
            const r = moveRow + dr;
            const c = moveCol + dc;
            
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === null) {
                
                // Check if this empty point is surrounded by white
                let surroundingWhite = 0;
                const orthoDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                
                for (const [odr, odc] of orthoDirs) {
                    const or = r + odr;
                    const oc = c + odc;
                    if (or >= 0 && or < this.boardSize && oc >= 0 && oc < this.boardSize &&
                        this.board[or][oc] === 'white') {
                        surroundingWhite++;
                    }
                }
                
                if (surroundingWhite === 3) {
                    // One move away from being a sealed eye
                    eyeScore += 6;
                } else if (surroundingWhite === 2) {
                    eyeScore += 3;
                }
            }
        }
        
        // 5. Check if move connects and creates stronger eye patterns
        const group = this.getConnectedGroup(moveRow, moveCol);
        if (group.length >= 2) {
            // Connected groups have better eye-forming potential
            eyeScore += 1;
        }
        
        this.board = tempBoard;
        return eyeScore;
    }
    
    evaluateBuildLiveTerritory(move) {
        // Teach AI to actively build sealed live territory
        let buildScore = 0;
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        // Find empty regions that would be made safer by this move
        const visited = new Set();
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === null) {
                
                const key = `${r},${c}`;
                if (!visited.has(key)) {
                    const region = this.floodFillTerritory(r, c, visited);
                    
                    // Evaluate before the move (restore original board state temporarily)
                    this.board = tempBoard;
                    const beforeRegion = this.evaluateRegionSecurity(region);
                    
                    // Evaluate after the move
                    this.board[move.row][move.col] = 'white';
                    const afterRegion = this.evaluateRegionSecurity(region);
                    
                    // Score improvement in territory security
                    const improvements = {
                        'contested': { 'semi-live': 15, 'live': 30, 'dead': 0 },
                        'semi-live': { 'live': 25 },
                        'dead': {},
                        'live': {}
                    };
                    
                    if (improvements[beforeRegion] && improvements[beforeRegion][afterRegion]) {
                        buildScore += improvements[beforeRegion][afterRegion];
                    }
                    
                    // Bonus if creating multiple small sealed regions (eyes)
                    if (region.empty.length <= 3 && afterRegion === 'live') {
                        buildScore += region.empty.length * 5;  // Each point of live territory is valuable
                    }
                    
                    // Bonus for preventing opponent's territory from becoming live
                    if (beforeRegion === 'contested' && region.adjacentBlack.size > region.adjacentWhite.size) {
                        const blackAdvantage = region.adjacentBlack.size - region.adjacentWhite.size;
                        buildScore += blackAdvantage * 3;  // Stop opponent from building
                    }
                }
            }
        }
        
        // Early bonuses for building patterns that lead to live territory
        let diagonalPairs = 0;
        const cornerDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dr, dc] of cornerDirs) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'white') {
                diagonalPairs++;
            }
        }
        
        // Strong bonus for creating diagonal stone patterns (foundation for eyes)
        if (diagonalPairs >= 1) {
            buildScore += diagonalPairs * 4;
        }
        
        this.board = tempBoard;
        return buildScore;
    }

    evaluateTerritoryInfluence(move) {
        let score = 0;
        
        // Extended area control with strategic evaluation
        let whiteInfluence = 0;
        let blackInfluence = 0;
        let emptySpaces = 0;
        
        for (let dr = -4; dr <= 4; dr++) {
            for (let dc = -4; dc <= 4; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = move.row + dr;
                const c = move.col + dc;
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize) {
                    if (this.board[r][c] === 'white') {
                        whiteInfluence++;
                        // Bonus for extending existing territory
                        const distance = Math.abs(dr) + Math.abs(dc);
                        score += (5 - distance) * 2;
                    } else if (this.board[r][c] === 'black') {
                        blackInfluence++;
                    } else {
                        emptySpaces++;
                        // Potential territory bonus with distance decay
                        const distance = Math.abs(dr) + Math.abs(dc);
                        if (distance <= 3) score += (4 - distance) * 0.8;
                    }
                }
            }
        }
        
        // Bonus for controlling more space than opponent
        if (whiteInfluence > blackInfluence) {
            score += (whiteInfluence - blackInfluence) * 0.5;
        }
        
        // Add live territory bonus - moves that secure safe territory
        const liveScore = this.evaluateLiveTerritory(move);
        score += liveScore;
        
        // Subtract penalty for entering dead/contested territory
        const deadPenalty = this.evaluateDeadTerritory(move);
        score -= deadPenalty;
        
        return score;
    }
    
    evaluateLiveTerritory(move) {
        // Identify and score secure white territory
        let liveScore = 0;
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        // Find all empty regions adjacent to this stone
        const visited = new Set();
        const emptyRegions = [];
        
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        // Start flood fill from adjacent empty spaces
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === null) {
                const key = `${r},${c}`;
                if (!visited.has(key)) {
                    const region = this.floodFillTerritory(r, c, visited);
                    emptyRegions.push(region);
                }
            }
        }
        
        // Score each region based on how secure it is
        for (const region of emptyRegions) {
            const regionSecurity = this.evaluateRegionSecurity(region);
            
            if (regionSecurity === 'live') {
                // Live territory - completely surrounded by white stones
                liveScore += region.empty.length * 3;
            } else if (regionSecurity === 'semi-live') {
                // Semi-live territory - mostly white but some black influence
                liveScore += region.empty.length * 1.5;
            } else if (regionSecurity === 'contested') {
                // Contested - both players have influence
                liveScore += region.empty.length * 0.5;
            }
            // Dead territory (only black influence) = 0 score
        }
        
        this.board = tempBoard;
        return liveScore;
    }
    
    floodFillTerritory(startRow, startCol, visited) {
        // Find all connected empty spaces and surrounding stones
        const region = {
            empty: [],
            adjacentWhite: new Set(),
            adjacentBlack: new Set()
        };
        
        const queue = [{ row: startRow, col: startCol }];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        while (queue.length > 0) {
            const { row: r, col: c } = queue.shift();
            const key = `${r},${c}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (this.board[r][c] === null) {
                region.empty.push({ row: r, col: c });
                
                // Check all neighbors
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    
                    if (nr >= 0 && nr < this.boardSize && nc >= 0 && nc < this.boardSize) {
                        const neighborKey = `${nr},${nc}`;
                        
                        if (this.board[nr][nc] === null && !visited.has(neighborKey)) {
                            queue.push({ row: nr, col: nc });
                        } else if (this.board[nr][nc] === 'white') {
                            region.adjacentWhite.add(neighborKey);
                        } else if (this.board[nr][nc] === 'black') {
                            region.adjacentBlack.add(neighborKey);
                        }
                    }
                }
            }
        }
        
        return region;
    }
    
    evaluateRegionSecurity(region) {
        // Determine if territory is live, semi-live, contested, or dead
        const whiteCount = region.adjacentWhite.size;
        const blackCount = region.adjacentBlack.size;
        
        // Live territory: surrounded only by white stones
        if (blackCount === 0 && whiteCount > 0) {
            return 'live';
        }
        
        // Dead territory: surrounded only by black stones
        if (whiteCount === 0 && blackCount > 0) {
            return 'dead';
        }
        
        // Semi-live territory: mostly white with minimal black influence
        if (whiteCount > blackCount * 2) {
            return 'semi-live';
        }
        
        // Contested territory: mixed influence
        return 'contested';
    }
    
    evaluateDeadTerritory(move) {
        // Penalize plays that invade black territory
        let deadPenalty = 0;
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        const visited = new Set();
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        // Check empty regions around this move
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === null) {
                const key = `${r},${c}`;
                if (!visited.has(key)) {
                    const region = this.floodFillTerritory(r, c, visited);
                    
                    // Check if this is primarily dead territory
                    if (region.adjacentBlack.size > region.adjacentWhite.size && 
                        region.adjacentBlack.size > 0) {
                        // Playing in dead territory is costly
                        deadPenalty += region.empty.length * 0.8;
                    }
                }
            }
        }
        
        this.board = tempBoard;
        return deadPenalty;
    }


    evaluateConnections(move, directions) {
        let score = 0;
        
        // Direct adjacent connections
        let adjacentWhite = 0;
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'white') {
                adjacentWhite++;
            }
        }
        score += adjacentWhite * 3;
        
        // Two-space jump pattern (extension move)
        for (const [dr, dc] of directions) {
            const skip = [dr * 2, dc * 2];
            const r = move.row + skip[0];
            const c = move.col + skip[1];
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === 'white') {
                const between = [move.row + dr, move.col + dc];
                if (this.board[between[0]][between[1]] === null) {
                    score += 4; // Good extension opportunity
                }
            }
        }
        
        return score;
    }

    evaluateBlockingMoves(move) {
        let blockScore = 0;
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        // Find black groups and see if move blocks their expansion
        for (let row = Math.max(0, move.row - 3); row <= Math.min(this.boardSize - 1, move.row + 3); row++) {
            for (let col = Math.max(0, move.col - 3); col <= Math.min(this.boardSize - 1, move.col + 3); col++) {
                if (this.board[row][col] === 'black') {
                    const group = this.getConnectedGroup(row, col);
                    const liberties = this.getGroupLiberties(group);
                    
                    // Moves that reduce black's options are valuable
                    blockScore += Math.max(0, 3 - liberties.length) * 2;
                }
            }
        }
        
        this.board = tempBoard;
        return blockScore;
    }

    evaluateLadderSafety(move) {
        // Check if the move would trap us in a ladder
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        const group = this.getConnectedGroup(move.row, move.col);
        const liberties = this.getGroupLiberties(group);
        
        let ladderPenalty = 0;
        
        // If we're in a ladder pattern, penalize it
        if (liberties.length === 1) {
            const liberty = liberties[0];
            const nextMove = { row: liberty.row, col: liberty.col };
            
            // Simple ladder detection: if our only liberty is in a linear pattern
            const isLinearPosition = (move.row === liberty.row) || (move.col === liberty.col);
            if (isLinearPosition) {
                ladderPenalty = -10; // Small penalty for potential ladder
            }
        }
        
        this.board = tempBoard;
        return ladderPenalty;
    }

    evaluateLookahead(move, depth) {
        // Enhanced lookahead to evaluate mid-term consequences
        if (depth === 0) return 0;
        
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = 'white';
        
        let score = 0;
        const validNextMoves = this.getValidMoves();
        
        if (validNextMoves.length === 0) {
            // Excellent position forces opponent to pass
            score += 10;
        } else {
            // Analyze best black responses and how well we handle them
            const topBlackMoves = validNextMoves
                .map(m => ({
                    move: m,
                    threatLevel: this.evaluateMoveImportance(m, 'black')
                }))
                .sort((a, b) => b.threatLevel - a.threatLevel)
                .slice(0, 3);
            
            for (const { move: blackMove } of topBlackMoves) {
                const tempBoard2 = this.board.map(row => [...row]);
                this.board[blackMove.row][blackMove.col] = 'black';
                
                // Check our counter-response options
                const ourResponses = this.getValidMoves();
                
                if (ourResponses.length > 0) {
                    // Can we maintain or improve position?
                    const bestCounterScore = Math.max(
                        ...ourResponses.map(r => 
                            this.evaluateCaptureOpportunity(r) + 
                            this.evaluateTerritoryInfluence(r) * 0.5
                        )
                    );
                    
                    if (bestCounterScore > 0) {
                        score += 3;
                    }
                } else {
                    // We'd need to pass - not ideal
                    score -= 5;
                }
                
                this.board = tempBoard2;
            }
        }
        
        this.board = tempBoard;
        return score;
    }
    
    evaluateMoveImportance(move, player) {
        // Quick evaluation of how important a move is
        let importance = 0;
        
        // Critical captures
        const tempBoard = this.board.map(row => [...row]);
        this.board[move.row][move.col] = player;
        
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        const opponent = player === 'white' ? 'black' : 'white';
        
        for (const [dr, dc] of directions) {
            const r = move.row + dr;
            const c = move.col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === opponent) {
                const group = this.getConnectedGroup(r, c);
                const liberties = this.getGroupLiberties(group);
                
                if (liberties.length === 0) {
                    importance += group.length * 5;
                } else if (liberties.length === 1) {
                    importance += group.length * 2;
                }
            }
        }
        
        this.board = tempBoard;
        return importance;
    }

    getPercentageControlledByPlayer(player) {
        let controlledStones = 0;
        let totalStones = 0;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== null) {
                    totalStones++;
                    if (this.board[row][col] === player) {
                        controlledStones++;
                    }
                }
            }
        }
        
        return totalStones === 0 ? 0 : controlledStones;
    }

    countNeighbors(row, col) {
        let count = 0;
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of directions) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] !== null) {
                count++;
            }
        }
        return count;
    }

    getValidMoves() {
        const moves = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null && this.isLegalMove(row, col, this.currentPlayer)) {
                    moves.push({ row, col });
                }
            }
        }
        return moves.sort(() => Math.random() - 0.5).slice(0, 50);
    }

    isLegalMove(row, col, player) {
        const opponent = player === 'black' ? 'white' : 'black';
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        const tempBoard = this.board.map(r => [...r]);
        this.board[row][col] = player;
        
        let isLegal = false;
        
        // Check if this move captures opponent stones
        for (const [dr, dc] of directions) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize &&
                this.board[r][c] === opponent) {
                const group = this.getConnectedGroup(r, c);
                const groupLiberties = this.getGroupLiberties(group);
                if (groupLiberties.length === 0) {
                    isLegal = true;
                    // Simulate the capture
                    group.forEach(pos => {
                        this.board[pos.row][pos.col] = null;
                    });
                    break;
                }
            }
        }
        
        // If no captures, check if the placed stone has liberties
        if (!isLegal) {
            const group = this.getConnectedGroup(row, col);
            const groupLiberties = this.getGroupLiberties(group);
            if (groupLiberties.length > 0) {
                isLegal = true;
            }
        }
        
        // Check Ko rule: move cannot recreate the previous board state
        if (isLegal && this.previousBoard !== null) {
            if (this.boardsAreEqual(this.board, this.previousBoard)) {
                isLegal = false;
            }
        }
        
        this.board = tempBoard;
        
        return isLegal;
    }

    boardsAreEqual(board1, board2) {
        for (let i = 0; i < board1.length; i++) {
            for (let j = 0; j < board1[i].length; j++) {
                if (board1[i][j] !== board2[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    calculateScore() {
        const visited = new Set();
        let blackTerritory = 0;
        let whiteTerritory = 0;
        
        // Count territory (empty regions surrounded by one color)
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null && !visited.has(`${row},${col}`)) {
                    const { territory, owner } = this.getTerritoryOwner(row, col, visited);
                    
                    if (owner === 'black') {
                        blackTerritory += territory;
                    } else if (owner === 'white') {
                        whiteTerritory += territory;
                    }
                }
            }
        }
        
        // Add captured stones (opponent stones captured by each player)
        // capturedBlack = black stones captured BY white
        // capturedWhite = white stones captured BY black
        const blackScore = blackTerritory + this.capturedWhite;
        const whiteScore = whiteTerritory + this.capturedBlack + 7.5; // Komi (white handicap)
        
        return {
            blackScore: blackScore,
            whiteScore: whiteScore,
            blackTerritory: blackTerritory,
            whiteTerritory: whiteTerritory,
            blackCaptured: this.capturedWhite,
            whiteCaptured: this.capturedBlack
        };
    }

    getTerritoryOwner(row, col, visited) {
        const territory = [];
        const queue = [{ row, col }];
        const owners = new Set();
        
        while (queue.length > 0) {
            const { row: r, col: c } = queue.shift();
            const key = `${r},${c}`;
            
            if (visited.has(key) || r < 0 || r >= this.boardSize || c < 0 || c >= this.boardSize) {
                continue;
            }
            
            if (this.board[r][c] !== null) {
                owners.add(this.board[r][c]);
                continue;
            }
            
            visited.add(key);
            territory.push({ row: r, col: c });
            
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dr, dc] of directions) {
                queue.push({ row: r + dr, col: c + dc });
            }
        }
        
        // Territory belongs to a player if surrounded by only that player's stones
        let owner = null;
        if (owners.size === 1) {
            owner = Array.from(owners)[0];
        }
        
        return { territory: territory.length, owner };
    }

    draw() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Calculate adaptive cellSize based on board size and canvas dimensions
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
        
        this.ctx.fillStyle = '#d4af37'; //'#daa76a';
        this.ctx.fillRect(0, 0, width, height);
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX, this.offsetY + i * this.cellSize);
            this.ctx.lineTo(this.offsetX + boardSize, this.offsetY + i * this.cellSize);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX + i * this.cellSize, this.offsetY);
            this.ctx.lineTo(this.offsetX + i * this.cellSize, this.offsetY + boardSize);
            this.ctx.stroke();
        }
        
        this.drawStarPoints();
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== null) {
                    this.drawStone(row, col, this.board[row][col]);
                }
            }
        }
        
        if (this.lastMove) {
            this.drawLastMoveMarker(this.lastMove.row, this.lastMove.col);
        }
    }

    drawStarPoints() {
        const starPoints = this.getStarPoints();
        this.ctx.fillStyle = '#333';
        
        for (const [row, col] of starPoints) {
            const x = this.offsetX + col * this.cellSize;
            const y = this.offsetY + row * this.cellSize;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    getStarPoints() {
        const points = [];
        const positions = this.boardSize === 19 ? [3, 9, 15] : 
                         this.boardSize === 13 ? [3, 9] : 
                         [2, 6];
        
        for (const row of positions) {
            for (const col of positions) {
                points.push([row, col]);
            }
        }
        return points;
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
        
        if (player === 'black') {
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
        this.ctx.fillStyle = player === 'black' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.25, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw stone border
        this.ctx.strokeStyle = player === 'black' ? '#1a1a1a' : '#999999';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawPlacementIndicator(row, col, player) {
        const x = this.offsetX + col * this.cellSize;
        const y = this.offsetY + row * this.cellSize;
        const radius = this.cellSize * 0.35;
        
        this.ctx.strokeStyle = player === 'black' ? '#333' : '#999';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawLastMoveMarker(row, col) {
        const x = this.offsetX + col * this.cellSize;
        const y = this.offsetY + row * this.cellSize;
        const markerSize = this.cellSize * 0.15;
        
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - markerSize, y - markerSize, markerSize * 2, markerSize * 2);
    }

    updateUI() {
        document.getElementById('blackCaptured').textContent = this.capturedWhite;
        document.getElementById('whiteCaptured').textContent = this.capturedBlack;
        document.getElementById('currentPlayer').textContent = 
            `Current: ${this.currentPlayer === 'black' ? 'Black' : 'White'}`;
        
        const historyDiv = document.getElementById('moveHistory');
        if (historyDiv) {
            const moveCount = this.moveHistory.length;
            if (moveCount > 0) {
                const lastMove = this.moveHistory[moveCount - 1];
                const moveNum = Math.ceil(moveCount / 2);
                const moveText = `${moveNum}. ${lastMove.player[0].toUpperCase()}(${lastMove.col},${lastMove.row})`;
                historyDiv.innerHTML = moveText + '<br>' + historyDiv.innerHTML;
                historyDiv.innerHTML = historyDiv.innerHTML.substring(0, 500);
            }
        }
    }
}

let game = null;

export function selectMode(mode) {
    const humanVsAIBtn = document.getElementById('humanVsAIBtn');
    const humanVsHumanBtn = document.getElementById('humanVsHumanBtn');
    
    humanVsAIBtn.classList.remove('active');
    humanVsHumanBtn.classList.remove('active');
    
    if (mode === 'ai') {
        humanVsAIBtn.classList.add('active');
        game.gameMode = 'ai';
    } else {
        humanVsHumanBtn.classList.add('active');
        game.gameMode = 'twoPlayer';
    }
    
    game.initializeBoard();
    game.draw();
    game.updateUI();
}

export function changeDifficulty() {
    const difficulty = document.getElementById('difficulty').value;
    game.aiDifficulty = difficulty;
    game.initializeBoard();
    game.draw();
    game.updateUI();
}

export function changeBoardSize() {
    const size = parseInt(document.getElementById('boardSize').value);
    game.boardSize = size;
    game.initializeBoard();
    game.draw();
}

export function passMove() {
    const passingPlayer = game.currentPlayer === 'black' ? 'Black' : 'White';
    game.passCount++;
    
    if (game.passCount >= 2) {
        game.gameOver = true;
        document.getElementById('status').textContent = 'Game Over - Both players passed';
        game.aiThinking = false;
        endGame();
    } else {
        game.currentPlayer = game.currentPlayer === 'black' ? 'white' : 'black';
        document.getElementById('status').textContent = 
            `${passingPlayer} passed - ${game.gameMode === 'ai' ? 'Your turn' : 'Next player turn'}`;
        
        if (game.gameMode === 'ai' && game.currentPlayer === 'white') {
            game.aiThinking = true;
            setTimeout(() => game.makeAIMove(), 500);
        }
    }
    
    game.updateUI();
}

export function undoMove() {
    if (game.moveHistory.length > 0) {
        const lastMove = game.moveHistory.pop();
        game.board[lastMove.row][lastMove.col] = null;
        game.previousBoard = null;  // Clear Ko rule state after undo
        game.currentPlayer = lastMove.player;
        game.passCount = 0;
        game.aiThinking = false;
        document.getElementById('status').textContent = 'Move undone';
        game.draw();
        game.updateUI();
    }
}

export function resetGame() {
    // Just reset the board state, don't create a new instance
    // This avoids duplicate event listeners
    game.initializeBoard();
    
    // Re-enable buttons
    document.getElementById('passBtn').disabled = false;
    document.getElementById('undoBtn').disabled = true;
    
    // Clear move history display if it exists
    const moveHistoryDiv = document.getElementById('moveHistory');
    if (moveHistoryDiv) {
        moveHistoryDiv.innerHTML = '';
    }
    
    // Clear status
    document.getElementById('status').textContent = 'Black to play';
    
    game.draw();
    game.updateUI();
}

function endGame() {
    // Calculate final scores
    const scores = game.calculateScore();
    
    let message = '';
    if (scores.blackScore > scores.whiteScore) {
        message = `BLACK WINS! Score: Black ${scores.blackScore.toFixed(1)} - White ${scores.whiteScore.toFixed(1)}`;
    } else if (scores.whiteScore > scores.blackScore) {
        message = `WHITE WINS! Score: Black ${scores.blackScore.toFixed(1)} - White ${scores.whiteScore.toFixed(1)}`;
    } else {
        message = `DRAW! Score: Black ${scores.blackScore.toFixed(1)} - White ${scores.whiteScore.toFixed(1)}`;
    }
    
    document.getElementById('status').textContent = message;
    document.getElementById('passBtn').disabled = true;
    document.getElementById('undoBtn').disabled = true;
}

export function initializeGoGame() {
    //window.addEventListener('load', () => {
    game = new GoGame(19);
    game.gameMode = 'ai';
    game.draw();
    game.updateUI();
    //});
}
