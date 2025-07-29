
import {Pipe, PipeTransform} from '@angular/core';
import {environment} from '../../../environments/environment';
import {UtilsService} from '../../services/core/utils.service';

@Pipe({
  name: 'imgCtrl',
  standalone: true
})
export class ImgCtrlPipe implements PipeTransform {

  constructor(
    private utilsService: UtilsService
  ) {
  }
  transform(url: string, type: 'filename' | 'width' | 'height'): any {
    const cdnBaseUrl = environment.ftpPrefixPath;

    if (url) {
      const mUrl = new URL(url);
      const searchParams = mUrl.searchParams;
      const resolution = searchParams.get('resolution')
      const [width, height] = resolution ? resolution.split('_') : [null, null]

      switch (type) {
        case 'filename':
          const path = url.replace(cdnBaseUrl, '');
          return this.utilsService.removeUrlQuery(path);

        case 'width':
          return width ? +width : null;

        case 'height':
          return height ? +height : null;
      }
    }
    return null;
  }

}
