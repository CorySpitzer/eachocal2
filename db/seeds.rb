# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Create a test user if it doesn't exist
user = User.find_or_create_by!(email: 'test@example.com') do |u|
  u.password = 'password123'
  u.password_confirmation = 'password123'
end

# Create Algebra subject
algebra = Subject.find_or_create_by!(name: 'Algebra', user: user)

# Comprehensive list of algebra skills organized by topic
algebra_skills = {
  'Basic Concepts': [
    'Order of Operations (PEMDAS)',
    'Properties of Numbers (Commutative, Associative, Distributive)',
    'Absolute Value',
    'Number Line Operations',
    'Integer Operations',
    'Fractions and Mixed Numbers',
    'Decimals and Percentages'
  ],
  
  'Variables and Expressions': [
    'Variables and Constants',
    'Algebraic Expressions',
    'Simplifying Expressions',
    'Combining Like Terms',
    'Evaluating Expressions',
    'Translating Words to Expressions'
  ],
  
  'Equations and Inequalities': [
    'One-Step Equations',
    'Two-Step Equations',
    'Multi-Step Equations',
    'Equations with Variables on Both Sides',
    'Literal Equations',
    'One-Step Inequalities',
    'Multi-Step Inequalities',
    'Compound Inequalities',
    'Absolute Value Equations',
    'Absolute Value Inequalities'
  ],
  
  'Functions and Relations': [
    'Function Notation',
    'Domain and Range',
    'Input-Output Tables',
    'Mapping Diagrams',
    'Linear Functions',
    'Function Operations',
    'Composite Functions',
    'Inverse Functions',
    'Piecewise Functions'
  ],
  
  'Linear Equations': [
    'Slope',
    'Slope-Intercept Form',
    'Point-Slope Form',
    'Standard Form',
    'Parallel and Perpendicular Lines',
    'Writing Linear Equations',
    'Graphing Linear Equations',
    'Linear Inequalities in Two Variables'
  ],
  
  'Systems of Equations': [
    'Graphing Systems of Equations',
    'Substitution Method',
    'Elimination Method',
    'Systems of Linear Inequalities',
    'Three Variable Systems',
    'Applications of Systems'
  ],
  
  'Exponents and Polynomials': [
    'Laws of Exponents',
    'Scientific Notation',
    'Polynomial Operations',
    'Factoring Polynomials',
    'Factor by Grouping',
    'Factoring Trinomials',
    'Factoring Special Products',
    'Solving by Factoring'
  ],
  
  'Rational Expressions': [
    'Simplifying Rational Expressions',
    'Multiplying Rational Expressions',
    'Dividing Rational Expressions',
    'Adding Rational Expressions',
    'Complex Fractions',
    'Rational Equations'
  ],
  
  'Radicals and Complex Numbers': [
    'Simplifying Radicals',
    'Operations with Radicals',
    'Rationalizing Denominators',
    'Solving Radical Equations',
    'Complex Numbers',
    'Operations with Complex Numbers'
  ],
  
  'Quadratic Functions': [
    'Graphing Quadratic Functions',
    'Vertex Form',
    'Standard Form',
    'Factored Form',
    'Completing the Square',
    'Quadratic Formula',
    'Applications of Quadratics'
  ]
}

# First, remove any existing associations
algebra.skills.clear

# Create skills for each topic
algebra_skills.each do |topic, skills|
  skills.each do |skill_name|
    skill = Skill.find_or_create_by!(name: skill_name, user: user) do |s|
      s.pattern = 'Classic'  # Default pattern
      s.start_date = Time.new(2025, 1, 24, 15, 1, 28, "-05:00")  # Default start date
    end
    
    # Ensure the skill is associated with algebra
    unless algebra.skills.include?(skill)
      algebra.skills << skill
    end
  end
end

puts "Created #{Skill.count} skills for Algebra"
puts "Algebra subject has #{algebra.skills.count} skills"
