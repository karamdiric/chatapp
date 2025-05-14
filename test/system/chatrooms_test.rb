require "application_system_test_case"

class ChatroomsTest < ApplicationSystemTestCase
  def setup
    @user = users(:one)
    @chatroom = chatrooms(:one)
    sign_in @user
  end

  test "visiting the index" do
    visit chatrooms_path
    assert_selector "h1", text: "Chatrooms"
  end

  test "creating a Chatroom" do
    visit chatrooms_path
    click_on "New Chatroom"

    fill_in "Name", with: "New Test Chatroom"
    fill_in "Description", with: "This is a test chatroom"
    click_on "Create Chatroom"

    assert_text "Chatroom was successfully created"
    assert_selector "h1", text: "New Test Chatroom"
  end

  test "updating a Chatroom" do
    visit chatroom_path(@chatroom)
    click_on "Edit"

    fill_in "Name", with: "Updated Chatroom"
    fill_in "Description", with: "This is an updated chatroom"
    click_on "Update Chatroom"

    assert_text "Chatroom was successfully updated"
    assert_selector "h1", text: "Updated Chatroom"
  end

  test "destroying a Chatroom" do
    visit chatroom_path(@chatroom)
    accept_confirm do
      click_on "Delete"
    end

    assert_text "Chatroom was successfully deleted"
  end

  test "sending a message" do
    visit chatroom_path(@chatroom)
    fill_in "message_content", with: "Hello, this is a test message"
    click_on "Send"

    assert_text "Hello, this is a test message"
  end

  test "sending a message with media" do
    visit chatroom_path(@chatroom)
    fill_in "message_content", with: "Message with media"
    attach_file "message_media", Rails.root.join("test/fixtures/files/test_image.jpg")
    click_on "Send"

    assert_text "Message with media"
    assert_selector "img[src*='test_image.jpg']"
  end

  test "deleting a message" do
    visit chatroom_path(@chatroom)
    fill_in "message_content", with: "Message to delete"
    click_on "Send"

    accept_confirm do
      click_on "Delete", match: :first
    end

    assert_no_text "Message to delete"
  end

  test "non-owner cannot edit chatroom" do
    other_user = users(:two)
    sign_in other_user
    visit edit_chatroom_path(@chatroom)
    assert_text "You can only edit your own chatrooms"
  end

  test "non-owner cannot delete chatroom" do
    other_user = users(:two)
    sign_in other_user
    visit chatroom_path(@chatroom)
    assert_no_selector "a", text: "Delete"
  end

  test "non-owner cannot delete messages" do
    other_user = users(:two)
    sign_in other_user
    visit chatroom_path(@chatroom)
    assert_no_selector "a", text: "Delete", match: :first
  end
end 