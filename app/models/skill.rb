class Skill < ApplicationRecord
  belongs_to :user, optional: true  # Optional because base skills won't have a user
  has_many :practice_sessions, dependent: :destroy
  has_many :practice_schedules, dependent: :destroy
  has_and_belongs_to_many :subjects
  
  validates :name, presence: true
  validates :pattern, presence: true, if: -> { !base_skill }
  validates :start_date, presence: true, if: -> { !base_skill }
  validates :rating, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }, allow_nil: true

  scope :base_skills, -> { where(base_skill: true) }
  scope :user_skills, -> { where.not(base_skill: true) }

  after_create :generate_practice_schedules
  after_update :regenerate_practice_schedules, if: :practice_pattern_changed?

  private

  def generate_practice_schedules
    return if base_skill
    PracticeScheduleGenerator.generate_schedules(self)
  end

  def regenerate_practice_schedules
    return if base_skill
    practice_schedules.where('scheduled_date > ?', Date.current).destroy_all
    PracticeScheduleGenerator.generate_schedules(self)
  end

  def practice_pattern_changed?
    saved_change_to_pattern? || saved_change_to_start_date?
  end
end
