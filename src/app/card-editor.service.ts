import { EventEmitter, Injectable } from '@angular/core';
import { CardDisplayComponent } from './card-display/card-display.component';
import { CardData } from './carddata';

function compare( a: CardData, b: CardData ) {
  if(a.star < b.star){
    return -1;
  }
  if(a.star > b.star){
    return 1;
  }
  if ( a.vp! < b.vp! ){
    return -1;
  }
  if ( a.vp! > b.vp! ){
    return 1;
  }
  return 0;
}

@Injectable({
  providedIn: 'root'
})
export class CardEditorService {
  allCards: Array<CardData> = [];

  currentCard: CardData = {
    pop: 0, cash: 0, trouble: 0, star: false,
    hasPop: false, hasCash: false, hasTrouble: false,
    vp: "",
    abilities: [],
    text: "",
    name: "",
    imageURL: "",
    credits: "",
    type: "",
    textSizeModifier: 1
  };
  
  cardDisplayComponent?: CardDisplayComponent;

  public cardUpdate = new EventEmitter<any>();

  saveCard() {
    var index = this.allCards.findIndex(card => card.name == this.currentCard.name);
    if(index == -1){
      this.allCards.push(this.currentCard)
    } else {
      this.allCards[index] = this.currentCard;
    }
    this.currentCard = structuredClone(this.currentCard);

    this.allCards.sort(compare);

    localStorage.setItem("savedCards", JSON.stringify(this.allCards))
  }

  loadCard(index: number) {
    this.currentCard = structuredClone(this.allCards[index])
    this.cardUpdate.emit(null);
  }

  deleteCard(index: number) {
    this.allCards.splice(index, 1)

    localStorage.setItem("savedCards", JSON.stringify(this.allCards))
  }

  getCurrentCard(): CardData{
    return this.currentCard;
  }

  updateCard(){
    if(this.cardDisplayComponent != undefined){
      this.cardDisplayComponent.setCardDimensions();
    }
  }

  constructor() {
    if(localStorage.getItem("savedCards") != null){
      this.allCards = JSON.parse(localStorage.getItem("savedCards")!)
      console.log(this.allCards)
      if(this.allCards.length > 0){
        this.loadCard(0)
      }
    }
  }
}
