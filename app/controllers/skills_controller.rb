class SkillsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_subject

  def new
    @skill = @subject.skills.new
  end

  def create
    @skill = @subject.skills.new(skill_params)
    @skill.user = current_user

    if @skill.save
      redirect_to calendar_path(subject_id: @subject.id), notice: 'Skill was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def set_subject
    @subject = current_user.subjects.find(params[:subject_id])
  end

  def skill_params
    params.require(:skill).permit(:name, :description, :rating)
  end
end
