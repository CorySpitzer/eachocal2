class CalendarController < ApplicationController
  before_action :authenticate_user!
  
  def index
    # Get the requested year and month from params, default to current date
    @current_date = if params[:year].present? && params[:month].present?
      Date.new(params[:year].to_i, params[:month].to_i, 1)
    else
      Date.today.beginning_of_month
    end

    @prev_month = @current_date.prev_month.beginning_of_month
    @next_month = @current_date.next_month.beginning_of_month
    
    # Use date-only for range queries
    @start_date = @current_date.beginning_of_month.to_date
    @end_date = @current_date.end_of_month.to_date
    
    # Set up subjects and skills
    @subjects = current_user.subjects.includes(:skills)
    @selected_subject = params[:subject_id].present? ? current_user.subjects.find_by(id: params[:subject_id]) : nil
    
    # Get skills based on subject selection
    @skills = if @selected_subject
                @selected_subject.skills.where(user: current_user)
              else
                current_user.skills
              end

    Rails.logger.info "Calendar - Fetching sessions between #{@start_date} and #{@end_date}"
    
    @calendar_data = @skills.map.with_index do |skill, index|
      # Fetch practice sessions for the current month's view
      practice_sessions = skill.practice_sessions
                             .where(scheduled_date: @start_date..@end_date)
                             .order(:scheduled_date)
                             .includes(:skill)

      Rails.logger.info "Calendar - Found #{practice_sessions.size} sessions for skill: #{skill.name}"
      practice_sessions.each do |session|
        Rails.logger.info "Calendar - Session date: #{session.scheduled_date}"
      end

      {
        id: skill.id,
        name: skill.name,
        pattern: skill.pattern,
        start_date: skill.start_date,
        rating: skill.rating,
        color: generate_color(index),
        practice_sessions: practice_sessions
      }
    end
  end

  private

  def generate_color(index)
    hue = (index * 137.508) % 360
    "hsl(#{hue}, 70%, 45%)"
  end
end
