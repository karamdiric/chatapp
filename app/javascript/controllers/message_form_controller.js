import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "fileCounter", "mediaLabel", "preview", "submitButton"]
  
  // Define a constant for max file size (30MB in bytes)
  static MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB in bytes
  
  // Define acceptable file types
  static ACCEPTABLE_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/heic', 'image/heif'],
    video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm', 'video/ogg'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }

  connect() {
    this.scrollToBottom()
    if (this.hasSubmitButtonTarget) {
      this.submitButtonTarget.disabled = !this.formIsValid()
    }
  }

  handleKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      this.submitForm(event)
    }
  }

  handleFileSelect(event) {
    const files = event.target.files
    if (files.length > 0) {
      const file = files[0]
      
      // Check if file is too large
      if (file.size > this.constructor.MAX_FILE_SIZE) {
        alert(`File size exceeds the limit of 30MB. Please select a smaller file.`)
        event.target.value = '' // Clear the file input
        return
      }
      
      // Check if file type is acceptable
      if (!this.isAcceptableFileType(file.type)) {
        alert(`File type not supported. Please select an image, video, or PDF document.`)
        event.target.value = '' // Clear the file input
        return
      }
      
      this.fileCounterTarget.textContent = files.length
      this.fileCounterTarget.classList.remove("hidden")
      this.mediaLabelTarget.classList.add("text-blue-600")
      
      // Show loading indicator before processing the file
      this.showLoadingPreview(file)
      
      // Create preview based on file type (with slight delay to show the loading state)
      setTimeout(() => this.createPreview(file), 500)
      
      // Update submit button state
      this.updateSubmitButton()
    }
  }
  
  isAcceptableFileType(mimeType) {
    return this.constructor.ACCEPTABLE_TYPES.image.includes(mimeType) ||
           this.constructor.ACCEPTABLE_TYPES.video.includes(mimeType) ||
           this.constructor.ACCEPTABLE_TYPES.document.includes(mimeType)
  }
  
  getFileTypeCategory(mimeType) {
    if (this.constructor.ACCEPTABLE_TYPES.image.includes(mimeType)) return 'image'
    if (this.constructor.ACCEPTABLE_TYPES.video.includes(mimeType)) return 'video'
    if (this.constructor.ACCEPTABLE_TYPES.document.includes(mimeType)) return 'document'
    return 'unknown'
  }
  
  showLoadingPreview(file) {
    const fileTypeText = this.getFileTypeText(file.type)
    
    const loadingHTML = `
      <div class="relative bg-gray-100 p-3 rounded-lg mb-2">
        <div class="flex items-center">
          <div class="mr-3">
            <svg class="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="font-medium text-sm">Processing ${fileTypeText}...</span>
            <span class="text-xs text-gray-500 truncate max-w-xs">${file.name}</span>
            <span class="text-xs text-gray-500">${this.formatFileSize(file.size)}</span>
          </div>
        </div>
        <button type="button" data-action="click->message-form#clearPreview" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `
    
    this.previewTarget.innerHTML = loadingHTML
    this.previewTarget.classList.remove("hidden")
  }
  
  getFileTypeText(mimeType) {
    const category = this.getFileTypeCategory(mimeType)
    switch(category) {
      case 'image': return 'image'
      case 'video': return 'video'
      case 'document': 
        if (mimeType === 'application/pdf') return 'PDF'
        return 'document'
      default: return 'file'
    }
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  createPreview(file) {
    const category = this.getFileTypeCategory(file.type)
    
    // Create appropriate preview based on file type category
    switch(category) {
      case 'image':
        this.createImagePreview(file)
        break
      case 'video':
        this.createVideoPreview(file)
        break
      default:
        this.createGenericFilePreview(file)
        break
    }
  }
  
  createImagePreview(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const previewHTML = `
        <div class="relative bg-gray-100 p-2 rounded-lg mb-2">
          <img src="${e.target.result}" class="max-h-24 rounded-lg object-cover" />
          <button type="button" data-action="click->message-form#clearPreview" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div class="flex justify-between mt-1">
            <span class="text-xs text-gray-500 truncate max-w-xs">${file.name}</span>
            <span class="text-xs text-gray-500">${this.formatFileSize(file.size)}</span>
          </div>
        </div>
      `
      this.previewTarget.innerHTML = previewHTML
    }
    reader.readAsDataURL(file)
  }
  
  createVideoPreview(file) {
    // Create a loading state while video is processing
    const objectUrl = URL.createObjectURL(file)
    
    const previewHTML = `
      <div class="relative bg-gray-100 p-2 rounded-lg mb-2">
        <video src="${objectUrl}" class="max-h-24 w-auto rounded-lg" controls preload="metadata"></video>
        <button type="button" data-action="click->message-form#clearPreview" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="flex justify-between mt-1">
          <span class="text-xs text-gray-500 truncate max-w-xs">${file.name}</span>
          <span class="text-xs text-gray-500">${this.formatFileSize(file.size)}</span>
        </div>
      </div>
    `
    
    this.previewTarget.innerHTML = previewHTML
    
    // Get the video element to handle loading events
    const videoElement = this.previewTarget.querySelector('video')
    
    // Add loading indicator until metadata is loaded
    if (videoElement) {
      videoElement.addEventListener('loadedmetadata', () => {
        // Video metadata loaded successfully
        console.log('Video metadata loaded')
      })
      
      videoElement.addEventListener('error', (error) => {
        console.error('Error loading video:', error)
        this.previewTarget.innerHTML = `
          <div class="relative bg-red-100 p-3 rounded-lg mb-2">
            <div class="flex items-center text-red-700">
              <svg class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Failed to load video preview. The file may still be uploaded.</span>
            </div>
            <button type="button" data-action="click->message-form#clearPreview" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        `
      })
    }
    
    // Store the object URL to revoke it later
    this.objectUrl = objectUrl
  }
  
  createGenericFilePreview(file) {
    const fileIconHTML = file.type === 'application/pdf' 
      ? `<svg class="h-6 w-6 text-red-500 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
         </svg>`
      : `<svg class="h-6 w-6 text-gray-500 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
         </svg>`
    
    const previewHTML = `
      <div class="relative bg-gray-100 p-2 rounded-lg mb-2 flex items-center">
        ${fileIconHTML}
        <div class="flex-1 min-w-0">
          <span class="text-sm text-gray-700 truncate block">${file.name}</span>
          <span class="text-xs text-gray-500">${this.formatFileSize(file.size)}</span>
        </div>
        <button type="button" data-action="click->message-form#clearPreview" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `
    
    this.previewTarget.innerHTML = previewHTML
  }

  clearPreview() {
    // Revoke any object URLs to avoid memory leaks
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = null
    }
    
    const fileInput = this.element.querySelector('input[type="file"]')
    fileInput.value = ''
    this.previewTarget.innerHTML = ''
    this.previewTarget.classList.add("hidden")
    this.fileCounterTarget.classList.add("hidden")
    this.mediaLabelTarget.classList.remove("text-blue-600")
    
    this.updateSubmitButton()
  }
  
  disconnect() {
    // Clean up any object URLs when controller disconnects
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = null
    }
  }

  formIsValid() {
    const hasText = this.inputTarget.value.trim().length > 0
    const hasMedia = this.element.querySelector('input[type="file"]').files.length > 0
    return hasText || hasMedia
  }

  inputChanged() {
    this.updateSubmitButton()
  }
  
  updateSubmitButton() {
    if (this.hasSubmitButtonTarget) {
      this.submitButtonTarget.disabled = !this.formIsValid()
    }
  }

  submitForm(event) {
    // Always prevent the default form submission
    if (event) {
      event.preventDefault()
    }
    
    if (!this.formIsValid()) return
    
    // Disable the submit button to prevent double submissions
    if (this.hasSubmitButtonTarget) {
      this.submitButtonTarget.disabled = true
    }

    const form = this.element
    const formData = new FormData(form)
    
    // Add Turbo-specific header if needed
    let headers = {
      "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content
    }
    
    // Show sending state
    const originalButtonText = this.submitButtonTarget.value
    this.submitButtonTarget.value = "Sending..."
    
    fetch(form.action, {
      method: form.method || "POST",
      body: formData,
      headers: headers,
      credentials: "same-origin"
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response
    })
    .then(() => {
      // Success - clear the form
      this.resetForm()
    })
    .catch(error => {
      console.error('Error submitting form:', error)
      
      // Reset button text
      this.submitButtonTarget.value = originalButtonText
      
      // Re-enable the submit button on error
      if (this.hasSubmitButtonTarget) {
        this.submitButtonTarget.disabled = false
      }
      
      alert("Failed to send message. Please try again.")
    })
  }

  resetForm() {
    // Revoke any object URLs to avoid memory leaks
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = null
    }
    
    // Clear text input
    if (this.hasInputTarget) {
      this.inputTarget.value = ""
    }
    
    // Clear file input
    const fileInput = this.element.querySelector('input[type="file"]')
    if (fileInput) {
      fileInput.value = ""
    }
    
    // Reset file counter
    if (this.hasFileCounterTarget) {
      this.fileCounterTarget.classList.add("hidden")
      this.fileCounterTarget.textContent = ""
    }
    
    // Reset media label
    if (this.hasMediaLabelTarget) {
      this.mediaLabelTarget.classList.remove("text-blue-600")
    }
    
    // Clear preview
    if (this.hasPreviewTarget) {
      this.previewTarget.innerHTML = ""
      this.previewTarget.classList.add("hidden")
    }
    
    // Reset submit button
    if (this.hasSubmitButtonTarget) {
      this.submitButtonTarget.disabled = true
      this.submitButtonTarget.value = "Send"
    }
    
    // Scroll to bottom
    this.scrollToBottom()
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById("messages")
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }
}