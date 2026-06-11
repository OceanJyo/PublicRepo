import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { Points24Card, Points24DeckInfo } from '../../models/kidsgames.model';

@Component({
  selector: 'points24-card',
  standalone: true,
  imports: [NgClass],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card {

  @Input() card!: Points24Card;
  @Input() selected: boolean = false;

  onClickCard() {
      this.selected = !this.selected;
  }

  onDragStart(de: DragEvent) {
    if (de.target && de.target instanceof HTMLImageElement) {
      const img: HTMLImageElement = de.target as HTMLImageElement;
      de.dataTransfer?.setData("id", img.id);
    }
  }
    
}
