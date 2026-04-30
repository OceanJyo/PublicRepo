import { Component } from '@angular/core';
import { MatchPairBoardSize, MatchPairStatus } from '../../app/models/kidsgames.model';
import { StatusComponent } from './status.component';
import { BoardComponent } from './board.component';

@Component({
  selector: 'game-match-pair',
  standalone: true,
  imports: [BoardComponent, StatusComponent],
  templateUrl: './match-pair.component.html',
  styleUrl: './match-pair.component.css'
})
export class MatchPairComponent {

  selectedBoardSize!: MatchPairBoardSize;
  gameStatus: MatchPairStatus = {
    foundPairs: 0,
    numOfTrial: 0
  };

  boardSizeSelected(boardSize: MatchPairBoardSize) {
    this.selectedBoardSize = {...boardSize};
  }

  statusUpdated(status: MatchPairStatus) {
    this.gameStatus.foundPairs = status.foundPairs;
    this.gameStatus.numOfTrial = status.numOfTrial;
  }

}
