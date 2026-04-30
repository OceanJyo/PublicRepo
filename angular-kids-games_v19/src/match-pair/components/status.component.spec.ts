import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusComponent } from './status.component';
import { MatchPairStatus } from '../../app/models/kidsgames.model';

describe('MatchPair.StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    const status: MatchPairStatus = {
      foundPairs: 1,
      numOfTrial: 1
    };
    component.gameStatus = status;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
