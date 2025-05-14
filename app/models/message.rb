class Message < ApplicationRecord
  belongs_to :user
  belongs_to :chatroom

  has_one_attached :media

  # Maximum file size: 30MB
  MAX_FILE_SIZE = 30.megabytes
  
  # Define acceptable content types
  IMAGE_TYPES = %w[image/jpeg image/png image/gif image/svg+xml image/webp image/heic image/heif].freeze
  VIDEO_TYPES = %w[video/mp4 video/quicktime video/x-msvideo video/x-ms-wmv video/webm video/ogg].freeze
  DOCUMENT_TYPES = %w[application/pdf application/msword application/vnd.openxmlformats-officedocument.wordprocessingml.document].freeze
  
  # All acceptable types
  ACCEPTABLE_TYPES = (IMAGE_TYPES + VIDEO_TYPES + DOCUMENT_TYPES).freeze

  validates :content, presence: true, unless: :media_attached?
  validate :acceptable_media, if: :media_attached?

  scope :ordered, -> { order(created_at: :asc) }

  # Validate file size
  validate :validate_media_size

  # Remove duplicate broadcasting
  after_update_commit -> { MessageBroadcastJob.perform_later(self, "update") }
  after_destroy_commit -> { MessageBroadcastJob.perform_later(self, "destroy") }

  # Helper methods to check media type
  def image?
    media_attached? && IMAGE_TYPES.include?(media.content_type)
  end
  
  def video?
    media_attached? && VIDEO_TYPES.include?(media.content_type)
  end
  
  def document?
    media_attached? && DOCUMENT_TYPES.include?(media.content_type)
  end

  private

  def media_attached?
    media.attached?
  end
  
  def acceptable_media
    return unless media.attached?
    
    unless ACCEPTABLE_TYPES.include?(media.content_type)
      errors.add(:media, "must be a valid image, video, or PDF document")
      media.purge # Remove the invalid attachment
    end
  end

  def validate_media_size
    return unless media.attached?
    
    if media.blob.byte_size > MAX_FILE_SIZE
      errors.add(:media, "is too large (maximum is 30MB)")
      # Purge the attachment to prevent storage of invalid files
      media.purge
    end
  end
end