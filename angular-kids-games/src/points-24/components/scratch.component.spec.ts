import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ScratchComponent } from './scratch.component';
import { Points24Service } from '../services/points-24.service';
import { Points24SimpleExpression } from '../../app/models/kidsgames.model';

describe('ScratchComponent', () => {
  let component: ScratchComponent;
  let fixture: ComponentFixture<ScratchComponent>;
  let service: Points24Service;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ScratchComponent],
    providers: [Points24Service, HttpClient, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
    
    service = TestBed.inject(Points24Service);
    fixture = TestBed.createComponent(ScratchComponent);
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
