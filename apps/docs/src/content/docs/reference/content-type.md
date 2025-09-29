---
title: ContentType enum
description: Reference docs for the ContentType enumeration and utility functions
badge:
    text: Enum
    variant: caution
---

import { Tabs, TabItem } from '@astrojs/starlight/components';

The [`ContentType`](/reference/content-type) enum provides comprehensive MIME type definitions for content classification and HTTP headers. It includes all common file types used in web development, from text files to multimedia content.

## Definition

```typescript
enum ContentType {
  // Application types
  ApplicationJson = 'application/json',
  ApplicationPdf = 'application/pdf',
  ApplicationZip = 'application/zip',
  
  // Text types
  TextHtml = 'text/html',
  TextCss = 'text/css',
  TextJavascript = 'text/javascript',
  TextPlain = 'text/plain',
  
  // Image types
  ImagePng = 'image/png',
  ImageJpeg = 'image/jpeg',
  ImageGif = 'image/gif',
  ImageSvgxml = 'image/svg+xml',
  
  // Audio/Video types
  AudioMpeg = 'audio/mpeg',
  VideoMp4 = 'video/mp4',
  
  // And many more...
}
```

## Complete Enum Values

### Application Types
- `ApplicationEpubzip` - `'application/epub+zip'`
- `ApplicationGzip` - `'application/gzip'`
- `ApplicationJavaarchive` - `'application/java-archive'`
- `ApplicationJson` - `'application/json'`
- `ApplicationLdjson` - `'application/ld+json'`
- `ApplicationManifestJson` - `'application/manifest+json'`
- `ApplicationMsword` - `'application/msword'`
- `ApplicationOctetStream` - `'application/octet-stream'`
- `ApplicationOgg` - `'application/ogg'`
- `ApplicationPdf` - `'application/pdf'`
- `ApplicationRtf` - `'application/rtf'`
- `ApplicationVndamazonebook` - `'application/vnd.amazon.ebook'`
- `ApplicationVndappleinstallerxml` - `'application/vnd.apple.installer+xml'`
- `ApplicationVndmsexcel` - `'application/vnd.ms-excel'`
- `ApplicationVndmsfontobject` - `'application/vnd.ms-fontobject'`
- `ApplicationVndmspowerpoint` - `'application/vnd.ms-powerpoint'`
- `ApplicationVndmozillaxulxml` - `'application/vnd.mozilla.xul+xml'`
- `ApplicationVndoasisopendocumentpresentation` - `'application/vnd.oasis.opendocument.presentation'`
- `ApplicationVndoasisopendocumentspreadsheet` - `'application/vnd.oasis.opendocument.spreadsheet'`
- `ApplicationVndoasisopendocumenttext` - `'application/vnd.oasis.opendocument.text'`
- `ApplicationVndopenxmlformatsofficedocumentpresentationmlpresentation` - `'application/vnd.openxmlformats-officedocument.presentationml.presentation'`
- `ApplicationVndopenxmlformatsofficedocumentspreadsheetmlsheet` - `'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'`
- `ApplicationVndopenxmlformatsofficedocumentwordprocessingmldocument` - `'application/vnd.openxmlformats-officedocument.wordprocessingml.document'`
- `ApplicationX7zcompressed` - `'application/x-7z-compressed'`
- `ApplicationXabiword` - `'application/x-abiword'`
- `ApplicationXcdf` - `'application/x-cdf'`
- `ApplicationXcsh` - `'application/x-csh'`
- `ApplicationXfreearc` - `'application/x-freearc'`
- `ApplicationXhttpdphp` - `'application/x-httpd-php'`
- `ApplicationXbzip` - `'application/x-bzip'`
- `ApplicationXbzip2` - `'application/x-bzip2'`
- `ApplicationXsh` - `'application/x-sh'`
- `ApplicationXtar` - `'application/x-tar'`
- `ApplicationXhtmlxml` - `'application/xhtml+xml'`
- `ApplicationXml` - `'application/xml'`
- `ApplicationZip` - `'application/zip'`

### Audio Types
- `Audio3gpp` - `'audio/3gpp'`
- `Audio3gpp2` - `'audio/3gpp2'`
- `AudioAac` - `'audio/aac'`
- `AudioMidi` - `'audio/midi'`
- `AudioMpeg` - `'audio/mpeg'`
- `AudioOgg` - `'audio/ogg'`
- `AudioOpus` - `'audio/ogg'`
- `AudioWav` - `'audio/wav'`
- `AudioWebm` - `'audio/webm'`

### Font Types
- `FontOtf` - `'font/otf'`
- `FontTtf` - `'font/ttf'`
- `FontWoff` - `'font/woff'`
- `FontWoff2` - `'font/woff2'`

### Image Types
- `ImageApng` - `'image/apng'`
- `ImageAvif` - `'image/avif'`
- `ImageBmp` - `'image/bmp'`
- `ImageGif` - `'image/gif'`
- `ImageJpeg` - `'image/jpeg'`
- `ImagePng` - `'image/png'`
- `ImageSvgxml` - `'image/svg+xml'`
- `ImageVndmicrosofticon` - `'image/vnd.microsoft.icon'`
- `ImageWebp` - `'image/webp'`

### Text Types
- `Markdown` - `'text/markdown'`
- `TextCalendar` - `'text/calendar'`
- `TextCss` - `'text/css'`
- `TextCsv` - `'text/csv'`
- `TextHtml` - `'text/html'`
- `TextJavascript` - `'text/javascript'`
- `TextPlain` - `'text/plain'`

