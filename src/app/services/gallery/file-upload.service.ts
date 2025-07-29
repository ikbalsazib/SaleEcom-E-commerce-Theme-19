import { HttpClient } from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import { environment } from '../../../environments/environment';
import { UtilsService } from '../core/utils.service';
import { ImageUploadResponse, ResponsePayload } from '../../interfaces/core/response-payload.interface';

// const API_UPLOAD = environment.ftpBaseLink + '/api/upload/';
const API_UPLOAD = environment.ftpBaseLink + environment.ftpPrefix + '/upload/';


@Injectable({
  providedIn: 'root',
})
export class FileUploadService {

  // Inject
  private httpClient = inject(HttpClient);
  private utilsService = inject(UtilsService);

  /**
   * UPLOAD IMAGE
   * uploadSingleImage()
   * uploadMultiImageOriginal()
   */

  uploadSingleImage(fileData: any) {
    const data = new FormData();
    data.append('folderPath', fileData.folderPath);
    data.append('image', fileData.file, fileData.fileName);
    return this.httpClient.post<{ message: string; url: string }>(
      API_UPLOAD + 'single-image',
      data
    );
  }

  uploadMultiImageOriginal(files: File[]) {
    const data = new FormData();
    files.forEach((f) => {
      const fileName =
        this.utilsService.getImageName(f.name) +
        this.utilsService.getRandomInt(100, 5000) +
        '.' +
        f.name.split('.').pop();
      data.append('imageMulti', f);
    });
    return this.httpClient.post<ImageUploadResponse[]>(
      API_UPLOAD + 'multiple-image',
      data
    );
  }

  /**
   * REMOVE IMAGE
   * removeSingleFile
   */

  removeSingleFile(url: string) {
    return this.httpClient.post<{ message: string }>(
      API_UPLOAD + 'delete-single-image',
      { url }
    );
  }
}
