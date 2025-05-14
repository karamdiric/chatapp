class AddUserToChatrooms < ActiveRecord::Migration[8.0]
  def change
    unless column_exists?(:chatrooms, :user_id)
      add_reference :chatrooms, :user, null: true, foreign_key: true
    end
  end
end
