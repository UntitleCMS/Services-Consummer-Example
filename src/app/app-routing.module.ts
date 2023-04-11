import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignalRComponent } from './signal-r/signal-r.component';

const routes: Routes = [
  {path: "signalR", component: SignalRComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
