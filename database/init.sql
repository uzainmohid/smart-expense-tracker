-- Smart Expense Tracker - Database Initialization
-- SQL script to create initial database structure and sample data

-- Create database (PostgreSQL)
-- CREATE DATABASE expense_tracker;
-- USE expense_tracker;

-- Note: For SQLite, tables will be created automatically by Flask-SQLAlchemy

-- Insert sample categories (these will be inserted by the application)
-- This is just for reference

/*
INSERT INTO categories (name, description, color, icon, is_system, sort_order) VALUES
('Food & Dining', 'Expenses related to food and dining', '#FF6B6B', '🍽️', true, 1),
('Transportation', 'Expenses related to transportation', '#4ECDC4', '🚗', true, 2),
('Shopping', 'Expenses related to shopping', '#45B7D1', '🛍️', true, 3),
('Entertainment', 'Expenses related to entertainment', '#96CEB4', '🎬', true, 4),
('Bills & Utilities', 'Expenses related to bills and utilities', '#FFEAA7', '💡', true, 5),
('Healthcare', 'Expenses related to healthcare', '#DDA0DD', '🏥', true, 6),
('Education', 'Expenses related to education', '#FFB347', '📚', true, 7),
('Travel', 'Expenses related to travel', '#87CEEB', '✈️', true, 8),
('Business', 'Expenses related to business', '#F0E68C', '💼', true, 9),
('Other', 'Other miscellaneous expenses', '#D3D3D3', '📋', true, 10);
*/

-- Create indexes for better performance (SQLAlchemy will handle this)
/*
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_amount ON expenses(amount);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
*/

-- Database initialization complete
