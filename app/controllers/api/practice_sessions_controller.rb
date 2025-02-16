module Api
  class PracticeSessionsController < ApplicationController
    skip_before_action :verify_authenticity_token
    rescue_from ActiveRecord::RecordNotFound, with: :not_found
    rescue_from ActiveRecord::RecordInvalid, with: :invalid_record

    def rate
      practice_session = PracticeSession.find(params[:id])
      practice_session.update!(rating: params[:rating])
      render json: practice_session
    end

    def create
      skill = Skill.find(params[:skill_id])
      
      # Ensure date is handled consistently
      scheduled_date = if params[:practice_session][:scheduled_date].is_a?(String)
        Date.parse(params[:practice_session][:scheduled_date])
      else
        params[:practice_session][:scheduled_date].to_date
      end
      
      # Check if a practice session already exists for this date
      practice_session = skill.practice_sessions.find_by(scheduled_date: scheduled_date)
      
      if practice_session
        render json: practice_session
      else
        practice_session = skill.practice_sessions.create!(scheduled_date: scheduled_date)
        
        # Mark any practice schedule for this date as completed
        skill.practice_schedules
            .where(scheduled_date: scheduled_date)
            .update_all(completed: true)
        
        render json: practice_session
      end
    end

    private

    def practice_session_params
      params.require(:practice_session).permit(:scheduled_date)
    end

    def not_found
      render json: { error: 'Record not found' }, status: :not_found
    end

    def invalid_record(exception)
      render json: { error: exception.record.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
