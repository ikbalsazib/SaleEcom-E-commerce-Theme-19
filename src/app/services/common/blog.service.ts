import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Blog} from '../../interfaces/common/blog.interface';
import {FilterData} from "../../interfaces/core/filter-data";
import {Observable, of, tap} from "rxjs";
import {Brand} from "../../interfaces/common/brand.interface";

const API_BLOGS = `${environment.apiBaseLink}/api/blog/`;
@Injectable({
  providedIn: 'root',
})
export class BlogService {


  // Store Data
  private readonly cacheKey: string = 'blog_cache';
  private blogCache: Map<string, { data: Blog[]; message: string; success: boolean }> = new Map();

  constructor(private httpClient: HttpClient) {}

  /**
   * BLOG HTTP REQUEST
   * getAllBlogs()
   * getBlogById()
   */

  getAllBlogs(): Observable<{
    data: Blog[];
    success: boolean;
    message: string;
  }> {
    if (this.blogCache.has(this.cacheKey)) {
      return of(this.blogCache.get(this.cacheKey) as {
        data: Blog[];
        success: boolean;
        message: string;
      });
    }

    return this.httpClient
      .get<{
        data: Blog[];
        success: boolean;
        message: string;
      }>(API_BLOGS + 'get-all-data')
      .pipe(
        tap((response) => {
          // Cache the response
          this.blogCache.set(this.cacheKey, response);
        })
      );
  }


  // getAllBlog(filterData: FilterData, searchQuery?: string) {
  //   let params = new HttpParams();
  //   if (searchQuery) {
  //     params = params.append('q', searchQuery);
  //   }
  //   return this.httpClient.post<{
  //     data: Blog[];
  //     count: number;
  //     success: boolean;
  //     calculation: any;
  //   }>(API_BLOGS + 'get-all/', filterData, { params });
  // }



  getAllBlog(filterData: FilterData, searchQuery?: string) {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.append('q', searchQuery);
    }
    return this.httpClient.post<{ data: Brand[], count: number, success: boolean }>(API_BLOGS + 'get-all-by-shop', filterData, {params});
  }

  getBlogById(id: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Blog;
      message: string;
      success: boolean;
    }>(API_BLOGS + 'get-by/' + id, { params });
  }


  getBlogBySlug(slug: string, select?: string) {
    let params = new HttpParams();
    if (select) {
      params = params.append('select', select);
    }
    return this.httpClient.get<{
      data: Blog;
      message: string;
      success: boolean;
    }>(API_BLOGS + 'get-by-slug/' + slug, { params });
  }


  getAllBlogsCount(data: any) {
    return this.httpClient.post<{ success: boolean }>(API_BLOGS + 'blog-view-count', data);
  }
}
