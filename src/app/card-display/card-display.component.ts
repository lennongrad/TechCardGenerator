import { Component, ElementRef, HostListener } from '@angular/core';
import { AbilityData, CardData } from '../carddata';
import { CardTextService } from '../card-text.service';
import { CardEditorService } from '../card-editor.service';
import { KeyValuePipe, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [KeyValuePipe, NgForOf, NgIf],
  templateUrl: './card-display.component.html',
  styleUrls: ['./card-display.component.less']
})
export class CardDisplayComponent {
  // card sizes
  public cardWidth: number = 0;
  public cardHeight: number = 0;
  public innerCardWidth: number = 0;
  public innerCardHeight: number = 0;
  // font sizes
  public fontSizeTiny: number = 0;
  public fontSizeSmall: number = 0;
  public fontSizeMedium: number = 0;
  public fontSizeLarge: number = 0;
  public fontSizeHuge: number = 0;
  public fontSizeName: number = 0;
  // textbox font sizes
  public fontSizeReminder: number = 0;
  // resource icons
  public statIconSize: number = 0;
  public realStatIconSize: number = 0;
  public statModifier: number = 3;
  public resourceIconSize: number = 0;

  getCurrentCard(): CardData{
    return this.editorService.getCurrentCard();
  }

  setCardDimensions(){
    var containerWidth = this.element.nativeElement.offsetWidth;
    var containerHeight = this.element.nativeElement.offsetHeight;

    if(containerHeight < containerWidth * 7/5){
      this.cardHeight = containerHeight - 40;
      this.cardWidth = (this.cardHeight) * 5/7;
    } else {
      this.cardWidth = containerWidth - 40;
      this.cardHeight = this.cardWidth * 7/5;
    }

    var borderDistance = this.cardWidth * .065;
    this.innerCardHeight = this.cardHeight - borderDistance;
    this.innerCardWidth = this.cardWidth - borderDistance * 1.2;

    // set font sizes
    this.fontSizeTiny = this.cardWidth * .023;
    this.fontSizeSmall = this.cardWidth * .04;
    this.fontSizeMedium = this.cardWidth * .06;
    this.fontSizeLarge = this.cardWidth * .05;
    this.fontSizeHuge = this.cardWidth * .12;
    this.fontSizeReminder = this.cardWidth * .04;
    // reminder size change based on amount of text
    // set icon size
    this.statIconSize = this.cardWidth * .075;
    this.realStatIconSize = this.statIconSize * 2.5;

    setTimeout(() => {this.onCardUpdate()}, 100)
  }

  //////////////
  // getter functions for card properties
  //////////////
  getName(): string{
    return this.getCurrentCard().name;
  }

  getPopBackgroundImage(): string {
    return this.getCurrentCard().pop >= 0 ? 'url("./assets/trap1.png")' : 'url("./assets/trap3.png")';
  }
  getCashBackgroundImage(): string {
    return this.getCurrentCard().cash >= 0 ? 'url("./assets/trap2.png")' : 'url("./assets/trap3.png")';
  }
  getTroubleBackgroundImage(): string {
    return this.getCurrentCard().trouble < 0 ? 'url("./assets/trap4.png")' : 'url("./assets/trap5.png")';
  }

  getCardBackground(): string{
    return "url('./assets/eighty6.png')"
  }

  getBackgroundImage(): string{
    return "url("  + this.getCurrentCard().imageURL + ")";
  }

  getAbilities(): Array<AbilityData>{
    return this.getCurrentCard().abilities;
  }

  getIcons(ability: string): Array<[string, string, string]> {
    var icons = Array<[string, string, string]>();

    ability.split(",").forEach((a) => {
      if(a.indexOf(".") != -1){
        var first = a.split(".")[0]
        var second = a.split(".")[1]

        if(first.indexOf("_") != -1){
          icons.push([first, second, first.split("_")[1]])
        } else {
          icons.push([first, second, ""])
        }
      } else {
        icons.push([a, "", ""])
      }
    })

    return icons;
  }

  getReminderless(): string{
    var baseline = "";
    var abilities = this.getCurrentCard().abilities;
    for(let index in abilities){
      var ability = abilities[index];
      var reminderText = this.textService.getReminderText(ability.name);

      if(((ability.reminder == null || ability.reminder == "") && reminderText == "") || (ability.overrideReminder)){
        baseline += ability.name + ", ";
      }
    }
    return baseline.slice(0, baseline.length - 2);
  }

  getText(): string{
    return this.getCurrentCard().text != null ? this.getCurrentCard().text! : "";
  }

  getCredits(): string {
    return this.getCurrentCard().credits != null ? this.getCurrentCard().credits! : "";
  }

  getType(): string {
    return this.getCurrentCard().type != null ? this.getCurrentCard().type! : "";
  }

  getCost(): string {
    var segments = this.getCurrentCard().vp.split(".")

    if(segments.length != 2) {
      return "0"
    }

    return segments[1]
  }

  getColor(): string{
    var segments = this.getCurrentCard().vp.split(".")

    if(segments.length != 2) {
      return "d"
    }

    if(["a", "b", "c", "d"].indexOf(segments[0]) == -1){
      return "d"
    }

    return segments[0]
  }

  getVP(): string{
    if(this.getCurrentCard().vp == undefined){
      return "";
    }
    return this.getCurrentCard().vp!;
  }

  getPaddingBottom(statName: string): string{
    return (Math.abs(this.getAmount(statName)) != 0 && Math.abs(this.getAmount(statName)) != 1 && Math.abs(this.getAmount(statName)) != 2 && Math.abs(this.getAmount(statName)) != 6 && Math.abs(this.getAmount(statName)) != 8) ? '30%' : '20%'
  }

  getAmount(statName: string): number{
    switch(statName){
      case "pop": return this.getCurrentCard().pop!; 
      case "cash": return this.getCurrentCard().cash!; 
      case "trouble": return this.getCurrentCard().trouble!; 
    }
    return 0;
  }

  getStat(statName: string): string{
    var amt: number = 0;
    switch(statName){
      case "pop": amt = this.getCurrentCard().pop!; break;
      case "cash": amt = this.getCurrentCard().cash!; break;
      case "trouble": amt = this.getCurrentCard().trouble!; break;
    }
    
    if(amt >= 0){
      return "+" + amt;
    }
    return String(amt);
  }

  ngOnInit(){
    this.setCardDimensions();
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(_event: any) {
    this.setCardDimensions();
  }


  testCanvas: any;

  getTextWidth(text: any, font: any) {
    // re-use canvas object for better performance
    const canvas = this.testCanvas || (this.testCanvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }

  getCssStyle(element: any, prop: any) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
  }

  getCanvasFont(el = document.body) {
    const fontWeight = this.getCssStyle(el, 'font-weight') || 'normal';
    const fontSize = this.getCssStyle(el, 'font-size') || '16px';
    const fontFamily = this.getCssStyle(el, 'font-family') || 'Times New Roman';

    return `${fontWeight} ${fontSize} ${fontFamily}`;
  }

  onCardUpdate(){
    // calculate name size
    var startSize = this.cardHeight * 0.04;
    while(this.getTextWidth(this.getCurrentCard().name.toUpperCase(), `900 ${startSize}px myFont`) > this.cardWidth * 0.525){
      startSize -= 0.1;
    }
   this.fontSizeName = startSize;
  }

  constructor(private element:ElementRef, private textService: CardTextService, private editorService: CardEditorService){
    editorService.cardDisplayComponent = this;

    editorService.cardUpdate.subscribe(() => {this.onCardUpdate()});
  }
}
