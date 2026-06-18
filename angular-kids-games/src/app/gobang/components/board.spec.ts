import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GobangBoard } from './board';

describe('GobangBoard', () => {
  let component: GobangBoard;
  let fixture: ComponentFixture<GobangBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GobangBoard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GobangBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it.skip('should create', () => {
    expect(component).toBeTruthy();
  });
});
