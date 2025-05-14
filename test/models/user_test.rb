require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @user = User.new(
      email: "test@example.com",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  test "should be valid" do
    assert @user.valid?
  end

  test "email should be present" do
    @user.email = ""
    assert_not @user.valid?
  end

  test "email should be unique" do
    duplicate_user = @user.dup
    @user.save!
    assert_not duplicate_user.valid?
  end

  test "email should be properly formatted" do
    invalid_emails = %w[user@example,com user_at_example.com user@example. user@example..com]
    invalid_emails.each do |email|
      @user.email = email
      assert_not @user.valid?, "#{email} should be invalid"
    end
  end

  test "password should be present" do
    @user.password = @user.password_confirmation = " " * 6
    assert_not @user.valid?
  end

  test "password should have minimum length" do
    @user.password = @user.password_confirmation = "a" * 5
    assert_not @user.valid?
  end

  test "should have many messages" do
    assert_respond_to @user, :messages
  end

  test "should have many chatrooms" do
    assert_respond_to @user, :chatrooms
  end

  test "should have one avatar" do
    assert_respond_to @user, :avatar
  end
end
