import { Component, signal, WritableSignal } from '@angular/core';
import { MatchPairBoardSize, MatchPairStatus } from '../../models/kidsgames.model';
import { BOARD_SIZES, Status } from './status';
import { Board } from './board';

@Component({
  selector: 'game-match-pair',
  standalone: true,
  imports: [Board, Status],
  templateUrl: './match-pair.html',
  styleUrl: './match-pair.css'
})
export class MatchPair {

  _selectedBoardSize: WritableSignal<MatchPairBoardSize> = signal(BOARD_SIZES[0]);
  _gameStatus: WritableSignal<MatchPairStatus> = signal({
    foundPairs: 0,
    numOfTrial: 0
  });

  // boardSizeSelected(boardSize: MatchPairBoardSize) {
  //   this.selectedBoardSize = {...boardSize};
  // }

  // statusUpdated(status: MatchPairStatus) {
  //   this.gameStatus.foundPairs = status.foundPairs;
  //   this.gameStatus.numOfTrial = status.numOfTrial;
  // }

}
