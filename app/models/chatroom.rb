class Chatroom < ApplicationRecord
  belongs_to :user
  has_many :messages, dependent: :destroy
  has_many :users, through: :messages

  validates :name, presence: true, uniqueness: true
  validates :description, presence: true

  scope :ordered, -> { order(created_at: :desc) }
end
