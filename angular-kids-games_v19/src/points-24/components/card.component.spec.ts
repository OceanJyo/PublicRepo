import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';
import { Points24Card } from '../../app/models/kidsgames.model';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardComponent);
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
