// AI-POWERED REPORTS PAGE
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Alert,
  AlertIcon,
  Flex,
  Icon,
  useToast,
  Input,
  FormControl,
  FormLabel,
  CircularProgress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiMail, 
  FiCalendar,
  FiFileText,
  FiBarChart,
  FiTrendingUp,
  FiFilter,
  FiCpu
} from 'react-icons/fi';

const AIReportsPage = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();
  
  const [reportType, setReportType] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // AI Report Generation Engine
  const generateAIReport = (type) => {
    try {
      const expenses = JSON.parse(localStorage.getItem('smart-expense-tracker-expenses') || '[]');
      
      // Filter expenses by date range and category
      let filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        const dateMatch = expenseDate >= startDate && expenseDate <= endDate;
        const categoryMatch = filterCategory ? expense.category === filterCategory : true;
        
        return dateMatch && categoryMatch;
      });

      // AI Report Analysis
      const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalCount = filteredExpenses.length;
      const avgExpense = totalAmount / (totalCount || 1);
      
      // AI Category Breakdown
      const categoryBreakdown = {};
      filteredExpenses.forEach(expense => {
        const category = expense.category || 'Other';
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = {
            total: 0,
            count: 0,
            percentage: 0,
            aiScore: 0
          };
        }
        categoryBreakdown[category].total += expense.amount;
        categoryBreakdown[category].count += 1;
        categoryBreakdown[category].aiScore += expense.confidence || 0;
      });

      // Calculate percentages and AI scores
      Object.keys(categoryBreakdown).forEach(category => {
        categoryBreakdown[category].percentage = (categoryBreakdown[category].total / totalAmount) * 100;
        categoryBreakdown[category].aiScore = categoryBreakdown[category].aiScore / categoryBreakdown[category].count;
      });

      // AI Trend Analysis
      const trendAnalysis = generateTrendAnalysis(filteredExpenses);
      
      // AI Insights for Report
      const aiInsights = generateReportInsights(filteredExpenses, categoryBreakdown);
      
      // AI Recommendations
      const aiRecommendations = generateReportRecommendations(filteredExpenses, categoryBreakdown);

      return {
        reportType: type,
        period: dateRange.start + ' to ' + dateRange.end,
        summary: {
          totalAmount,
          totalCount,
          avgExpense,
          aiProcessedCount: filteredExpenses.filter(e => e.aiSuggested).length
        },
        categoryBreakdown,
        trendAnalysis,
        transactions: filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)),
        aiInsights,
        aiRecommendations,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Report generation error:', error);
      return null;
    }
  };

  const generateTrendAnalysis = (expenses) => {
    const trends = {
      dailyTrends: {},
      weeklyTrends: {},
      monthlyTrends: {}
    };

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      
      // Daily trends
      const dayKey = date.toISOString().split('T')[0];
      trends.dailyTrends[dayKey] = (trends.dailyTrends[dayKey] || 0) + expense.amount;
      
      // Weekly trends
      const weekKey = 'Week ' + Math.ceil(date.getDate() / 7);
      trends.weeklyTrends[weekKey] = (trends.weeklyTrends[weekKey] || 0) + expense.amount;
      
      // Monthly trends
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      trends.monthlyTrends[monthKey] = (trends.monthlyTrends[monthKey] || 0) + expense.amount;
    });

    return trends;
  };

  const generateReportInsights = (expenses, categoryData) => {
    const insights = [];
    
    // Top spending insight
    const topCategory = Object.entries(categoryData)
      .sort(([,a], [,b]) => b.total - a.total)[0];
    
    if (topCategory) {
      insights.push({
        type: 'spending',
        message: topCategory[0] + ' is your highest spending category at $' + topCategory[1].total.toFixed(2) + ' (' + topCategory[1].percentage.toFixed(1) + '% of total)',
        impact: 'high'
      });
    }

    // AI usage insight
    const aiExpenses = expenses.filter(e => e.aiSuggested).length;
    const aiRatio = (aiExpenses / expenses.length) * 100;
    insights.push({
      type: 'ai_usage',
      message: aiRatio.toFixed(1) + '% of expenses were AI-categorized with average ' + 
               (expenses.filter(e => e.confidence).reduce((sum, e) => sum + e.confidence, 0) / 
                expenses.filter(e => e.confidence).length || 0).toFixed(1) + '% confidence',
      impact: 'medium'
    });

    // Spending frequency insight
    const avgDailyExpenses = expenses.length / 30; // Assuming 30-day period
    insights.push({
      type: 'frequency',
      message: 'Average of ' + avgDailyExpenses.toFixed(1) + ' transactions per day with $' + 
               (expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length).toFixed(2) + ' average amount',
      impact: 'low'
    });

    return insights;
  };

  const generateReportRecommendations = (expenses, categoryData) => {
    const recommendations = [];
    
    // Budget optimization
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const topSpendingCategories = Object.entries(categoryData)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 3);
    
    topSpendingCategories.forEach(([category, data]) => {
      if (data.percentage > 30) {
        recommendations.push({
          type: 'budget',
          category: category,
          message: 'Consider setting a budget limit for ' + category + ' to control spending',
          potentialSavings: Math.round(data.total * 0.1)
        });
      }
    });

    // AI improvement recommendation
    const manualEntries = expenses.filter(e => !e.aiSuggested).length;
    if (manualEntries > expenses.length * 0.5) {
      recommendations.push({
        type: 'ai_improvement',
        message: 'Use AI categorization more frequently to improve tracking accuracy and save time',
        benefit: 'Increased accuracy and automated insights'
      });
    }

    return recommendations;
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = generateAIReport(reportType);
      setReportData(data);
      setIsGenerating(false);
      toast({
        title: '🤖 AI Report Generated',
        description: 'Smart analysis complete with AI insights',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 2000);
  };

  const handleExportReport = (format) => {
    if (!reportData) return;
    
    // Simulate export
    toast({
      title: 'Export Started',
      description: 'AI Report is being exported in ' + format.toUpperCase() + ' format',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  useEffect(() => {
    handleGenerateReport();
  }, []);

  if (isGenerating) {
    return (
      <Box textAlign="center" py={10}>
        <CircularProgress isIndeterminate color="purple.300" />
        <Text mt={4}>🧠 AI Generating Intelligent Report...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack align="start" spacing={8}>
        {/* Header */}
        <Flex justify="space-between" align="center" w="full">
          <VStack align="start" spacing={2}>
            <Heading size="xl">📊 AI Smart Reports</Heading>
            <Text color="gray.600">Intelligent reporting with AI-powered insights</Text>
          </VStack>
          <HStack spacing={3}>
            <Button leftIcon={<FiDownload />} onClick={() => handleExportReport('pdf')} colorScheme="blue">
              Export PDF
            </Button>
            <Button leftIcon={<FiMail />} onClick={() => handleExportReport('email')} variant="outline">
              Email Report
            </Button>
          </HStack>
        </Flex>

        {/* Report Controls */}
        <Card bg={cardBg} w="full">
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              <FormControl>
                <FormLabel>Report Type</FormLabel>
                <Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  <option value="monthly">Monthly Report</option>
                  <option value="quarterly">Quarterly Report</option>
                  <option value="yearly">Yearly Report</option>
                  <option value="custom">Custom Period</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Category Filter</FormLabel>
                <Select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  placeholder="All Categories"
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                </Select>
              </FormControl>
            </SimpleGrid>
            
            <Button 
              leftIcon={<FiCpu />} 
              colorScheme="purple" 
              mt={4} 
              onClick={handleGenerateReport}
              isLoading={isGenerating}
              loadingText="AI Generating..."
            >
              Generate AI Report
            </Button>
          </CardBody>
        </Card>

        {reportData && (
          <>
            {/* Report Summary */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
              <Card bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white">
                <CardBody>
                  <Stat>
                    <StatLabel color="whiteAlpha.900">Total Amount</StatLabel>
                    <StatNumber></StatNumber>
                    <StatHelpText color="whiteAlpha.800">{reportData.period}</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" color="white">
                <CardBody>
                  <Stat>
                    <StatLabel color="whiteAlpha.900">Transactions</StatLabel>
                    <StatNumber>{reportData.summary.totalCount}</StatNumber>
                    <StatHelpText color="whiteAlpha.800">AI Processed: {reportData.summary.aiProcessedCount}</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" color="white">
                <CardBody>
                  <Stat>
                    <StatLabel color="whiteAlpha.900">Average Expense</StatLabel>
                    <StatNumber></StatNumber>
                    <StatHelpText color="whiteAlpha.800">Per Transaction</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)" color="white">
                <CardBody>
                  <Stat>
                    <StatLabel color="whiteAlpha.900">AI Accuracy</StatLabel>
                    <StatNumber>
                      {((reportData.summary.aiProcessedCount / reportData.summary.totalCount) * 100).toFixed(1)}%
                    </StatNumber>
                    <StatHelpText color="whiteAlpha.800">Smart Processing</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Category Breakdown */}
            <Card bg={cardBg} w="full">
              <CardBody>
                <Heading size="md" mb={4}>🎯 Category Analysis</Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Category</Th>
                      <Th>Amount</Th>
                      <Th>Count</Th>
                      <Th>Percentage</Th>
                      <Th>AI Score</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(reportData.categoryBreakdown)
                      .sort(([,a], [,b]) => b.total - a.total)
                      .map(([category, data]) => (
                      <Tr key={category}>
                        <Td fontWeight="semibold">{category}</Td>
                        <Td></Td>
                        <Td>{data.count}</Td>
                        <Td>
                          <Badge colorScheme="purple">
                            {data.percentage.toFixed(1)}%
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme="green">
                            {data.aiScore.toFixed(0)}% AI
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>

            {/* AI Insights */}
            <Card bg={cardBg} w="full">
              <CardBody>
                <Heading size="md" mb={4}>🧠 AI Insights</Heading>
                <VStack align="stretch" spacing={3}>
                  {reportData.aiInsights.map((insight, index) => (
                    <Alert 
                      key={index} 
                      status={insight.impact === 'high' ? 'warning' : 'info'}
                      borderRadius="lg"
                    >
                      <AlertIcon />
                      <Text>{insight.message}</Text>
                    </Alert>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* AI Recommendations */}
            <Card bg={cardBg} w="full">
              <CardBody>
                <Heading size="md" mb={4}>🤖 AI Recommendations</Heading>
                <VStack align="stretch" spacing={3}>
                  {reportData.aiRecommendations.map((rec, index) => (
                    <Alert key={index} status="success" borderRadius="lg">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="semibold">
                          {rec.type === 'budget' ? '💰 Budget Optimization' : '🎯 AI Enhancement'}
                        </Text>
                        <Text mt={1}>{rec.message}</Text>
                        {rec.potentialSavings && (
                          <Text mt={2} fontWeight="bold" color="green.600">
                            Potential Monthly Savings: 
                          </Text>
                        )}
                      </Box>
                    </Alert>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Transactions */}
            <Card bg={cardBg} w="full">
              <CardBody>
                <Heading size="md" mb={4}>💳 Recent Transactions</Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Description</Th>
                      <Th>Category</Th>
                      <Th>Amount</Th>
                      <Th>AI</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {reportData.transactions.slice(0, 10).map((expense) => (
                      <Tr key={expense.id}>
                        <Td>{expense.date}</Td>
                        <Td>{expense.description}</Td>
                        <Td>
                          <Badge colorScheme="blue">{expense.category}</Badge>
                        </Td>
                        <Td fontWeight="bold"></Td>
                        <Td>
                          {expense.aiSuggested && (
                            <Badge colorScheme="purple">
                              🧠 {expense.confidence}%
                            </Badge>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default AIReportsPage;
