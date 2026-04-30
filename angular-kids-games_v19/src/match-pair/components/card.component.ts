import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { MatchPairCardInfo, MatchPairCardSize } from '../../app/models/kidsgames.model';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'match-pair-card',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit, AfterViewInit, OnChanges {

  parser: DOMParser = new DOMParser(); 
  @Input() card!: MatchPairCardInfo;
  @Input() cardSize!: MatchPairCardSize;
  @Input() selected: boolean = false;
  // property for parent component
  _thinking: boolean = false;
  get thinking(): boolean {
    return this._thinking;
  }
  set thinking(value: boolean) {
    this._thinking = value;
  }
  
  @Output() cardSelected = new EventEmitter<number>();

  @ViewChild("svgContainer") divSvg!: ElementRef;
  @ViewChild("cardContainer") divCard!: ElementRef;

  styleCardSize = {
    height: '',
    width: ''
  };
  
  constructor(private render: Renderer2) {}

  ngOnInit(): void {
    this.styleCardSize.height = this.cardSize.height + "px";
    this.styleCardSize.width = this.cardSize.width + "px";
  }

  ngAfterViewInit(): void {
    const doc = this.parser.parseFromString(this.card.svgImg, "text/html");
    const svg = doc.querySelector("svg");
    svg?.setAttribute("height", this.cardSize.height - 40 + "px");
    svg?.setAttribute("width", this.cardSize.width - 40 + "px");
    this.render.appendChild(this.divSvg.nativeElement, svg);
    //this.div.nativeElement.innerHTML = this.svgImg;
    this.render.setAttribute(this.divSvg.nativeElement, "id", "MatchPairCard_" + this.card.cardId);
    this.render.setAttribute(this.divSvg.nativeElement, "title", this.card.cardName);
  }

  // onChanges may monitor @Input changes, but not a solution 
  // for the case to change UI redering
  ngOnChanges(changes: SimpleChanges): void {
    //console.log(changes);
    const selected = changes["selected"];
    // if (!selected.firstChange) {
    //   if (selected.currentValue === false) {
    //     this.render.removeClass(this.divCard.nativeElement, "flip");
    //   } 
    // }
  }

  onClickCard() {
    if (this.thinking)
      return;
    if (!this.selected) {
      this.selected = true;
      this.render.addClass(this.divCard.nativeElement, "flip");
      this.cardSelected.emit(this.card.cardId);
    }
  }

  flipBack() {
    this.selected = false;
    this.render.removeClass(this.divCard.nativeElement, "flip");
  }

}
