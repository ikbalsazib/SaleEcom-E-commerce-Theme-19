import {Component, inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Router} from '@angular/router';
import {SocialLogin} from "../../../interfaces/common/setting.interface";
import {UtilsService} from "../../../services/core/utils.service";
import {SettingService} from "../../../services/common/setting.service";
import {Subscription} from "rxjs";
import {RegistrationFormComponent} from "./registration-form/registration-form.component";
import {Meta, Title} from "@angular/platform-browser";
import {CanonicalService} from "../../../services/core/canonical.service";
import {SeoPageService} from "../../../services/common/seo-page.service";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  standalone: true,
  imports: [
    RegistrationFormComponent
  ]
})
export class SignUpComponent implements OnInit, OnDestroy {

  // Store Data
  socialLogins: SocialLogin[] = [];
  loginFormValue: any;
  currentUrl: string;
  type: 'login' | 'signup' | '' = '';
  seoPageData: any;

  // Inject
  private readonly router = inject(Router);
  private readonly utilsService = inject(UtilsService);
  private readonly settingService = inject(SettingService);
  private readonly meta = inject(Meta);
  private readonly canonicalService = inject(CanonicalService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly seoPageService = inject(SeoPageService);
  private readonly title = inject(Title);

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.currentUrl = this.utilsService.removeUrlQuery(this.router.url);

    // Base Data
    this.getSocialLogins();
    this.getAllSeoPage();
  }


  /**
   * HTTP REQUEST HANDLE
   * getSocialLogins()
   */
  private getSocialLogins() {
    const subscription = this.settingService.getSocialLogins()
      .subscribe({
        next: (res) => {
          this.socialLogins = res.data;
        },
        error: (error) => {
          console.log(error);
        },
      });
    this.subscriptions?.push(subscription);
  }

  /**
   * onLoginFormSubmit()
   * onTypeChange()
   * title()
   * description()
   * onBack()
   */
  onLoginFormSubmit(event: any) {
    this.loginFormValue = event;
  }

  onTypeChange(event: any) {
    this.type = event;
  }

  get title1() {
    if (this.type === 'login') {
      return 'Login'
    } else if (this.type === 'signup') {
      return 'Signup'
    } else {
      return 'Login or Signup'
    }
  }

  get description() {
    if (this.type === 'login') {
      return 'Please enter your valid phone number and password for login.'
    } else if (this.type === 'signup') {
      return 'Please enter your valid information for signup.'
    } else {
      return 'Please continue with your phone number. we will auto-detect you can login or sign up'
    }
  }

  onBack() {
    if (this.type === 'signup') {
      this.type = '';
    } else {
      this.router.navigate(['/website-builder/choose-color']).then()
    }
  }

  private getAllSeoPage() {
    const subscription = this.seoPageService.getAllSeoPageByUi({status: 'publish', 'type': 'registration-page'}, 1, 1).subscribe({
      next: (res) => {
        this.seoPageData = res.data[0];
        if (isPlatformBrowser(this.platformId)) {
          this.updateMetaData();
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.subscriptions.push(subscription);
  }

  /**
   * updateMetaData()
   */

  private updateMetaData() {
    // Extract product information for reuse
    const seoTitle = this.seoPageData?.seoTitle ? this.seoPageData?.seoTitle : 'Registration page';
    const seoDescription = this.seoPageData?.seoDescription ? this.seoPageData?.seoDescription : this.seoPageData?.name;
    const imageUrl = this.seoPageData?.images ? this.seoPageData?.images[0] : ''; // Default to an empty string if no image is available
    const seoKeywords = this.seoPageData?.seoKeyword || ''; // Example: "organic honey, pure honey, raw honey"
    const url = window.location.href;

    // Title
    this.title.setTitle(seoTitle);

    // Meta Tags
    this.meta.updateTag({name: 'robots', content: 'index, follow'});
    this.meta.updateTag({name: 'theme-color', content: '#0000'});
    this.meta.updateTag({name: 'description', content: seoDescription});
    this.meta.updateTag({ name: 'keywords', content: seoKeywords });

    // Open Graph (og:)
    this.meta.updateTag({property: 'og:title', content: seoTitle});
    this.meta.updateTag({property: 'og:type', content: 'website'});
    this.meta.updateTag({property: 'og:url', content: url});
    this.meta.updateTag({property: 'og:image', content: imageUrl});
    this.meta.updateTag({property: 'og:image:type', content: 'image/jpeg'});
    this.meta.updateTag({property: 'og:image:width', content: '1200'}); // Recommended width
    this.meta.updateTag({property: 'og:image:height', content: '630'}); // Recommended height
    this.meta.updateTag({property: 'og:description', content: seoDescription});
    this.meta.updateTag({property: 'og:locale', content: 'en_US'});

    // Twitter Tags
    this.meta.updateTag({name: 'twitter:title', content: seoTitle});
    this.meta.updateTag({name: 'twitter:card', content: 'summary_large_image'});
    this.meta.updateTag({name: 'twitter:description', content: seoDescription});
    this.meta.updateTag({name: 'twitter:image', content: imageUrl}); // Image for Twitter

    // Microsoft
    this.meta.updateTag({name: 'msapplication-TileImage', content: imageUrl});

    // Canonical
    this.canonicalService.setCanonicalURL();
  }
  /**
   * On Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
