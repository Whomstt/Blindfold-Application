import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { DealerComponent } from './dealer/dealer.component';  
import { MessagesComponent } from './messages/messages.component';
import { SearchListComponent } from './search-list/search-list.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, // Require authentication
  { path: 'profile', component : ProfileComponent, canActivate: [AuthGuard] }, 
  { path: 'dealer', component : DealerComponent, canActivate: [AuthGuard] }, 
  { path: 'messages', component : MessagesComponent, canActivate: [AuthGuard] },
  { path: 'search-list', component : SearchListComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
