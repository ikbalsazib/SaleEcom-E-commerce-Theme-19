import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {BlogService} from "../../services/common/blog.service";
import {debounceTime, distinctUntilChanged, EMPTY, pluck, Subscription, switchMap} from "rxjs";
import {Blog} from "../../interfaces/common/blog.interface";
import {FilterData} from "../../interfaces/core/filter-data";
import {BlogCardOneComponent} from "../../shared/components/blog-cards/blog-card-one/blog-card-one.component";
import {BlogBannerComponent} from "./blog-banner/blog-banner.component";
import {MatIcon} from "@angular/material/icon";
import {FormsModule, NgForm} from "@angular/forms";
import {Pagination} from "../../interfaces/core/pagination";
import {Router} from "@angular/router";

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss',
  imports: [
    BlogCardOneComponent,
    BlogBannerComponent,
    MatIcon,
    FormsModule,
  ],
  standalone: true
})
export class BlogsComponent implements OnInit {
//Store Data
  allBlog: Blog[] = [];
  isLoadBlog = false;

  // Pagination
  currentPage = 1;
  totalBlogs = 0;
  blogsPerPage = 100;
  totalBlogsStore = 0;
  holdPrevData: Blog[] = [];


  // SEARCH AREA
  searchBlogs: Blog[] = [];
  searchQuery = null;
  @ViewChild('searchForm') searchForm: NgForm;

  private readonly blogService = inject(BlogService);
  private readonly router = inject(Router);

  // Subscription
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.getAllBlogs();
  }


  ngAfterViewInit(): void {
    const formValue = this.searchForm.valueChanges;
    const subForm = formValue.pipe(
      // map(t => t.searchTerm)
      // filter(() => this.searchForm.valid),
      pluck('searchTerm'),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(data => {
        this.searchQuery = data;
        if (this.searchQuery === '' || this.searchQuery === null) {
          this.searchBlogs = [];
          this.allBlog = this.holdPrevData;
          this.totalBlogs = this.totalBlogsStore;
          this.searchQuery = null;
          return EMPTY;
        }
        const pagination: Pagination = {
          pageSize: Number(this.blogsPerPage),
          currentPage: Number(this.currentPage) - 1
        };
        // Select
        const mSelect = {
          title: 1,
          image: 1,
          images: 1,
          slug: 1,
          totalView: 1,
          authorName: 1,
          description: 1,
          shortDesc: 1,
          createdAt: 1,
          priority: 1,
        }

        const filterData: FilterData = {
          pagination: pagination,
          filter: {status: 'publish'},
          select: mSelect,
          sort: {createdAt: -1}
        }
        return this.blogService.getAllBlog(filterData, this.searchQuery);
      })
    )
      .subscribe({
        next: (res => {
          this.searchBlogs = res.data;
          this.allBlog = this.searchBlogs;
          this.totalBlogs = res.count;
          this.currentPage = 1;
          this.router.navigate([], {queryParams: {page: this.currentPage}});
        }),
        error: (error => {
          console.log(error)
        })
      });
    this.subscriptions.push(subForm);
  }

  /**
   * HTTP REQUEST HANDLE
   * getAllBlogs()
   */

  private getAllBlogs() {
    const mSelect = {
      title: 1,
      image: 1,
      images: 1,
      slug: 1,
      totalView: 1,
      authorName: 1,
      description: 1,
      shortDesc: 1,
      createdAt: 1,
      priority: 1
    }

    const filter: FilterData = {
      select: mSelect,
      filter: {status: 'publish'},
      pagination: null,
      sort: { priority: -1 }
    }

    const subBlogData = this.blogService.getAllBlog(filter).subscribe({
      next: (res) => {
        if (res.success) {
          this.allBlog = res.data;
          if (!this.searchQuery) {
            this.holdPrevData = res.data;
            this.totalBlogsStore = res.count;
          }
          this.isLoadBlog = true;
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
    this.subscriptions.push(subBlogData);
  }


  /**
   * ON Destroy
   */
  ngOnDestroy() {
    this.subscriptions?.forEach(sub => sub?.unsubscribe());
  }
}
