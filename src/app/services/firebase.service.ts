import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  isLoggedIn = false;
  constructor(public firebaseAuth: AngularFireAuth) { }
  async signin(email: string, password: string) {
    await this.firebaseAuth.signInWithEmailAndPassword(email, password)
      .then(res => {
        this.isLoggedIn = true;
        localStorage.setItem('user', JSON.stringify(res.user));
      });
  }

  async signup(email: string, password: string) {
    await this.firebaseAuth.createUserWithEmailAndPassword(email, password)
      .then(res => {
        this.isLoggedIn = true;
        localStorage.setItem('user', JSON.stringify(res.user));
      });
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // Check if the email exists
      const result = await this.firebaseAuth.fetchSignInMethodsForEmail(email);
      
      // If result contains methods, it means email exists
      return result.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false; // Return false if an error occurs
    }
  }

  logout() {
    this.firebaseAuth.signOut();
    localStorage.removeItem('user');
  }
  
}
