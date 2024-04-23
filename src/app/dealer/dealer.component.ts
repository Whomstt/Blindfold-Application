import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dealer',
  templateUrl: './dealer.component.html',
  styleUrls: ['./dealer.component.css']
})
export class DealerComponent {

  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth, private router: Router) { }

  async findMatch(): Promise<void> {
    try {
      // Get the current user's ID
      const currentUser = await this.afAuth.currentUser;
      if (currentUser) {
        const currentUserId = currentUser.uid;

        // Query Firestore for a random user (excluding the current user)
        const randomUser = await this.getRandomUser(currentUserId);

        // If a random user is found, navigate to their profile page
        if (randomUser) {
          this.router.navigate(['/view-other-profile', randomUser.userID]);
        } else {
          console.log('No random user found.');
        }
      }
    } catch (error) {
      console.error('Error finding match:', error);
    }
  }

  async getRandomUser(currentUserId: string): Promise<any> {
    try {
      // Query Firestore for users excluding the current user
      const usersSnapshot = await this.firestore.collection('users', ref => ref.where('userID', '!=', currentUserId)).get().toPromise();
      
      // Check if usersSnapshot is not undefined and not empty
      if (usersSnapshot && !usersSnapshot.empty) {
        const randomIndex = Math.floor(Math.random() * usersSnapshot.size);
        const randomUserDoc = usersSnapshot.docs[randomIndex];
        const randomUser = randomUserDoc.data();
        return randomUser;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting random user:', error);
      return null;
    }
  }
}
