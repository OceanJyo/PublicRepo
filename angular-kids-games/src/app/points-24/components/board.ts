import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
import { NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { Card } from './card';
import { Points24Service } from '../services/points-24.service';
import { Points24Card, Points24DeckInfo, Points24InitialState, Points24SimpleExpression } from '../../models/kidsgames.model';
import { Scratch } from './scratch';

@Component({
  selector: 'points24-board',
  standalone: true,
  imports: [Card, Scratch, NgClass],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class Board implements AfterViewInit, OnDestroy {

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
  _searchCompleted: WritableSignal<boolean> = signal(true);
  showSolutions: boolean = false;
  private cardService: Points24Service = inject(Points24Service);
  private deckInfo: Points24DeckInfo = {
    success: false,
    deckId: '',
    remaining: 0,
    shuffled: false
  };
  _loading: WritableSignal<boolean> = signal(false);
  _cards: WritableSignal<Points24Card[]> = signal([]);
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
    this._searchCompleted.set(true);
    this._cards.set([]);
    this.selectedCards = [];
    this.init();
    this._loading.set(true);
    this.cardService.get4Cards(this.deckInfo, this.initialState.easyMode).then(
      (cards: Points24Card[]) => {
        this._cards.set(cards);
        cards.forEach(c => this.selectedCards.push(false));
        const cs = this._cards().map(c => c.value);
        this._searchCompleted.set(false);
        this.handleTimeout = setTimeout(() => {
          this.subSolution = this.cardService.findSolutions(cs).subscribe({
            next: (f) => {
              this.solutions.push(f); 
            },
            complete: () => {
                this._searchCompleted.set(true);
            }
          });
        }, 3000);
        this._loading.set(false);
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
