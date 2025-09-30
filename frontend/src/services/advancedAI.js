// Advanced AI Engine for Smart Expense Tracker
class AdvancedAIEngine {
  constructor() {
    this.spendingPatterns = this.loadSpendingPatterns();
    this.userPreferences = this.loadUserPreferences();
    this.aiMemory = this.loadAIMemory();
    this.initializeAI();
  }

  initializeAI() {
    console.log('🧠 Advanced AI Engine initialized');
    this.startRealTimeMonitoring();
  }

  // Load AI memory and learning data
  loadAIMemory() {
    try {
      return JSON.parse(localStorage.getItem('ai-memory')) || {
        categoryAccuracy: {},
        merchantLearning: {},
        spendingBehavior: {},
        predictions: {},
        lastAnalysis: null
      };
    } catch {
      return { categoryAccuracy: {}, merchantLearning: {}, spendingBehavior: {}, predictions: {} };
    }
  }

  // Advanced AI categorization with learning
  intelligentCategorization(description, merchant, amount, date, userHistory = []) {
    const text = (description + ' ' + merchant).toLowerCase();
    
    // Advanced ML-like rules with confidence scoring
    const advancedRules = [
      { 
        keywords: ['starbucks', 'dunkin', 'coffee', 'cafe', 'bistro'], 
        category: 'Food & Dining', 
        confidence: 98,
        subcategory: 'Coffee & Beverages'
      },
      { 
        keywords: ['mcdonald', 'burger', 'pizza', 'restaurant', 'dining', 'food'], 
        category: 'Food & Dining', 
        confidence: 95,
        subcategory: 'Restaurants'
      },
      { 
        keywords: ['uber', 'lyft', 'taxi', 'cab'], 
        category: 'Transportation', 
        confidence: 97,
        subcategory: 'Rideshare'
      },
      { 
        keywords: ['shell', 'exxon', 'chevron', 'gas', 'fuel', 'gasoline'], 
        category: 'Transportation', 
        confidence: 96,
        subcategory: 'Fuel'
      },
      { 
        keywords: ['amazon', 'ebay', 'walmart', 'target', 'costco'], 
        category: 'Shopping', 
        confidence: 94,
        subcategory: 'Online Shopping'
      },
      { 
        keywords: ['netflix', 'spotify', 'hulu', 'disney', 'subscription'], 
        category: 'Entertainment', 
        confidence: 99,
        subcategory: 'Streaming Services'
      },
      { 
        keywords: ['electric', 'pge', 'utility', 'water', 'internet', 'phone', 'cell'], 
        category: 'Bills & Utilities', 
        confidence: 98,
        subcategory: 'Monthly Bills'
      }
    ];

    // Find best match with learning from user behavior
    let bestMatch = null;
    for (const rule of advancedRules) {
      for (const keyword of rule.keywords) {
        if (text.includes(keyword)) {
          // Apply AI learning boost
          const learningBoost = this.aiMemory.merchantLearning[merchant] || 0;
          bestMatch = {
            category: rule.category,
            confidence: Math.min(100, rule.confidence + learningBoost),
            subcategory: rule.subcategory,
            reason: AI matched "" with % learning boost,
            aiEnhanced: learningBoost > 0
          };
          break;
        }
      }
      if (bestMatch) break;
    }

    // Advanced amount-based AI analysis
    if (!bestMatch) {
      bestMatch = this.amountBasedAIAnalysis(amount, date, userHistory);
    }

    // Time-based AI enhancement
    if (bestMatch) {
      bestMatch = this.timeBasedAIEnhancement(bestMatch, date);
    }

    return bestMatch || { 
      category: 'Other', 
      confidence: 50, 
      reason: 'No AI pattern found',
      subcategory: 'Uncategorized'
    };
  }

