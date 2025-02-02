class Subject < ApplicationRecord
  belongs_to :user
  has_and_belongs_to_many :skills

  validates :name, presence: true, uniqueness: { scope: :user_id }
  validates :user_id, presence: true
end
