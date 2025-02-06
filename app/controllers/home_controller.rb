class HomeController < ApplicationController
  before_action :authenticate_user!
  
  def index
    @subjects = current_user.subjects.includes(:skills)
  end
end
