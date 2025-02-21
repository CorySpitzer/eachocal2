class TodayController < ApplicationController
  before_action :authenticate_user!

  def index
    @current_date = if params[:date].present?
      Date.parse(params[:date])
    else
      Date.current
    end

    @prev_date = @current_date - 1.day
    @next_date = @current_date + 1.day

    # Add one day to the query date to match homepage calendar
    query_date = @current_date + 1.day
    Rails.logger.info "Today - Looking for skills on date: #{query_date}"

    @today_skills = current_user.skills
                               .joins(:practice_schedules)
                               .where(practice_schedules: { scheduled_date: query_date, completed: false })
                               .distinct
  end
end
