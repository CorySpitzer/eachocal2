class HomeController < ApplicationController
  before_action :authenticate_user!
  
  def index
    Rails.logger.debug "Current user: #{current_user.inspect}"
    Rails.logger.debug "Current user ID: #{current_user.id}"
    
    @subjects = current_user.subjects.includes(:skills)
    Rails.logger.debug "Found #{@subjects.size} subjects"
    
    @subjects.each do |subject|
      Rails.logger.debug "Subject '#{subject.name}' has #{subject.skills.size} skills:"
      subject.skills.each do |skill|
        Rails.logger.debug "  - #{skill.name}"
      end
    end
  end
end
