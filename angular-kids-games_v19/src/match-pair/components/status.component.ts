import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatchPairBoardSize, MatchPairStatus } from '../../app/models/kidsgames.model';

@Component({
  selector: 'match-pair-status',
  standalone: true,
  imports: [NgClass],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css'
})
export class StatusComponent implements OnInit {

  boardSizes: MatchPairBoardSize[] = [
    {x: 4, y: 4}, {x: 6, y: 4}, {x: 8, y: 4}
  ];
  selectedBoardSizeIdx: number = 0;
  selectedBoardSize: MatchPairBoardSize = this.boardSizes[0];
  totalPairs: number = 0;

  @Input() gameStatus!: MatchPairStatus;
  @Output() boardSizeSelected = new EventEmitter<MatchPairBoardSize>();
  
  ngOnInit(): void {
    this.onClickSize(0);  
  }

  onClickSize(idx: number) {
    this.selectedBoardSizeIdx = idx;
    this.selectedBoardSize = this.boardSizes[idx];
    this.totalPairs = this.selectedBoardSize.x * this.selectedBoardSize.y / 2;
    this.gameStatus.foundPairs = 0;
    this.gameStatus.numOfTrial = 0;
    this.boardSizeSelected.emit(this.selectedBoardSize);
  }

}
