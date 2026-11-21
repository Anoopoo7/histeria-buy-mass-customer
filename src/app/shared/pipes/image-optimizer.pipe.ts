import { Pipe, PipeTransform } from '@angular/core';
import { ImageSizePreset, optimizeImageUrl } from '../../core/utils/image.utils';

@Pipe({
  name: 'bmImg',
  standalone: true,
})
export class ImageOptimizerPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    preset: ImageSizePreset = 'card',
    quality = 75,
  ): string {
    return optimizeImageUrl(value, preset, quality);
  }
}
