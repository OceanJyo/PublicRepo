import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'kids-games';
  isDisabled: boolean = false;

  onClickToggle() {
    this.isDisabled = !this.isDisabled;
    console.log("in");
  };

  onClickResetText() {
    console.log(this.title);
    this.title = 'kids-games';
    console.log(this.title);
  };

}
