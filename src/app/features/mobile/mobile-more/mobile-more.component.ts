import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';
import { BusinessStatusService } from '../../../core/services/business-status.service';
import { AdminService } from '../../../core/services/admin.service';
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
  private statusService = inject(BusinessStatusService);
  private adminService = inject(AdminService);
  config = BUSINESS_CONFIG;

  status = this.statusService.status;

  openAdminModal(): void {
    this.adminService.openAdmin();
  }
}
