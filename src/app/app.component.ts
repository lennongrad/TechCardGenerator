import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardEditorComponent } from './card-editor/card-editor.component';
import { CardDisplayComponent } from './card-display/card-display.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CardEditorComponent, CardDisplayComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'party-house';
}
