import { EventEmitter, Injectable } from '@angular/core';
import { CardDisplayComponent } from './card-display/card-display.component';
import { AbilityData, CardData } from './carddata';

function compare( a: CardData, b: CardData ) {
  if ( a.cost! < b.cost! ){
    return -1;
  }
  if ( a.cost! > b.cost! ){
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
    cost: "",
    abilities: [],
    name: "",
    imageURL: "",
    credits: "",
    type: ""
  };
  
  cardDisplayComponent?: CardDisplayComponent;

  public cardUpdate = new EventEmitter<any>();

  saveCurrentCard() {
    this.saveCard(this.currentCard);
    this.currentCard = structuredClone(this.currentCard);
  }

  saveCard(cardToSave: CardData) {
    var index = this.allCards.findIndex(card => card.name == cardToSave.name);
    if(index == -1){
      this.allCards.push(cardToSave)
    } else {
      this.allCards[index] = cardToSave;
    }

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
    this.cardUpdate.emit(null);
  }

  expandCards(){
    var otherMaterials: Array<[string, string, string]> = [
      ["Barnythium", "Barynthic", "b"], 
      ["Cryonth","Cryonthic", "c"]
    ];

    var newCards: Array<CardData> = [];

    this.allCards.forEach((card) => {
      otherMaterials.forEach((m) => {
        var newCard = JSON.parse(JSON.stringify(card))

        newCard.name = newCard.name.replace(/Axiomite/gi, m[0]).replace(/Axiomitic/gi, m[1]);
      
        newCard.cost = newCard.cost.replace(/a/gi, m[2])
        newCard.name = newCard.name.replace(/Axiomite/gi, m[0]).replace(/Axiomitic/gi, m[1]);
        newCard.abilities.forEach((ability: AbilityData) => {
          ability.name = ability.name.replace(/\_a/gi, "_" + m[2])
          ability.reminder = ability.reminder!.replace(/\{A}/gi, `\{${m[2].toUpperCase()}\}`)
        })
        
        newCards.push(newCard)
      })
    })

    newCards.forEach(card => this.saveCard(card))
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
