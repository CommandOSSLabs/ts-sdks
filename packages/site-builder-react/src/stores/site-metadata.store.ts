import { atom, computed } from 'nanostores'

const DEFAULT_TITLE = 'wal-0'
const DEFAULT_DESCRIPTION = 'WAL-0 Generated Project'

class SiteMetadata {
  title = atom(DEFAULT_TITLE)
  description = atom(DEFAULT_DESCRIPTION)
  imageUrl = atom<string | File | null>('https://www.walrus.xyz/walrus-site')
  link = atom<string>('')
  projectUrl = atom<string>('')
  epochs = atom(5)
  deletable = atom(false)
  loading = atom(false)
  suiNSUrl = atom<string>('')

  // Site data
  originalTitle = atom(DEFAULT_TITLE)
  originalDescription = atom(DEFAULT_DESCRIPTION)
  originalImageUrl = atom<string | File | null>(
    'https://www.walrus.xyz/walrus-site'
  )
  originalLink = atom<string>('')
  originalProjectUrl = atom<string>('')
  originalEpochs = atom(5)
  originalSuiNSUrl = atom<string>('')

  // Derived/computed state
  isDirty = computed(
    [
      this.title,
      this.description,
      this.imageUrl,
      this.link,
      this.projectUrl,
      this.epochs,
      this.suiNSUrl,
      this.originalTitle,
      this.originalDescription,
      this.originalImageUrl,
      this.originalLink,
      this.originalProjectUrl,
      this.originalEpochs,
      this.originalSuiNSUrl
    ],
    (
      title,
      description,
      iconUrl,
      link,
      projectUrl,
      epochs,
      suiNSUrl,
      originalTitle,
      originalDescription,
      originalIcon,
      originalLink,
      originalProjectUrl,
      originalEpochs,
      originalSuiNSUrl
    ) =>
      title !== originalTitle ||
      description !== originalDescription ||
      (iconUrl ?? null) !== (originalIcon ?? null) ||
      link !== originalLink ||
      projectUrl !== originalProjectUrl ||
      epochs !== originalEpochs ||
      suiNSUrl !== originalSuiNSUrl
  )
  /**
   * Computed URL for displaying the image preview
   */
  imageDisplayUrl = computed([this.imageUrl], imageUrl => {
    if (!imageUrl) return null
    if (typeof imageUrl === 'string') return imageUrl
    return URL.createObjectURL(imageUrl) // TODO: revoke when not used
  })

  commitChanges() {
    this.originalTitle.set(this.title.get())
    this.originalDescription.set(this.description.get())
    this.originalImageUrl.set(this.imageUrl.get())
    this.originalLink.set(this.link.get())
    this.originalProjectUrl.set(this.projectUrl.get())
    this.originalEpochs.set(this.epochs.get())
    this.originalSuiNSUrl.set(this.suiNSUrl.get())
  }

  reset() {
    this.title.set(this.originalTitle.get())
    this.description.set(this.originalDescription.get())
    this.imageUrl.set(this.originalImageUrl.get())
    this.link.set(this.originalLink.get())
    this.projectUrl.set(this.originalProjectUrl.get())
    this.epochs.set(this.originalEpochs.get())
    this.suiNSUrl.set(this.originalSuiNSUrl.get())
    this.loading.set(false)
  }

  cancelEdit = () => this.reset()
}

export const siteMetadataStore = new SiteMetadata()
