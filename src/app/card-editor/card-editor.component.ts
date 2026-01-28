import { Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { CardTextService } from '../card-text.service';
import { CardEditorService } from '../card-editor.service';
import { CardData } from '../carddata';
import { CommonModule, KeyValuePipe, NgForOf } from '@angular/common';
import html2canvas from 'html2canvas';

function generateCanvas(element:any){
    const canvas = document.createElement('canvas')
    canvas.width = element.offsetWidth * devicePixelRatio, canvas.height = element.offsetHeight * devicePixelRatio
    const ctx = canvas.getContext('2d')
    ctx!.imageSmoothingEnabled = true
    return html2canvas(element, {useCORS: true, canvas: canvas})
}

@Component({
  selector: 'app-card-editor',
  standalone: true,
  imports: [CommonModule, KeyValuePipe, NgForOf],
  templateUrl: './card-editor.component.html',
  styleUrls: ['./card-editor.component.less']
})
export class CardEditorComponent {
  // text inputs
  @ViewChild('name', { static: true }) nameElement!: ElementRef;
  @ViewChild('url', { static: true }) urlElement!: ElementRef;
  @ViewChild('vp', { static: true }) vpElement!: ElementRef;
  @ViewChild('credit', { static: true }) creditElement!: ElementRef;
  @ViewChild('types', { static: true }) typeElement!: ElementRef;
  @ViewChild('abilitiesList', { static: true }) abilitiesListElement!: ElementRef;

  capturedImage: string = "";

  getCard(): CardData{
    return this.editorService.getCurrentCard();
  }

  // text inputs
  nameKey(event: any){
    this.getCard().name = event.target.value;
    this.editorService.cardUpdate.emit(null);
  }
  urlKey(event: any){
    this.getCard().imageURL = event.target.value;
  }
  typeKey(event: any){
    this.getCard().type = event.target.value;
  }
  creditsKey(event: any){
    this.getCard().credits = event.target.value;
  }
  vpKey(event:any){
    this.getCard().vp = event.target.value;
  }

  saveCard() {
    this.editorService.saveCard()
    generateCanvas(document.querySelector("#card-out")!).then(canvas => {
      var link = document.getElementById('image-download-link');
      link!.setAttribute('download', `PH_${this.getCard().name.replace(/[\s\.]/g, '')}.png`);
      link!.setAttribute('href', canvas.toDataURL("image/png"));
      link!.click();
    })
  }

  getAllCards(): Array<CardData> {
    return this.editorService.allCards
  }
  loadSavedCard(index: number){
    this.editorService.loadCard(index)
    this.loadCard()
  }
  deleteCard(index: number){
    this.editorService.deleteCard(index)
    return false
  }

  starClick(event: any){
    this.getCard().star = !this.getCard().star;
    this.editorService.updateCard();
    this.loadCard();
  }

  statsKey(statsName: string, event: any){
    var numberAmount = Number(event.target.value);
    if(isNaN(numberAmount)){
      numberAmount = 0;
    }

    switch(statsName){
      case "pop": this.getCard().pop = numberAmount; break;
      case "cash":  this.getCard().cash = numberAmount; break;
      case "trouble":  this.getCard().trouble = numberAmount; break;
    }

    this.editorService.updateCard();
    this.loadCard();
  }

  haveStatsClick(statsName: string, event: any){
    switch(statsName){
      case "pop": 
        this.getCard().hasPop = !this.getCard().hasPop;
        if(!this.getCard().hasPop){
          this.getCard().pop = 0
        } 
        break;
      case "cash":  
        this.getCard().hasCash = !this.getCard().hasCash; 
        if(!this.getCard().hasCash){
          this.getCard().cash = 0
        } 
        break;
      case "trouble":  
        this.getCard().hasTrouble = !this.getCard().hasTrouble; 
        if(!this.getCard().hasTrouble){
          this.getCard().trouble = 0
        } 
        break;
    }
    this.editorService.updateCard();
    this.loadCard();
  }

  getAbilitiesLength(): number{
    return this.getCard().abilities.length;
  }

  abilityNameInput(index:number, event:any){
    this.getCard().abilities[index].name = event.target.value;
  }

  abilityReminderInput(index:number, event:any){
    this.getCard().abilities[index].reminder = event.target.value;
  }

  addAbility(){
    this.getCard().abilities.push({name:""})
  }

  removeAbility(){
    this.getCard().abilities.pop();
  }  
  
  onFileChanged(event: any) {
    const file = event.target.files[0];
    var fr = new FileReader();
    fr.onload = () => { 
      if(typeof(fr.result) == "string"){
        this.getCard().imageURL = fr.result;
        this.loadCard();
      }
    };
    fr.readAsDataURL(file);
  }

  loadCard(){
    this.nameElement.nativeElement.value = this.getCard().name;
    this.vpElement.nativeElement.value = this.getCard().vp == undefined ? "" : this.getCard().vp;
    this.typeElement.nativeElement.value = this.getCard().type;
    this.creditElement.nativeElement.value = this.getCard().credits;

    // set url
    this.urlElement.nativeElement.value = this.getCard().imageURL;

    // abilities
    for(var i = 0; i < this.abilitiesListElement.nativeElement.children.length; i++){
      var childRow = this.abilitiesListElement.nativeElement.children[i];
      var nameInput = childRow.getElementsByClassName("ability-name")[0];
      var reminderInput = childRow.getElementsByClassName("ability-reminder")[0];
      var overrideInput = childRow.getElementsByClassName("ability-override")[0];

      nameInput.value = this.getCard().abilities[i].name;
      reminderInput.value = this.getCard().abilities[i].reminder == undefined ? "" : this.getCard().abilities[i].reminder;
    }
  }

  ngOnInit(){
    setTimeout(() => {this.loadCard()}, 1)
  }

  constructor(private element:ElementRef, private textService: CardTextService, private editorService: CardEditorService){  }
}
