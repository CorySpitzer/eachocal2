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

# Create base skills for each topic
algebra_skills.each do |topic, skills|
  skills.each do |skill_name|
    # Create base skill without user, pattern, or start_date
    skill = Skill.find_or_create_by!(name: skill_name) do |s|
      s.base_skill = true
    end
  end
end

puts "Created #{Skill.base_skills.count} base skills for Algebra"

# Create Test1 and Test2 subjects with test-skill1
test1 = Subject.find_or_create_by!(name: 'Test1', user: user)
test2 = Subject.find_or_create_by!(name: 'Test2', user: user)

# Add test-skill1 to both subjects
['Test1', 'Test2'].each do |subject_name|
  subject = Subject.find_by!(name: subject_name)
  skill = Skill.find_or_create_by!(name: 'test-skill1', user: user) do |s|
    s.pattern = 'daily'  # Adding required fields
    s.start_date = Date.today
  end
  subject.skills << skill unless subject.skills.include?(skill)
end
