import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Points24DeckInfo, Points24Card } from '../../app/models/kidsgames.model';


@Injectable({
  providedIn: 'root'
})
export class Points24Service {

  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = 'https://deckofcardsapi.com';
  private newDeckShuffleUrl: string = "/api/deck/new/shuffle/?deck_count=1";
  private pickOneCardUrl: string = '/api/deck/{deckId}/draw/?count=1';
  
  constructor() { }

  private async getShuffledNewDeck() {
    const url: string = this.baseUrl + this.newDeckShuffleUrl;
    let deckInfo: Points24DeckInfo = {
      success: false,
      deckId: '',
      remaining: 0,
      shuffled: false
    }; 
    try {
      let resp = await fetch(url, {
        method: 'GET',
      });
      let d = await resp.json();
      deckInfo.success = d.success;
      deckInfo.deckId = d.deck_id;
      deckInfo.remaining = d.remaining;
      deckInfo.shuffled = d.shuffled;
    }
    catch(err) {
      console.log(url);
      console.error(err);
    }

    return deckInfo;
  }

  private getCardValue(v: string): number {
    let val: number = 0;
    if (v == "2" || v == "3" || v == "4" || v == "5" || v == "6" || v == "7" || v == "8" || v == "9" || v == "10")
      val = +v;
    else if (v == "ACE")
      val = 1;
    else if (v == "JACK")
      val = 11;
    else if (v == "QUEEN")
      val = 12;
    else if (v == "KING")
      val = 13;

    return val;
  }

  async get4Cards(deckInfo: Points24DeckInfo, easyMode: boolean) {
    if (!deckInfo.success || deckInfo.remaining === 0) {
      await this.getShuffledNewDeck().then(d => deckInfo = d)
    }

    const url: string = this.baseUrl + this.pickOneCardUrl.replace("{deckId}", deckInfo.deckId);
    const cardsInfo: Points24Card[] = [];
    let hasOverTen: boolean = false;
    for (let i = 0; i < 4; i++) {
      try {
        let resp = await fetch(url, {
          method: 'GET',
        });
        let json = await resp.json();
        let card = json.cards[0];
        let isOverTen = card.code.includes("J") || card.code.includes("Q") || card.code.includes("K");
        if (easyMode) {
          if (isOverTen) {
            i--;
            continue;
          }
        }
        else {
          if (isOverTen) 
            hasOverTen = isOverTen;
          // last chance to get card over 10
          if (!hasOverTen && i == 3) {
            i--;
            continue;
          }
        }
        let v = this.getCardValue(card.value);
        let cardInfo: Points24Card = {
          code: card.code,
          img: card.image,
          value: v
        }
        cardsInfo.push(cardInfo);
      }
      catch(err) {
        console.log(url);
        console.error(err);
      }
  
    }

    return cardsInfo;
  }

  calculateOneExpression(str: string, op: string) {
    let exp = str.replace("(", "").replace(")", "");
    const operands = exp.split(op);
    let result = 0;
    switch (op) {
        case "+":
            result = (+operands[0]) + (+operands[1]);
            break;
        case "-":
            result = (+operands[0]) - (+operands[1]);
            break;
        case "*":
            result = (+operands[0]) * (+operands[1]);
            break;
        case "/":
            if (+operands[1] != 0)
              result = (+operands[0]) / (+operands[1]);
            else 
              result = -1;
            break;
    }
    return result;
  }


