class MessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_chatroom
  before_action :set_message, only: [:destroy]
  before_action :authorize_user, only: [:destroy]


  def create
    @message = @chatroom.messages.build(message_params)
    @message.user = current_user

    if @message.save
      # Broadcast the message immediately
      MessageBroadcastJob.perform_now(@message, "create")
      
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to @chatroom }
      end
    else
      redirect_to @chatroom, alert: "Failed to send message"
    end
  end

  def destroy
    # Authorization is handled by before_action :authorize_user
    @message.destroy
    # Broadcast the deletion immediately
    MessageBroadcastJob.perform_now(@message, "destroy")
    
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to @chatroom, notice: 'Message was successfully deleted.' }
      format.json { head :no_content }
    end
  end

  private

  def set_chatroom
    begin
      @chatroom = Chatroom.find(params[:chatroom_id])
    rescue ActiveRecord::RecordNotFound
      redirect_to chatrooms_path, alert: 'Chatroom does not exist.'
      return false
    end
  end

  def set_message
    begin
      @message = @chatroom.messages.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      redirect_to @chatroom, alert: 'Message does not exist.'
      return false
    end
  end

  def authorize_user
    unless @message.user == current_user
      respond_to do |format|
        format.turbo_stream { head :forbidden }
        format.html { redirect_to @chatroom, alert: 'You can only delete your own messages.' }
        format.json { render json: { error: 'You can only delete your own messages.' }, status: :forbidden }
      end
      return false
    end
    true
  end


  def message_params
    params.require(:message).permit(:content, :media)
  end

  helper_method :current_user_id

  def current_user_id
    current_user.id
  end
end
