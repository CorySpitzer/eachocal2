class AddUserToSkills < ActiveRecord::Migration[7.1]
  def change
    add_reference :skills, :user, null: true, foreign_key: true
  end
end
