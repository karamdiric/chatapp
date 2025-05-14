class MessageBroadcastJob < ApplicationJob
    queue_as :default
  
    def perform(message, action = "create")
      return unless message.present? && message.chatroom.present?
      
      chatroom = message.chatroom
      
      # Get all users in the chatroom except the sender
      chatroom.users.distinct.each do |user|
        begin
          # Render message with the correct alignment for each user
          html = ApplicationController.render(
            partial: "messages/message",
            locals: { 
              message: message,
              current_user_id: user.id
            }
          )
          
          # Prepare media data if present
          media_data = if message.media.attached?
            {
              url: Rails.application.routes.url_helpers.rails_blob_path(message.media, only_path: true),
              filename: message.media.filename.to_s,
              content_type: message.media.content_type
            }
          end
          
          # Broadcast to each user's personal channel
          ActionCable.server.broadcast(
            "chatroom_#{chatroom.id}_user_#{user.id}",
            {
              html: html,
              message_id: message.id,
              user_id: message.user_id,
              created_at: message.created_at.strftime("%I:%M %p"),
              action: action,
              media: media_data
            }
          )
        rescue => e
          Rails.logger.error "Error broadcasting message to user #{user.id}: #{e.message}"
        end
      end
    end
  end