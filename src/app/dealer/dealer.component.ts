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
      const currentUser = await this.afAuth.currentUser;
      if (currentUser) {
        const currentUserId = currentUser.uid;
  
        const currentUserDoc = await this.firestore.collection('profiles').doc(currentUserId).get().toPromise();
        const currentUserData = currentUserDoc?.data() as { userGender: string, userSeeking: string } | undefined;
        const userGender = currentUserData?.userGender || '';
        const userSeeking = currentUserData?.userSeeking || '';
    
        let randomUser;
        if (userSeeking === 'both') {
          randomUser = await this.getRandomUser(currentUserId, ['male', 'female', 'other'], userGender, userSeeking);
        } else {
          randomUser = await this.getRandomUser(currentUserId, [userSeeking], userGender, userSeeking);
        }
  
  
        if (randomUser) {
          this.router.navigate(['/view-other-profile', randomUser.userID]);
        } else {
        }
      }
    } catch (error) {
      console.error('Error finding match:', error);
    }
  }
  
  async getRandomUser(currentUserId: string, genders: string[], currentUserGender: string, currentUserSeeking: string): Promise<any> {
    try {
      const usersSnapshot = await this.firestore.collection('users', ref => 
        ref.where('userID', '!=', currentUserId)
      ).get().toPromise();
      
      if (usersSnapshot && !usersSnapshot.empty) {
        const nonBannedUsers = [];
        for (const userDoc of usersSnapshot.docs) {
          const userData: any = userDoc.data();
          const userProfileDoc = await this.firestore.collection('profiles').doc(userData.userID).get().toPromise();
          const userProfileData: { userBanned: boolean, userGender: string, userSeeking: string } | undefined = userProfileDoc?.data() as { userBanned: boolean, userGender: string, userSeeking: string } | undefined;
          if (userProfileData && !userProfileData.userBanned && genders.includes(userProfileData.userGender) && 
            ((currentUserSeeking === 'both' && (userProfileData.userSeeking === currentUserGender || userProfileData.userSeeking === 'both')) || 
             (userProfileData.userSeeking === 'both' && currentUserSeeking === userProfileData.userGender))) {
            nonBannedUsers.push(userProfileData);
          }
        }
        if (nonBannedUsers.length > 0) {
          const randomIndex = Math.floor(Math.random() * nonBannedUsers.length);
          return nonBannedUsers[randomIndex];
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting random user:', error);
      return null;
    }
  }
}
