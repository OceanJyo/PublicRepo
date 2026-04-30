import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatchPairComponent} from '../match-pair/components/match-pair.component'

@Component({
  selector: 'app-kidsgames',
  standalone: true,
  imports: [RouterModule, MatchPairComponent],
  templateUrl: './app.kidsgames.component.html',
  styleUrl: './app.kidsgames.component.css'
})
export class AppKidsgamesComponent {

}
