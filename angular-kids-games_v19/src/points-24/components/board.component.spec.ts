import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BoardComponent } from './board.component';
import { Points24Service } from '../services/points-24.service';
import { Points24SimpleExpression } from '../../app/models/kidsgames.model';

describe('Points24.BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let service: Points24Service;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, BoardComponent],
      providers: [Points24Service, HttpClient]
    })
    .compileComponents();
  
    service = TestBed.inject(Points24Service);
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    const exps: Points24SimpleExpression[] = [
      {
        operand1: 1,
        operator: "+",
        operand2: 2,
        isFailed: false,
        isDone: true,
        result: "3",
        resultDragged: true
      },
      {
        operand1: 6,
        operator: "+",
        operand2: 2,
        isFailed: false,
        isDone: true,
        result: "8",
        resultDragged: true
      },
      {
        operand1: 3,
        operator: "*",
        operand2: 8,
        isFailed: false,
        isDone: true,
        result: "24",
        resultDragged: false
      },
    ];
    component.expressions = exps;    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
