import { Component, EventEmitter, Output } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  @Output() isLogout = new EventEmitter<void>();
  
  searchQuery: string = ''; 
  searchResults: any[] = []; 
  
    constructor(
      private route: ActivatedRoute,
      private firestore: AngularFirestore,
      private router: Router,
      private firebaseService: FirebaseService,
      private afAuth: AngularFireAuth,
      private storage: AngularFireStorage
    ) { }
    ngOnInit() {
      this.route.queryParams.subscribe(params => {
        this.searchQuery = params['query'] || ''; 
        this.fetchUsernames(); 
      });
    }

    async logout() {
      this.firebaseService.logout();
      this.isLogout.emit();
      this.router.navigate(['']);
    }
  
    fetchUsernames() {
      this.firestore.collection('users').valueChanges().subscribe(
        (users: any[]) => {
    
          this.firestore.collection('profiles').valueChanges().subscribe(
            (profiles: any[]) => {
    
              const matchedResults = users.map(user => {
                const profile = profiles.find(p => p.userID === user.userID);
                if (profile) {
                  return {
                    user: user,
                    profile: profile,
                    userID: user.userID 
                  };
                } else {
                  console.warn(`Profile not found for user with userID: ${user.userID}`);
                  return null;
                }
              }).filter(Boolean); 
              const searchTerms = this.searchQuery.split(',').map(term => term.trim());
    
              const interests = searchTerms.slice(3);
    
              this.searchResults = matchedResults.filter(result =>
                result && result.user &&
                (result.user.userName.toLowerCase().startsWith(searchTerms[0].toLowerCase()) ||
                    result.profile.userRealName.toLowerCase().startsWith(searchTerms[0].toLowerCase())) &&
                (searchTerms[1] ? result.profile.userAge >= parseInt(searchTerms[1]) : true) && 
                (searchTerms[2] ? result.profile.userAge <= parseInt(searchTerms[2]) : true) && 
                (interests.length === 0 || interests.some(interest => result.profile['user' + interest.charAt(0).toUpperCase() + interest.slice(1).toLowerCase()] === true))
              );
    
            },
            error => {
            }
          );
        },
        error => {
        }
      );
    }
    viewProfile(userID: string) {
      this.router.navigate(['/view-other-profile', userID]); 
    }

    async banUser(userId: string) {
      try {
        await this.firestore.collection('profiles').doc(userId).update({ userBanned: true });
      } catch (error) {
        console.error('Error banning user:', error);
      }
    }
  
    async unbanUser(userId: string) {
      try {
        await this.firestore.collection('profiles').doc(userId).update({ userBanned: false });
      } catch (error) {
        console.error('Error unbanning user:', error);
      }
    }
    async admin(userId: string) {
      try {
        await this.firestore.collection('users').doc(userId).update({ userType: "Admin" });
      } catch (error) {
        console.error('Error creating admin:', error);
      }
    }
    async unAdmin(userId: string) {
      try {
        await this.firestore.collection('users').doc(userId).update({ userType: "User" });
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }
  
    async deleteUser(userId: string) {
      try {
        await this.firestore.collection('users').doc(userId).delete();
        await this.firestore.collection('profiles').doc(userId).delete();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
}
