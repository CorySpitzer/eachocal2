class TodayController < ApplicationController
  before_action :authenticate_user!

  def index
    @today_skills = current_user.skills
                               .joins(:practice_schedules)
                               .where(practice_schedules: { scheduled_date: Date.current, completed: false })
                               .distinct
  end
end
