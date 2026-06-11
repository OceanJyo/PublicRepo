import { Component, EventEmitter, Input, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatchPairBoardSize, MatchPairStatus } from '../../models/kidsgames.model';

@Component({
  selector: 'match-pair-status',
  standalone: true,
  imports: [NgClass],
  templateUrl: './status.html',
  styleUrl: './status.css'
})
export class Status implements OnInit {

  readonly BOARD_SIZES: typeof BOARD_SIZES = BOARD_SIZES;

  selectedBoardSizeIdx: number = 0;
  //selectedBoardSize: MatchPairBoardSize = this.boardSizes[0];
  totalPairs: number = 0;

  @Input() selectedBoardSize!: WritableSignal<MatchPairBoardSize>;
  @Input() gameStatus!: WritableSignal<MatchPairStatus>;
  //@Output() boardSizeSelected = new EventEmitter<MatchPairBoardSize>();
  
  ngOnInit(): void {
    this.onClickSize(0);  
  }

  onClickSize(idx: number) {
    this.selectedBoardSizeIdx = idx;
    this.selectedBoardSize.set(BOARD_SIZES[idx]);
    this.totalPairs = this.selectedBoardSize().x * this.selectedBoardSize().y / 2;
    //this.gameStatus.set({ foundPairs: 0, numOfTrial: 0 });
    //this.boardSizeSelected.emit(this.selectedBoardSize);
  }

}

export const BOARD_SIZES: MatchPairBoardSize[] = [{x: 4, y: 4}, {x: 6, y: 4}, {x: 8, y: 4}];
