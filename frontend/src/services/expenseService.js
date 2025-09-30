// Smart Expense Tracker - Expense Service with AI
class ExpenseService {
  constructor() {
    this.expenses = this.loadExpenses();
    this.categories = [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
      'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Business', 'Other'
    ];
  }

  // Load expenses from localStorage
  loadExpenses() {
    try {
      const stored = localStorage.getItem('smart-expense-tracker-expenses');
      return stored ? JSON.parse(stored) : this.getSampleExpenses();
    } catch (error) {
      console.error('Error loading expenses:', error);
      return this.getSampleExpenses();
    }
  }

  // Save expenses to localStorage
  saveExpenses() {
    try {
      localStorage.setItem('smart-expense-tracker-expenses', JSON.stringify(this.expenses));
      return true;
    } catch (error) {
      console.error('Error saving expenses:', error);
      return false;
    }
  }

  // Get sample data for initial load
  getSampleExpenses() {
    return [
      {
        id: 1,
        description: 'Starbucks Coffee',
        amount: 5.75,
        category: 'Food & Dining',
        date: '2025-09-29',
        merchant: 'Starbucks',
        confidence: 95,
        aiSuggested: true,
        notes: 'Morning coffee'
      },
      {
        id: 2,
        description: 'Uber Ride',
        amount: 18.50,
        category: 'Transportation',
        date: '2025-09-28',
        merchant: 'Uber',
        confidence: 92,
        aiSuggested: true,
        notes: 'To airport'
      },
      {
        id: 3,
        description: 'Grocery Shopping',
        amount: 67.89,
        category: 'Food & Dining',
        date: '2025-09-28',
        merchant: 'Safeway',
        confidence: 88,
        aiSuggested: true,
        notes: 'Weekly groceries'
      }
    ];
  }

  // AI Category Prediction
  predictCategory(description, merchant = '', amount = 0) {
    const text = (description + ' ' + merchant).toLowerCase();
    
    // AI categorization rules
    const rules = [
      { keywords: ['starbucks', 'coffee', 'cafe', 'restaurant', 'food', 'lunch', 'dinner', 'pizza', 'burger'], category: 'Food & Dining', confidence: 95 },
      { keywords: ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'bus'], category: 'Transportation', confidence: 93 },
      { keywords: ['amazon', 'target', 'walmart', 'shop', 'store', 'purchase'], category: 'Shopping', confidence: 90 },
      { keywords: ['netflix', 'spotify', 'movie', 'theater', 'game', 'entertainment'], category: 'Entertainment', confidence: 92 },
      { keywords: ['electric', 'gas bill', 'water', 'internet', 'phone', 'utility'], category: 'Bills & Utilities', confidence: 96 },
      { keywords: ['doctor', 'hospital', 'pharmacy', 'medical', 'health'], category: 'Healthcare', confidence: 94 },
      { keywords: ['school', 'university', 'course', 'book', 'education'], category: 'Education', confidence: 91 },
      { keywords: ['hotel', 'flight', 'airbnb', 'travel', 'vacation'], category: 'Travel', confidence: 89 },
      { keywords: ['office', 'supplies', 'meeting', 'business', 'conference'], category: 'Business', confidence: 87 }
    ];

    // Find best match
    for (const rule of rules) {
      for (const keyword of rule.keywords) {
        if (text.includes(keyword)) {
          return {
            category: rule.category,
            confidence: rule.confidence,
            reason: 'Matched keyword: ' + keyword
          };
        }
      }
    }

    // Amount-based prediction
    if (amount > 500) return { category: 'Travel', confidence: 70, reason: 'High amount suggests travel/major purchase' };
    if (amount > 100) return { category: 'Shopping', confidence: 65, reason: 'Medium amount suggests shopping' };
    if (amount < 20) return { category: 'Food & Dining', confidence: 60, reason: 'Small amount suggests food/drink' };

