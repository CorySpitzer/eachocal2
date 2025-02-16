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
      Rails.logger.info "Creating practice session with params: #{params.inspect}"
      
      skill = Skill.find(params[:skill_id])
      Rails.logger.info "Found skill: #{skill.inspect}"
      
      # Ensure date is handled consistently
      begin
        scheduled_date = if params[:practice_session][:scheduled_date].is_a?(String)
          Date.parse(params[:practice_session][:scheduled_date])
        else
          params[:practice_session][:scheduled_date].to_date
        end
        Rails.logger.info "Parsed scheduled_date: #{scheduled_date}"
      rescue => e
        Rails.logger.error "Error parsing date: #{e.message}"
        Rails.logger.error "Date string was: #{params[:practice_session][:scheduled_date]}"
        raise
      end
      
      # Check if a practice session already exists for this date
      practice_session = skill.practice_sessions.find_by(scheduled_date: scheduled_date)
      Rails.logger.info "Existing practice session: #{practice_session.inspect}"
      
      if practice_session
        # Update rating if provided
        if params[:practice_session][:rating].present?
          Rails.logger.info "Updating existing session with rating: #{params[:practice_session][:rating]}"
          practice_session.update!(rating: params[:practice_session][:rating])
        end
        render json: practice_session
      else
        # Create new session with rating if provided
        Rails.logger.info "Creating new session with rating: #{params[:practice_session][:rating]}"
        practice_session = skill.practice_sessions.create!(
          scheduled_date: scheduled_date,
          rating: params[:practice_session][:rating]
        )
        
        # Mark any practice schedule for this date as completed
        skill.practice_schedules
            .where(scheduled_date: scheduled_date)
            .update_all(completed: true)
        
        render json: practice_session
      end
    rescue => e
      Rails.logger.error "Error in create: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: e.message }, status: :unprocessable_entity
    end

    private

    def practice_session_params
      params.require(:practice_session).permit(:scheduled_date, :rating)
    end

    def not_found
      render json: { error: 'Record not found' }, status: :not_found
    end

    def invalid_record(exception)
      render json: { error: exception.record.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
