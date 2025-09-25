/**
 * Content types for content of a page.
 *
 * The list is generated starting from
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 */
export enum ContentType {
  ApplicationEpubzip = 'application/epub+zip',
  ApplicationGzip = 'application/gzip',
  ApplicationJavaarchive = 'application/java-archive',
  ApplicationJson = 'application/json',
  ApplicationLdjson = 'application/ld+json',
  ApplicationManifestJson = 'application/manifest+json',
  ApplicationMsword = 'application/msword',
  ApplicationOctetStream = 'application/octet-stream',
  ApplicationOgg = 'application/ogg',
  ApplicationPdf = 'application/pdf',
  ApplicationRtf = 'application/rtf',
  ApplicationVndamazonebook = 'application/vnd.amazon.ebook',
  ApplicationVndappleinstallerxml = 'application/vnd.apple.installer+xml',
  ApplicationVndmsexcel = 'application/vnd.ms-excel',
  ApplicationVndmsfontobject = 'application/vnd.ms-fontobject',
  ApplicationVndmspowerpoint = 'application/vnd.ms-powerpoint',
  ApplicationVndmozillaxulxml = 'application/vnd.mozilla.xul+xml',
  ApplicationVndoasisopendocumentpresentation = 'application/vnd.oasis.opendocument.presentation',
  ApplicationVndoasisopendocumentspreadsheet = 'application/vnd.oasis.opendocument.spreadsheet',
  ApplicationVndoasisopendocumenttext = 'application/vnd.oasis.opendocument.text',
  ApplicationVndopenxmlformatsofficedocumentpresentationmlpresentation = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ApplicationVndopenxmlformatsofficedocumentspreadsheetmlsheet = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ApplicationVndopenxmlformatsofficedocumentwordprocessingmldocument = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ApplicationX7zcompressed = 'application/x-7z-compressed',
  ApplicationXabiword = 'application/x-abiword',
  ApplicationXcdf = 'application/x-cdf',
  ApplicationXcsh = 'application/x-csh',
  ApplicationXfreearc = 'application/x-freearc',
  ApplicationXhttpdphp = 'application/x-httpd-php',
  ApplicationXbzip = 'application/x-bzip',
  ApplicationXbzip2 = 'application/x-bzip2',
  ApplicationXsh = 'application/x-sh',
  ApplicationXtar = 'application/x-tar',
  ApplicationXhtmlxml = 'application/xhtml+xml',
  ApplicationXml = 'application/xml',
  ApplicationZip = 'application/zip',
  Audio3gpp = 'audio/3gpp',
  Audio3gpp2 = 'audio/3gpp2',
  AudioAac = 'audio/aac',
  AudioMidi = 'audio/midi',
  AudioMpeg = 'audio/mpeg',
  AudioOgg = 'audio/ogg',
  AudioOpus = 'audio/ogg',
  AudioWav = 'audio/wav',
  AudioWebm = 'audio/webm',
  FontOtf = 'font/otf',
  FontTtf = 'font/ttf',
  FontWoff = 'font/woff',
  FontWoff2 = 'font/woff2',
  ImageApng = 'image/apng',
  ImageAvif = 'image/avif',
  ImageBmp = 'image/bmp',
  ImageGif = 'image/gif',
  ImageJpeg = 'image/jpeg',
  ImagePng = 'image/png',
  ImageSvgxml = 'image/svg+xml',
  ImageVndmicrosofticon = 'image/vnd.microsoft.icon',
  ImageWebp = 'image/webp',
  Markdown = 'text/markdown',
  TextCalendar = 'text/calendar',
  TextCss = 'text/css',
  TextCsv = 'text/csv',
  TextHtml = 'text/html',
  TextJavascript = 'text/javascript',
  TextPlain = 'text/plain',
  Video3gpp = 'video/3gpp',
  Video3gpp2 = 'video/3gpp2',
  VideoMp2t = 'video/mp2t',
  VideoMp4 = 'video/mp4',
  VideoMpeg = 'video/mpeg',
  VideoOgg = 'video/ogg',
  VideoWebm = 'video/webm',
  VideoXmsvideo = 'video/x-msvideo'
}

/**
 * Get ContentType from file extension
 */
