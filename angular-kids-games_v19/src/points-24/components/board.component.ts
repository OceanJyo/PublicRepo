import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { CardComponent } from './card.component';
import { Points24Service } from '../services/points-24.service';
import { Points24Card, Points24DeckInfo, Points24InitialState, Points24SimpleExpression } from '../../app/models/kidsgames.model';
import { ScratchComponent } from './scratch.component';

@Component({
  selector: 'points24-board',
  standalone: true,
  imports: [CardComponent, ScratchComponent, NgClass],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements AfterViewInit, OnDestroy {

  @Input()
  get initialState() {
    return this._initialState;
  }
  set initialState(value: Points24InitialState) {
    this._initialState = value;
    this.initialize();
  }
  _initialState: Points24InitialState = {
    easyMode: true
  };

  private subSolution?: Subscription;
  private handleTimeout?: any;
  solutions: string[] = [];
  searchCompleted: boolean = true;
  showSolutions: boolean = false;
  private cardService: Points24Service = inject(Points24Service);
  private deckInfo: Points24DeckInfo = {
    success: false,
    deckId: '',
    remaining: 0,
    shuffled: false
  };
  cards: Points24Card[] = [];
  selectedCards: boolean[] = [];
  expressions: Points24SimpleExpression[] = [];

  constructor(private render: Renderer2) {}

  ngOnDestroy(): void {
    this.subSolution?.unsubscribe();
    clearTimeout(this.handleTimeout);
  }
  
  initialize(): void {
    this.subSolution?.unsubscribe();
    clearTimeout(this.handleTimeout);
    this.solutions = [];
    this.showSolutions = false;
    this.searchCompleted = true;
    this.cards = [];
    this.selectedCards = [];
    this.init();
    this.cardService.get4Cards(this.deckInfo, this.initialState.easyMode).then(
      (cards: Points24Card[]) => {
        this.cards = cards;
        cards.forEach(c => this.selectedCards.push(false));
        const cs = this.cards.map(c => c.value);
        this.searchCompleted = false;
        this.handleTimeout = setTimeout(() => {
          this.subSolution = this.cardService.findSolutions(cs).subscribe({
            next: (f) => {
              this.solutions.push(f); 
            },
            complete: () => {
                this.searchCompleted = true;
            }
          });       
        }, 3000);
      }
    );
  }

  ngAfterViewInit(): void {
    console.log("After View Init");
  }

  private init() {
    this.expressions = [
      {operand1: -1, operator: "+", operand2: -1, isFailed: true, isDone: false, result: "", resultDragged: false},
      {operand1: -1, operator: "+", operand2: -1, isFailed: true, isDone: false, result: "", resultDragged: false},
      {operand1: -1, operator: "+", operand2: -1, isFailed: true, isDone: false, result: "", resultDragged: false},
    ];
  }

  onClickRecalculate() {
    this.init();
    this.selectedCards.forEach((_, idx, arr) => arr[idx] = false);
  }

  toggleShowSolutions() {
    if (this.solutions.length != 0)
      this.showSolutions = !this.showSolutions;
  }
}
