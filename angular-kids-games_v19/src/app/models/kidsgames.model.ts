export interface MatchPairCardSize {
  height: number,
  width: number
}

export interface MatchPairCardInfo {
  cardId: number,
  typeId: number,
  svgImg: string,
  cardName: string
}

export interface MatchPairBoardSize {
  x: number,
  y: number
}

export interface MatchPairStatus {
  foundPairs: number,
  numOfTrial: number
}

export interface Points24InitialState {
  easyMode: boolean,
}

export interface Points24DeckInfo {
  success: boolean,
  deckId: string,
  remaining: number,
  shuffled: boolean
}

export interface Points24Card {
  code: string,
  img: string,
  value: number,
}

export interface Points24SimpleExpression {
  operand1: number,
  operator: string,
  operand2: number,
  isFailed: boolean,
  isDone: boolean,
  result: string,
  resultDragged: boolean
}