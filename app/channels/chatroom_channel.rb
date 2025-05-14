class ChatroomChannel < ApplicationCable::Channel
  def subscribed
    Rails.logger.info "Attempting to subscribe to chatroom channel: #{params[:chatroom_id]} for user: #{params[:user_id]}"
    
    begin
      chatroom = Chatroom.find(params[:chatroom_id])
      # Subscribe to user-specific channel
      stream_from "chatroom_#{chatroom.id}_user_#{params[:user_id]}"
      Rails.logger.info "Successfully subscribed to chatroom channel: #{chatroom.id} for user: #{params[:user_id]}"
    rescue ActiveRecord::RecordNotFound
      Rails.logger.error "Chatroom not found: #{params[:chatroom_id]}"
      reject_subscription
    rescue => e
      Rails.logger.error "Error subscribing to chatroom channel: #{e.message}"
      reject_subscription
    end
  end

  def unsubscribed
    Rails.logger.info "Unsubscribing from chatroom channel: #{params[:chatroom_id]} for user: #{params[:user_id]}"
    stop_all_streams
  end
end 