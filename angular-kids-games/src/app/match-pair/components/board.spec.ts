import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Board } from './board';
import { MatchPairCardService } from '../services/match-pair-card.service';
import { MatchPairBoardSize } from '../../models/kidsgames.model';

describe('BoardComponent', () => {
  let component: Board;
  let fixture: ComponentFixture<Board>;
  let service: MatchPairCardService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, Board],
      providers: [MatchPairCardService]
    })
    .compileComponents();
  
    service = TestBed.inject(MatchPairCardService);
    fixture = TestBed.createComponent(Board);
    component = fixture.componentInstance;
    const bs: MatchPairBoardSize = {x: 4, y: 4};
    component.boardSize = bs;
    fixture.detectChanges();
  });

  it.skip('should create', () => {
    expect(component).toBeTruthy();
  });
});
