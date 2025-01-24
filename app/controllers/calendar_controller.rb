class CalendarController < ApplicationController
  before_action :authenticate_user!
  
  def index
    @current_date = Time.new(2025, 1, 24, 14, 54, 10, "-05:00")
    @start_date = @current_date.beginning_of_month.beginning_of_week(:sunday)
    @end_date = @current_date.end_of_month.end_of_week(:sunday)
    
    @skills = current_user.skills.includes(:practice_sessions)
    @calendar_data = @skills.map.with_index do |skill, index|
      {
        id: skill.id,
        name: skill.name,
        color: generate_color(index),
        # Sessions with ratings are completed
        completed_sessions: skill.practice_sessions
                               .where(scheduled_date: @start_date..@end_date)
                               .where.not(rating: nil)
                               .pluck(:scheduled_date),
        # Sessions without ratings are scheduled
        scheduled_sessions: skill.practice_sessions
                               .where(scheduled_date: @start_date..@end_date)
                               .where(rating: nil)
                               .pluck(:scheduled_date)
      }
    end
  end

  private

  def generate_color(index)
    # Generate unique, visually distinct colors using HSL
    hue = (index * 137.508) % 360  # Golden angle approximation
    "hsl(#{hue}, 70%, 60%)"
  end
end
