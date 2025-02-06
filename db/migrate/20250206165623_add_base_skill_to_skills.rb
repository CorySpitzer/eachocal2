class AddBaseSkillToSkills < ActiveRecord::Migration[7.1]
  def change
    add_column :skills, :base_skill, :boolean, default: false, null: false
    add_index :skills, :base_skill
  end
end
