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
        # Generate practice schedules using the PracticeScheduleGenerator
        PracticeScheduleGenerator.generate_schedules(@skill)
        
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
          # Delete existing practice sessions and schedules
          @skill.practice_sessions.destroy_all
          @skill.practice_schedules.destroy_all
          
          # Generate new schedules and sessions
          PracticeScheduleGenerator.generate_schedules(@skill)
        end
        
        render json: {
          skill: @skill,
          practice_sessions: @skill.practice_sessions,
          practice_schedules: @skill.practice_schedules
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

    def reset_start_date
      @skill = Skill.find(params[:id])
      new_start_date = Date.parse(params[:start_date])

      # Start a transaction to ensure all updates happen together
      ActiveRecord::Base.transaction do
        # Update skill's start date
        @skill.update!(start_date: new_start_date)

        # Delete all existing practice sessions and schedules
        @skill.practice_sessions.destroy_all
        @skill.practice_schedules.destroy_all

        # Generate new schedules and sessions
        PracticeScheduleGenerator.generate_schedules(@skill)
      end

      render json: { 
        skill: @skill,
        practice_sessions: @skill.practice_sessions.order(:scheduled_date),
        practice_schedules: @skill.practice_schedules
      }
    rescue => e
      render json: { error: e.message }, status: :unprocessable_entity
    end

    private

    def skill_params
      params.require(:skill).permit(:name, :pattern, :start_date, :rating, subject_ids: [])
    end
  end
end
