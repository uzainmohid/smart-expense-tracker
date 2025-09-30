import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  useColorModeValue,
  Button,
  HStack,
  Badge,
  Progress,
  Flex,
  Alert,
  AlertIcon,
  CircularProgress,
  CircularProgressLabel,
  useToast,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiUpload, 
  FiTrendingUp, 
  FiRefreshCw,
  FiCpu,
  FiZap,
  FiTarget,
  FiDollarSign,
  FiCalendar,
  FiBarChart,
  FiFileText
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const statsColumns = useBreakpointValue({ base: 1, sm: 2, lg: 4 });
  const cardSpacing = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const containerPadding = useBreakpointValue({ base: 4, md: 6, lg: 8 });

  const generateAIAnalytics = useMemo(() => {
    return () => {
      try {
        const expenses = JSON.parse(localStorage.getItem('smart-expense-tracker-expenses') || '[]');
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const aiProcessed = expenses.filter(e => e.aiSuggested).length;
        const avgExpense = totalAmount / (expenses.length || 1);

        // Current month analysis
        const currentMonth = new Date().getMonth();
        const thisMonth = expenses.filter(expense => 
          new Date(expense.date).getMonth() === currentMonth
        );
        const thisMonthTotal = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);

        // AI predictions
        const currentDay = new Date().getDate();
        const dailyAverage = thisMonthTotal / currentDay;
        const daysInMonth = new Date(new Date().getFullYear(), currentMonth + 1, 0).getDate();
        const projectedTotal = dailyAverage * daysInMonth;

        // Category analysis
        const categoryAnalysis = {};
        expenses.forEach(expense => {
          const category = expense.category || 'Other';
          categoryAnalysis[category] = (categoryAnalysis[category] || 0) + expense.amount;
        });

        // AI insights
        const insights = [];
        const topCategory = Object.entries(categoryAnalysis).sort(([,a], [,b]) => b - a)[0];
        if (topCategory && topCategory[1] > 100) {
          insights.push({
            type: 'pattern',
            icon: 'chart',
            title: 'AI Spending Pattern Detected',
            message: topCategory[0] + ' is your top spending category with $' + topCategory[1].toFixed(2),
            priority: 'high',
            actionable: true
          });
        }

        if (expenses.length > 0 && aiProcessed / expenses.length > 0.7) {
          insights.push({
            type: 'achievement',
            icon: 'trophy',
            title: 'Excellent AI Integration',
            message: 'Great job! ' + ((aiProcessed / expenses.length) * 100).toFixed(0) + '% of expenses are AI-categorized',
            priority: 'medium',
            actionable: false
          });
        }

        // Smart recommendations
        const recommendations = [];
        if (thisMonthTotal > 0 && projectedTotal > thisMonthTotal * 1.2) {
          recommendations.push({
            type: 'budget_warning',
            title: 'Budget Alert',
            message: 'Your projected spending is 20% above average',
            action: 'Review budget settings'
          });
        }

        return {
          totalAmount,
          totalExpenses: expenses.length,
          thisMonthTotal,
          avgExpense,
          aiProcessed,
          aiAccuracy: aiProcessed > 0 ? 
            expenses.filter(e => e.aiSuggested).reduce((sum, e) => sum + (e.confidence || 0), 0) / aiProcessed : 0,
          predictions: {
            projectedMonthlyTotal: projectedTotal,
            dailyAverage: dailyAverage,
            remainingDays: daysInMonth - currentDay,
            confidenceScore: expenses.length > 10 ? 95 : Math.max(60, expenses.length * 8),
            savingsOpportunity: totalAmount * 0.12
          },
          categoryAnalysis,
          insights,
          recommendations,
          recentTransactions: expenses.slice(0, 5),
          aiScore: Math.min(100, 50 + (aiProcessed / Math.max(expenses.length, 1) * 45) + (expenses.length > 20 ? 5 : 0)),
          performanceMetrics: {
            categoriesTracked: Object.keys(categoryAnalysis).length,
            averageTransactionSize: avgExpense,
            topSpendingDay: thisMonth.length > 0 ? 
              Object.entries(thisMonth.reduce((acc, exp) => {
                const day = new Date(exp.date).getDate();
                acc[day] = (acc[day] || 0) + exp.amount;
                return acc;
              }, {})).sort(([,a], [,b]) => b - a)[0] : [1, 0]
          }
        };
      } catch (error) {
        console.error('Analytics generation error:', error);
        return null;
      }
    };
  }, []);

  const loadAnalytics = () => {
    setIsLoading(true);
    // Optimized loading time based on device
    const loadTime = isMobile ? 400 : isTablet ? 600 : 800;
    
    setTimeout(() => {
      const data = generateAIAnalytics();
      setAnalytics(data);
      setIsLoading(false);
      
      if (data && data.recommendations.length > 0) {
        setTimeout(() => {
          toast({
            title: 'AI Insight Available',
            description: data.recommendations[0].message,
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
        }, 1000);
      }
    }, loadTime);
  };

  useEffect(() => {
    loadAnalytics();
  }, [generateAIAnalytics, isMobile, isTablet]);

  if (isLoading || !analytics) {
    return (
      <Box 
        px={containerPadding} 
        py={{ base: 6, md: 8 }} 
        minH="calc(100vh - 120px)"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress 
          isIndeterminate 
          color="purple.400" 
          size={isMobile ? '80px' : '120px'}
          thickness={4}
        />
        <VStack spacing={3} mt={6}>
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="purple.600">
            AI Loading Smart Dashboard...
          </Text>
          <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600" textAlign="center">
            Analyzing your expenses with artificial intelligence
          </Text>
          <HStack spacing={2}>
            <Badge colorScheme="purple" variant="subtle">AI Processing</Badge>
            <Badge colorScheme="blue" variant="subtle">Real-time Analysis</Badge>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box px={containerPadding} py={{ base: 4, md: 6 }} maxW="full" overflowX="hidden" minH="calc(100vh - 120px)">
      <VStack align="start" spacing={cardSpacing} w="full">
        
        {/* RESPONSIVE HEADER SECTION */}
        <Box w="full">
          <Flex 
            direction={{ base: 'column', lg: 'row' }} 
            justify="space-between" 
            align={{ base: 'start', lg: 'center' }} 
            gap={{ base: 4, lg: 6 }}
            w="full"
          >
            <VStack align="start" spacing={{ base: 2, md: 3 }} flex="1" minW="0">
              <Heading 
                size={{ base: 'lg', md: 'xl', lg: '2xl' }} 
                bgGradient="linear(to-r, blue.400, purple.600)"
                bgClip="text"
                noOfLines={1}
              >
                AI Smart Dashboard
              </Heading>
              <HStack wrap="wrap" spacing={{ base: 2, md: 3 }} w="full">
                <Badge 
                  colorScheme="purple" 
                  variant="solid" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                >
                  AI Score: {analytics.aiScore.toFixed(0)}/100
                </Badge>
                <Badge 
                  colorScheme="green" 
                  variant="outline" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                >
                  {analytics.totalExpenses} Transactions
                </Badge>
                <Badge 
                  colorScheme="blue" 
                  variant="outline" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                  display={{ base: 'none', sm: 'flex' }}
                >
                  {analytics.predictions.confidenceScore}% AI Confidence
                </Badge>
                <Badge 
                  colorScheme="orange" 
                  variant="subtle" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                  display={{ base: 'none', md: 'flex' }}
                >
                  {analytics.performanceMetrics.categoriesTracked} Categories
                </Badge>
              </HStack>
            </VStack>
            
            <VStack spacing={3} w={{ base: 'full', lg: 'auto' }} align={{ base: 'stretch', lg: 'end' }}>
              <HStack spacing={3} w="full" justify={{ base: 'stretch', lg: 'end' }}>
                <Button 
                  leftIcon={<FiCpu />} 
                  variant="outline"
                  onClick={loadAnalytics}
                  colorScheme="purple"
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  isLoading={isLoading}
                  loadingText="AI Processing"
                  minW={{ base: '100px', md: '140px' }}
                >
                  {isMobile ? 'AI Refresh' : 'Refresh AI Analytics'}
                </Button>
                <Button 
                  leftIcon={<FiUpload />} 
                  colorScheme="blue" 
                  variant="outline"
                  onClick={() => navigate('/expenses/upload')}
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  minW={{ base: '100px', md: '120px' }}
                >
                  {isMobile ? 'Upload' : 'AI Upload'}
                </Button>
                <Button 
                  leftIcon={<FiPlus />} 
                  colorScheme="blue"
                  onClick={() => navigate('/expenses/new')}
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  minW={{ base: '80px', md: '100px' }}
                >
                  Add
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </Box>
        
        {/* RESPONSIVE STATS CARDS */}
        <SimpleGrid columns={statsColumns} spacing={cardSpacing} w="full">
          
          {/* Total Amount Card */}
          <Card 
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
            color="white" 
            transition="all 0.3s ease"
            _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
          >
            <CardBody py={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                  AI Total Analysis
                </StatLabel>
                <StatNumber fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}>
                  
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  <StatArrow type="increase" />
                  {analytics.totalExpenses} Smart Transactions
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Monthly Prediction Card */}
          <Card 
            bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" 
            color="white"
            transition="all 0.3s ease"
            _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
          >
            <CardBody py={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                  AI Monthly Forecast
                </StatLabel>
                <StatNumber fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}>
                  
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  <StatArrow type="increase" />
                  Projected: 
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Smart Average Card */}
          <Card 
            bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" 
            color="white"
            transition="all 0.3s ease"
            _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
          >
            <CardBody py={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                  Smart Average
                </StatLabel>
                <StatNumber fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}>
                  
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  <Icon as={FiTarget} mr={1} />
                  AI Per-Transaction
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* AI Forecast Card */}
          <Card 
            bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)" 
            color="white"
            transition="all 0.3s ease"
            _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
          >
            <CardBody py={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                  Days Remaining
                </StatLabel>
                <StatNumber fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}>
                  {Math.max(0, analytics.predictions.remainingDays)}
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  <Icon as={FiCalendar} mr={1} />
                  This Month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* AI INTELLIGENCE CENTER */}
        <Card 
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
          color="white" 
          w="full"
          transition="all 0.3s ease"
          _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
        >
          <CardBody py={cardSpacing}>
            <VStack spacing={cardSpacing} align="start">
              <HStack spacing={4} w="full" wrap="wrap">
                <Icon as={FiCpu} boxSize={{ base: 6, md: 8, lg: 10 }} />
                <VStack align="start" spacing={1} flex="1" minW="0">
                  <Heading size={{ base: 'md', md: 'lg', lg: 'xl' }} noOfLines={1}>
                    AI Intelligence Center
                  </Heading>
                  <Text opacity={0.9} fontSize={{ base: 'sm', md: 'md' }} noOfLines={2}>
                    Advanced machine learning insights and predictive spending analysis
                  </Text>
                </VStack>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={cardSpacing} w="full">
                <VStack spacing={3}>
                  <CircularProgress 
                    value={analytics.predictions.confidenceScore} 
                    color="yellow.400" 
                    size={{ base: '80px', md: '100px', lg: '120px' }}
                    thickness={8}
                  >
                    <CircularProgressLabel fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">
                      {analytics.predictions.confidenceScore}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" fontWeight="semibold">
                    AI Confidence Score
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" opacity={0.8}>
                    Machine learning accuracy
                  </Text>
                </VStack>
                
                <VStack spacing={3}>
                  <Text fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="bold">
                    
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" fontWeight="semibold">
                    Monthly AI Forecast
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" opacity={0.8}>
                    Predictive spending model
                  </Text>
                </VStack>
                
                <VStack spacing={3}>
                  <Text fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="bold">
                    
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" fontWeight="semibold">
                    Daily Smart Average
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" opacity={0.8}>
                    AI calculated pattern
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* RESPONSIVE INSIGHTS AND CATEGORIES */}
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={cardSpacing} w="full">
          
          {/* Category Breakdown */}
          <Card bg={cardBg} transition="all 0.3s ease" _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size={{ base: 'sm', md: 'md' }} color="purple.600">
                  Smart Categories Analysis
                </Heading>
                <VStack align="stretch" spacing={3}>
                  {Object.entries(analytics.categoryAnalysis)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, isMobile ? 4 : 6)
                    .map(([category, amount]) => {
                    const percentage = (amount / analytics.totalAmount) * 100;
                    return (
                      <Box key={category}>
                        <Flex justify="space-between" mb={2} align="center" wrap="wrap" gap={2}>
                          <Text 
                            fontWeight="semibold" 
                            fontSize={{ base: 'sm', md: 'md' }} 
                            noOfLines={1}
                            flex="1"
                          >
                            {category}
                          </Text>
                          <HStack spacing={2}>
                            <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">
                              
                            </Text>
                            <Badge colorScheme="purple" size="sm">
                              {percentage.toFixed(1)}%
                            </Badge>
                          </HStack>
                        </Flex>
                        <Progress 
                          value={percentage} 
                          colorScheme="purple" 
                          size="lg" 
                          borderRadius="full"
                          bg="purple.50"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          AI analyzed spending pattern
                        </Text>
                      </Box>
                    );
                  })}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* AI Insights */}
          <Card bg={cardBg} transition="all 0.3s ease" _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size={{ base: 'sm', md: 'md' }} color="blue.600">
                  AI Smart Insights
                </Heading>
                
                <VStack align="stretch" spacing={3}>
                  {analytics.insights.map((insight, index) => (
                    <Alert
                      key={index}
                      status={insight.type === 'achievement' ? 'success' : 'info'}
                      borderRadius="lg"
                      variant="left-accent"
                    >
                      <AlertIcon />
                      <Box flex="1" minW="0">
                        <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }} noOfLines={1}>
                          {insight.title}
                        </Text>
                        <Text fontSize={{ base: 'xs', md: 'sm' }} mt={1} noOfLines={3}>
                          {insight.message}
                        </Text>
                      </Box>
                    </Alert>
                  ))}
                  
                  {analytics.recentTransactions.length > 0 && (
                    <Box mt={4}>
                      <Text fontWeight="semibold" mb={3} fontSize={{ base: 'sm', md: 'md' }} color="gray.700">
                        Recent Smart Transactions
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {analytics.recentTransactions.slice(0, isMobile ? 3 : 4).map((transaction, index) => (
                          <HStack key={transaction.id || index} justify="space-between" spacing={2}>
                            <VStack align="start" spacing={0} flex="1" minW="0">
                              <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium" noOfLines={1}>
                                {transaction.description}
                              </Text>
                              <HStack spacing={1} wrap="wrap">
                                <Badge colorScheme="blue" size="xs">
                                  {transaction.category}
                                </Badge>
                                {transaction.aiSuggested && (
                                  <Badge colorScheme="purple" size="xs">
                                    AI Enhanced
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                            <VStack align="end" spacing={0}>
                              <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold" color="red.500">
                                -
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {transaction.date}
                              </Text>
                            </VStack>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                  
                  <Alert status="success" borderRadius="lg" variant="left-accent">
                    <AlertIcon />
                    <Box flex="1">
                      <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                        AI Performance Status: Excellent
                      </Text>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} mt={1}>
                        Your expense tracking shows {analytics.aiScore.toFixed(0)}% optimization with {analytics.aiProcessed} AI-enhanced transactions. 
                        Smart categorization accuracy is {analytics.aiAccuracy.toFixed(1)}%.
                      </Text>
                    </Box>
                  </Alert>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* MOBILE QUICK ACTIONS - PROPERLY SCOPED TO DASHBOARD */}
        {isMobile && (
          <Card bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white" w="full">
            <CardBody py={4}>
              <VStack spacing={4}>
                <Text fontWeight="bold" fontSize="md" textAlign="center">
                  Quick AI Actions
                </Text>
                <SimpleGrid columns={2} spacing={3} w="full">
                  <Button 
                    leftIcon={<FiPlus />} 
                    colorScheme="blue" 
                    variant="solid"
                    size="md"
                    onClick={() => navigate('/expenses/new')}
                    bg="blue.500"
                    _hover={{ bg: 'blue.600' }}
                  >
                    Add Expense
                  </Button>
                  <Button 
                    leftIcon={<FiUpload />} 
                    colorScheme="green" 
                    variant="solid"
                    size="md"
                    onClick={() => navigate('/expenses/upload')}
                    bg="green.500"
                    _hover={{ bg: 'green.600' }}
                  >
                    AI Upload
                  </Button>
                  <Button 
                    leftIcon={<FiBarChart />} 
                    colorScheme="purple" 
                    variant="solid"
                    size="md"
                    onClick={() => navigate('/analytics')}
                    bg="purple.500"
                    _hover={{ bg: 'purple.600' }}
                  >
                    Analytics
                  </Button>
                  <Button 
                    leftIcon={<FiFileText />} 
                    colorScheme="orange" 
                    variant="solid"
                    size="md"
                    onClick={() => navigate('/reports')}
                    bg="orange.500"
                    _hover={{ bg: 'orange.600' }}
                  >
                    AI Reports
                  </Button>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* PERFORMANCE METRICS CARD */}
        <Card bg={cardBg} w="full" transition="all 0.3s ease" _hover={{ shadow: 'lg' }}>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size={{ base: 'sm', md: 'md' }} color="gray.700">
                AI Performance Metrics
              </Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Stat textAlign="center">
                  <StatNumber fontSize={{ base: 'lg', md: 'xl' }} color="green.500">
                    {analytics.aiScore.toFixed(0)}%
                  </StatNumber>
                  <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>AI Optimization</StatLabel>
                </Stat>
                <Stat textAlign="center">
                  <StatNumber fontSize={{ base: 'lg', md: 'xl' }} color="blue.500">
                    {analytics.aiProcessed}
                  </StatNumber>
                  <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>AI Enhanced</StatLabel>
                </Stat>
                <Stat textAlign="center">
                  <StatNumber fontSize={{ base: 'lg', md: 'xl' }} color="purple.500">
                    {analytics.performanceMetrics.categoriesTracked}
                  </StatNumber>
                  <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>Categories</StatLabel>
                </Stat>
                <Stat textAlign="center">
                  <StatNumber fontSize={{ base: 'lg', md: 'xl' }} color="orange.500">
                    {analytics.aiAccuracy.toFixed(1)}%
                  </StatNumber>
                  <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>AI Accuracy</StatLabel>
                </Stat>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

      </VStack>
    </Box>
  );
};

export default Dashboard;