  // search solutions
  findSolutions(cards: number[]): Observable<string> {

    const observable = new Observable<string>((subscriber) => {

      const hs: number[][] = [
        [0, 1, 2, 3],    [1, 0, 2, 3],    [2, 0, 1, 3],    [3, 0, 1, 2],
        [0, 1, 3, 2],    [1, 0, 3, 2],    [2, 0, 3, 1],    [3, 0, 2, 1],
        [0, 2, 1, 3],    [1, 2, 0, 3],    [2, 1, 0, 3],    [3, 1, 0, 2],
        [0, 2, 3, 1],    [1, 2, 3, 0],    [2, 1, 3, 0],    [3, 1, 2, 0],
        [0, 3, 1, 2],    [1, 3, 0, 2],    [2, 3, 0, 1],    [3, 2, 0, 1],
        [0, 3, 2, 1],    [1, 3, 2, 0],    [2, 3, 1, 0],    [3, 2, 1, 0],
      ];
      const os: string[] = [
        "+++",    "++-",    "++*",    "++/",    "+-+",    "+--",    "+-*",    "+-/",
        "+*+",    "+*-",    "+**",    "+*/",    "+/+",    "+/-",    "+/*",    "+//",
        "-++",    "-+-",    "-+*",    "-+/",    "--+",    "---",    "--*",    "--/",
        "-*+",    "-*-",    "-**",    "-*/",    "-/+",    "-/-",    "-/*",    "-//",
        "*++",    "*+-",    "*+*",    "*+/",    "*-+",    "*--",    "*-*",    "*-/",
        "**+",    "**-",    "***",    "**/",    "*/+",    "*/-",    "*/*",    "*//",
        "/++",    "/+-",    "/+*",    "/+/",    "/-+",    "/--",    "/-*",    "/-/",
        "/*+",    "/*-",    "/**",    "/*/",    "//+",    "//-",    "//*",    "///",
      ];

      let totalPromise = 0;
      let promiseCount = 0;
      let exps: string[] = [];
      for (const h of hs) {
        for (const o of os) {
          let fs = this.mutateFormula(h.map((e) => cards[e]), [...o]);
          for (let f of fs) {
            if (exps.includes(f))
              continue;
            exps.push(f);
            totalPromise += 1;
            this.calculate(f).then(
              (rst) => {
                promiseCount += 1;
                if (rst == 24) {
                  console.info(promiseCount + " - " + f + " = " + rst + " =========== GOT IT!");
                  subscriber.next(f);
                } 
                // else {
                //   promiseCount += 1;
                //   // console.log(i + " - " + f + " = " + rst);
                // }
                if (promiseCount >= totalPromise)
                  subscriber.complete();
              },
              (err) => {
                promiseCount += 1;
                if (promiseCount >= totalPromise)
                  subscriber.complete();
                // console.error(i + " - " + f + " >> " + err);
              }
            )
          }
        }
      }
    })

    return observable;
  }

  private mutateFormula(cards: number[], os: string[]) {
    const fs: string[] = [];
    const ln = os.length;
    const lowerIdx: number[] = [];

    // 1. no paranthesis
    fs.push(this.generateFormula(cards, os))

    os.forEach((o, i) => {
        if (o == "+" || o == "-")
          lowerIdx.push(i);
    });
    let ocLower = lowerIdx.length;
    // all lower priority (+ or -), return
    if (ocLower == ln) return fs;
    let ocHigher = os.filter(o => o == "*" || o == "/").length;
    // all higher priority (* or /), return
    if (ocHigher == ln) return fs;

    // mixed cases
    // 2. one parathesis
    for (let i = 0; i < ocLower; i++) {
        fs.push(this.generateFormula(cards, os, [lowerIdx[i]]))
    }
    // 3. 2 parathesis
    if (ocLower > 1) {
        fs.push(this.generateFormula(cards, os, lowerIdx))
    }

    return fs;
  }

