class PracticeSchedule < ApplicationRecord
  belongs_to :skill

  validates :scheduled_date, presence: true
  
  scope :for_date, ->(date) { where(scheduled_date: date.beginning_of_day) }
  scope :pending, -> { where(completed: false) }

  before_validation :normalize_scheduled_date

  private

  def normalize_scheduled_date
    self.scheduled_date = scheduled_date.beginning_of_day if scheduled_date
  end
end