### Video Types
- `Video3gpp` - `'video/3gpp'`
- `Video3gpp2` - `'video/3gpp2'`
- `VideoMp2t` - `'video/mp2t'`
- `VideoMp4` - `'video/mp4'`
- `VideoMpeg` - `'video/mpeg'`
- `VideoOgg` - `'video/ogg'`
- `VideoWebm` - `'video/webm'`
- `VideoXmsvideo` - `'video/x-msvideo'`

## Utility Functions

### `contentTypeFromExtension(ext)`

Gets ContentType from file extension.

**Returns:** [`ContentType`](/reference/content-type)

#### Parameters

##### `ext`
The file extension (without the dot).

**Type:** `string`

<Tabs>
  <TabItem label="Common extensions">

```typescript
import { contentTypeFromExtension } from '@cmdoss/site-builder';

console.log(contentTypeFromExtension('html')); // ContentType.TextHtml
console.log(contentTypeFromExtension('css'));  // ContentType.TextCss
console.log(contentTypeFromExtension('js'));   // ContentType.TextJavascript
console.log(contentTypeFromExtension('png'));  // ContentType.ImagePng
console.log(contentTypeFromExtension('json')); // ContentType.ApplicationJson
```

  </TabItem>
  <TabItem label="Edge cases">

```typescript
console.log(contentTypeFromExtension('htm'));   // ContentType.TextHtml
console.log(contentTypeFromExtension('mjs'));   // ContentType.TextJavascript
console.log(contentTypeFromExtension('jpg'));   // ContentType.ImageJpeg
console.log(contentTypeFromExtension('unknown')); // ContentType.ApplicationOctetStream
```

  </TabItem>
</Tabs>

### `contentTypeFromFilePath(path)`

Gets ContentType from file path.

**Returns:** [`ContentType`](/reference/content-type)

#### Parameters

##### `path`
The full file path.

**Type:** `string`

<Tabs>
  <TabItem label="File paths">

```typescript
import { contentTypeFromFilePath } from '@cmdoss/site-builder';

console.log(contentTypeFromFilePath('/index.html'));     // ContentType.TextHtml
console.log(contentTypeFromFilePath('/style.css'));      // ContentType.TextCss
console.log(contentTypeFromFilePath('/script.js'));      // ContentType.TextJavascript
console.log(contentTypeFromFilePath('/logo.png'));       // ContentType.ImagePng
console.log(contentTypeFromFilePath('/data.json'));      // ContentType.ApplicationJson
console.log(contentTypeFromFilePath('/image.jpg'));      // ContentType.ImageJpeg
```

  </TabItem>
  <TabItem label="Nested paths">

```typescript
console.log(contentTypeFromFilePath('/assets/images/logo.png'));    // ContentType.ImagePng
console.log(contentTypeFromFilePath('/src/components/Button.tsx')); // ContentType.ApplicationOctetStream
console.log(contentTypeFromFilePath('/docs/README.md'));            // ContentType.Markdown
```

  </TabItem>
</Tabs>

### `contentTypeFromString(value)`

Converts string to ContentType enum.

**Returns:** [`ContentType`](/reference/content-type)

#### Parameters

##### `value`
The MIME type string.

**Type:** `string`

<Tabs>
  <TabItem label="Valid MIME types">

```typescript
import { contentTypeFromString } from '@cmdoss/site-builder';

console.log(contentTypeFromString('text/html'));           // ContentType.TextHtml
console.log(contentTypeFromString('application/json'));    // ContentType.ApplicationJson
console.log(contentTypeFromString('image/png'));           // ContentType.ImagePng
console.log(contentTypeFromString('text/css'));            // ContentType.TextCss
```

  </TabItem>
  <TabItem label="Error handling">

```typescript
try {
  const contentType = contentTypeFromString('invalid/mime-type');
} catch (error) {
  console.error('Invalid MIME type:', error.message);
  // Throws: "Invalid conversion to content type"
}
```

  </TabItem>
</Tabs>

## Usage Examples

### Setting Headers for Resources

```typescript
import { contentTypeFromFilePath } from '@cmdoss/site-builder';

const assets = [
  { path: '/index.html', content: htmlContent },
  { path: '/style.css', content: cssContent },
  { path: '/script.js', content: jsContent },
  { path: '/logo.png', content: pngContent }
];

const resources = assets.map(asset => ({
  full_path: asset.path,
  unencoded_size: asset.content.length,
  info: {
    path: asset.path,
    headers: {
      'content-type': contentTypeFromFilePath(asset.path),
      'content-encoding': 'identity'
    }
    // ... other properties
  }
}));
```

### Content Type Validation

```typescript
import { ContentType, contentTypeFromString } from '@cmdoss/site-builder';

function validateContentType(mimeType: string): boolean {
  try {
    const contentType = contentTypeFromString(mimeType);
    return Object.values(ContentType).includes(contentType);
  } catch {
    return false;
  }
}

console.log(validateContentType('text/html'));      // true
console.log(validateContentType('invalid/type'));   // false
```

### Dynamic Content Type Detection

```typescript
import { contentTypeFromFilePath, ContentType } from '@cmdoss/site-builder';

function getAssetContentType(filePath: string): string {
  const contentType = contentTypeFromFilePath(filePath);
  
  // Add additional headers based on content type
  const headers: Record<string, string> = {
    'content-type': contentType
  };
  
  if (contentType === ContentType.TextHtml) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }
  
  if (contentType.startsWith('image/')) {
    headers['Cache-Control'] = 'public, max-age=31536000';
  }
  
  return headers['content-type'];
}
```

## Related Types

- [`Resource`](/reference/resource) - Resource structure that uses ContentType
- [`WSResources`](/reference/ws-resources) - Site configuration that may include content type headers
- [`SuiResource`](/reference/sui-resource) - On-chain resource with content type headers
