import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireModule } from '@angular/fire/compat';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { FirebaseService } from './services/firebase.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyCShg7ErBfUMVAsl-Kt6UTNRoQiPQGOJvA",
      authDomain: "blindfold-application.firebaseapp.com",
      projectId: "blindfold-application",
      storageBucket: "blindfold-application.appspot.com",
      messagingSenderId: "244075422081",
      appId: "1:244075422081:web:608e0c8bfd508aae61c880",
      measurementId: "G-50EEMXE1PC"
    })
  ],
  providers: [
    provideClientHydration(),
    FirebaseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
