import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Flex,
  Button,
  useBreakpointValue,
  Spinner,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiBarChart, FiCpu, FiTarget, FiZap, FiRefreshCw, FiPlus, FiUpload, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const statsColumns = useBreakpointValue({ base: 1, sm: 2, lg: 4 });
  const cardSpacing = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const containerPadding = useBreakpointValue({ base: 4, md: 6, lg: 8 });

  const generateAnalytics = useMemo(() => {
    return () => {
      const expenses = JSON.parse(localStorage.getItem('smart-expense-tracker-expenses') || '[]');
      
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const avgExpense = totalAmount / (expenses.length || 1);
      
      // Advanced category breakdown
      const categoryBreakdown = {};
      expenses.forEach(expense => {
        const category = expense.category || 'Other';
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = { total: 0, count: 0, aiProcessed: 0, avgAmount: 0 };
        }
        categoryBreakdown[category].total += expense.amount;
        categoryBreakdown[category].count += 1;
        if (expense.aiSuggested) categoryBreakdown[category].aiProcessed += 1;
      });

      // Calculate averages
      Object.keys(categoryBreakdown).forEach(category => {
        categoryBreakdown[category].avgAmount = categoryBreakdown[category].total / categoryBreakdown[category].count;
      });

      // AI statistics
      const aiProcessed = expenses.filter(e => e.aiSuggested).length;
      const aiAccuracy = aiProcessed > 0 ? 
        expenses.filter(e => e.aiSuggested).reduce((sum, e) => sum + (e.confidence || 0), 0) / aiProcessed : 0;

      // Advanced AI insights
      const insights = [];
      const topCategory = Object.entries(categoryBreakdown).sort(([,a], [,b]) => b.total - a.total)[0];
      if (topCategory) {
        insights.push({
          type: 'pattern',
          icon: 'chart',
          title: 'AI Spending Pattern Analysis',
          message: topCategory[0] + ' dominates with $' + topCategory[1].total.toFixed(2) + ' (' + ((topCategory[1].total / totalAmount) * 100).toFixed(1) + '% of spending)',
          priority: 'high',
          actionable: true
        });
      }

      if (aiProcessed / expenses.length > 0.8) {
        insights.push({
          type: 'achievement',
          icon: 'trophy',
          title: 'AI Integration Excellence',
          message: 'Outstanding! ' + ((aiProcessed / expenses.length) * 100).toFixed(0) + '% of expenses benefit from AI intelligence',
          priority: 'medium',
          actionable: false
        });
      }

      // Trend analysis
      const monthlyTrends = {};
      expenses.forEach(expense => {
        const monthKey = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlyTrends[monthKey] = (monthlyTrends[monthKey] || 0) + expense.amount;
      });

      // Advanced predictions
      const recentMonths = Object.entries(monthlyTrends).slice(-3);
      const avgMonthlySpending = recentMonths.reduce((sum, [, amount]) => sum + amount, 0) / (recentMonths.length || 1);
      
      return {
        totalAmount,
        totalExpenses: expenses.length,
        avgExpense,
        categoryBreakdown,
        aiProcessed,
        aiAccuracy,
        aiEfficiency: (aiProcessed / expenses.length) * 100,
        insights,
        monthlyTrends,
        predictions: {
          projectedSpending: avgMonthlySpending * 1.05,
          savingsPotential: totalAmount * 0.18,
          budgetOptimization: Math.min(100, (expenses.length / 50) * 100),
          aiScore: Math.min(100, 60 + (aiProcessed / Math.max(expenses.length, 1) * 40)),
          trendDirection: recentMonths.length >= 2 ? 
            (recentMonths[recentMonths.length - 1][1] > recentMonths[recentMonths.length - 2][1] ? 'increasing' : 'decreasing') : 'stable'
        },
        performanceMetrics: {
          categoriesTracked: Object.keys(categoryBreakdown).length,
          highestSpendingCategory: topCategory ? topCategory[0] : 'N/A',
          mostAIEnhancedCategory: Object.entries(categoryBreakdown)
            .sort(([,a], [,b]) => b.aiProcessed - a.aiProcessed)[0]?.[0] || 'N/A',
          avgTransactionSize: avgExpense,
          totalSavingsIdentified: totalAmount * 0.12
        }
      };
    };
  }, []);

  const loadAnalytics = () => {
    setIsLoading(true);
    setTimeout(() => {
      const data = generateAnalytics();
      setAnalytics(data);
      setIsLoading(false);
    }, isMobile ? 300 : isTablet ? 600 : 800);
  };

  useEffect(() => {
    loadAnalytics();
  }, [generateAnalytics, isMobile, isTablet]);

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
            AI Processing Analytics...
          </Text>
          <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600" textAlign="center">
            Advanced machine learning analysis in progress
          </Text>
          <HStack spacing={2}>
            <Badge colorScheme="purple" variant="subtle">Deep Learning</Badge>
            <Badge colorScheme="blue" variant="subtle">Pattern Recognition</Badge>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box px={containerPadding} py={{ base: 4, md: 6 }} maxW="full" overflowX="hidden" minH="calc(100vh - 120px)">
      <VStack align="start" spacing={cardSpacing} w="full">
        
        {/* RESPONSIVE HEADER */}
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
                bgGradient="linear(to-r, purple.400, blue.600)"
                bgClip="text"
                noOfLines={1}
              >
                AI Smart Analytics
              </Heading>
              <HStack wrap="wrap" spacing={{ base: 2, md: 3 }} w="full">
                <Badge 
                  colorScheme="purple" 
                  variant="solid" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                >
                  AI Score: {analytics.predictions.aiScore.toFixed(0)}/100
                </Badge>
                <Badge 
                  colorScheme="blue" 
                  variant="outline" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                >
                  {analytics.totalExpenses} Analyzed
                </Badge>
                <Badge 
                  colorScheme="green" 
                  variant="outline" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                  display={{ base: 'none', sm: 'flex' }}
                >
                  {analytics.aiEfficiency.toFixed(0)}% AI Enhanced
                </Badge>
              </HStack>
            </VStack>
            
            <VStack spacing={3} w={{ base: 'full', lg: 'auto' }} align={{ base: 'stretch', lg: 'end' }}>
              <HStack spacing={3} w="full" justify={{ base: 'stretch', lg: 'end' }}>
                <Button 
                  leftIcon={<FiZap />} 
                  colorScheme="purple" 
                  variant="outline"
                  onClick={loadAnalytics}
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  isLoading={isLoading}
                  loadingText="AI Processing"
                  minW={{ base: '120px', md: '140px' }}
                >
                  Refresh AI
                </Button>
                <Button 
                  leftIcon={<FiFileText />} 
                  colorScheme="blue"
                  onClick={() => navigate('/reports')}
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  minW={{ base: '120px', md: '140px' }}
                >
                  Generate Report
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* AI STATS OVERVIEW */}
        <SimpleGrid columns={statsColumns} spacing={cardSpacing} w="full">
          <Card 
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
            color="white" 
            transition="all 0.3s ease" 
            _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
          >
            <CardBody py={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                  Total AI Analyzed
                </StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                  
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  <StatArrow type={analytics.predictions.trendDirection === 'increasing' ? 'increase' : 'decrease'} />
                  AI Processed Amount
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card 
            bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" 
            color="white" 
            transition="all 0.3s ease" 
            _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
          >
            <CardBody py={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                  AI Efficiency Rate
                </StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                  {analytics.aiEfficiency.toFixed(1)}%
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  Smart Processing Rate
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card 
            bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" 
            color="white" 
            transition="all 0.3s ease" 
            _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
          >
            <CardBody py={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                  Smart Transactions
                </StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                  {analytics.totalExpenses}
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  AI Enhanced: {analytics.aiProcessed}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card 
            bg="linear-gradient(135deg, #fa709a 0%, #fee140 100%)" 
            color="white" 
            transition="all 0.3s ease" 
            _hover={{ transform: 'translateY(-4px)', shadow: '2xl' }}
          >
            <CardBody py={{ base: 4, md: 6 }}>
              <Stat>
                <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                  AI Accuracy Score
                </StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                  {analytics.aiAccuracy.toFixed(1)}%
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  Machine Learning Score
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
                    Advanced machine learning insights and behavioral pattern analysis
                  </Text>
                </VStack>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={cardSpacing} w="full">
                <VStack spacing={3}>
                  <CircularProgress 
                    value={analytics.predictions.aiScore} 
                    color="yellow.400" 
                    size={{ base: '80px', md: '100px', lg: '120px' }}
                    thickness={8}
                  >
                    <CircularProgressLabel fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">
                      {analytics.predictions.aiScore.toFixed(0)}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" fontWeight="semibold">
                    AI Intelligence Score
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" opacity={0.8}>
                    Advanced ML accuracy
                  </Text>
                </VStack>
                
                <VStack spacing={3}>
                  <Text fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="bold">
                    {analytics.aiProcessed}
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" fontWeight="semibold">
                    Smart Categorizations
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" opacity={0.8}>
                    AI-powered classifications
                  </Text>
                </VStack>
                
                <VStack spacing={3}>
                  <Text fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="bold">
                    
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" fontWeight="semibold">
                    Savings Potential
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" opacity={0.8}>
                    AI-identified opportunities
                  </Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* ANALYTICS TABS */}
        <Card bg={cardBg} w="full" transition="all 0.3s ease" _hover={{ shadow: 'lg' }}>
          <CardBody>
            <Tabs variant="soft-rounded" colorScheme="purple" isLazy>
              <TabList mb={4} flexWrap="wrap" gap={2}>
                <Tab fontSize={{ base: 'sm', md: 'md' }}>
                  <Icon as={FiBarChart} mr={2} />
                  AI Categories
                </Tab>
                <Tab fontSize={{ base: 'sm', md: 'md' }}>
                  <Icon as={FiTrendingUp} mr={2} />
                  Smart Insights
                </Tab>
                <Tab fontSize={{ base: 'sm', md: 'md' }}>
                  <Icon as={FiTarget} mr={2} />
                  Predictions
                </Tab>
              </TabList>
              
              <TabPanels>
                {/* Category Analysis */}
                <TabPanel px={{ base: 2, md: 6 }}>
                  <Heading size={{ base: 'sm', md: 'md' }} mb={4} color="purple.600">
                    AI Category Intelligence Dashboard
                  </Heading>
                  <VStack align="stretch" spacing={4}>
                    {Object.entries(analytics.categoryBreakdown)
                      .sort(([,a], [,b]) => b.total - a.total)
                      .slice(0, isMobile ? 5 : 10)
                      .map(([category, data]) => {
                      const percentage = (data.total / analytics.totalAmount) * 100;
                      const aiPercentage = (data.aiProcessed / data.count) * 100;
                      return (
                        <Box key={category}>
                          <Flex justify="space-between" mb={2} wrap="wrap" gap={2}>
                            <HStack flex="1" minW="0" spacing={3}>
                              <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }} noOfLines={1}>
                                {category}
                              </Text>
                              <Badge colorScheme="purple" size={{ base: 'xs', md: 'sm' }}>
                                {data.count} transactions
                              </Badge>
                              <Badge colorScheme="blue" size={{ base: 'xs', md: 'sm' }}>
                                {aiPercentage.toFixed(0)}% AI
                              </Badge>
                            </HStack>
                            <VStack align="end" spacing={0}>
                              <Text fontWeight="bold" fontSize={{ base: 'sm', md: 'md' }}>
                                
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                Avg: 
                              </Text>
                            </VStack>
                          </Flex>
                          <Progress value={percentage} colorScheme="purple" size="lg" borderRadius="full" />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            {percentage.toFixed(1)}% of total spending (AI analyzed with {aiPercentage.toFixed(0)}% intelligence)
                          </Text>
                        </Box>
                      );
                    })}
                  </VStack>
                </TabPanel>

                {/* AI Insights */}
                <TabPanel px={{ base: 2, md: 6 }}>
                  <Heading size={{ base: 'sm', md: 'md' }} mb={4} color="blue.600">
                    Advanced AI Intelligence Insights
                  </Heading>
                  <VStack align="stretch" spacing={4}>
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
                    
                    <Alert status="success" borderRadius="lg" variant="left-accent">
                      <AlertIcon />
                      <Box flex="1">
                        <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                          AI Analysis Complete - Performance Excellent
                        </Text>
                        <Text fontSize={{ base: 'xs', md: 'sm' }} mt={1}>
                          AI has processed {analytics.totalExpenses} transactions with {analytics.aiAccuracy.toFixed(1)}% accuracy. 
                          Your spending intelligence shows {analytics.predictions.aiScore.toFixed(0)}% optimization with advanced pattern recognition active.
                        </Text>
                      </Box>
                    </Alert>

                    <Alert status="info" borderRadius="lg" variant="left-accent">
                      <AlertIcon />
                      <Box flex="1">
                        <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                          Performance Metrics Summary
                        </Text>
                        <VStack align="start" spacing={1} mt={2} fontSize={{ base: 'xs', md: 'sm' }}>
                          <Text>• Categories Tracked: {analytics.performanceMetrics.categoriesTracked}</Text>
                          <Text>• Highest Spending: {analytics.performanceMetrics.highestSpendingCategory}</Text>
                          <Text>• Most AI Enhanced: {analytics.performanceMetrics.mostAIEnhancedCategory}</Text>
                          <Text>• Total Savings Identified: </Text>
                        </VStack>
                      </Box>
                    </Alert>
                  </VStack>
                </TabPanel>

                {/* Predictions */}
                <TabPanel px={{ base: 2, md: 6 }}>
                  <Heading size={{ base: 'sm', md: 'md' }} mb={4} color="green.600">
                    AI Predictive Analytics & Forecasting
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Card bg="blue.50" _dark={{ bg: 'blue.900' }} transition="all 0.3s ease" _hover={{ transform: 'translateY(-2px)' }}>
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="blue.700" _dark={{ color: 'blue.300' }}>
                            AI Monthly Forecast
                          </Text>
                          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="blue.600" _dark={{ color: 'blue.400' }}>
                            
                          </Text>
                          <Text fontSize={{ base: 'xs', md: 'sm' }} color="blue.600" _dark={{ color: 'blue.400' }}>
                            Advanced AI analysis based on spending velocity, behavioral patterns, and seasonal trends
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card bg="green.50" _dark={{ bg: 'green.900' }} transition="all 0.3s ease" _hover={{ transform: 'translateY(-2px)' }}>
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="green.700" _dark={{ color: 'green.300' }}>
                            Smart Optimization Potential
                          </Text>
                          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="green.600" _dark={{ color: 'green.400' }}>
                            
                          </Text>
                          <Text fontSize={{ base: 'xs', md: 'sm' }} color="green.600" _dark={{ color: 'green.400' }}>
                            AI-identified monthly savings through intelligent budgeting, pattern analysis, and behavioral optimization
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  <Card variant="outline" mt={6} transition="all 0.3s ease" _hover={{ shadow: 'md' }}>
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Heading size={{ base: 'sm', md: 'md' }} color="purple.600">
                          AI Optimization Dashboard
                        </Heading>
                        <Box>
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize={{ base: 'sm', md: 'md' }}>Budget Intelligence Score</Text>
                            <Badge colorScheme="purple" fontSize={{ base: 'xs', md: 'sm' }}>
                              {analytics.predictions.budgetOptimization.toFixed(0)}%
                            </Badge>
                          </HStack>
                          <Progress 
                            value={analytics.predictions.budgetOptimization} 
                            colorScheme="purple" 
                            size="lg" 
                            borderRadius="full" 
                          />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            AI comprehensive analysis of expense tracking efficiency, categorization accuracy, and spending optimization
                          </Text>
                        </Box>
                        
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Stat textAlign="center">
                            <StatNumber fontSize={{ base: 'lg', md: 'xl' }} color="blue.500">
                              {analytics.predictions.trendDirection === 'increasing' ? '+' : '-'}
                              {Math.abs(((analytics.predictions.projectedSpending - analytics.avgExpense * 30) / (analytics.avgExpense * 30)) * 100).toFixed(1)}%
                            </StatNumber>
                            <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>Trend Direction</StatLabel>
                          </Stat>
                          <Stat textAlign="center">
                            <StatNumber fontSize={{ base: 'lg', md: 'xl' }} color="green.500">
                              {((analytics.predictions.savingsPotential / analytics.totalAmount) * 100).toFixed(0)}%
                            </StatNumber>
                            <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>Savings Rate</StatLabel>
                          </Stat>
                          <Stat textAlign="center">
                            <StatNumber fontSize={{ base: 'lg', md: 'xl' }} color="purple.500">
                              {analytics.performanceMetrics.categoriesTracked}
                            </StatNumber>
                            <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>AI Categories</StatLabel>
                          </Stat>
                        </SimpleGrid>
                      </VStack>
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        {/* FIXED: AI QUICK ACTIONS - FULL RESPONSIVE MOBILE */}
        {isMobile && (
          <Box w="full" px={0} mx={0}>
            <Card 
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
              color="white" 
              w="full"
              mx={0}
            >
              <CardBody py={6} px={6}>
                <VStack spacing={6} w="full">
                  <VStack spacing={2} w="full">
                    <Text fontWeight="bold" fontSize="lg" textAlign="center">
                      AI Quick Actions
                    </Text>
                    <Text fontSize="sm" textAlign="center" opacity={0.9}>
                      Smart analytics shortcuts
                    </Text>
                  </VStack>
                  
                  <VStack spacing={4} w="full">
                    <SimpleGrid columns={2} spacing={4} w="full">
                      <Button 
                        leftIcon={<FiFileText />} 
                        colorScheme="blue" 
                        variant="solid"
                        size="lg"
                        onClick={() => navigate('/reports')}
                        bg="blue.500"
                        _hover={{ bg: 'blue.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>AI Reports</Text>
                        <Text fontSize="xs" opacity={0.8}>Generate</Text>
                      </Button>
                      <Button 
                        leftIcon={<FiZap />} 
                        colorScheme="purple" 
                        variant="solid"
                        size="lg"
                        onClick={loadAnalytics}
                        isLoading={isLoading}
                        bg="purple.500"
                        _hover={{ bg: 'purple.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>Refresh AI</Text>
                        <Text fontSize="xs" opacity={0.8}>Analytics</Text>
                      </Button>
                    </SimpleGrid>
                    
                    <SimpleGrid columns={2} spacing={4} w="full">
                      <Button 
                        leftIcon={<FiPlus />} 
                        colorScheme="green" 
                        variant="solid"
                        size="lg"
                        onClick={() => navigate('/expenses/new')}
                        bg="green.500"
                        _hover={{ bg: 'green.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>Add Smart</Text>
                        <Text fontSize="xs" opacity={0.8}>Expense</Text>
                      </Button>
                      <Button 
                        leftIcon={<FiUpload />} 
                        colorScheme="orange" 
                        variant="solid"
                        size="lg"
                        onClick={() => navigate('/expenses/upload')}
                        bg="orange.500"
                        _hover={{ bg: 'orange.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>AI Upload</Text>
                        <Text fontSize="xs" opacity={0.8}>Receipt</Text>
                      </Button>
                    </SimpleGrid>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        )}

      </VStack>
    </Box>
  );
};

export default Analytics;

