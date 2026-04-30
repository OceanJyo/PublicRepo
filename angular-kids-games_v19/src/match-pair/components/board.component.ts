import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { CardComponent } from './card.component';
import { MatchPairCardService } from '../services/match-pair-card.service';
import { MatchPairBoardSize, MatchPairCardInfo, MatchPairCardSize, MatchPairStatus } from '../../app/models/kidsgames.model';

@Component({
  selector: 'match-pair-board',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit, AfterViewInit {

  cardService: MatchPairCardService = inject(MatchPairCardService);

  cards: MatchPairCardInfo[] = [];
  selectedCards: boolean[] = [];
  prevSelectedCardId: number = -1;
  cardSize: MatchPairCardSize = {
    height: 160,
    width: 160
  }
  gameStatus: MatchPairStatus = {
    foundPairs: 0,
    numOfTrial: 0
  }
  
  @Input() 
  get boardSize() {
    return this._boardSize;
  }
  set boardSize(value: MatchPairBoardSize) {
    this._boardSize = value;
    if (this.cards.length != 0) {
      this.ngOnInit();
      this.ngAfterViewInit();
    }
  }
  _boardSize!: MatchPairBoardSize;
  @Output() statusUpdated = new EventEmitter<MatchPairStatus>();
  
  @ViewChild('divMatchPairBoard') divMatchPairBoard!: ElementRef;
  @ViewChildren('matchPairCards') matchPairCards!: QueryList<ElementRef>;

  constructor(private render: Renderer2) {}

  ngOnInit(): void {
    this.cards = [];
    this.selectedCards = [];
    this.gameStatus.foundPairs = 0;
    this.gameStatus.numOfTrial = 0;
    const numOfCards: number = this.boardSize.x * this.boardSize.y / 2;
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
      this.cards = cds;
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

  onClickStart() {
    this.cards = [];
    const cds: MatchPairCardInfo[] = [];
    for (let i = 1; i <= 649; i++) {
      this.cardService.getMatchPairCard(i, ((card: MatchPairCardInfo) => {
        cds.push(card);
        if (cds.length == 649) {
          cds.sort((a, b) => a.cardId - b.cardId);
          this.cards = cds;
        }
      }));
    }
  }
  
  onCardSelected(cardId: number) {
    this.selectedCards[cardId] = true;
    const pairs = this.selectedCards.filter(s => s === true);
    if (pairs.length == this.cards.length) {
      const foundPairs = pairs.length / 2;
      this.gameStatus.foundPairs = foundPairs;
      this.gameStatus.numOfTrial++;
      this.statusUpdated.emit(this.gameStatus);
      return;
    }
    if (pairs.length % 2 == 1) {
      this.prevSelectedCardId = cardId;
    }
    else {
      this.gameStatus.numOfTrial++;
      // if not matched, flip back
      if (this.cards[this.prevSelectedCardId!].typeId != this.cards[cardId].typeId) {
        this.selectedCards[this.prevSelectedCardId!] = false;
        this.selectedCards[cardId] = false;
        const prevComp = this.matchPairCards.get(this.prevSelectedCardId) as unknown as CardComponent;
        const currComp = this.matchPairCards.get(cardId) as unknown as CardComponent;
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
        this.gameStatus.foundPairs = foundPairs;
      }
      this.statusUpdated.emit(this.gameStatus);
      this.prevSelectedCardId = -1;
    }
  }

  blockAllChildren(childComps: QueryList<ElementRef>, isBlock: boolean = true) {
    childComps.forEach(c => {
      const comp = c as unknown as CardComponent;
      comp.thinking = isBlock;
    })
  }

}
