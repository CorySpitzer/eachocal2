class PracticeSession < ApplicationRecord
  belongs_to :skill
  
  validates :scheduled_date, presence: true
  validates :rating, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }, allow_nil: true
end