export function contentTypeFromExtension(ext: string): ContentType {
  switch (ext) {
    case 'aac':
      return ContentType.AudioAac
    case 'abw':
      return ContentType.ApplicationXabiword
    case 'apng':
      return ContentType.ImageApng
    case 'arc':
      return ContentType.ApplicationXfreearc
    case 'avif':
      return ContentType.ImageAvif
    case 'avi':
      return ContentType.VideoXmsvideo
    case 'azw':
      return ContentType.ApplicationVndamazonebook
    case 'bin':
      return ContentType.ApplicationOctetStream
    case 'bmp':
      return ContentType.ImageBmp
    case 'bz':
      return ContentType.ApplicationXbzip
    case 'bz2':
      return ContentType.ApplicationXbzip2
    case 'cda':
      return ContentType.ApplicationXcdf
    case 'csh':
      return ContentType.ApplicationXcsh
    case 'css':
      return ContentType.TextCss
    case 'csv':
      return ContentType.TextCsv
    case 'doc':
      return ContentType.ApplicationMsword
    case 'docx':
      return ContentType.ApplicationVndopenxmlformatsofficedocumentwordprocessingmldocument
    case 'eot':
      return ContentType.ApplicationVndmsfontobject
    case 'epub':
      return ContentType.ApplicationEpubzip
    case 'gz':
      return ContentType.ApplicationGzip
    case 'gif':
      return ContentType.ImageGif
    case 'htm':
    case 'html':
      return ContentType.TextHtml
    case 'ico':
      return ContentType.ImageVndmicrosofticon
    case 'ics':
      return ContentType.TextCalendar
    case 'jar':
      return ContentType.ApplicationJavaarchive
    case 'jpeg':
    case 'jpg':
      return ContentType.ImageJpeg
    case 'js':
    case 'mjs':
      return ContentType.TextJavascript
    case 'json':
      return ContentType.ApplicationJson
    case 'jsonld':
      return ContentType.ApplicationLdjson
    case 'mid':
    case 'midi':
      return ContentType.AudioMidi
    case 'mp3':
      return ContentType.AudioMpeg
    case 'mp4':
      return ContentType.VideoMp4
    case 'mpeg':
      return ContentType.VideoMpeg
    case 'mpkg':
      return ContentType.ApplicationVndappleinstallerxml
    case 'odp':
      return ContentType.ApplicationVndoasisopendocumentpresentation
    case 'ods':
      return ContentType.ApplicationVndoasisopendocumentspreadsheet
    case 'odt':
      return ContentType.ApplicationVndoasisopendocumenttext
    case 'oga':
      return ContentType.AudioOgg
    case 'ogv':
    case 'ogg':
      return ContentType.VideoOgg
    case 'ogx':
      return ContentType.ApplicationOgg
    case 'opus':
      return ContentType.AudioOpus
    case 'otf':
      return ContentType.FontOtf
    case 'png':
      return ContentType.ImagePng
    case 'pdf':
      return ContentType.ApplicationPdf
    case 'php':
      return ContentType.ApplicationXhttpdphp
    case 'ppt':
      return ContentType.ApplicationVndmspowerpoint
    case 'pptx':
      return ContentType.ApplicationVndopenxmlformatsofficedocumentpresentationmlpresentation
    case 'rar':
      return ContentType.ApplicationXtar // No direct mapping, fallback to tar
    case 'rtf':
      return ContentType.ApplicationRtf
    case 'sh':
      return ContentType.ApplicationXsh
    case 'svg':
      return ContentType.ImageSvgxml
    case 'tar':
      return ContentType.ApplicationXtar
    case 'tif':
    case 'tiff':
      return ContentType.ImageSvgxml // No direct mapping, fallback to svg+xml
    case 'ts':
      return ContentType.VideoMp2t
    case 'ttf':
      return ContentType.FontTtf
    case 'txt':
      return ContentType.TextPlain
    case 'vsd':
      return ContentType.ApplicationOctetStream // No direct mapping, fallback to octet-stream
    case 'wav':
      return ContentType.AudioWav
    case 'weba':
      return ContentType.AudioWebm
    case 'webm':
      return ContentType.VideoWebm
    case 'webp':
      return ContentType.ImageWebp
    case 'woff':
      return ContentType.FontWoff
    case 'woff2':
      return ContentType.FontWoff2
    case 'xhtml':
      return ContentType.ApplicationXhtmlxml
    case 'xls':
      return ContentType.ApplicationVndmsexcel
    case 'xlsx':
      return ContentType.ApplicationVndopenxmlformatsofficedocumentspreadsheetmlsheet
    case 'xml':
      return ContentType.ApplicationXml
    case 'xul':
      return ContentType.ApplicationVndmozillaxulxml
    case 'zip':
      return ContentType.ApplicationZip
    case '7z':
      return ContentType.ApplicationX7zcompressed
    default:
      return ContentType.ApplicationOctetStream
  }
}

/**
 * Get ContentType from file path
 */
export function contentTypeFromFilePath(path: string): ContentType {
  const ext = path.toLowerCase().split('.').pop() || ''
  return contentTypeFromExtension(ext)
}

/**
 * Convert string to ContentType enum
 */
