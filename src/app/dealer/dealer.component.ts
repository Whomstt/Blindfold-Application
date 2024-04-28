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
  
        // Get the current user's gender and seeking preferences
        const currentUserDoc = await this.firestore.collection('profiles').doc(currentUserId).get().toPromise();
        const currentUserData = currentUserDoc?.data() as { userGender: string, userSeeking: string } | undefined;
        const userGender = currentUserData?.userGender || '';
        const userSeeking = currentUserData?.userSeeking || '';
  
        console.log('Current user gender:', userGender);
        console.log('Current user seeking:', userSeeking);
  
        // Query Firestore for a random user (excluding the current user) whose gender matches the current user's seeking preference and the current user's gender matches the other user's seeking preference
        let randomUser;
        if (userSeeking === 'both') {
          // If the current user is seeking both, retrieve all user genders
          randomUser = await this.getRandomUser(currentUserId, ['male', 'female', 'other'], userGender, userSeeking);
        } else {
          // Otherwise, retrieve users based on the current user's seeking preference
          randomUser = await this.getRandomUser(currentUserId, [userSeeking], userGender, userSeeking);
        }
  
  
        // If a random user is found, navigate to their profile page
        if (randomUser) {
          console.log('Random user gender:', randomUser.userGender);
          console.log('Random user seeking:', randomUser.userSeeking);
          this.router.navigate(['/view-other-profile', randomUser.userID]);
        } else {
          console.log('No random user found matching seeking preference.');
        }
      }
    } catch (error) {
      console.error('Error finding match:', error);
    }
  }
  
  async getRandomUser(currentUserId: string, genders: string[], currentUserGender: string, currentUserSeeking: string): Promise<any> {
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
          const userProfileData: { userBanned: boolean, userGender: string, userSeeking: string } | undefined = userProfileDoc?.data() as { userBanned: boolean, userGender: string, userSeeking: string } | undefined; // Add type assertion for userProfileData
          if (userProfileData && !userProfileData.userBanned && genders.includes(userProfileData.userGender) && 
            ((currentUserSeeking === 'both' && (userProfileData.userSeeking === currentUserGender || userProfileData.userSeeking === 'both')) || 
             (userProfileData.userSeeking === 'both' && currentUserSeeking === userProfileData.userGender))) {
            nonBannedUsers.push(userProfileData);
          }
        }
        // If there are non-banned users whose gender matches the specified genders and seeking preference matches the current user's gender, select a random one
        if (nonBannedUsers.length > 0) {
          const randomIndex = Math.floor(Math.random() * nonBannedUsers.length);
          return nonBannedUsers[randomIndex];
        } else {
          return null; // No non-banned users found matching the specified genders and seeking preference
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
