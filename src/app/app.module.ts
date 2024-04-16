import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Import AngularFireAuth
import { AngularFireModule } from '@angular/fire/compat';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { FirebaseService } from './services/firebase.service';
import { environment } from "../environments/environment";
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { DealerComponent } from './dealer/dealer.component';
import { MessagesComponent } from './messages/messages.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { SearchListComponent } from './search-list/search-list.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    ProfileComponent,
    DealerComponent,
    MessagesComponent,
    SearchListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), // Initializing Firebase here,
    AngularFirestoreModule,
    FormsModule,
  ],
  
  providers: [
    AngularFireAuth, // Provide AngularFireAuth directly
    FirebaseService,
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideFirestore(() => getFirestore())
    ])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
}

