import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatchPairCardInfo } from '../../app/models/kidsgames.model';

@Injectable({
  providedIn: 'root'
})
export class MatchPairCardService {

  private http: HttpClient = inject(HttpClient);
  private svgImgUrl: string = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/{id}.svg';
  private pokemonInfoUrl: string = 'https://pokeapi.co/api/v2/pokemon/{id}/';
  private pokemonMaxId: number = 649;

  constructor() { }

  async getMatchPairCards(cardNum: number, afterGetCards: Function) {
    const cardsInfo: MatchPairCardInfo[] = [];
    const ids : number[] = [];
    for (let i = 0; i < cardNum; i++) {
      let id = Math.ceil(Math.random() * this.pokemonMaxId);
      if (!ids.includes(id)) {
        ids.push(id);
        const card: MatchPairCardInfo = {
          cardId: i,
          typeId: id,
          svgImg: "",
          cardName: ""
        };
        await this.getSVGImage(id).then(xml => {
          card.svgImg = xml;
        });
        await this.getPokemonInfo(id).then(name => {
          card.cardName = name;
        });
        cardsInfo.push(card);
      }
      else {
        // for case of type already included
        i--;
      }
    }
    afterGetCards(cardsInfo);
  }

  async getMatchPairCard(cardId: number, afterGetCard: Function) {
    const cardInfo: MatchPairCardInfo = {
      cardId: 0,
      typeId: cardId,
      svgImg: "",
      cardName: ""
    };
    await this.getSVGImage(cardId).then(xml => {
      cardInfo.svgImg = xml;
    });
    await this.getPokemonInfo(cardId).then(name => {
      cardInfo.cardName = name;
    });
    afterGetCard(cardInfo);
  }

  private async getSVGImage(id: number): Promise<string> {
    let url = this.svgImgUrl.replace('{id}', id.toString());
    let xml: string = '';
    try {
      let resp = await fetch(url, {
        method: 'GET',
      });
      xml = await resp.text();
    }
    catch(err) {
      console.log(url);
      console.error(err);
    }

    return xml;
  }

  private async getPokemonInfo(id: number): Promise<string> {
    let url = this.pokemonInfoUrl.replace('{id}', id.toString());
    let name: string = "";
    try {
      let resp = await fetch(url, {
        method: 'GET',
      });
      let json = await resp.json();
      name = json.name;
    }
    catch(err) {
      console.log(url);
      console.error(err);
    }

    return name;
  }


}
