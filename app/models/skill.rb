class Skill < ApplicationRecord
  belongs_to :user
  has_many :practice_sessions, dependent: :destroy
  has_and_belongs_to_many :subjects
  
  validates :name, presence: true
  validates :pattern, presence: true
  validates :start_date, presence: true
end
