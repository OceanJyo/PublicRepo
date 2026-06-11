import { Component, EventEmitter, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'points24-status',
  standalone: true,
  imports: [NgClass],
  templateUrl: './status.html',
  styleUrl: './status.css'
})
export class Status {

  easyMode: boolean = true;

  @Output() modeChanged = new EventEmitter<boolean>();

  onClickMode(easyMode: boolean = true) {
    this.easyMode = easyMode;
  }

  onClickDraw() {
    this.modeChanged.emit(this.easyMode);
  }
    
}
