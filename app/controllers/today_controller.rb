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

    @today_skills = current_user.skills
                               .joins(:practice_schedules)
                               .where(practice_schedules: { scheduled_date: @current_date, completed: false })
                               .distinct
  end
end
