class Skill < ApplicationRecord
  belongs_to :user, optional: true  # Optional because base skills won't have a user
  has_many :practice_sessions, dependent: :destroy
  has_and_belongs_to_many :subjects
  
  validates :name, presence: true
  validates :pattern, presence: true, if: -> { !base_skill }
  validates :start_date, presence: true, if: -> { !base_skill }

  scope :base_skills, -> { where(base_skill: true) }
  scope :user_skills, -> { where.not(base_skill: true) }
end
