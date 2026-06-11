import { Component, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { Status } from './status';
import { Board } from './board';
import { Points24InitialState } from '../../models/kidsgames.model';

@Component({
  selector: 'game-points-24',
  standalone: true,
  imports: [Status, Board],
  templateUrl: './points-24.html',
  styleUrl: './points-24.css'
})
export class Points24 implements OnInit {

  initialState: WritableSignal<Points24InitialState> = signal({
    easyMode: true
  });

  ngOnInit(): void {
    
  }

  modeChanged(easyMode: boolean) {
    this.initialState.set({
      easyMode: easyMode
    });
  }
    
}
