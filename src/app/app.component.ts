import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore'; 
import { Router } from '@angular/router';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  items: Observable<any[]> | undefined;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.checkBannedStatus(user.uid);
      } else {
        // If user is not logged in, redirect to login page or another appropriate page
        this.router.navigate(['/login']);
      }
    });
  }

  checkBannedStatus(uid: string): void {
    // Fetch profile data from "profiles" collection
    this.firestore.collection('profiles').doc(uid).valueChanges().pipe(
      map((profileData: any) => profileData && profileData.userBanned === true),
      catchError(error => {
        console.error('Error checking banned status:', error);
        return throwError(error);
      })
    ).subscribe(isBanned => {
      if (isBanned) {
        // Redirect to the banned page if the user is banned
        this.router.navigate(['/banned']);
      } else {
        // If the user is not banned, check if they are an admin
        this.checkAdminStatus(uid);
      }
    });
  }

  checkAdminStatus(uid: string): void {
    // Fetch user data from "users" collection
    this.firestore.collection('users').doc(uid).valueChanges().pipe(
      map((userData: any) => userData && userData.userType === 'Admin'),
      catchError(error => {
        console.error('Error checking admin status:', error);
        return throwError(error);
      })
    ).subscribe(isAdmin => {
      if (isAdmin) {
        // Navigate to the admin page if the user is an admin
        this.router.navigate(['/admin']);
      } else {
        // If the user is not an admin, redirect to the home page
        this.router.navigate(['/home']);
      }
    });
  }
}
