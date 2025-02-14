class AddRatingToSkills < ActiveRecord::Migration[7.1]
  def change
    add_column :skills, :rating, :integer
  end
end
