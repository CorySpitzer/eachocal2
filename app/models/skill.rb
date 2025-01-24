class Skill < ApplicationRecord
  has_many :practice_sessions, dependent: :destroy
  
  validates :name, presence: true
  validates :pattern, presence: true
  validates :start_date, presence: true
end
