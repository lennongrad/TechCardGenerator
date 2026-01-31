import { Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { CardEditorService } from '../card-editor.service';
import { AbilityData, CardData } from '../carddata';
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
  imports: [CommonModule, NgForOf],
  templateUrl: './card-editor.component.html',
  styleUrls: ['./card-editor.component.less']
})
export class CardEditorComponent {
  // text inputs
  @ViewChild('name', { static: true }) nameElement!: ElementRef;
  @ViewChild('url', { static: true }) urlElement!: ElementRef;
  @ViewChild('cost', { static: true }) costElement!: ElementRef;
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
  costKey(event:any){
    this.getCard().cost = event.target.value;
  }

  saveCard() {
    this.editorService.saveCurrentCard()
    this.renderCard()
  }

  renderCard() {
    generateCanvas(document.querySelector("#card-out")!).then(canvas => {
      var link = document.getElementById('image-download-link');
      link!.setAttribute('download', `PH_${this.getCard().name.replace(/[\s\.]/g, '')}.png`);
      link!.setAttribute('href', canvas.toDataURL("image/png"));
      link!.click();
    })
  }

  expandCards() {
    this.editorService.expandCards()
  }

  async pasteCard() {
    const copiedData = await navigator.clipboard.readText()

    copiedData.split("\n").forEach(datum => {
      var splitData = datum.split("\t")

      if(splitData.length == 7){
        var newCard: CardData = {
          name: splitData[0],
          type: splitData[3],
          cost: splitData[4],
          imageURL: splitData[1],
          credits: splitData[2],
          abilities: [
            {name : splitData[5], reminder: splitData[6]}
          ]
        }

        //console.log(newCard)
        this.editorService.saveCard(newCard)
      }
    })
  }

  clearAll() {
    localStorage.clear()
    this.editorService.allCards = []
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

  getAbilitiesLength(): number{
    return this.getCard().abilities.length;
    this.editorService.cardUpdate.emit(null);
  }

  abilityNameInput(index:number, event:any){
    this.getCard().abilities[index].name = event.target.value;
    this.editorService.cardUpdate.emit(null);
  }

  abilityReminderInput(index:number, event:any){
    this.getCard().abilities[index].reminder = event.target.value;
    this.editorService.cardUpdate.emit(null);
  }

  addAbility(){
    this.getCard().abilities.push({name:"", reminder:""})
    this.editorService.cardUpdate.emit(null);
  }

  removeAbility(){
    this.getCard().abilities.pop();
    this.editorService.cardUpdate.emit(null);
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
    this.costElement.nativeElement.value = this.getCard().cost;
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

  exportAll(){
    this.exportT(0);
  }

  exportT(index: number){
    this.editorService.loadCard(index)
    this.renderCard()
    setTimeout(() => this.exportT(index + 1), 1000)
  }

  ngOnInit(){
    setTimeout(() => {this.loadCard()}, 1)
  }

  constructor(private element:ElementRef, private editorService: CardEditorService){  }
}
