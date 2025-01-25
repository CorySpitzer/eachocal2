module Api
  class PracticeSessionsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def rate
      session = PracticeSession.find(params[:id])
      if session.update(rating: params[:rating])
        render json: session
      else
        render json: { errors: session.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def create
      skill = Skill.find(params[:skill_id])
      session = skill.practice_sessions.build(session_params)
      
      if session.save
        render json: session
      else
        render json: { errors: session.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def session_params
      params.require(:practice_session).permit(:scheduled_date, :rating)
    end
  end
end
