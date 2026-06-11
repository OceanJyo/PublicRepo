import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card } from './card';
import { Points24Card } from '../../models/kidsgames.model';

describe('CardComponent', () => {
  let component: Card;
  let fixture: ComponentFixture<Card>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Card]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Card);
    component = fixture.componentInstance;
    const card: Points24Card = {
      code: "5H",
      img: '/assets/images/back.png',
      value: 5
    };
    component.card = card;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
