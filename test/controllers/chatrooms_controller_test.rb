require "test_helper"

class ChatroomsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:one)
    @other_user = users(:two)
    
    # Make sure chatroom belongs to @user
    @chatroom = chatrooms(:one)
    @chatroom.update(user: @user)
    
    # Create another chatroom for @other_user
    @other_chatroom = chatrooms(:two)
    @other_chatroom.update(user: @other_user)
    
    sign_in @user
  end

  test "should get index" do
    get chatrooms_path
    assert_response :success
  end

  test "should get new" do
    get new_chatroom_path
    assert_response :success
  end

  test "should create chatroom" do
    assert_difference("Chatroom.count") do
      post chatrooms_path, params: {
        chatroom: {
          name: "New Chatroom",
          description: "This is a new chatroom"
        }
      }
    end
    assert_redirected_to chatroom_path(Chatroom.last)
  end

  test "should show chatroom" do
    get chatroom_path(@chatroom)
    assert_response :success
  end

  test "should get edit" do
    get edit_chatroom_path(@chatroom)
    assert_response :success
  end

  test "should update chatroom" do
    patch chatroom_path(@chatroom), params: {
      chatroom: {
        name: "Updated Chatroom",
        description: "This is an updated chatroom"
      }
    }
    assert_redirected_to chatroom_path(@chatroom)
    @chatroom.reload
    assert_equal "Updated Chatroom", @chatroom.name
  end

  test "should destroy chatroom" do
    assert_difference("Chatroom.count", -1) do
      delete chatroom_path(@chatroom)
    end
    assert_redirected_to chatrooms_path
  end

  # test "should not allow non-owner to edit chatroom" do
  #   sign_in @other_user
  #   get edit_chatroom_path(@chatroom)
  #   assert_redirected_to chatrooms_path
  #   assert_equal 'You are not authorized to perform this action.', flash[:alert]
  # end

  # test "should not allow non-owner to update chatroom" do
  #   sign_in @other_user
  #   original_name = @chatroom.name
    
  #   patch chatroom_path(@chatroom), params: {
  #     chatroom: {
  #       name: "Hacked Chatroom",
  #       description: "This is a hacked chatroom"
  #     }
  #   }
    
  #   assert_redirected_to chatrooms_path
  #   assert_equal 'You are not authorized to perform this action.', flash[:alert]
    
  #   @chatroom.reload
  #   assert_equal original_name, @chatroom.name
  # end

  # test "should not allow non-owner to destroy chatroom" do
  #   sign_in @other_user
    
  #   assert_no_difference("Chatroom.count") do
  #     delete chatroom_path(@chatroom)
  #   end
    
  #   assert_redirected_to chatrooms_path
  #   assert_equal 'You are not authorized to perform this action.', flash[:alert]
  # end

  test "should require authentication for index" do
    sign_out @user
    get chatrooms_path
    assert_redirected_to new_user_session_path
  end

  test "should require authentication for new" do
    sign_out @user
    get new_chatroom_path
    assert_redirected_to new_user_session_path
  end

  test "should require authentication for create" do
    sign_out @user
    assert_no_difference("Chatroom.count") do
      post chatrooms_path, params: {
        chatroom: {
          name: "New Chatroom",
          description: "This is a new chatroom"
        }
      }
    end
    assert_redirected_to new_user_session_path
  end
end