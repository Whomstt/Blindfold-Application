import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.css']
})
export class SearchListComponent implements OnInit {
  searchQuery: string = ''; 
  searchResults: any[] = []; 
  currentUserID: string | null = null; 
  currentUserSeeking: string = ''; 
  currentUserGender: string = '';
  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    private router: Router,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.searchQuery = params['query'] || ''; 
      console.log('Search query:', this.searchQuery); 
      await this.fetchUsernames(); 
    });

   
    this.getCurrentUser();
  }

 async fetchUsernames() {
  try {
    
    this.currentUserSeeking = await this.firebaseService.getCurrentUserSeeking();
    this.currentUserGender = await this.firebaseService.getCurrentUserGender();
    console.log('Current user seeking preference:', this.currentUserSeeking);

    this.firestore.collection('users').valueChanges().subscribe(
      (users: any[]) => {
        this.firestore.collection('profiles').valueChanges().subscribe(
          (profiles: any[]) => {
            const matchedResults = users.map(user => {
              const profile = profiles.find(p => p.userID === user.userID);
              if (profile && !profile.userBanned) {
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
            const interests = searchTerms.slice(1);
            const currentUserSeeking = this.currentUserSeeking;

         this.searchResults = matchedResults.filter(result =>
    result &&
    result.user &&
    result.userID !== this.currentUserID &&
    result.user.userType !== 'Admin' &&
    (
        
        (result.user.userName.toLowerCase().startsWith(searchTerms[0].toLowerCase()) ||
        result.profile.userRealName.toLowerCase().startsWith(searchTerms[0].toLowerCase()))
    ) &&
    (
        
        (
          (currentUserSeeking === 'both' &&
          (this.currentUserGender === result?.profile?.userSeeking || result?.profile?.userSeeking === 'both'))
        ) ||
        (
            currentUserSeeking !== 'both' &&
            result?.profile?.userGender.toLowerCase() === currentUserSeeking.toLowerCase() &&
            this.currentUserGender === result?.profile?.userSeeking
        )
    ) &&
    (
        
        interests.length === 0 ||
        interests.some(interest =>
            result?.profile['user' + interest.charAt(0).toUpperCase() + interest.slice(1).toLowerCase()] === true
        )
    )
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
  } catch (error) {
    console.error('Error fetching current user seeking preference:', error);
  }
}


  async getCurrentUser() {
    this.currentUserID = await this.firebaseService.getCurrentUserID();
    this.currentUserSeeking = await this.firebaseService.getCurrentUserSeeking();
    console.log('Current user ID:', this.currentUserID);
    console.log('Current user seeking preference:', this.currentUserSeeking);
  }

  viewProfile(userID: string) {
    this.router.navigate(['/view-other-profile', userID]); 
  }
}