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
      const usersSnapshot = await this.firestore.collection('users', ref => 
        ref.where('userID', '!=', currentUserId)
      ).get().toPromise();
      
      // Check if usersSnapshot is not undefined and not empty
      if (usersSnapshot && !usersSnapshot.empty) {
        // Filter out banned users
        const nonBannedUsers = [];
        for (const userDoc of usersSnapshot.docs) {
          const userData: any = userDoc.data(); // Explicitly type 'userData' as any
          // Check if the user is banned
          const userProfileDoc = await this.firestore.collection('profiles').doc(userData.userID).get().toPromise();
          const userProfileData: { userBanned: boolean } | undefined = userProfileDoc?.data() as { userBanned: boolean } | undefined; // Add type assertion for userProfileData
          if (userProfileData && !userProfileData.userBanned) {
            nonBannedUsers.push(userData);
          }
        }
        // If there are non-banned users, select a random one
        if (nonBannedUsers.length > 0) {
          const randomIndex = Math.floor(Math.random() * nonBannedUsers.length);
          return nonBannedUsers[randomIndex];
        } else {
          return null; // No non-banned users found
        }
      } else {
        return null; // No users found
      }
    } catch (error) {
      console.error('Error getting random user:', error);
      return null;
    }
  }
  
}
