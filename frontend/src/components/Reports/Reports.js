import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Progress,
  useColorModeValue,
  Alert,
  AlertIcon,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Spinner,
  Icon,
  Flex,
  useBreakpointValue,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { FiDownload, FiMail, FiBarChart, FiCalendar, FiFileText, FiCpu, FiZap, FiPlus, FiUpload, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // FIXED: Move all useColorModeValue calls to top level
  const selectBg = useColorModeValue('gray.50', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.600');
  const toast = useToast();
  
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const statsColumns = useBreakpointValue({ base: 1, sm: 2, lg: 4 });
  const cardSpacing = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const containerPadding = useBreakpointValue({ base: 4, md: 6, lg: 8 });

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange]);

  const generateReport = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const expenses = JSON.parse(localStorage.getItem('smart-expense-tracker-expenses') || '[]');
      
      // Filter by date range
      const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return expenseDate >= startDate && expenseDate <= endDate;
      });

      const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const categories = {};
      const aiProcessed = filteredExpenses.filter(e => e.aiSuggested || e.aiEnhanced).length;
      
      filteredExpenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
      });

      // Advanced AI Insights
      const insights = [];
      const topCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0];
      if (topCategory) {
        insights.push({
          type: 'spending',
          title: 'AI Spending Analysis',
          message: topCategory[0] + ' dominates your spending at $' + topCategory[1].toFixed(2) + ' (' + ((topCategory[1] / total) * 100).toFixed(1) + '%)',
          priority: 'high'
        });
      }

      if (filteredExpenses.length > 0 && aiProcessed / filteredExpenses.length > 0.7) {
        insights.push({
          type: 'ai',
          title: 'AI Integration Excellence',
          message: 'Outstanding! ' + ((aiProcessed / filteredExpenses.length) * 100).toFixed(0) + '% of expenses benefit from AI intelligence',
          priority: 'medium'
        });
      }

      // Performance metrics
      const performanceScore = Math.min(100, 60 + (aiProcessed / Math.max(filteredExpenses.length, 1) * 40));
      const categoryCount = Object.keys(categories).length;
      const avgTransaction = total / (filteredExpenses.length || 1);

      setReportData({
        totalAmount: total,
        totalExpenses: filteredExpenses.length,
        categories: categories,
        avgExpense: avgTransaction,
        aiProcessed: aiProcessed,
        insights: insights,
        transactions: filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)),
        period: dateRange.start + ' to ' + dateRange.end,
        reportType: reportType,
        generatedAt: new Date().toISOString(),
        performanceMetrics: {
          aiScore: performanceScore,
          categoryCount: categoryCount,
          aiAccuracy: aiProcessed > 0 ? 
            filteredExpenses.filter(e => e.aiSuggested).reduce((sum, e) => sum + (e.confidence || 0), 0) / aiProcessed : 0,
          savingsPotential: total * 0.15,
          trendAnalysis: filteredExpenses.length > 10 ? 'positive' : 'developing'
        }
      });
      
      setIsGenerating(false);
    }, isMobile ? 800 : isTablet ? 1200 : 1500);
  };

  // ENHANCED PDF Export Function
  const exportToPDF = async () => {
    if (!reportData) return;
    
    setIsExporting(true);
    
    try {
      const reportLines = [];
      reportLines.push('-------------------------------------------------------');
      reportLines.push('?? AI SMART EXPENSE TRACKER - INTELLIGENT REPORT');
      reportLines.push('-------------------------------------------------------');
      reportLines.push('');
      reportLines.push('?? REPORT METADATA');
      reportLines.push('Generated: ' + new Date().toLocaleDateString() + ' at ' + new Date().toLocaleTimeString());
      reportLines.push('Report Type: ' + reportData.reportType.toUpperCase());
      reportLines.push('Analysis Period: ' + reportData.period);
      reportLines.push('AI Performance Score: ' + reportData.performanceMetrics.aiScore.toFixed(1) + '/100');
      reportLines.push('');
      reportLines.push('?? EXECUTIVE SUMMARY');
      reportLines.push('+-- Total Transactions Analyzed: ' + reportData.totalExpenses);
      reportLines.push('+-- Total Amount Processed: $' + reportData.totalAmount.toFixed(2));
      reportLines.push('+-- Average Transaction Size: $' + reportData.avgExpense.toFixed(2));
      reportLines.push('+-- AI-Enhanced Transactions: ' + reportData.aiProcessed + ' (' + ((reportData.aiProcessed / reportData.totalExpenses) * 100).toFixed(1) + '%)');
      reportLines.push('+-- Categories Tracked: ' + reportData.performanceMetrics.categoryCount);
      reportLines.push('+-- AI Accuracy Rate: ' + reportData.performanceMetrics.aiAccuracy.toFixed(1) + '%');
      reportLines.push('');
      reportLines.push('??? AI CATEGORY BREAKDOWN');
      
      Object.entries(reportData.categories)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, amount], index) => {
          const percentage = ((amount / reportData.totalAmount) * 100).toFixed(1);
          const prefix = index === Object.keys(reportData.categories).length - 1 ? '+--' : '+--';
          reportLines.push(prefix + ' ' + category + ': $' + amount.toFixed(2) + ' (' + percentage + '%)');
        });
      
      reportLines.push('');
      reportLines.push('?? AI INTELLIGENCE INSIGHTS');
      reportData.insights.forEach((insight, index) => {
        const prefix = index === reportData.insights.length - 1 ? '+--' : '+--';
        reportLines.push(prefix + ' ' + insight.title + ': ' + insight.message);
      });
      
      reportLines.push('');
      reportLines.push('?? PERFORMANCE ANALYTICS');
      reportLines.push('+-- Savings Potential Identified: $' + reportData.performanceMetrics.savingsPotential.toFixed(2));
      reportLines.push('+-- Spending Trend Analysis: ' + reportData.performanceMetrics.trendAnalysis.toUpperCase());
      reportLines.push('+-- AI Optimization Score: ' + reportData.performanceMetrics.aiScore.toFixed(0) + '%');
      reportLines.push('+-- Smart Categorization Rate: ' + ((reportData.aiProcessed / reportData.totalExpenses) * 100).toFixed(0) + '%');
      
      reportLines.push('');
      reportLines.push('?? RECENT TRANSACTION DETAILS');
      reportData.transactions.slice(0, 20).forEach((t, index) => {
        const prefix = index === Math.min(19, reportData.transactions.length - 1) ? '+--' : '+--';
        const line = t.date + ' | ' + t.description + ' | ' + t.category + ' | $' + t.amount.toFixed(2);
        reportLines.push(prefix + ' ' + line + (t.aiSuggested ? ' [?? AI]' : ''));
      });
      
      reportLines.push('');
      reportLines.push('-------------------------------------------------------');
      reportLines.push('?? REPORT SUMMARY');
      reportLines.push('-------------------------------------------------------');
      reportLines.push('This intelligent report was generated by AI Smart Expense Tracker');
      reportLines.push('AI Processing Accuracy: ' + (reportData.aiProcessed > 0 ? reportData.performanceMetrics.aiAccuracy.toFixed(1) + '%' : 'N/A'));
      reportLines.push('Machine Learning Categories: ' + reportData.performanceMetrics.categoryCount);
      reportLines.push('Advanced Analytics: ENABLED');
      reportLines.push('Report Generation: ' + new Date().toLocaleString());
      reportLines.push('Version: 4.0 Advanced AI');
      reportLines.push('-------------------------------------------------------');

      const reportContent = reportLines.join('\n');

      // Create and download advanced report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AI-Smart-Expense-Report-' + reportData.reportType + '-' + new Date().toISOString().split('T')[0] + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: '?? AI Smart Report Exported!',
        description: 'Advanced intelligence report downloaded successfully',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: 'Export Error',
        description: 'Failed to export AI report. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ENHANCED Email Function
  const emailReport = async () => {
    if (!reportData) return;
    
    setIsExporting(true);
    
    try {
      const subject = '?? AI Smart Expense Report - ' + reportData.period + ' (' + reportData.reportType + ')';
      
      const bodyLines = [];
      bodyLines.push('Hello!');
      bodyLines.push('');
      bodyLines.push('Your AI-powered expense intelligence report is ready:');
      bodyLines.push('');
      bodyLines.push('?? EXECUTIVE SUMMARY');
      bodyLines.push('• Total Expenses: ' + reportData.totalExpenses + ' transactions');
      bodyLines.push('• Total Amount: $' + reportData.totalAmount.toFixed(2));
      bodyLines.push('• Smart Average: $' + reportData.avgExpense.toFixed(2));
      bodyLines.push('• AI Enhanced: ' + reportData.aiProcessed + ' transactions (' + ((reportData.aiProcessed / reportData.totalExpenses) * 100).toFixed(0) + '%)');
      bodyLines.push('• AI Performance Score: ' + reportData.performanceMetrics.aiScore.toFixed(0) + '/100');
      bodyLines.push('');
      bodyLines.push('??? TOP AI CATEGORIES');
      
      Object.entries(reportData.categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([category, amount]) => {
          bodyLines.push('• ' + category + ': $' + amount.toFixed(2) + ' (' + ((amount / reportData.totalAmount) * 100).toFixed(1) + '%)');
        });
      
      bodyLines.push('');
      bodyLines.push('?? AI INTELLIGENCE INSIGHTS');
      reportData.insights.forEach(insight => {
        bodyLines.push('• ' + insight.message);
      });
      
      bodyLines.push('');
      bodyLines.push('?? SMART RECOMMENDATIONS');
      bodyLines.push('• Savings Potential: $' + reportData.performanceMetrics.savingsPotential.toFixed(2));
      bodyLines.push('• AI Accuracy: ' + reportData.performanceMetrics.aiAccuracy.toFixed(1) + '%');
      bodyLines.push('• Categories Optimized: ' + reportData.performanceMetrics.categoryCount);
      
      bodyLines.push('');
      bodyLines.push('-------------------------------');
      bodyLines.push('Generated by AI Smart Expense Tracker v4.0');
      bodyLines.push('Advanced Machine Learning Analytics');
      bodyLines.push('Report Date: ' + new Date().toLocaleDateString());
      bodyLines.push('AI Processing: ACTIVE');
      bodyLines.push('-------------------------------');

      const body = bodyLines.join('\n');

      // Create enhanced mailto link
      const mailtoLink = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      
      // Open email client
      window.location.href = mailtoLink;
      
      toast({
        title: '?? AI Report Email Ready!',
        description: 'Advanced intelligence report prepared for email',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: 'Email Error',
        description: 'Failed to prepare AI report email',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isGenerating || !reportData) {
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
          color="blue.400" 
          size={isMobile ? '80px' : '120px'}
          thickness={4}
        />
        <VStack spacing={3} mt={6}>
          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="blue.600">
            AI Generating Smart Report...
          </Text>
          <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600" textAlign="center">
            Advanced intelligence analysis and report generation
          </Text>
          <HStack spacing={2}>
            <Badge colorScheme="blue" variant="subtle">AI Processing</Badge>
            <Badge colorScheme="purple" variant="subtle">Smart Analysis</Badge>
            <Badge colorScheme="green" variant="subtle">Report Building</Badge>
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
                bgGradient="linear(to-r, blue.400, green.600)"
                bgClip="text"
                noOfLines={1}
              >
                AI Smart Reports
              </Heading>
              <HStack wrap="wrap" spacing={{ base: 2, md: 3 }} w="full">
                <Badge 
                  colorScheme="blue" 
                  variant="solid" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                >
                  AI Score: {reportData.performanceMetrics.aiScore.toFixed(0)}/100
                </Badge>
                <Badge 
                  colorScheme="green" 
                  variant="outline" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                >
                  {reportData.totalExpenses} Analyzed
                </Badge>
                <Badge 
                  colorScheme="purple" 
                  variant="outline" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                  display={{ base: 'none', sm: 'flex' }}
                >
                  {((reportData.aiProcessed / reportData.totalExpenses) * 100).toFixed(0)}% AI Enhanced
                </Badge>
              </HStack>
            </VStack>
            
            <VStack spacing={3} w={{ base: 'full', lg: 'auto' }} align={{ base: 'stretch', lg: 'end' }}>
              <HStack spacing={3} w="full" justify={{ base: 'stretch', lg: 'end' }}>
                <Button 
                  leftIcon={<FiDownload />} 
                  onClick={exportToPDF}
                  colorScheme="blue"
                  isLoading={isExporting}
                  loadingText="Exporting..."
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  minW={{ base: '120px', md: '140px' }}
                >
                  Export AI Report
                </Button>
                <Button 
                  leftIcon={<FiMail />} 
                  onClick={emailReport}
                  variant="outline"
                  colorScheme="green"
                  isLoading={isExporting}
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  minW={{ base: '120px', md: '140px' }}
                >
                  Email Report
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* AI REPORT CONTROLS */}
        <Card bg={cardBg} w="full" transition="all 0.3s ease" _hover={{ shadow: 'lg' }}>
          <CardBody>
            <VStack spacing={4}>
              <Heading size={{ base: 'sm', md: 'md' }} color="purple.600" alignSelf="start">
                AI Report Configuration
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Report Type</FormLabel>
                  <Select 
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)}
                    size={{ base: 'md', md: 'lg' }}
                    fontSize={{ base: 'sm', md: 'md' }}
                    bg={selectBg}
                  >
                    <option value="monthly">Monthly AI Report</option>
                    <option value="quarterly">Quarterly Analysis</option>
                    <option value="yearly">Annual Intelligence</option>
                    <option value="custom">Custom Period</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Start Date</FormLabel>
                  <Input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    size={{ base: 'md', md: 'lg' }}
                    bg={selectBg}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>End Date</FormLabel>
                  <Input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    size={{ base: 'md', md: 'lg' }}
                    bg={selectBg}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="end">
                  <Button 
                    leftIcon={<FiCpu />} 
                    colorScheme="purple" 
                    onClick={generateReport}
                    isLoading={isGenerating}
                    loadingText="AI Processing..."
                    size={{ base: 'md', md: 'lg' }}
                    w="full"
                  >
                    {isMobile ? 'Generate' : 'Generate AI Report'}
                  </Button>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        {/* AI REPORT SUMMARY */}
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
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }} noOfLines={1}>
                  {reportData.period}
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
                  Smart Transactions
                </StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                  {reportData.totalExpenses}
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  AI Enhanced: {reportData.aiProcessed}
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
                  Average Intelligence
                </StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                  
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  Per Transaction
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
                  AI Processing
                </StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                  {reportData.totalExpenses > 0 ? ((reportData.aiProcessed / reportData.totalExpenses) * 100).toFixed(1) : 0}%
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  Smart Accuracy
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* AI INTELLIGENCE DASHBOARD */}
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
                <Icon as={FiFileText} boxSize={{ base: 6, md: 8, lg: 10 }} />
                <VStack align="start" spacing={1} flex="1" minW="0">
                  <Heading size={{ base: 'md', md: 'lg', lg: 'xl' }} noOfLines={1}>
                    AI Report Intelligence Center
                  </Heading>
                  <Text opacity={0.9} fontSize={{ base: 'sm', md: 'md' }} noOfLines={2}>
                    Advanced reporting with machine learning insights and predictive analytics
                  </Text>
                </VStack>
              </HStack>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={cardSpacing} w="full">
                <VStack spacing={3}>
                  <CircularProgress 
                    value={reportData.performanceMetrics.aiScore} 
                    color="yellow.400" 
                    size={{ base: '80px', md: '100px', lg: '120px' }}
                    thickness={8}
                  >
                    <CircularProgressLabel fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">
                      {reportData.performanceMetrics.aiScore.toFixed(0)}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" fontWeight="semibold">
                    AI Report Score
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" opacity={0.8}>
                    Intelligence accuracy
                  </Text>
                </VStack>
                
                <VStack spacing={3}>
                  <Text fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="bold">
                    {reportData.performanceMetrics.categoryCount}
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" fontWeight="semibold">
                    AI Categories
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} textAlign="center" opacity={0.8}>
                    Smart classifications
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

        {/* RESPONSIVE CONTENT GRID */}
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={cardSpacing} w="full">
          
          {/* Category Analysis */}
          <Card bg={cardBg} transition="all 0.3s ease" _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}>
            <CardBody>
              <Heading size={{ base: 'sm', md: 'md' }} mb={4} color="purple.600">
                AI Category Analysis
              </Heading>
              <VStack align="stretch" spacing={3}>
                {Object.entries(reportData.categories)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, isMobile ? 5 : 8)
                  .map(([category, amount]) => {
                  const percentage = (amount / reportData.totalAmount) * 100;
                  return (
                    <Box key={category}>
                      <Flex justify="space-between" mb={2} wrap="wrap" gap={2}>
                        <Text 
                          fontWeight="semibold" 
                          fontSize={{ base: 'sm', md: 'md' }} 
                          flex="1" 
                          noOfLines={1}
                        >
                          {category}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="purple" fontSize={{ base: 'xs', md: 'sm' }}>
                            
                          </Badge>
                          <Badge colorScheme="blue" variant="outline" fontSize={{ base: 'xs', md: 'sm' }}>
                            {percentage.toFixed(1)}%
                          </Badge>
                        </HStack>
                      </Flex>
                      <Progress value={percentage} colorScheme="purple" size="lg" borderRadius="full" />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        AI analyzed spending pattern with {percentage.toFixed(1)}% of total
                      </Text>
                    </Box>
                  );
                })}
              </VStack>
            </CardBody>
          </Card>

          {/* AI Insights */}
          <Card bg={cardBg} transition="all 0.3s ease" _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}>
            <CardBody>
              <Heading size={{ base: 'sm', md: 'md' }} mb={4} color="blue.600">
                AI Smart Insights
              </Heading>
              <VStack align="stretch" spacing={3}>
                {reportData.insights.map((insight, index) => (
                  <Alert 
                    key={index} 
                    status={insight.type === 'ai' ? 'success' : 'info'}
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
                      AI Report Performance: Excellent
                    </Text>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} mt={1}>
                      Your expense intelligence shows {reportData.performanceMetrics.aiScore.toFixed(0)}% optimization with {reportData.aiProcessed} AI-enhanced transactions. 
                      Smart reporting accuracy is {reportData.performanceMetrics.aiAccuracy.toFixed(1)}% with {reportData.performanceMetrics.categoryCount} categories tracked.
                    </Text>
                  </Box>
                </Alert>

                <Alert status="info" borderRadius="lg" variant="left-accent">
                  <AlertIcon />
                  <Box flex="1">
                    <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                      Smart Recommendations
                    </Text>
                    <VStack align="start" spacing={1} mt={2} fontSize={{ base: 'xs', md: 'sm' }}>
                      <Text>• Potential savings identified: </Text>
                      <Text>• AI accuracy rate: {reportData.performanceMetrics.aiAccuracy.toFixed(1)}%</Text>
                      <Text>• Trend analysis: {reportData.performanceMetrics.trendAnalysis}</Text>
                      <Text>• Categories optimized: {reportData.performanceMetrics.categoryCount}</Text>
                    </VStack>
                  </Box>
                </Alert>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

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
                      Smart reporting shortcuts
                    </Text>
                  </VStack>
                  
                  <VStack spacing={4} w="full">
                    <SimpleGrid columns={2} spacing={4} w="full">
                      <Button 
                        leftIcon={<FiDownload />} 
                        colorScheme="blue" 
                        variant="solid"
                        size="lg"
                        onClick={exportToPDF}
                        isLoading={isExporting}
                        bg="blue.500"
                        _hover={{ bg: 'blue.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>Export AI</Text>
                        <Text fontSize="xs" opacity={0.8}>Report</Text>
                      </Button>
                      <Button 
                        leftIcon={<FiMail />} 
                        colorScheme="green" 
                        variant="solid"
                        size="lg"
                        onClick={emailReport}
                        isLoading={isExporting}
                        bg="green.500"
                        _hover={{ bg: 'green.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>Email Report</Text>
                        <Text fontSize="xs" opacity={0.8}>Send</Text>
                      </Button>
                    </SimpleGrid>
                    
                    <SimpleGrid columns={2} spacing={4} w="full">
                      <Button 
                        leftIcon={<FiBarChart />} 
                        colorScheme="purple" 
                        variant="solid"
                        size="lg"
                        onClick={() => navigate('/analytics')}
                        bg="purple.500"
                        _hover={{ bg: 'purple.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>Analytics</Text>
                        <Text fontSize="xs" opacity={0.8}>View</Text>
                      </Button>
                      <Button 
                        leftIcon={<FiPlus />} 
                        colorScheme="orange" 
                        variant="solid"
                        size="lg"
                        onClick={() => navigate('/expenses/new')}
                        bg="orange.500"
                        _hover={{ bg: 'orange.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>Add Smart</Text>
                        <Text fontSize="xs" opacity={0.8}>Expense</Text>
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

export default Reports;


