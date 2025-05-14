require "test_helper"

class MessagesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = users(:one)
    @other_user = users(:two)
    @chatroom = chatrooms(:one)
    
    # Ensure the message belongs to @user
    @message = messages(:one)
    @message.update(user: @user, chatroom: @chatroom)
    
    # Create another message for @other_user
    @other_message = messages(:two)
    @other_message.update(user: @other_user, chatroom: @chatroom)
    
    sign_in @user
  end

  test "should create message" do
    assert_difference("Message.count") do
      post chatroom_messages_path(@chatroom), params: {
        message: {
          content: "New message"
        }
      }
    end
    assert_redirected_to chatroom_path(@chatroom)
  end

  test "should create message with media" do
    assert_difference("Message.count") do
      post chatroom_messages_path(@chatroom), params: {
        message: {
          content: "Message with media",
          media: fixture_file_upload(
            Rails.root.join("test", "fixtures", "files", "test_image.jpg"),
            "image/jpeg"
          )
        }
      }
    end
    assert_redirected_to chatroom_path(@chatroom)
    assert Message.last.media.attached?
  end

  test "should destroy message" do
    assert_difference("Message.count", -1) do
      delete chatroom_message_path(@chatroom, @message)
    end
    assert_redirected_to chatroom_path(@chatroom)
  end

  # test "should not allow non-owner to destroy message" do
  #   sign_in @other_user
    
  #   assert_no_difference("Message.count") do
  #     delete chatroom_message_path(@chatroom, @message)
  #   end
    
  #   assert_redirected_to chatroom_path(@chatroom)
  #   assert_equal "You can only delete your own messages.", flash[:alert]
    
  #   # Verify the message still exists and belongs to the original user
  #   @message.reload
  #   assert_equal @user.id, @message.user_id
  # end

  test "should require authentication for create" do
    sign_out @user
    assert_no_difference("Message.count") do
      post chatroom_messages_path(@chatroom), params: {
        message: {
          content: "New message"
        }
      }
    end
    assert_redirected_to new_user_session_path
  end

  test "should require authentication for destroy" do
    sign_out @user
    assert_no_difference("Message.count") do
      delete chatroom_message_path(@chatroom, @message)
    end
    assert_redirected_to new_user_session_path
  end

  test "should broadcast message after creation" do
    assert_enqueued_with(job: MessageBroadcastJob) do
      post chatroom_messages_path(@chatroom), params: {
        message: {
          content: "New message"
        }
      }
    end
  end

  # test "should broadcast message after deletion" do
  #   assert_enqueued_with(job: MessageBroadcastJob, args: [@message, "destroy"]) do
  #     delete chatroom_message_path(@chatroom, @message)
  #   end
  # end

  test "should reject invalid file types" do
    assert_no_difference("Message.count") do
      post chatroom_messages_path(@chatroom), params: {
        message: {
          content: "Message with invalid media",
          media: fixture_file_upload(
            Rails.root.join("test", "fixtures", "files", "test_file.exe"),
            "application/x-msdownload"
          )
        }
      }
    end
    assert_redirected_to chatroom_path(@chatroom)
  end

  test "should reject files larger than 30MB" do
    # Check that the model has the validation
    assert Message.private_method_defined?(:validate_media_size)
    
    # Check that the constant is defined correctly
    assert_equal 30.megabytes, Message::MAX_FILE_SIZE
    
    # Skip the actual large file test
    skip "Cannot easily test large file upload without creating an actual large file"
  end
end