export function contentTypeFromString(value: string): ContentType {
  switch (value) {
    case 'audio/aac':
      return ContentType.AudioAac
    case 'application/x-abiword':
      return ContentType.ApplicationXabiword
    case 'image/apng':
      return ContentType.ImageApng
    case 'application/x-freearc':
      return ContentType.ApplicationXfreearc
    case 'image/avif':
      return ContentType.ImageAvif
    case 'video/x-msvideo':
      return ContentType.VideoXmsvideo
    case 'application/vnd.amazon.ebook':
      return ContentType.ApplicationVndamazonebook
    case 'application/octet-stream':
      return ContentType.ApplicationOctetStream
    case 'image/bmp':
      return ContentType.ImageBmp
    case 'application/x-bzip':
      return ContentType.ApplicationXbzip
    case 'application/x-bzip2':
      return ContentType.ApplicationXbzip2
    case 'application/x-cdf':
      return ContentType.ApplicationXcdf
    case 'application/x-csh':
      return ContentType.ApplicationXcsh
    case 'text/css':
      return ContentType.TextCss
    case 'text/csv':
      return ContentType.TextCsv
    case 'application/msword':
      return ContentType.ApplicationMsword
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return ContentType.ApplicationVndopenxmlformatsofficedocumentwordprocessingmldocument
    case 'application/vnd.ms-fontobject':
      return ContentType.ApplicationVndmsfontobject
    case 'application/epub+zip':
      return ContentType.ApplicationEpubzip
    case 'application/gzip':
      return ContentType.ApplicationGzip
    case 'image/gif':
      return ContentType.ImageGif
    case 'text/html':
      return ContentType.TextHtml
    case 'image/vnd.microsoft.icon':
      return ContentType.ImageVndmicrosofticon
    case 'text/calendar':
      return ContentType.TextCalendar
    case 'application/java-archive':
      return ContentType.ApplicationJavaarchive
    case 'image/jpeg':
      return ContentType.ImageJpeg
    case 'text/javascript':
      return ContentType.TextJavascript
    case 'application/json':
      return ContentType.ApplicationJson
    case 'application/ld+json':
      return ContentType.ApplicationLdjson
    case 'audio/midi':
      return ContentType.AudioMidi
    case 'audio/mpeg':
      return ContentType.AudioMpeg
    case 'video/mp4':
      return ContentType.VideoMp4
    case 'video/mpeg':
      return ContentType.VideoMpeg
    case 'application/vnd.apple.installer+xml':
      return ContentType.ApplicationVndappleinstallerxml
    case 'application/vnd.oasis.opendocument.presentation':
      return ContentType.ApplicationVndoasisopendocumentpresentation
    case 'application/vnd.oasis.opendocument.spreadsheet':
      return ContentType.ApplicationVndoasisopendocumentspreadsheet
    case 'application/vnd.oasis.opendocument.text':
      return ContentType.ApplicationVndoasisopendocumenttext
    case 'audio/ogg':
      return ContentType.AudioOgg
    case 'video/ogg':
      return ContentType.VideoOgg
    case 'application/ogg':
      return ContentType.ApplicationOgg
    case 'audio/opus':
      return ContentType.AudioOpus
    case 'font/otf':
      return ContentType.FontOtf
    case 'image/png':
      return ContentType.ImagePng
    case 'application/pdf':
      return ContentType.ApplicationPdf
    case 'application/x-httpd-php':
      return ContentType.ApplicationXhttpdphp
    case 'application/vnd.ms-powerpoint':
      return ContentType.ApplicationVndmspowerpoint
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return ContentType.ApplicationVndopenxmlformatsofficedocumentpresentationmlpresentation
    case 'application/vnd.rar':
      return ContentType.ApplicationXtar // No direct mapping, fallback to tar
    case 'application/rtf':
      return ContentType.ApplicationRtf
    case 'application/x-sh':
      return ContentType.ApplicationXsh
    case 'image/svg+xml':
      return ContentType.ImageSvgxml
    case 'application/x-tar':
      return ContentType.ApplicationXtar
    case 'image/tiff':
      return ContentType.ImageSvgxml // No direct mapping, fallback to svg+xml
    case 'video/mp2t':
      return ContentType.VideoMp2t
    case 'font/ttf':
      return ContentType.FontTtf
    case 'text/plain':
      return ContentType.TextPlain
    case 'application/vnd.visio':
      return ContentType.ApplicationOctetStream // No direct mapping, fallback to octet-stream
    case 'audio/wav':
      return ContentType.AudioWav
    case 'audio/webm':
      return ContentType.AudioWebm
    case 'video/webm':
      return ContentType.VideoWebm
    case 'image/webp':
      return ContentType.ImageWebp
    case 'font/woff':
      return ContentType.FontWoff
    case 'font/woff2':
      return ContentType.FontWoff2
    case 'application/xhtml+xml':
      return ContentType.ApplicationXhtmlxml
    case 'application/vnd.ms-excel':
      return ContentType.ApplicationVndmsexcel
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return ContentType.ApplicationVndopenxmlformatsofficedocumentspreadsheetmlsheet
    case 'application/xml':
      return ContentType.ApplicationXml
    case 'application/vnd.mozilla.xul+xml':
      return ContentType.ApplicationVndmozillaxulxml
    case 'application/zip':
      return ContentType.ApplicationZip
    case 'application/x-7z-compressed':
      return ContentType.ApplicationX7zcompressed
    default:
      throw new Error('Invalid conversion to content type')
  }
}
