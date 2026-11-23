import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { HeroComponent } from './hero/hero.component';
import { CategoryNavComponent } from './category-nav/category-nav.component';
import { FeaturedComponent } from './featured/featured.component';
import { KunafaSpotlightComponent } from './kunafa-spotlight/kunafa-spotlight.component';
import { MenuComponent } from './menu/menu.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';
import { FloatingWhatsappComponent } from './floating-whatsapp/floating-whatsapp.component';

@Component({
  selector: 'app-website',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    CategoryNavComponent,
    FeaturedComponent,
    KunafaSpotlightComponent,
    MenuComponent,
    AboutComponent,
    ContactComponent,
    FooterComponent,
    FloatingWhatsappComponent
  ],
  templateUrl: './website.component.html',
  styleUrl: './website.component.scss'
})
export class WebsiteComponent {
  @Output() openHoursModal = new EventEmitter<void>();
}
