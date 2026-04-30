import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BoardComponent } from './board.component';
import { MatchPairCardService } from '../services/match-pair-card.service';
import { MatchPairBoardSize } from '../../models/kidsgames.model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let service: MatchPairCardService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [BoardComponent],
    providers: [MatchPairCardService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
  
    service = TestBed.inject(MatchPairCardService);
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    const bs: MatchPairBoardSize = {x: 4, y: 4};
    component.boardSize = bs;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
