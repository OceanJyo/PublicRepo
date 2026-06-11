import { Component } from '@angular/core';
import { initializeGoGame, selectMode, changeBoardSize, changeDifficulty, passMove, resetGame, undoMove } from '../services/go';

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class GoBoard {

    ngOnInit(): void {
      initializeGoGame();
    }

    selectMode(mode: string) {
      selectMode(mode);
    }
    changeBoardSize() {
      changeBoardSize();
    }
    changeDifficulty() {
      changeDifficulty();
    }
    passMove() {
      passMove();
    }
    undoMove() {
      undoMove();
    }
    resetGame() {
      resetGame();
    }
}
