class HomeController < ApplicationController
  before_action :authenticate_user!
  
  def index
    @subjects = current_user.subjects.includes(:skills)
    @base_skills = Skill.base_skills.order(:name)
  end

  def add_skill
    base_skill = Skill.base_skills.find(params[:base_skill_id])
    subject = current_user.subjects.find(params[:subject_id])

    # Create a new user-specific skill based on the base skill
    skill = current_user.skills.create!(
      name: base_skill.name,
      pattern: params[:pattern] || 'Classic',
      start_date: params[:start_date],
      subjects: [subject]
    )

    respond_to do |format|
      format.json { render json: { skill: skill } }
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Skill or subject not found' }, status: :not_found
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end
end
