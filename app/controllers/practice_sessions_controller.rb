class PracticeSessionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_practice_session, only: [:reschedule]
  protect_from_forgery with: :exception

  def reschedule
    Rails.logger.info "Reschedule params: #{params.inspect}"
    
    begin
      new_date = Date.parse(params[:new_date])
      days_difference = (new_date - @practice_session.scheduled_date.to_date).to_i
      
      Rails.logger.info "Rescheduling session #{@practice_session.id} from #{@practice_session.scheduled_date} to #{new_date}"
      
      # Find all practice sessions for this skill that are scheduled after the current session
      subsequent_sessions = PracticeSession.where(skill_id: @practice_session.skill_id)
                                         .where('scheduled_date > ?', @practice_session.scheduled_date)
                                         .order(:scheduled_date)

      ActiveRecord::Base.transaction do
        # Update the selected session
        @practice_session.update!(scheduled_date: new_date)

        # Update all subsequent sessions
        subsequent_sessions.each do |session|
          session.update!(scheduled_date: session.scheduled_date + days_difference.days)
        end

        Rails.logger.info "Successfully rescheduled session and #{subsequent_sessions.count} subsequent sessions"
        
        respond_to do |format|
          format.json { render json: { success: true, message: 'Session rescheduled successfully' } }
        end
      end
    rescue StandardError => e
      Rails.logger.error "Error in reschedule: #{e.class} - #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      respond_to do |format|
        format.json { render json: { error: e.message }, status: :unprocessable_entity }
      end
    end
  end

  private

  def set_practice_session
    @practice_session = PracticeSession.find(params[:id])
    Rails.logger.info "Found practice session: #{@practice_session.inspect}"
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error "Practice session not found with id: #{params[:id]}"
    respond_to do |format|
      format.json { render json: { error: 'Practice session not found' }, status: :not_found }
    end
  end
end
