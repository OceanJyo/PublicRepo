import { Component, inject, Input, OnInit } from '@angular/core';
import { StatusComponent } from './status.component';
import { BoardComponent } from './board.component';
import { Points24InitialState } from '../../app/models/kidsgames.model';

@Component({
  selector: 'game-points-24',
  standalone: true,
  imports: [StatusComponent, BoardComponent],
  templateUrl: './points-24.component.html',
  styleUrl: './points-24.component.css'
})
export class Points24Component implements OnInit {

  initialState: Points24InitialState = {
    easyMode: true
  };

  ngOnInit(): void {
    
  }

  modeChanged(easyMode: boolean) {
    this.initialState = {
      easyMode: easyMode,
    }
  }
    
}
