class ChatroomsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_chatroom, only: [:show, :edit, :update, :destroy]
  before_action :authorize_user, only: [:edit, :update, :destroy]


  def index
    @chatrooms = Chatroom.ordered
  end

  def show
    @message = Message.new
    @messages = @chatroom.messages.ordered.includes(:user)
  end

  def new
    @chatroom = Chatroom.new
  end

  def create
    @chatroom = Chatroom.new(chatroom_params)
    @chatroom.user = current_user

    if @chatroom.save
      redirect_to @chatroom, notice: 'Chatroom was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    # Authorization is handled by before_action :authorize_user
  end

  def update
    if @chatroom.update(chatroom_params)
      redirect_to @chatroom, notice: 'Chatroom was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @chatroom.destroy
    redirect_to chatrooms_path, notice: 'Chatroom was successfully deleted.'
  end

  private

  def set_chatroom
    begin
      @chatroom = Chatroom.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      redirect_to chatrooms_path, alert: 'Chatroom does not exist.'
      return false
    end
  end

  def chatroom_params
    params.require(:chatroom).permit(:name, :description)
  end

  helper_method :current_user_id

  def current_user_id
    current_user.id
  end

  def authorize_user
    unless @chatroom.user == current_user
      redirect_to chatrooms_path, alert: 'You are not authorized to perform this action.'
      return false
    end
    true
  end
end
