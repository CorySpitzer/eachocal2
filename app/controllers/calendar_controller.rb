class CalendarController < ApplicationController
  before_action :authenticate_user!
  
  def index
    @current_date = Time.new(2025, 1, 24, 14, 42, 51, "-05:00")
    @start_date = @current_date.beginning_of_month.beginning_of_week(:sunday)
    @end_date = @current_date.end_of_month.end_of_week(:sunday)
    
    @skills = current_user.skills.includes(:practice_sessions)
    @practice_days = @skills.map do |skill|
      {
        id: skill.id,
        name: skill.name,
        color: generate_color(skill.id),
        days: skill.practice_sessions.where(scheduled_date: @start_date..@end_date).pluck(:scheduled_date)
      }
    end
  end

  private

  def generate_color(id)
    # Generate a unique color based on the skill ID
    hue = (id * 137.508) % 360  # Golden angle approximation
    "hsl(#{hue}, 70%, 60%)"
  end
end
