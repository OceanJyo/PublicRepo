import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoBoard } from './board';

describe('GoBoard', () => {
  let component: GoBoard;
  let fixture: ComponentFixture<GoBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
