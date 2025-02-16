class PracticeSchedule < ApplicationRecord
  belongs_to :skill

  validates :scheduled_date, presence: true
  
  scope :for_date, ->(date) { where(scheduled_date: date) }
  scope :pending, -> { where(completed: false) }
end
