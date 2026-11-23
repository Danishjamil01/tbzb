import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';
import { BusinessStatusService } from '../../../core/services/business-status.service';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { BUSINESS_CONFIG } from '../../../core/config/business.config';

@Component({
  selector: 'app-mobile-more',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './mobile-more.component.html',
  styleUrl: './mobile-more.component.scss'
})
export class MobileMoreComponent {
  platformService = inject(PlatformService);
  authService = inject(AuthService);
  private statusService = inject(BusinessStatusService);
  private adminService = inject(AdminService);
  config = BUSINESS_CONFIG;

  @Output() openAuth = new EventEmitter<void>();

  status = this.statusService.status;

  openAdminModal(): void {
    this.adminService.openAdmin();
  }
}
