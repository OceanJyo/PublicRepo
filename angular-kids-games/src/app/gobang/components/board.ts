import { Component } from '@angular/core';
import { initializeGobang, selectGameMode, changeBoardSize } from '../services/gobang';

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class GobangBoard {

  ngOnInit(): void {
    initializeGobang();
  }

  selectGameMode(mode: string) {
    selectGameMode(mode);
  }
  changeBoardSize() {
    changeBoardSize();
  }

}
