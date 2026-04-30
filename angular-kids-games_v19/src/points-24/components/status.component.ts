import { Component, EventEmitter, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'points24-status',
  standalone: true,
  imports: [NgClass],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css'
})
export class StatusComponent {

  easyMode: boolean = true;

  @Output() modeChanged = new EventEmitter<boolean>();

  onClickMode(easyMode: boolean = true) {
    this.easyMode = easyMode;
  }

  onClickDraw() {
    this.modeChanged.emit(this.easyMode);
  }
    
}
