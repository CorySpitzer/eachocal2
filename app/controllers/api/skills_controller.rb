class Api::SkillsController < ApplicationController
  skip_before_action :verify_authenticity_token
  
  def create
    skill = Skill.new(skill_params)
    
    if skill.save
      # Create practice sessions for each date in the pattern
      dates = generate_practice_dates(skill.start_date, skill.pattern)
      dates.each do |date|
        skill.practice_sessions.create!(scheduled_date: date)
      end
      
      render json: {
        skill: skill,
        practice_sessions: skill.practice_sessions
      }, status: :created
    else
      render json: { errors: skill.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    skill = Skill.find(params[:id])
    old_pattern = skill.pattern
    
    if skill.update(skill_params)
      if old_pattern != skill.pattern
        # Delete existing practice sessions
        skill.practice_sessions.destroy_all
        
        # Create new practice sessions for the new pattern
        dates = generate_practice_dates(skill.start_date, skill.pattern)
        dates.each do |date|
          skill.practice_sessions.create!(scheduled_date: date)
        end
      end
      
      render json: {
        skill: skill,
        practice_sessions: skill.practice_sessions
      }, status: :ok
    else
      render json: { errors: skill.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    skill = Skill.find(params[:id])
    skill.destroy
    head :no_content
  end

  private

  def skill_params
    params.require(:skill).permit(:name, :pattern, :start_date)
  end

  def generate_practice_dates(start_date, pattern_name)
    pattern = case pattern_name
    when 'Classic'
      [1, 2, 4, 7, 14, 30, 60, 120]
    when 'Aggressive'
      [1, 3, 7, 14, 30, 45, 90]
    when 'Gentle'
      [1, 2, 3, 5, 8, 13, 21, 34]
    when 'Custom'
      [1, 4, 10, 20, 40, 80, 160]
    when 'Double'
      [1, 2, 4, 8, 16, 32, 64, 128]
    when 'Linear'
      [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120]
    when 'Fibonacci'
      [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233]
    else
      [1, 2, 4, 7, 14, 30, 60, 120] # Default to Classic
    end

    pattern.map { |days| start_date + days.days }
  end
end
