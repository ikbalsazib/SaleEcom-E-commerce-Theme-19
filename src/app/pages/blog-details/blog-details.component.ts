import { DatePipe, NgIf } from "@angular/common";
import { AfterViewInit, Component, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule } from "@angular/forms";
import { MatIcon } from "@angular/material/icon";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Blog } from "../../interfaces/common/blog.interface";
import { User } from "../../interfaces/common/user.interface";
import { BlogService } from "../../services/common/blog.service";
import { CommentService } from "../../services/common/comment.service";
import { UserService } from "../../services/common/user.service";
import { ReloadService } from "../../services/core/reload.service";
import { UiService } from "../../services/core/ui.service";
import { UtilsService } from "../../services/core/utils.service";
import { BlogCardOneComponent } from "../../shared/components/blog-cards/blog-card-one/blog-card-one.component";
import { SwiperComponent } from "../../shared/components/swiper/swiper.component";
import { ImageLoadErrorDirective } from "../../shared/directives/image-load-error.directive";
import { SafeHtmlCustomPipe } from "../../shared/pipes/safe-html.pipe";
import { AllCommentsComponent } from "./all-comments/all-comments.component";

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss',
  imports: [
    NgIf,
    SafeHtmlCustomPipe,
    DatePipe,
    ImageLoadErrorDirective,
    MatIcon,
    ReactiveFormsModule,
    AllCommentsComponent,
    BlogCardOneComponent,
    SwiperComponent,
  ],
  standalone: true
})
export class BlogDetailsComponent implements OnInit, OnDestroy, AfterViewInit {

  blog: Blog;
  slug: string | any;
  blogs: Blog[];

  isLoading: boolean = true;
  isLoadingBlog: boolean = true;
  language: string;
  
  // Swiper breakpoints configuration
  breakpoints = {
    1200: { slidesPerView: 4, spaceBetween: 20 },
    992: { slidesPerView: 3, spaceBetween: 15 },
    768: { slidesPerView: 2, spaceBetween: 15 },
    0: { slidesPerView: 1, spaceBetween: 10 }
  };
  
  // Store Data
  @ViewChild('formElement') formElement: NgForm;
  dataForm: FormGroup;
  user: User = null;

  private readonly reloadService = inject(ReloadService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly blogService = inject(BlogService);
  private readonly fb = inject(FormBuilder);
  private readonly uiService = inject(UiService);
  private readonly commentService = inject(CommentService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly utilsService = inject(UtilsService);
  private readonly platformId = inject(PLATFORM_ID);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initDataForm();
    const subParamData = this.activatedRoute.paramMap.subscribe(res => {
      this.slug = res.get('slug');
      if (this.slug) {
        this.getBlogBySlug(this.slug);
      }
    })
    this.subscriptions.push(subParamData);
  }

  ngAfterViewInit(): void {
    // Initialize after view is ready
  }

  /**
   * FORM CONTROL
   * initDataForm()
   * onSubmit()
   */
  private initDataForm() {
    this.dataForm = this.fb.group({
      // message: ['', Validators.required],
      user: [null],
      product: [null],
      userName: [null],
      name: [null],
      review: [null],
      // rating: [null],
      reviewDate: [null],
      replyDate: [null],
      status: ['draft'],
      // like: 0,
      // dislike: 0,
      // images: null,
    });
  }

  onSubmit() {
    if (this.dataForm.invalid) {
      this.uiService.message('Please complete all the required field.',"warn")
      return;
    }
    if (this.userService.getUserStatus()) {
      this.addComment();
    } else {
      this.router.navigate(['/login']);
      // this.reloadService.needRefreshWishList$();
    }
  }

  /**
   * HTTP REQ HANDLE
   * addContact()
   */
  private addComment() {
    const mData = {
      ...this.dataForm.value,
      ...{
        reviewDate: this.utilsService.getDateString(new Date()),
        blog:this.slug,
      }
    }
    const subDataOne = this.commentService.addComment(mData)
      .subscribe({
        next: (res => {
          this.uiService.message('Your review is under process',"success");
          // this.reloadService.needRefreshData$();
          this.formElement.resetForm();
        }),
        error: (error => {
          console.log(error);
        })
      });
    this.subscriptions.push(subDataOne);
  }

  getBlogBySlug(slug: string | any) {
    const subBlogData = this.blogService.getBlogBySlug(slug).subscribe({
      next: (res) => {
        if (res.success) {
          this.blog = res.data;
          if (this.blog) {
            setTimeout(() => {
              this.getBlogCount();
            }, 1000)
            // Base Data
            this.getAllBlog();
          }
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
    this.subscriptions.push(subBlogData);
  }


  private getBlogCount() {
    const subGetData2 = this.blogService.getAllBlogsCount({
      id: this.blog._id,
    })
      .subscribe({
        next: (res) => {
        },
        error: (err) => {
          console.log(err);
        }
      });
    this.subscriptions.push(subGetData2);
  }


  /**
   * HTTP Request Handle
   * getAllBlog()
   **/
  private getAllBlog() {
    const subscription = this.blogService.getAllBlogs().subscribe({
      next: (res) => {
        // this.blogs = res.data;
        if (res.data && res.data.length) {
          this.blogs = res.data.filter(f => f.slug !== this.slug);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
    this.subscriptions?.push(subscription);
  }
  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
