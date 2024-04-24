import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  
    searchQuery: string = ''; 
    searchResults: any[] = []; 
  
    constructor(
      private route: ActivatedRoute,
      private firestore: AngularFirestore,
      private router: Router
    ) { }
    ngOnInit() {
      this.route.queryParams.subscribe(params => {
        this.searchQuery = params['query'] || ''; 
        console.log('Search query:', this.searchQuery); 
        this.fetchUsernames(); 
      });
    }
  
    fetchUsernames() {
      this.firestore.collection('users').valueChanges().subscribe(
        (users: any[]) => {
          console.log('Users:', users);
    
          this.firestore.collection('profiles').valueChanges().subscribe(
            (profiles: any[]) => {
              console.log('Profiles:', profiles);
    
              const matchedResults = users.map(user => {
                const profile = profiles.find(p => p.userID === user.userID);
                if (profile) {
                  return {
                    user: user,
                    profile: profile,
                    userID: user.userID // Include userID here
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
    
              console.log('Search results:', this.searchResults);
            },
            error => {
              console.error('Error fetching profiles:', error);
            }
          );
        },
        error => {
          console.error('Error fetching users:', error);
        }
      );
    }
    viewProfile(userID: string) {
      this.router.navigate(['/view-other-profile', userID]); // Navigate to view_other_profile page with user ID
    }

    async banUser(userId: string) {
      try {
        await this.firestore.collection('profiles').doc(userId).update({ userBanned: true });
        console.log(`User with ID ${userId} is banned.`);
      } catch (error) {
        console.error('Error banning user:', error);
      }
    }
  
    async unbanUser(userId: string) {
      try {
        await this.firestore.collection('profiles').doc(userId).update({ userBanned: false });
        console.log(`User with ID ${userId} is unbanned.`);
      } catch (error) {
        console.error('Error unbanning user:', error);
      }
    }
  
    async deleteUser(userId: string) {
      try {
        await this.firestore.collection('users').doc(userId).delete();
        await this.firestore.collection('profiles').doc(userId).delete();
        console.log(`User with ID ${userId} is deleted.`);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
}
