import { Routes } from '@angular/router';
import { MatchPairComponent } from '../match-pair/components/match-pair.component';
import { Points24Component } from '../points-24/components/points-24.component';

export const routes: Routes = [
    {
        path: 'matchpair',
        component: MatchPairComponent
    },
    {
        path: 'points24',
        component: Points24Component
    },
    {
        path: '',
        redirectTo: 'matchpair',
        pathMatch: 'full'
    },
];
