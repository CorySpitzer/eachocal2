module Api
  class SkillsController < ApplicationController
    before_action :authenticate_user!
    skip_before_action :verify_authenticity_token
    rescue_from StandardError, with: :handle_error
  
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
      Rails.logger.info "Creating skill with params: #{params.inspect}"
      Rails.logger.info "Skill params: #{skill_params.inspect}"
      
      @skill = current_user.skills.build(skill_params)
      Rails.logger.info "Built skill: #{@skill.inspect}"
      Rails.logger.info "Skill valid? #{@skill.valid?}"
      Rails.logger.info "Skill errors: #{@skill.errors.full_messages}" unless @skill.valid?
      
      # If a base skill was selected, copy its name
      if params[:base_skill_id].present?
        Rails.logger.info "Finding base skill: #{params[:base_skill_id]}"
        base_skill = Skill.base_skills.find(params[:base_skill_id])
        @skill.name = base_skill.name
        Rails.logger.info "Updated skill name from base skill: #{@skill.name}"
      end

      if @skill.save
        Rails.logger.info "Skill saved successfully"
        
        # Generate practice schedules using the PracticeScheduleGenerator
        PracticeScheduleGenerator.generate_schedules(@skill)
        Rails.logger.info "Generated practice schedules"
        
        # Associate with subjects if subject_ids are provided
        if params[:skill][:subject_ids]
          Rails.logger.info "Associating with subjects: #{params[:skill][:subject_ids]}"
          @skill.subject_ids = params[:skill][:subject_ids]
        end
        
        render json: {
          skill: @skill.as_json(include: :practice_sessions),
          practice_sessions: @skill.practice_sessions
        }, status: :created
      else
        Rails.logger.error "Failed to save skill: #{@skill.errors.full_messages}"
        Rails.logger.error "Validation context: #{@skill.validation_context}"
        Rails.logger.error "Current attributes: #{@skill.attributes}"
        render json: { 
          errors: @skill.errors.full_messages,
          validation_context: @skill.validation_context,
          current_attributes: @skill.attributes
        }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error in create: #{e.class} - #{e.message}\n#{e.backtrace.join("\n")}"
      render json: { 
        error: e.message,
        details: e.backtrace.first(5)
      }, status: :unprocessable_entity
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

    def handle_error(e)
      Rails.logger.error "API Error: #{e.class} - #{e.message}\n#{e.backtrace.join("\n")}"
      render json: { 
        error: e.message,
        details: e.backtrace.first(5)
      }, status: :unprocessable_entity
    end
  end
end
