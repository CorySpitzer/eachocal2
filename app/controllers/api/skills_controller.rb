module Api
  class SkillsController < ApplicationController
    before_action :authenticate_user!
    skip_before_action :verify_authenticity_token
  
    def index
      @skills = current_user.skills.includes(:practice_sessions)
      render json: {
        skills: @skills.map { |skill| 
          {
            skill: skill,
            practice_sessions: skill.practice_sessions
          }
        }
      }
    end

    def create
      @skill = current_user.skills.build(skill_params)
      
      # If a base skill was selected, copy its name
      if params[:base_skill_id].present?
        base_skill = Skill.base_skills.find(params[:base_skill_id])
        @skill.name = base_skill.name
      end

      if @skill.save
        # Create practice sessions for each date in the pattern
        dates = generate_practice_dates(@skill.start_date, @skill.pattern)
        dates.each do |date|
          @skill.practice_sessions.create!(scheduled_date: date)
        end
        
        # Associate with subjects if subject_ids are provided
        @skill.subject_ids = params[:skill][:subject_ids] if params[:skill][:subject_ids]
        
        render json: {
          skill: @skill,
          practice_sessions: @skill.practice_sessions
        }, status: :created
      else
        render json: { errors: @skill.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      @skill = current_user.skills.find(params[:id])
      old_pattern = @skill.pattern
      
      if @skill.update(skill_params)
        if old_pattern != @skill.pattern
          # Delete existing practice sessions
          @skill.practice_sessions.destroy_all
          
          # Create new practice sessions for the new pattern
          dates = generate_practice_dates(@skill.start_date, @skill.pattern)
          dates.each do |date|
            @skill.practice_sessions.create!(scheduled_date: date)
          end
        end
        
        render json: {
          skill: @skill,
          practice_sessions: @skill.practice_sessions
        }, status: :ok
      else
        render json: { errors: @skill.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @skill = current_user.skills.find(params[:id])
      @skill.destroy
      head :no_content
    end

    private

    def skill_params
      params.require(:skill).permit(:name, :pattern, :start_date, subject_ids: [])
    end

    def generate_practice_dates(start_date, pattern_name)
      pattern = case pattern_name
      when 'Classic'
        [1, 2, 4, 7, 14, 30, 60, 120]
      when 'Aggressive'
        [1, 3, 7, 14, 30, 45, 90]
      when 'Gentle'
        [1, 2, 3, 5, 8, 13, 21, 34]
      when 'Double'
        [1, 2, 4, 8, 16, 32, 64, 128]
      when 'Linear'
        [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120]
      when 'Fibonacci'
        [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233]
      when 'NLogN'
        # Generate n*log(n) intervals up to about 120 days
        (1..15).map { |n| (n * Math.log(n + 1)).round }
      when 'ClassicLogN'
        # Start with Classic pattern for early intervals
        early = [1, 2, 4, 7]
        # Then continue with NLogN pattern starting from where we left off
        # We want the next NLogN interval to be larger than 7
        later = (4..12).map { |n| (n * Math.log(n + 1)).round }.select { |x| x > 7 }
        early + later
      else
        # Default to ClassicLogN
        early = [1, 2, 4, 7]
        later = (4..12).map { |n| (n * Math.log(n + 1)).round }.select { |x| x > 7 }
        early + later
      end

      pattern.map { |days| start_date + days.days }
    end
  end
end
