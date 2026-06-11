import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, QueryList, Renderer2, signal, ViewChild, ViewChildren, WritableSignal } from '@angular/core';
import { Card } from './card';
import { MatchPairCardService } from '../services/match-pair-card.service';
import { MatchPairBoardSize, MatchPairCardInfo, MatchPairCardSize, MatchPairStatus } from '../../models/kidsgames.model';

@Component({
  selector: 'match-pair-board',
  standalone: true,
  imports: [Card],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class Board implements OnInit, AfterViewInit {

  cardService: MatchPairCardService = inject(MatchPairCardService);

  CARD_SIZE: typeof CARD_SIZE = CARD_SIZE;

  _cards: WritableSignal<MatchPairCardInfo[]> = signal([]);
  _loading: WritableSignal<boolean> = signal(false);

  selectedCards: boolean[] = [];
  prevSelectedCardId: number = -1;

  // gameStatus: MatchPairStatus = {
  //   foundPairs: 0,
  //   numOfTrial: 0
  // }
  
  @Input() 
  get boardSize() {
    return this._boardSize;
  }
  set boardSize(value: MatchPairBoardSize) {
    this._boardSize = value;
    if (this._cards().length != 0) {
      this.ngOnInit();
      this.ngAfterViewInit();
    }
  }
  _boardSize!: MatchPairBoardSize;
  @Input() gameStatus!: WritableSignal<MatchPairStatus>;

  //@Output() statusUpdated = new EventEmitter<MatchPairStatus>();
  
  @ViewChild('divMatchPairBoard') divMatchPairBoard!: ElementRef;
  @ViewChildren('matchPairCards') matchPairCards!: QueryList<ElementRef>;

  constructor(private render: Renderer2) {}

  ngOnInit(): void {
    this._cards = signal([]);
    this.selectedCards = [];
    this.gameStatus.set({ foundPairs: 0, numOfTrial: 0 });
    const numOfCards: number = this.boardSize.x * this.boardSize.y / 2;
    this._loading.set(true);
    this.cardService.getMatchPairCards(numOfCards, ((cards: MatchPairCardInfo[]) => {
      if (cards.length != numOfCards)
        console.log(cards);
      const cds: MatchPairCardInfo[] = [...cards];
      cards.forEach((c) => {
        cds.push({
          cardId: numOfCards + c.cardId,
          typeId: c.typeId,
          cardName: c.cardName,
          svgImg: c.svgImg
        });
      })
      cds.forEach(c => this.selectedCards.push(false));
      this.shuffle(cds);
      this._cards.set(cds);
      this._loading.set(false);
    }));
  }

  ngAfterViewInit(): void {
    const s = "auto ".repeat(this.boardSize.x).trim();
    this.render.setStyle(this.divMatchPairBoard.nativeElement, "grid-template-columns", s);
  }

  shuffle(cards: MatchPairCardInfo[]) {
    for (let i = cards.length - 1; i >= 0; i--) {
      let idx = Math.floor(Math.random() * i);
      let c = cards[idx];
      cards[idx] = cards[i];
      cards[i] = c;
      cards[idx].cardId = idx;
      cards[i].cardId = i;
    }
  }

  // onClickStart() {
  //   this.cards = [];
  //   const cds: MatchPairCardInfo[] = [];
  //   for (let i = 1; i <= 649; i++) {
  //     this.cardService.getMatchPairCard(i, ((card: MatchPairCardInfo) => {
  //       cds.push(card);
  //       if (cds.length == 649) {
  //         cds.sort((a, b) => a.cardId - b.cardId);
  //         this.cards = cds;
  //       }
  //     }));
  //   }
  // }
  
  onCardSelected(cardId: number) {
    this.selectedCards[cardId] = true;
    const pairs = this.selectedCards.filter(s => s === true);
    if (pairs.length == this._cards().length) {
      const foundPairs = pairs.length / 2;
      this.gameStatus.set({ foundPairs: foundPairs, numOfTrial: this.gameStatus().numOfTrial + 1 });
      //this.statusUpdated.emit(this.gameStatus());
      return;
    }
    if (pairs.length % 2 == 1) {
      this.prevSelectedCardId = cardId;
    }
    else {
      this.gameStatus.set({ ...this.gameStatus(), numOfTrial: this.gameStatus().numOfTrial + 1 });
      // if not matched, flip back
      if (this._cards()[this.prevSelectedCardId!].typeId != this._cards()[cardId].typeId) {
        this.selectedCards[this.prevSelectedCardId!] = false;
        this.selectedCards[cardId] = false;
        const prevComp = this.matchPairCards.get(this.prevSelectedCardId) as unknown as Card;
        const currComp = this.matchPairCards.get(cardId) as unknown as Card;
        const childComp = this.matchPairCards;
        const blkFunc = this.blockAllChildren;
        blkFunc(childComp);
        // give time for the second card flipping
        setTimeout(() => {
          prevComp?.flipBack();
          currComp.flipBack();
          blkFunc(childComp, false);
        }, 2000);
      }
      else {
        const foundPairs = pairs.length / 2;
        //this.gameStatus.foundPairs = foundPairs;
        this.gameStatus.set({ ...this.gameStatus(), foundPairs: foundPairs });
      }
      //this.statusUpdated.emit(this.gameStatus);
      this.prevSelectedCardId = -1;
    }
  }

  blockAllChildren(childComps: QueryList<ElementRef>, isBlock: boolean = true) {
    childComps.forEach(c => {
      const comp = c as unknown as Card;
      comp.thinking = isBlock;
    })
  }

}

export const CARD_SIZE: MatchPairCardSize = { height: 160, width: 160 }
