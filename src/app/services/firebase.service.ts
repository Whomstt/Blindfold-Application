import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
    private router: Router,
    private firestore: AngularFirestore
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

  async updateProfile(uid: string, newData: any): Promise<void> {
    try {
      await this.firestore.collection('profiles').doc(uid).update(newData);
    } catch (error) {
      throw error;
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

  getCurrentUserID() {
  return this.afAuth.currentUser.then(user => user ? user.uid : null);
}

async getCurrentUserSeeking() {
  try {
    const currentUser = await this.afAuth.currentUser;
    if (currentUser) {
      const doc = await this.firestore.collection('profiles').doc(currentUser.uid).get().toPromise();
      if (doc && doc.exists) {
        const data: any = doc.data();
        return data.userSeeking;
      } else {
        console.warn('User profile document not found or does not exist.');
        
      }
    } else {
      console.warn('No current user found.');
      throw new Error('No current user found.');
    }
  } catch (error) {
    console.error('Error getting user seeking preference:', error);
    
  }
}

async getCurrentUserGender() {
  try {
    const currentUser = await this.afAuth.currentUser;
    if (currentUser) {
      const doc = await this.firestore.collection('profiles').doc(currentUser.uid).get().toPromise();
      if (doc && doc.exists) {
        const data: any = doc.data();
        return data.userGender;
      } else {
        console.warn('User profile document not found or does not exist.');
        
      }
    } else {
      console.warn('No current user found.');
      throw new Error('No current user found.');
    }
  } catch (error) {
    console.error('Error getting user seeking preference:', error);
    
  }
}

}
