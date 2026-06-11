import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Status } from './status';
import { MatchPairStatus } from '../../models/kidsgames.model';

describe('MatchPair.StatusComponent', () => {
  let component: Status;
  let fixture: ComponentFixture<Status>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Status]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Status);
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