    return { category: 'Other', confidence: 50, reason: 'No clear pattern found' };
  }

  // Add new expense
  addExpense(expenseData) {
    const newExpense = {
      id: Date.now(),
      ...expenseData,
      createdAt: new Date().toISOString()
    };

    this.expenses.unshift(newExpense);
    this.saveExpenses();
    return newExpense;
  }

  // Get all expenses
  getExpenses() {
    return this.expenses;
  }

  // Get expense by ID
  getExpense(id) {
    return this.expenses.find(expense => expense.id === parseInt(id));
  }

  // Update expense
  updateExpense(id, updates) {
    const index = this.expenses.findIndex(expense => expense.id === parseInt(id));
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...updates };
      this.saveExpenses();
      return this.expenses[index];
    }
    return null;
  }

  // Delete expense
  deleteExpense(id) {
    const index = this.expenses.findIndex(expense => expense.id === parseInt(id));
    if (index !== -1) {
      this.expenses.splice(index, 1);
      this.saveExpenses();
      return true;
    }
    return false;
  }

  // AI Analytics
  getAIInsights() {
    const expenses = this.expenses;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Current month expenses
    const thisMonth = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    // Calculate totals by category
    const categoryTotals = {};
    thisMonth.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    // Find top spending category
    const topCategory = Object.entries(categoryTotals).reduce((a, b) => a[1] > b[1] ? a : b, ['Other', 0]);
    
    // Calculate insights
    const totalThisMonth = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
    const avgExpense = totalThisMonth / (thisMonth.length || 1);
    
    return {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      thisMonthTotal: totalThisMonth,
      thisMonthCount: thisMonth.length,
      avgExpense: avgExpense,
      topCategory: topCategory[0],
      topCategoryAmount: topCategory[1],
      categoryBreakdown: categoryTotals,
      insights: this.generateInsights(expenses, categoryTotals, totalThisMonth),
      predictions: this.generatePredictions(expenses)
    };
  }

  // Generate AI insights
  generateInsights(expenses, categoryTotals, totalThisMonth) {
    const insights = [];
    
    // Spending pattern analysis
    const dayTotals = {};
    expenses.forEach(expense => {
      const day = new Date(expense.date).getDay();
      dayTotals[day] = (dayTotals[day] || 0) + expense.amount;
    });
    
    const weekendSpending = (dayTotals[0] || 0) + (dayTotals[6] || 0);
    const weekdaySpending = Object.values(dayTotals).reduce((sum, amount) => sum + amount, 0) - weekendSpending;
    
    if (weekendSpending > weekdaySpending * 0.4) {
      insights.push({
        type: 'pattern',
        icon: '📈',
        title: 'Weekend Spending Alert',
        message: 'You spend significantly more on weekends. Consider setting weekend budgets.'
      });
    }

    // Category insights
    const topCategory = Object.entries(categoryTotals).reduce((a, b) => a[1] > b[1] ? a : b, ['Other', 0]);
    if (topCategory[1] > totalThisMonth * 0.4) {
      insights.push({
        type: 'category',
        icon: '🎯',
        title: 'Top Spending Category',
        message: ${topCategory[0]} accounts for % of your spending this month.
      });
    }

    // Savings suggestions
    if (categoryTotals['Food & Dining'] > 300) {
      insights.push({
        type: 'savings',
        icon: '💡',
        title: 'Savings Opportunity',
        message: 'You could save /month by cooking 3 more meals at home per week.'
      });
    }

    // Budget insights
    const monthlyBudget = 1000; // Default budget
    if (totalThisMonth < monthlyBudget * 0.8) {
      insights.push({
        type: 'budget',
        icon: '🎉',
        title: 'Great Job!',
        message: You are % under budget this month.
      });
    }

    return insights;
  }

  // Generate predictions
  generatePredictions(expenses) {
    const currentMonth = new Date().getMonth();
    const daysInMonth = new Date(new Date().getFullYear(), currentMonth + 1, 0).getDate();
    const currentDay = new Date().getDate();
    
    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth;
    });
    
    const totalSoFar = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const dailyAverage = totalSoFar / currentDay;
    const projectedTotal = dailyAverage * daysInMonth;
    
    return {
      projectedMonthlyTotal: projectedTotal,
      dailyAverage: dailyAverage,
      remainingDays: daysInMonth - currentDay,
      projectedDailySpending: dailyAverage
    };
  }
}

// OCR Service for receipt processing
class OCRService {
  async processReceipt(file) {
    // Simulate OCR processing with realistic delay and data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different receipt types based on file name or random
        const receiptTypes = [
          {
            merchant: 'Starbucks Coffee',
            amount: 5.75,
            date: new Date().toISOString().split('T')[0],
            items: [{ name: 'Grande Latte', price: 5.75 }],
            category: 'Food & Dining',
            confidence: 95
          },
          {
            merchant: 'Shell Gas Station',
            amount: 45.20,
            date: new Date().toISOString().split('T')[0],
            items: [{ name: 'Regular Gas', price: 45.20 }],
            category: 'Transportation',
            confidence: 92
          },
          {
            merchant: 'Amazon.com',
            amount: 89.99,
            date: new Date().toISOString().split('T')[0],
            items: [{ name: 'Electronics Purchase', price: 89.99 }],
            category: 'Shopping',
            confidence: 88
          }
        ];
        
        const randomReceipt = receiptTypes[Math.floor(Math.random() * receiptTypes.length)];
        resolve({
          success: true,
          data: randomReceipt
        });
      }, 3000); // 3 second processing time
    });
  }
}

// Export services
const expenseService = new ExpenseService();
const ocrService = new OCRService();

export { expenseService, ocrService };
export default expenseService;
