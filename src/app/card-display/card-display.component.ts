import { Component, ElementRef, HostListener, ViewEncapsulation } from '@angular/core';
import { AbilityData, CardData } from '../carddata';
import { CardEditorService } from '../card-editor.service';
import { NgForOf, NgIf } from '@angular/common';
import { SafeHtmlPipe } from '../safe-html.pipe';

@Component({
  selector: 'app-card-display',
  standalone: true,
  imports: [NgForOf, NgIf, SafeHtmlPipe],
  templateUrl: './card-display.component.html',
  encapsulation: ViewEncapsulation.None,
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
  public minReminderSize: number = 14;
  // resource icons
  public statIconSize: number = 0;
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

    setTimeout(() => {this.onCardUpdate()}, 100)
  }

  getName(): string{
    return this.getCurrentCard().name;
  }

  getBackgroundImage(): string{
    return "url("  + this.getCurrentCard().imageURL + ")";
  }

  getAbilities(): Array<AbilityData>{
    return this.getCurrentCard().abilities;
  }

  getIcons(ability: string): Array<[string, string, string, string, string]> {
    var icons = Array<[string, string, string, string, string]>();

    ability.split(",").forEach((a) => {
      var iconData: [string, string, string, string, string] = [a, "", "", "", ""];      
      
      if(iconData[0].indexOf("&") != -1){
        var splitResults = iconData[0].split("&")

        iconData[0] = splitResults[0]
        iconData[4] = splitResults[1]
      }

      if(iconData[0].indexOf("@") != -1){
        var splitResults = iconData[0].split("@")

        iconData[0] = splitResults[0]
        iconData[3] = splitResults[1]
      }

      if(iconData[0].indexOf(".") != -1){
        var splitResults = iconData[0].split(".")

        iconData[0] = splitResults[0]
        iconData[1] = splitResults[1]
      }

      if(iconData[0].indexOf("_") != -1){
        var splitResults = iconData[0].split("_")

        iconData[2] = splitResults[1]
      }

      icons.push(iconData);
    })

    return icons;
  }

  getCredits(): string {
    return this.getCurrentCard().credits != null ? this.getCurrentCard().credits! : "";
  }

  getType(): string {
    if(this.getCurrentCard().type.toLowerCase() == "policy"){
      return "Policy"
    }
    return "Facility"
  }

  getCost(): string {
    var segments = this.getCurrentCard().cost.split(".")

    if(segments.length != 2) {
      return "0"
    }

    return segments[1]
  }

  getColor(): string{
    var segments = this.getCurrentCard().cost.split(".")

    if(segments.length != 2) {
      return "d"
    }

    if(["a", "b", "c", "d"].indexOf(segments[0]) == -1){
      return "d"
    }

    return segments[0]
  }

  valueParse(s: string): string {
    return s.replace(/\*/gi, "×");
  }

  reminderParse(s: string): string {
    var newS = s.replace(/{([ABCDE])}/gi, (a,b) => (`<img style="width: ${this.fontSizeReminder}px" src="./assets/resource_${b.toLowerCase()}.png">`))
    newS = newS.replace(/\\n/gi, (a,b) => "<br>")
    return newS
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
    var startSize = this.cardHeight * 0.04;
    while(this.getTextWidth(this.getCurrentCard().name.toUpperCase(), `900 ${startSize}px myFont`) > this.cardWidth * 0.525){
      startSize -= 0.1;
    }
    this.fontSizeName = startSize;
    
    this.statIconSize = this.cardWidth * .15 * (1 - 0.2 * (this.getAbilities().length - 1));


    var startReminderSize = this.cardWidth * 0.06;
    var biggestAbilityReminder = this.getCurrentCard().abilities[0].reminder

    if(biggestAbilityReminder.includes("\\n")){
      biggestAbilityReminder = biggestAbilityReminder.split("\\n")[0]
      startReminderSize *= 0.8
    } 
    while(this.getTextWidth(biggestAbilityReminder, `normal ${startReminderSize}px Arial`) > this.cardWidth * 0.8 && startReminderSize >= this.minReminderSize){
      startReminderSize -= 0.01;
    }
    this.fontSizeReminder = startReminderSize;
  }

  constructor(private element:ElementRef, private editorService: CardEditorService){
    editorService.cardDisplayComponent = this;

    editorService.cardUpdate.subscribe(() => {this.onCardUpdate()});
  }
}
