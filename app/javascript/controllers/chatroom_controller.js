import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"

export default class extends Controller {
  static values = { chatroomId: Number }
  
  connect() {
    this.channel = createConsumer().subscriptions.create(
      { channel: "ChatroomChannel", chatroom_id: this.chatroomIdValue },
      { 
        received: this.#cableReceived.bind(this)
      }
    )
    this.scrollToBottom()
  }
  
  disconnect() {
    this.channel.unsubscribe()
  }
  
  #cableReceived(data) {
    const messagesContainer = document.getElementById("messages")
    if (!messagesContainer) return

    // Append the message if not already present
    if (!document.getElementById(`message_${data.message_id}`)) {
      messagesContainer.insertAdjacentHTML('beforeend', data.html)
      this.scrollToBottom()
    }
  }
  
  scrollToBottom() {
    const messagesContainer = document.getElementById("messages")
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }
}