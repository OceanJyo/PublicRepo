import { Routes } from '@angular/router';
import { MatchPair } from './match-pair/components/match-pair';
import { Points24 } from './points-24/components/points-24';
import { GobangBoard } from './gobang/components/board';
import { GoBoard } from './go/components/board';

export const routes: Routes = [
    {
        path: 'matchpair',
        component: MatchPair
    },
    {
        path: 'points24',
        component: Points24
    },
    {
        path: 'gobang',
        component: GobangBoard
    },
    {
        path: 'go',
        component: GoBoard
    },
    {
        path: '',
        redirectTo: 'matchpair',
        pathMatch: 'full'
    },
];
