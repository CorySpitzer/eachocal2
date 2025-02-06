class CalendarController < ApplicationController
  before_action :authenticate_user!
  
  def index
    # Get the requested year and month from params, default to current date
    @current_date = if params[:year].present? && params[:month].present?
      Time.new(params[:year].to_i, params[:month].to_i, 1, 14, 1, 28, "-05:00")
    else
      Time.new(2025, 1, 24, 15, 1, 28, "-05:00")
    end

    @prev_month = @current_date.prev_month.beginning_of_month
    @next_month = @current_date.next_month.beginning_of_month
    @start_date = @current_date.beginning_of_month.beginning_of_week(:sunday)
    @end_date = @current_date.end_of_month.end_of_week(:sunday)
    
    # Set up subjects and skills
    @subjects = current_user.subjects.includes(:skills)
    @selected_subject = params[:subject_id].present? ? current_user.subjects.find_by(id: params[:subject_id]) : nil
    
    # Get skills based on subject selection
    @skills = if @selected_subject
                @selected_subject.skills.where(user: current_user)
              else
                current_user.skills
              end

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
