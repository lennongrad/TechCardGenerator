import { Injectable } from '@angular/core';

import { CardData } from './carddata';

@Injectable({
  providedIn: 'root'
})
export class CardTextService {
  reminderText: {[keyword: string]: string} = {
    "Peek": "Exhaust: Look at the top card of your rolodex. You may put it on the bottom.",
    "Eject": "Exhaust: Boot another guest.",
    "Eject+": "Exhaust: Boot out two other adjacent guests.",
    "Backyard": "Exhaust: Shuffle all guests into your rolodex.",
    "Fetch": "Exhaust: You may search your rolodex for a guest, invite them, then shuffle.",
    "Clique": "Entry: Invite a guest.",
    "Clique+": "Entry: Invite two guests.",
    "Network": "Buy: Search the phonebook for a guest with the same name, shuffle, then put it on top."
  };

  getReminderText(abilityName: string): string{
    if(abilityName in this.reminderText){
      return this.reminderText[abilityName];
    }
    return "";
  }

  constructor() { }
}