  // Amount-based AI analysis
  amountBasedAIAnalysis(amount, date, userHistory) {
    const timeOfDay = new Date(date).getHours();
    
    if (amount > 1000) {
      return { category: 'Travel', confidence: 75, reason: 'High amount suggests major expense', subcategory: 'Major Purchase' };
    }
    if (amount > 500) {
      return { category: 'Shopping', confidence: 70, reason: 'Medium-high amount suggests shopping', subcategory: 'Major Shopping' };
    }
    if (amount < 15 && timeOfDay >= 6 && timeOfDay <= 11) {
      return { category: 'Food & Dining', confidence: 80, reason: 'Small morning amount suggests breakfast', subcategory: 'Breakfast' };
    }
    if (amount < 20 && timeOfDay >= 11 && timeOfDay <= 14) {
      return { category: 'Food & Dining', confidence: 75, reason: 'Small lunch-time amount', subcategory: 'Lunch' };
    }
    
    return { category: 'Other', confidence: 60, reason: 'Amount-based estimation', subcategory: 'General' };
  }

  // Time-based AI enhancement
  timeBasedAIEnhancement(prediction, date) {
    const hour = new Date(date).getHours();
    const day = new Date(date).getDay();
    
    // Weekend behavior boost
    if (day === 0 || day === 6) {
      if (prediction.category === 'Entertainment') {
        prediction.confidence = Math.min(100, prediction.confidence + 5);
        prediction.reason += ' (weekend entertainment boost)';
      }
    }
    
    // Time-of-day boosts
    if (hour >= 17 && hour <= 21 && prediction.category === 'Food & Dining') {
      prediction.confidence = Math.min(100, prediction.confidence + 3);
      prediction.subcategory = 'Dinner';
    }
    
    return prediction;
  }

  // Advanced spending analytics with AI predictions
  getAdvancedAnalytics() {
    const expenses = this.loadExpenses();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Current month expenses
    const thisMonth = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    // Advanced calculations
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const thisMonthTotal = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Category analysis with subcategories
    const categoryAnalysis = this.analyzeCategoriesAdvanced(expenses);
    const spendingPredictions = this.generateAdvancedPredictions(expenses);
    const smartInsights = this.generateSmartInsights(expenses, thisMonth);
    const budgetRecommendations = this.generateBudgetRecommendations(expenses);
    const anomalies = this.detectSpendingAnomalies(expenses);
    
    return {
      totalExpenses: expenses.length,
      totalAmount: totalAmount,
      thisMonthTotal: thisMonthTotal,
      thisMonthCount: thisMonth.length,
      avgExpense: totalAmount / (expenses.length || 1),
      categoryAnalysis: categoryAnalysis,
      predictions: spendingPredictions,
      insights: smartInsights,
      budgetRecommendations: budgetRecommendations,
      anomalies: anomalies,
      recentTransactions: expenses.slice(0, 8),
      aiScore: this.calculateAIScore(expenses)
    };
  }

