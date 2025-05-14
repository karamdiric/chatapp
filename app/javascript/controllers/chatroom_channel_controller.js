import { Controller } from "@hotwired/stimulus"
import consumer from "../channels/consumer"

export default class extends Controller {
  static values = {
    chatroomId: Number,
    currentUserId: Number
  }

  static targets = ["messages"]

  connect() {
    console.log("[ChatroomChannel] Controller connecting...")
    console.log("[ChatroomChannel] Values:", {
      chatroomId: this.chatroomIdValue,
      currentUserId: this.currentUserIdValue
    })

    if (!this.chatroomIdValue) {
      console.error("[ChatroomChannel] Error: Chatroom ID is required but not provided")
      return
    }

    if (!this.currentUserIdValue) {
      console.error("[ChatroomChannel] Error: Current User ID is required but not provided")
      return
    }

    // Setup channel immediately
    this._setupChannel()
    
    // Add event listener for message broadcast
    this.element.addEventListener("message:sent", this.handleMessageSent.bind(this))
     
    // Scroll to bottom
    this.scrollToBottom()
  }

  _setupChannel() {
    console.log("[ChatroomChannel] Setting up channel subscription...")
    
    try {
      this.channel = consumer.subscriptions.create(
        { 
          channel: "ChatroomChannel",
          chatroom_id: this.chatroomIdValue,
          user_id: this.currentUserIdValue
        },
        {
          connected: this._connected.bind(this),
          disconnected: this._disconnected.bind(this),
          received: this._received.bind(this),
          rejected: this._rejected.bind(this)
        }
      )
      console.log("[ChatroomChannel] Channel subscription created successfully")
    } catch (error) {
      console.error("[ChatroomChannel] Error creating channel subscription:", error)
      // Attempt to reconnect after a delay
      setTimeout(() => this._setupChannel(), 5000)
    }
  }

  disconnect() {
    console.log("[ChatroomChannel] Controller disconnecting...")
    if (this.channel) {
      console.log("[ChatroomChannel] Unsubscribing from channel...")
      this.channel.unsubscribe()
    }
    
    // Remove event listener
    this.element.removeEventListener("message:sent", this.handleMessageSent.bind(this))
  }

  _connected() {
    console.log("[ChatroomChannel] Successfully connected to channel:", this.chatroomIdValue)
  }

  _disconnected() {
    console.log("[ChatroomChannel] Disconnected from channel:", this.chatroomIdValue)
    // Attempt to reconnect after a delay
    setTimeout(() => this._setupChannel(), 5000)
  }

  _rejected() {
    console.error("[ChatroomChannel] Subscription rejected")
    // Attempt to reconnect after a delay
    setTimeout(() => this._setupChannel(), 5000)
  }
  
  handleMessageSent(event) {
    console.log("[ChatroomChannel] Message sent, clearing form inputs")
    // Find and reset the message form
    const messageForm = this.element.querySelector('[data-controller="message-form"]')
    if (messageForm) {
      const controller = this.application.getControllerForElementAndIdentifier(messageForm, "message-form")
      if (controller && typeof controller.resetForm === "function") {
        controller.resetForm()
      }
    }
    
    // Scroll to bottom
    this.scrollToBottom()
  }

  _received(data) {
    console.log("[ChatroomChannel] Received message:", data)
    
    if (!this.hasMessagesTarget) {
      console.error("[ChatroomChannel] Error: Messages target not found")
      return
    }
    
    const messagesContainer = this.messagesTarget
    let messagesWrapper = messagesContainer.querySelector('.space-y-4')
    const messageId = `message_${data.message_id}`

    // Check if message already exists
    if (document.getElementById(messageId)) {
      console.log("[ChatroomChannel] Message already exists, skipping:", messageId)
      return
    }

    if (data.action === "destroy") {
      const messageElement = document.getElementById(messageId)
      if (messageElement) {
        messageElement.remove()
      }
      return
    }

    if (data.action === "update") {
      const messageElement = document.getElementById(messageId)
      if (messageElement) {
        messageElement.outerHTML = data.html
      }
      return
    }

    // For new messages
    if (messagesWrapper) {
      messagesWrapper.insertAdjacentHTML("beforeend", data.html)
    } else {
      messagesContainer.insertAdjacentHTML("beforeend", `<div class="space-y-4">${data.html}</div>`)
    }
    
    // If this is a message from the current user, clear the input form
    if (data.user_id === this.currentUserIdValue) {
      this._triggerFormReset()
    }
    
    // Scroll to bottom
    this.scrollToBottom()
  }
  
  _triggerFormReset() {
    // Dispatch custom event to notify that a message was sent
    this.element.dispatchEvent(new CustomEvent('message:sent', { bubbles: true }))
  }
  
  scrollToBottom() {
    if (this.hasMessagesTarget) {
      this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight
    }
  }
}