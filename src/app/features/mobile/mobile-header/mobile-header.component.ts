import { Component, inject, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PlatformService } from '../../../core/services/platform.service';
import { BusinessStatusService } from '../../../core/services/business-status.service';
import { MenuService } from '../../../core/services/menu.service';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './mobile-header.component.html',
  styleUrl: './mobile-header.component.scss'
})
export class MobileHeaderComponent implements OnInit {
  platformService = inject(PlatformService);
  private statusService = inject(BusinessStatusService);
  private menuService = inject(MenuService);

  @Output() openHoursModal = new EventEmitter<void>();

  status = this.statusService.status;
  searchQuery: string = '';

  ngOnInit(): void {
    // Match mobile status bar color with header background (#092819)
    if (typeof document !== 'undefined') {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', '#092819');
      }
    }
  }

  onLocationClick(): void {
    this.platformService.fetchRealLocation();
  }

  onSearchChange(val: string): void {
    this.menuService.searchQuery.set(val);
    if (val && this.platformService.activeTab() !== 'menu') {
      this.platformService.setTab('menu');
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.menuService.searchQuery.set('');
  }
}
