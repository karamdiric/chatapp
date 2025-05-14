require "test_helper"

class ChatroomTest < ActiveSupport::TestCase
  def setup
    @chatroom = chatrooms(:one)
  end

  test "should be valid" do
    assert @chatroom.valid?
  end

  test "name should be present" do
    @chatroom.name = " "
    assert_not @chatroom.valid?
  end

  test "name should be unique" do
    duplicate_chatroom = @chatroom.dup
    duplicate_chatroom.name = @chatroom.name.upcase
    assert_not duplicate_chatroom.valid?
  end

  test "should have many messages" do
    assert_respond_to @chatroom, :messages
  end

  test "should have many users through messages" do
    assert_respond_to @chatroom, :users
  end

  test "should destroy associated messages when deleted" do
    @chatroom.save
    assert_difference "Message.count", -@chatroom.messages.count do
      @chatroom.destroy
    end
  end
end