  private generateFormula(cards: number[], os: string[], pp: number[] = []) {
      let f = "";
      if (pp.length == 0) {
          for (let i = 0; i < cards.length; i++) {
              f += cards[i] + os[i];
              if (i == cards.length - 2) {
                  f += cards[++i];
              }
          }
      }
      else {
          for (let i = 0; i < os.length; i++) {
              if (i == 0) {
                  f += cards[i] + os[i] + cards[i+1];
              }
              else {
                  f += os[i] + cards[i+1];
              }

              if (pp.includes(i)) {
                  if (i == 0) {
                      f = "(" + f + ")";
                  }
                  else {
                      const exp: string = cards[i] + os[i] + cards[i+1];
                      const regEx = cards[i] + "\\" + os[i] + cards[i+1];
                      const reg = new RegExp(regEx + '$');
                      if (f.match(reg)?.length == 1)
                          f = f.replace(reg, "(" + exp + ")");
                      else {
                          const reg = new RegExp(cards[i] + "\\)\\" + os[i] + cards[i+1] + "$");
                          f = f.replace(reg, "(" + exp + "))");
                      }
                  }
              }
          }        
      }

      return f;
  }

  private async calculate(str: string) {
      let result = 0;
      let parsedStr = str.replace(")(", ")*(");
      
      if (parsedStr.includes("(")) {
          let openCnt = 1;
          let startIdx = parsedStr.indexOf("(");
          let endIdx = parsedStr.length - 1;
          for (let i = startIdx + 1; i < parsedStr.length; i++) {
              if (parsedStr[i] === "(") openCnt++;
              if (parsedStr[i] === ")") openCnt--;
              if (openCnt === 0) {
                  endIdx = i;
                  break;
              }
          }
          let exp = parsedStr.substring(startIdx + 1, endIdx);
          //intermediate result in parenthesis (not count in final)
          let temp = await this.calculate(exp);
          parsedStr = parsedStr.replace("(" + exp + ")", temp.toString());
          if ((parsedStr.includes("+") || parsedStr.includes("-") || parsedStr.includes("*") || parsedStr.includes("/")))
              result = await this.calculate(parsedStr);
          else
              return +parsedStr;
      }
      else {
          let op = "";
          let exp = "";
          while (parsedStr.includes("+") || parsedStr.includes("-") || 
              parsedStr.includes("*") || parsedStr.includes("/")) {
              if (parsedStr.includes("*") || parsedStr.includes("/")) {
                  for (let o of parsedStr) {
                      if (o == "*" || o == "/") {
                          op = o;
                          exp = this.findOneExp(parsedStr, op);
                          break;
                      }
                  }
              }
              else {
                  for (let o of parsedStr) {
                      if (o == "+" || o == "-") {
                          op = o;
                          exp = this.findOneExp(parsedStr, op);
                          break;
                      }
                  }
              }
              
              result = this.calculateOneExp(exp, op);
              parsedStr = parsedStr.replace(exp, result.toString());
              // if more calculation
              if (parsedStr !== result.toString())
                  result += await this.calculate(parsedStr);
          }
      }

      return result;
  }

  private findOneExp(str: string, op: string) {
      let exp = "";
      let idx = str.indexOf(op);
      if (idx !== -1) {
          let startIdx = 0;
          for (let i = idx - 1; i >= 0; i--) {
              if (!(/[0-9]/).test(str[i])) {
                  startIdx = i + 1;
                  break;
              }
          }
          let endIdx = str.length - 1;
          for (let i = idx + 1; i < str.length; i++) {
              if (!(/[0-9]/).test(str[i])) {
                  endIdx = i - 1;
                  break;
              }
          }
          exp = str.substring(startIdx, endIdx + 1);
      }

      return exp;
  }

  private calculateOneExp(str: string, op: string) {
    let exp = str.replace("(", "").replace(")", "");
    const operands = exp.split(op);
    let result = 0;
    switch (op) {
        case "+":
            result = (+operands[0]) + (+operands[1]);
            break;
        case "-":
            result = (+operands[0]) - (+operands[1]);
            break;
        case "*":
            result = (+operands[0]) * (+operands[1]);
            break;
        case "/":
            if (+operands[1] == 0)
                throw "divide by 0.";
            result = (+operands[0]) / (+operands[1]);
            break;
    }
    if (result < 0)
        throw "result is negative."
    if (!Number.isInteger(result))
        throw "result is not integer."

    return result;
  }

}
