import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserInfo } from '../../models/auth.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
    private listTitles: any[];
    location: Location;
    mobile_menu_visible: any = 0;
    private toggleButton: any;
    private sidebarVisible: boolean;
    private userSubscription: Subscription;
    private tokenExpiringSubscription: Subscription;

    public isCollapsed = true;
    public currentUser: UserInfo | null = null;
    
    // Modal de confirmación de logout
    public showLogoutModal = false;
    
    // Alerta de token expirando
    public showTokenWarning = false;
    public tokenMinutesLeft = 0;

    constructor(
      location: Location,
      private element: ElementRef,
      private router: Router,
      private authService: AuthService,
      private modalService: NgbModal
    ) {
      this.location = location;
      this.sidebarVisible = false;
    }

    ngOnInit(){
      this.listTitles = ROUTES.filter(listTitle => listTitle);
      const navbar: HTMLElement = this.element.nativeElement;
      this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
      this.router.events.subscribe((event) => {
        this.sidebarClose();
         var $layer: any = document.getElementsByClassName('close-layer')[0];
         if ($layer) {
           $layer.remove();
           this.mobile_menu_visible = 0;
         }
     });

      // Suscribirse a los cambios del usuario
      this.userSubscription = this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      });

      // Suscribirse a alertas de token expirando
      this.tokenExpiringSubscription = this.authService.tokenExpiring$.subscribe(minutesLeft => {
        this.tokenMinutesLeft = minutesLeft;
        this.showTokenWarning = true;
      });
    }

    ngOnDestroy() {
      if (this.userSubscription) {
        this.userSubscription.unsubscribe();
      }
      if (this.tokenExpiringSubscription) {
        this.tokenExpiringSubscription.unsubscribe();
      }
    }

    // Mostrar modal de confirmación de logout
    confirmLogout(): void {
      this.showLogoutModal = true;
    }

    // Cancelar logout
    cancelLogout(): void {
      this.showLogoutModal = false;
    }

    // Confirmar y ejecutar logout
    logout(): void {
      this.showLogoutModal = false;
      this.authService.logout();
    }

    // Extender sesión
    extendSession(): void {
      this.showTokenWarning = false;
      this.authService.extendSession();
    }

    // Cerrar alerta de token sin extender
    dismissTokenWarning(): void {
      this.showTokenWarning = false;
    }

    // Cerrar sesión desde alerta de token
    logoutFromWarning(): void {
      this.showTokenWarning = false;
      this.authService.logout();
    }

    getUserInitials(): string {
      if (this.currentUser && this.currentUser.nombre) {
        const parts = this.currentUser.nombre.split(' ');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
      }
      return 'US';
    }

    getUserPhotoUrl(): string | null {
      if (this.currentUser && this.currentUser.fotoUrl) {
        return 'http://localhost:8080' + this.currentUser.fotoUrl;
      }
      return null;
    }

    collapse(){
      this.isCollapsed = !this.isCollapsed;
      const navbar = document.getElementsByTagName('nav')[0];
      console.log(navbar);
      if (!this.isCollapsed) {
        navbar.classList.remove('navbar-transparent');
        navbar.classList.add('bg-white');
      }else{
        navbar.classList.add('navbar-transparent');
        navbar.classList.remove('bg-white');
      }

    }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const mainPanel =  <HTMLElement>document.getElementsByClassName('main-panel')[0];
        const html = document.getElementsByTagName('html')[0];
        if (window.innerWidth < 991) {
          mainPanel.style.position = 'fixed';
        }

        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);

        html.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const html = document.getElementsByTagName('html')[0];
        this.toggleButton.classList.remove('toggled');
        const mainPanel =  <HTMLElement>document.getElementsByClassName('main-panel')[0];

        if (window.innerWidth < 991) {
          setTimeout(function(){
            mainPanel.style.position = '';
          }, 500);
        }
        this.sidebarVisible = false;
        html.classList.remove('nav-open');
    };
    sidebarToggle() {
        // const toggleButton = this.toggleButton;
        // const html = document.getElementsByTagName('html')[0];
        var $toggle = document.getElementsByClassName('navbar-toggler')[0];

        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
        const html = document.getElementsByTagName('html')[0];

        if (this.mobile_menu_visible == 1) {
            // $('html').removeClass('nav-open');
            html.classList.remove('nav-open');
            if ($layer) {
                $layer.remove();
            }
            setTimeout(function() {
                $toggle.classList.remove('toggled');
            }, 400);

            this.mobile_menu_visible = 0;
        } else {
            setTimeout(function() {
                $toggle.classList.add('toggled');
            }, 430);

            var $layer = document.createElement('div');
            $layer.setAttribute('class', 'close-layer');


            if (html.querySelectorAll('.main-panel')) {
                document.getElementsByClassName('main-panel')[0].appendChild($layer);
            }else if (html.classList.contains('off-canvas-sidebar')) {
                document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
            }

            setTimeout(function() {
                $layer.classList.add('visible');
            }, 100);

            $layer.onclick = function() { //asign a function
              html.classList.remove('nav-open');
              this.mobile_menu_visible = 0;
              $layer.classList.remove('visible');
              setTimeout(function() {
                  $layer.remove();
                  $toggle.classList.remove('toggled');
              }, 400);
            }.bind(this);

            html.classList.add('nav-open');
            this.mobile_menu_visible = 1;

        }
    };

    getTitle(){
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 2 );
      }
      titlee = titlee.split('/').pop();

      for(var item = 0; item < this.listTitles.length; item++){
          if(this.listTitles[item].path === titlee){
              return this.listTitles[item].title;
          }
      }
      return 'Dashboard';
    }
}
