//  Copyright 2018 Scandit AG
//
//  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software distributed under the
//  License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
//  express or implied. See the License for the specific language governing permissions and
//  limitations under the License.

#import "SBSSampleBufferConverter.h"

@implementation SBSSampleBufferConverter

+ (NSString *)base64StringFromFrame:(CMSampleBufferRef)frame {
    CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(frame);
    // Lock the base address of the pixel buffer.
    CVPixelBufferLockBaseAddress(imageBuffer,0);

    // Get the pixel buffer width and height.
    size_t width = CVPixelBufferGetWidth(imageBuffer);
    size_t height = CVPixelBufferGetHeight(imageBuffer);

    void *baseAddress = CVPixelBufferGetBaseAddress(imageBuffer);

    CVPlanarPixelBufferInfo_YCbCrBiPlanar *bufferInfo = (CVPlanarPixelBufferInfo_YCbCrBiPlanar *)baseAddress;

    int yOffset = CFSwapInt32BigToHost(bufferInfo->componentInfoY.offset);
    int yRowBytes = CFSwapInt32BigToHost(bufferInfo->componentInfoY.rowBytes);
    int cbCrOffset = CFSwapInt32BigToHost(bufferInfo->componentInfoCbCr.offset);
    int cbCrRowBytes = CFSwapInt32BigToHost(bufferInfo->componentInfoCbCr.rowBytes);

    unsigned char *dataPtr = (unsigned char*)baseAddress;
    unsigned char *rgbaImage = (unsigned char*)malloc(4 * width * height);

    for (int x = 0; x < width; x++) {
        for (int y = 0; y < height; y++) {
            int ypIndex = yOffset + (x + y * yRowBytes);

            int yp = (int) dataPtr[ypIndex];

            unsigned char* cbCrPtr = dataPtr + cbCrOffset;
            unsigned char* cbCrLinePtr = cbCrPtr + cbCrRowBytes * (y >> 1);

            unsigned char cb = cbCrLinePtr[x & ~1];
            unsigned char cr = cbCrLinePtr[x | 1];

            // YpCbCr to RGB conversion as used in JPEG and MPEG
            // full-range:
            int r = yp                        + 1.402   * (cr - 128);
            int g = yp - 0.34414 * (cb - 128) - 0.71414 * (cr - 128);
            int b = yp + 1.772   * (cb - 128);

            r = MIN(MAX(r, 0), 255);
            g = MIN(MAX(g, 0), 255);
            b = MIN(MAX(b, 0), 255);
            //printf("x/y %d/%d\n", x, y);
            rgbaImage[(x + y * width) * 4] = (unsigned char) b;
            rgbaImage[(x + y * width) * 4 + 1] = (unsigned char) g;
            rgbaImage[(x + y * width) * 4 + 2] = (unsigned char) r;
            rgbaImage[(x + y * width) * 4 + 3] = (unsigned char) 255;
        }
    }

    // Create a device-dependent RGB color space.
    static CGColorSpaceRef colorSpace = NULL;
    if (colorSpace == NULL) {
        colorSpace = CGColorSpaceCreateDeviceRGB();
        if (colorSpace == NULL) {
            // Handle the error appropriately.
            free(rgbaImage);
            return nil;
        }

    }

    // Create a Quartz direct-access data provider that uses data we supply.
    CGDataProviderRef dataProvider = CGDataProviderCreateWithData(NULL, rgbaImage, 4 * width * height, NULL);

    // Create a bitmap image from data supplied by the data provider.
    CGImageRef cgImage = CGImageCreate(width, height, 8, 32, width * 4,
                                       colorSpace, kCGImageAlphaNoneSkipFirst | kCGBitmapByteOrder32Little,
                                       dataProvider, NULL, true, kCGRenderingIntentDefault);

    CGDataProviderRelease(dataProvider);

    // Create and return an image object to represent the Quartz image.
    UIImage *image = [UIImage imageWithCGImage:cgImage];

    // Create base64 String from UIImage
    NSString *base64String = [UIImagePNGRepresentation(image) base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
    CGImageRelease(cgImage);
    CVPixelBufferUnlockBaseAddress(imageBuffer, 0);
    free(rgbaImage);

    // Return a String which is easily readable by js side.
    return [@"data:image/png;base64," stringByAppendingString:base64String];
}

@end
