module Api
  class PracticeSessionsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def rate
      practice_session = PracticeSession.find(params[:id])
      practice_session.update!(rating: params[:rating])
      render json: practice_session
    end

    def create
      skill = Skill.find(params[:skill_id])
      practice_session = skill.practice_sessions.create!(practice_session_params)
      render json: practice_session
    end

    private

    def practice_session_params
      params.require(:practice_session).permit(:scheduled_date)
    end
  end
end