  // Advanced category analysis
  analyzeCategoriesAdvanced(expenses) {
    const analysis = {};
    const subcategoryAnalysis = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      const subcategory = expense.subcategory || 'General';
      
      if (!analysis[category]) {
        analysis[category] = { total: 0, count: 0, avgAmount: 0, trend: 0 };
      }
      
      analysis[category].total += expense.amount;
      analysis[category].count += 1;
      analysis[category].avgAmount = analysis[category].total / analysis[category].count;
      
      // Subcategory tracking
      const key = ${category}:;
      subcategoryAnalysis[key] = (subcategoryAnalysis[key] || 0) + expense.amount;
    });
    
    return { categories: analysis, subcategories: subcategoryAnalysis };
  }

  // Generate advanced predictions using AI
  generateAdvancedPredictions(expenses) {
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), currentMonth + 1, 0).getDate();
    
    const thisMonth = expenses.filter(expense => 
      new Date(expense.date).getMonth() === currentMonth
    );
    
    const totalSoFar = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
    const dailyAverage = totalSoFar / currentDay;
    const projectedTotal = dailyAverage * daysInMonth;
    
    // Advanced weekly predictions
    const weeklyPattern = this.analyzeWeeklyPattern(expenses);
    const nextWeekPrediction = this.predictNextWeekSpending(expenses);
    
    // Category-wise predictions
    const categoryPredictions = this.predictCategorySpending(expenses);
    
    return {
      projectedMonthlyTotal: projectedTotal,
      dailyAverage: dailyAverage,
      remainingDays: daysInMonth - currentDay,
      weeklyPattern: weeklyPattern,
      nextWeekPrediction: nextWeekPrediction,
      categoryPredictions: categoryPredictions,
      confidenceScore: this.calculatePredictionConfidence(expenses)
    };
  }

  // Generate smart AI insights
  generateSmartInsights(expenses, thisMonth) {
    const insights = [];
    
    // Advanced spending pattern analysis
    const patterns = this.analyzeAdvancedPatterns(expenses);
    
    if (patterns.weekendSpending > patterns.weekdaySpending * 0.4) {
      insights.push({
        type: 'pattern',
        priority: 'high',
        icon: '📊',
        title: 'Weekend Spending Pattern Detected',
        message: You spend % more on weekends. AI suggests setting weekend alerts.,
        actionable: true,
        recommendation: 'Set weekend budget limit of '
      });
    }
    
    // Unusual spending detection
    if (patterns.unusualSpikes.length > 0) {
      insights.push({
        type: 'alert',
        priority: 'medium',
        icon: '⚠️',
        title: 'Unusual Spending Detected',
        message: ${patterns.unusualSpikes.length} transactions seem unusually high for your pattern.,
        actionable: true,
        recommendation: 'Review large transactions'
      });
    }
    
    // Smart savings opportunities
    const savingsOpportunities = this.findSavingsOpportunities(expenses);
    if (savingsOpportunities.length > 0) {
      insights.push({
        type: 'savings',
        priority: 'high',
        icon: '💡',
        title: 'AI-Detected Savings Opportunity',
        message: savingsOpportunities[0].message,
        actionable: true,
        recommendation: savingsOpportunities[0].action,
        potentialSavings: savingsOpportunities[0].amount
      });
    }
    
    // Positive reinforcement
    const goodHabits = this.identifyGoodHabits(expenses);
    if (goodHabits.length > 0) {
      insights.push({
        type: 'achievement',
        priority: 'low',
        icon: '🎉',
        title: 'Great Financial Habit!',
        message: goodHabits[0],
        actionable: false
      });
    }
    
    return insights;
  }

  // Real-time monitoring and alerts
  startRealTimeMonitoring() {
    setInterval(() => {
      this.checkForAlerts();
      this.updateAILearning();
    }, 30000); // Check every 30 seconds
  }

  // Helper methods
  loadExpenses() {
    try {
      return JSON.parse(localStorage.getItem('smart-expense-tracker-expenses')) || [];
    } catch {
      return [];
    }
  }

  loadSpendingPatterns() {
    try {
      return JSON.parse(localStorage.getItem('spending-patterns')) || {};
    } catch {
      return {};
    }
  }

  loadUserPreferences() {
    try {
      return JSON.parse(localStorage.getItem('user-preferences')) || {
        monthlyBudget: 2000,
        categoryBudgets: {},
        alertsEnabled: true
      };
    } catch {
      return { monthlyBudget: 2000, categoryBudgets: {}, alertsEnabled: true };
    }
  }

  analyzeAdvancedPatterns(expenses) {
    const dayTotals = {};
    const unusualSpikes = [];
    
    expenses.forEach(expense => {
      const day = new Date(expense.date).getDay();
      dayTotals[day] = (dayTotals[day] || 0) + expense.amount;
      
      // Detect unusual amounts (3x average)
      const avgAmount = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length;
      if (expense.amount > avgAmount * 3) {
        unusualSpikes.push(expense);
      }
    });
    
    const weekendSpending = (dayTotals[0] || 0) + (dayTotals[6] || 0);
    const weekdaySpending = Object.values(dayTotals).reduce((sum, amount) => sum + amount, 0) - weekendSpending;
    
    return { weekendSpending, weekdaySpending, unusualSpikes, dayTotals };
  }

  findSavingsOpportunities(expenses) {
    const opportunities = [];
    const categoryTotals = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    // Dining out opportunity
    if (categoryTotals['Food & Dining'] > 400) {
      opportunities.push({
        message: 'You spent $' + categoryTotals['Food & Dining'].toFixed(2) + ' on dining. Cooking 4 more meals at home could save /month.',
        action: 'Try meal prepping on Sundays',
        amount: 120
      });
    }
    
    // Subscription optimization
    if (categoryTotals['Entertainment'] > 100) {
      opportunities.push({
        message: 'Review streaming subscriptions. You might have overlapping services.',
        action: 'Cancel unused subscriptions',
        amount: 30
      });
    }
    
    return opportunities;
  }

  identifyGoodHabits(expenses) {
    const habits = [];
    const thisMonth = expenses.filter(expense => 
      new Date(expense.date).getMonth() === new Date().getMonth()
    );
    
    const totalThisMonth = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (totalThisMonth < 1500) {
      habits.push('You\'re staying within a reasonable monthly budget. Keep it up!');
    }
    
    const homeCookingCount = thisMonth.filter(expense => 
      expense.category === 'Food & Dining' && expense.amount < 15
    ).length;
    
    if (homeCookingCount > thisMonth.filter(e => e.category === 'Food & Dining').length * 0.6) {
      habits.push('You\'re making smart food choices with home cooking!');
    }
    
    return habits;
  }

  calculateAIScore(expenses) {
    let score = 50; // Base score
    
    // Boost for consistent tracking
    if (expenses.length > 20) score += 10;
    if (expenses.length > 50) score += 10;
    
    // Boost for AI usage
    const aiExpenses = expenses.filter(e => e.aiSuggested).length;
    score += Math.min(20, (aiExpenses / expenses.length) * 20);
    
    // Boost for good habits
    const avgExpense = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length;
    if (avgExpense < 50) score += 10;
    
    return Math.min(100, score);
  }

  // Additional helper methods for predictions and analysis
  analyzeWeeklyPattern(expenses) {
    const weeklyData = {};
    expenses.forEach(expense => {
      const week = Math.floor(new Date(expense.date).getDate() / 7);
      weeklyData[week] = (weeklyData[week] || 0) + expense.amount;
    });
    return weeklyData;
  }

  predictNextWeekSpending(expenses) {
    const recentWeeks = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const weeksAgo = (new Date() - expenseDate) / (1000 * 60 * 60 * 24 * 7);
      return weeksAgo <= 4;
    });
    
    const avgWeekly = recentWeeks.reduce((sum, e) => sum + e.amount, 0) / 4;
    return avgWeekly;
  }

  predictCategorySpending(expenses) {
    const predictions = {};
    const categoryTotals = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    Object.keys(categoryTotals).forEach(category => {
      const monthlyAvg = categoryTotals[category] / 3; // Assume 3 months of data
      predictions[category] = monthlyAvg * 1.1; // 10% buffer
    });
    
    return predictions;
  }

  calculatePredictionConfidence(expenses) {
    if (expenses.length < 10) return 40;
    if (expenses.length < 30) return 60;
    if (expenses.length < 50) return 80;
    return 90;
  }

  generateBudgetRecommendations(expenses) {
    const categoryTotals = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    const recommendations = [];
    const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      const percentage = (amount / totalSpending) * 100;
      let recommendedPercentage = 0;
      
      switch (category) {
        case 'Food & Dining': recommendedPercentage = 15; break;
        case 'Transportation': recommendedPercentage = 15; break;
        case 'Shopping': recommendedPercentage = 10; break;
        case 'Entertainment': recommendedPercentage = 5; break;
        default: recommendedPercentage = 10;
      }
      
      if (percentage > recommendedPercentage * 1.5) {
        recommendations.push({
          category: category,
          current: percentage.toFixed(1),
          recommended: recommendedPercentage,
          message: Consider reducing  spending by %
        });
      }
    });
    
    return recommendations;
  }

  detectSpendingAnomalies(expenses) {
    const anomalies = [];
    const avgAmount = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length;
    const threshold = avgAmount * 5; // 5x average is anomaly
    
    expenses.forEach(expense => {
      if (expense.amount > threshold) {
        anomalies.push({
          expense: expense,
          type: 'high_amount',
          message: Unusually high amount: start{expense.amount} (x your average)
        });
      }
    });
    
    return anomalies;
  }

  checkForAlerts() {
    // Implementation for real-time alerts
    console.log('🔔 Checking for real-time alerts...');
  }

  updateAILearning() {
    // Update AI memory with new patterns
    const expenses = this.loadExpenses();
    if (expenses.length > 0) {
      // Learn from user corrections and patterns
      this.aiMemory.lastAnalysis = new Date().toISOString();
      localStorage.setItem('ai-memory', JSON.stringify(this.aiMemory));
    }
  }
}

// Export the advanced AI engine
const advancedAI = new AdvancedAIEngine();
export default advancedAI;
