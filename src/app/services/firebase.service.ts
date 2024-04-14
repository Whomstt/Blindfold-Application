import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  user$ = this.afAuth.authState.pipe(
    filter(user => !!user),
    map(user => user!)
  );
  isLoggedIn = false;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  async signin(email: string, password: string) {
    try {
      const res = await this.afAuth.signInWithEmailAndPassword(email, password);
      this.isLoggedIn = true;
      localStorage.setItem('user', JSON.stringify(res.user));
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signup(email: string, password: string) {
    try {
      const res = await this.afAuth.createUserWithEmailAndPassword(email, password);
      this.isLoggedIn = true;
      localStorage.setItem('user', JSON.stringify(res.user));
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const result = await this.afAuth.fetchSignInMethodsForEmail(email);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  logout() {
    try {
      this.afAuth.signOut();
      localStorage.removeItem('user');
      this.isLoggedIn = false;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
}
