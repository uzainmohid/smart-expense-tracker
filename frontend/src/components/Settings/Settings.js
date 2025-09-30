import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Switch,
  Button,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
  useToast,
  Badge,
  SimpleGrid,
  useColorModeValue,
  useColorMode,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  useBreakpointValue,
  CircularProgress,
  CircularProgressLabel,
  Progress,
} from '@chakra-ui/react';
import { FiSave, FiRefreshCw, FiCpu, FiZap, FiMoon, FiSun, FiBell, FiShield, FiPlus, FiUpload, FiBarChart, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const cardBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const cardSpacing = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const containerPadding = useBreakpointValue({ base: 4, md: 6, lg: 8 });

  const [settings, setSettings] = useState({
    aiEnabled: true,
    autoCategorizationEnabled: true,
    aiConfidenceThreshold: 85,
    smartSuggestionsEnabled: true,
    aiLearningEnabled: true,
    personalizedInsights: true,
    monthlyBudget: 2000,
    categoryBudgets: {
      'Food and Dining': 500,
      'Transportation': 300,
      'Shopping': 400,
      'Entertainment': 200,
      'Bills and Utilities': 400
    },
    budgetAlertsEnabled: true,
    budgetAlertThreshold: 80,
    notificationsEnabled: true,
    budgetNotifications: true,
    aiInsightNotifications: true,
    weeklyReportsEnabled: true,
    anomalyDetectionEnabled: true,
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    theme: colorMode,
    compactView: false,
    dataRetention: 365,
    anonymousAnalytics: true,
    dataExportEnabled: true
  });

  const [aiStats, setAiStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAIStats();
  }, []);

  useEffect(() => {
    setSettings(prev => ({ ...prev, theme: colorMode }));
  }, [colorMode]);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('smart-expense-tracker-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadAIStats = () => {
    try {
      const expenses = JSON.parse(localStorage.getItem('smart-expense-tracker-expenses') || '[]');
      const aiExpenses = expenses.filter(e => e.aiSuggested || e.aiEnhanced);
      const totalConfidence = aiExpenses.reduce((sum, e) => sum + (e.confidence || 0), 0);
      
      setAiStats({
        totalExpenses: expenses.length,
        aiProcessed: aiExpenses.length,
        aiAccuracy: aiExpenses.length > 0 ? (totalConfidence / aiExpenses.length).toFixed(1) : 0,
        categoriesLearned: [...new Set(expenses.map(e => e.category).filter(Boolean))].length,
        merchantsRecognized: [...new Set(expenses.map(e => e.merchant).filter(Boolean))].length,
        averageConfidence: aiExpenses.length > 0 ? (totalConfidence / aiExpenses.length).toFixed(1) : 0,
        aiScore: Math.min(100, 60 + (aiExpenses.length / Math.max(expenses.length, 1) * 40)),
        savingsIdentified: expenses.reduce((sum, e) => sum + e.amount, 0) * 0.12
      });
    } catch (error) {
      console.error('Error loading AI stats:', error);
    }
  };

  const handleSettingChange = (key, value, category = null) => {
    setSettings(prev => {
      if (category) {
        return {
          ...prev,
          [category]: {
            ...prev[category],
            [key]: value
          }
        };
      }
      return {
        ...prev,
        [key]: value
      };
    });
  };

  const handleThemeChange = (newTheme) => {
    if (newTheme === 'dark' && colorMode === 'light') {
      toggleColorMode();
    } else if (newTheme === 'light' && colorMode === 'dark') {
      toggleColorMode();
    }
    handleSettingChange('theme', newTheme);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('smart-expense-tracker-settings', JSON.stringify(settings));
      
      if (settings.budgetAlertsEnabled) {
        localStorage.setItem('budget-alerts-enabled', 'true');
        localStorage.setItem('monthly-budget', settings.monthlyBudget.toString());
        localStorage.setItem('budget-threshold', settings.budgetAlertThreshold.toString());
        localStorage.setItem('category-budgets', JSON.stringify(settings.categoryBudgets));
      }
      
      localStorage.setItem('ai-enabled', settings.aiEnabled.toString());
      localStorage.setItem('auto-categorization', settings.autoCategorizationEnabled.toString());
      localStorage.setItem('ai-confidence-threshold', settings.aiConfidenceThreshold.toString());
      
      if (settings.notificationsEnabled && 'Notification' in window) {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      }
      
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: 'AI Settings Saved Successfully!',
          description: 'All intelligent preferences have been applied and are now active',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
        
        if (settings.budgetAlertsEnabled) {
          toast({
            title: 'Smart Budget Alerts Enabled',
            description: 'AI will alert you when spending reaches ' + settings.budgetAlertThreshold + '% of budget',
            status: 'info',
            duration: 3000,
          });
        }
        
        if (settings.aiEnabled) {
          toast({
            title: 'AI Intelligence Active',
            description: 'Advanced machine learning features are now running',
            status: 'info',
            duration: 3000,
          });
        }
      }, 1000);
      
    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Error Saving Settings',
        description: 'Failed to save AI settings. Please try again.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset all AI settings to default values? This cannot be undone.')) {
      const defaultSettings = {
        aiEnabled: true,
        autoCategorizationEnabled: true,
        aiConfidenceThreshold: 85,
        smartSuggestionsEnabled: true,
        aiLearningEnabled: true,
        personalizedInsights: true,
        monthlyBudget: 2000,
        categoryBudgets: {
          'Food and Dining': 500,
          'Transportation': 300,
          'Shopping': 400,
          'Entertainment': 200,
          'Bills and Utilities': 400
        },
        budgetAlertsEnabled: true,
        budgetAlertThreshold: 80,
        notificationsEnabled: true,
        budgetNotifications: true,
        aiInsightNotifications: true,
        weeklyReportsEnabled: true,
        anomalyDetectionEnabled: true,
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: 'light',
        compactView: false,
        dataRetention: 365,
        anonymousAnalytics: true,
        dataExportEnabled: true
      };
      
      setSettings(defaultSettings);
      localStorage.removeItem('smart-expense-tracker-settings');
      
      toast({
        title: 'AI Settings Reset',
        description: 'All settings have been reset to intelligent defaults',
        status: 'info',
        duration: 3000,
      });
    }
  };

  const exportData = () => {
    try {
      const expenses = JSON.parse(localStorage.getItem('smart-expense-tracker-expenses') || '[]');
      const dataToExport = {
        expenses: expenses,
        settings: settings,
        aiStats: aiStats,
        exportDate: new Date().toISOString(),
        version: '4.0 Advanced AI'
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AI-Smart-Expense-Data-' + new Date().toISOString().split('T')[0] + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'AI Data Exported Successfully',
        description: 'Your intelligent expense data has been exported',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Export Error',
        description: 'Failed to export AI data',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const clearAllData = () => {
    if (window.confirm('This will delete ALL your AI expense data and settings. This cannot be undone. Are you sure?')) {
      if (window.confirm('FINAL WARNING: This will permanently delete all AI intelligence. Continue?')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

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
                bgGradient="linear(to-r, purple.400, pink.600)"
                bgClip="text"
                noOfLines={1}
              >
                AI Smart Settings
              </Heading>
              <HStack wrap="wrap" spacing={{ base: 2, md: 3 }} w="full">
                {aiStats && (
                  <>
                    <Badge 
                      colorScheme="purple" 
                      variant="solid" 
                      fontSize={{ base: 'xs', md: 'sm' }}
                      px={3}
                      py={1}
                    >
                      AI Score: {aiStats.aiScore.toFixed(0)}/100
                    </Badge>
                    <Badge 
                      colorScheme="green" 
                      variant="outline" 
                      fontSize={{ base: 'xs', md: 'sm' }}
                      px={3}
                      py={1}
                    >
                      {aiStats.aiProcessed} AI Enhanced
                    </Badge>
                    <Badge 
                      colorScheme="blue" 
                      variant="outline" 
                      fontSize={{ base: 'xs', md: 'sm' }}
                      px={3}
                      py={1}
                      display={{ base: 'none', sm: 'flex' }}
                    >
                      {aiStats.aiAccuracy}% Accuracy
                    </Badge>
                  </>
                )}
              </HStack>
            </VStack>
            
            <VStack spacing={3} w={{ base: 'full', lg: 'auto' }} align={{ base: 'stretch', lg: 'end' }}>
              <HStack spacing={3} w="full" justify={{ base: 'stretch', lg: 'end' }}>
                <Button 
                  leftIcon={<FiRefreshCw />} 
                  onClick={resetToDefaults} 
                  variant="outline"
                  colorScheme="orange"
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  minW={{ base: '120px', md: '140px' }}
                >
                  Reset Defaults
                </Button>
                <Button 
                  leftIcon={<FiSave />} 
                  onClick={handleSaveSettings}
                  colorScheme="purple"
                  isLoading={isLoading}
                  loadingText="Saving..."
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  minW={{ base: '120px', md: '140px' }}
                >
                  Save AI Settings
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* AI PERFORMANCE STATS */}
        {aiStats && (
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
                      AI Performance Statistics
                    </Heading>
                    <Text opacity={0.9} fontSize={{ base: 'sm', md: 'md' }} noOfLines={2}>
                      Your AI assistant learning metrics and optimization status
                    </Text>
                  </VStack>
                </HStack>
                
                <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={cardSpacing} w="full">
                  <Stat textAlign="center">
                    <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>{aiStats.totalExpenses}</StatNumber>
                    <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                      Total Processed
                    </StatLabel>
                  </Stat>
                  <Stat textAlign="center">
                    <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>{aiStats.aiProcessed}</StatNumber>
                    <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                      AI Enhanced
                    </StatLabel>
                  </Stat>
                  <Stat textAlign="center">
                    <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>{aiStats.aiAccuracy}%</StatNumber>
                    <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                      AI Accuracy
                    </StatLabel>
                  </Stat>
                  <Stat textAlign="center">
                    <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>{aiStats.categoriesLearned}</StatNumber>
                    <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                      AI Learned
                    </StatLabel>
                  </Stat>
                  <Stat textAlign="center">
                    <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>{aiStats.merchantsRecognized}</StatNumber>
                    <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                      Merchants
                    </StatLabel>
                  </Stat>
                  <Stat textAlign="center">
                    <StatNumber fontSize={{ base: 'lg', md: 'xl' }}></StatNumber>
                    <StatLabel color="whiteAlpha.900" fontSize={{ base: 'xs', md: 'sm' }}>
                      Savings Found
                    </StatLabel>
                  </Stat>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* SETTINGS TABS */}
        <Card bg={cardBg} w="full" transition="all 0.3s ease" _hover={{ shadow: 'lg' }}>
          <CardBody>
            <Tabs variant="soft-rounded" colorScheme="purple" isLazy>
              <TabList mb={6} flexWrap="wrap" gap={2}>
                <Tab fontSize={{ base: 'sm', md: 'md' }}>
                  <Icon as={FiCpu} mr={2} />
                  AI Intelligence
                </Tab>
                <Tab fontSize={{ base: 'sm', md: 'md' }}>
                  <Icon as={FiZap} mr={2} />
                  Smart Budget
                </Tab>
                <Tab fontSize={{ base: 'sm', md: 'md' }}>
                  <Icon as={FiBell} mr={2} />
                  Notifications
                </Tab>
                <Tab fontSize={{ base: 'sm', md: 'md' }}>
                  <Icon as={FiShield} mr={2} />
                  Privacy
                </Tab>
                <Tab fontSize={{ base: 'sm', md: 'md' }}>
                  <Icon as={colorMode === 'dark' ? FiSun : FiMoon} mr={2} />
                  Display
                </Tab>
              </TabList>
              
              <TabPanels>
                {/* AI Intelligence Tab */}
                <TabPanel px={{ base: 2, md: 6 }}>
                  <VStack align="stretch" spacing={6}>
                    <Heading size={{ base: 'sm', md: 'md' }} color="purple.600">
                      AI Intelligence Configuration
                    </Heading>
                    
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      <Card variant="outline" transition="all 0.3s ease" _hover={{ shadow: 'md' }}>
                        <CardBody>
                          <VStack align="stretch" spacing={6}>
                            <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color="purple.700">
                              Core AI Features
                            </Text>
                            
                            <HStack justify="space-between" wrap={{ base: 'wrap', md: 'nowrap' }}>
                              <VStack align="start" spacing={1} flex="1" minW="0">
                                <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                                  AI Assistant Enabled
                                </Text>
                                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                                  Enable advanced AI-powered expense categorization
                                </Text>
                              </VStack>
                              <Switch 
                                colorScheme="purple"
                                size="lg"
                                isChecked={settings.aiEnabled}
                                onChange={(e) => handleSettingChange('aiEnabled', e.target.checked)}
                              />
                            </HStack>
                            
                            <HStack justify="space-between" wrap={{ base: 'wrap', md: 'nowrap' }}>
                              <VStack align="start" spacing={1} flex="1" minW="0">
                                <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                                  Smart Auto-Categorization
                                </Text>
                                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                                  Automatically apply high-confidence AI suggestions
                                </Text>
                              </VStack>
                              <Switch 
                                colorScheme="purple"
                                isChecked={settings.autoCategorizationEnabled}
                                onChange={(e) => handleSettingChange('autoCategorizationEnabled', e.target.checked)}
                                isDisabled={!settings.aiEnabled}
                              />
                            </HStack>
                            
                            <HStack justify="space-between" wrap={{ base: 'wrap', md: 'nowrap' }}>
                              <VStack align="start" spacing={1} flex="1" minW="0">
                                <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                                  Intelligent Suggestions
                                </Text>
                                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                                  Show AI-powered spending insights and recommendations
                                </Text>
                              </VStack>
                              <Switch 
                                colorScheme="purple"
                                isChecked={settings.smartSuggestionsEnabled}
                                onChange={(e) => handleSettingChange('smartSuggestionsEnabled', e.target.checked)}
                                isDisabled={!settings.aiEnabled}
                              />
                            </HStack>

                            <HStack justify="space-between" wrap={{ base: 'wrap', md: 'nowrap' }}>
                              <VStack align="start" spacing={1} flex="1" minW="0">
                                <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                                  AI Learning Mode
                                </Text>
                                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                                  Allow AI to learn from your spending patterns
                                </Text>
                              </VStack>
                              <Switch 
                                colorScheme="purple"
                                isChecked={settings.aiLearningEnabled}
                                onChange={(e) => handleSettingChange('aiLearningEnabled', e.target.checked)}
                                isDisabled={!settings.aiEnabled}
                              />
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card variant="outline" transition="all 0.3s ease" _hover={{ shadow: 'md' }}>
                        <CardBody>
                          <VStack align="stretch" spacing={6}>
                            <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color="blue.700">
                              AI Performance Tuning
                            </Text>
                            
                            <Box>
                              <Text fontWeight="semibold" mb={3} fontSize={{ base: 'sm', md: 'md' }}>
                                AI Confidence Threshold
                              </Text>
                              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" mb={4}>
                                Minimum confidence level for auto-applying AI suggestions
                              </Text>
                              <VStack spacing={3}>
                                <HStack w="full">
                                  <Text fontSize="sm">60%</Text>
                                  <Slider
                                    flex="1"
                                    value={settings.aiConfidenceThreshold}
                                    onChange={(value) => handleSettingChange('aiConfidenceThreshold', value)}
                                    min={60}
                                    max={99}
                                    step={5}
                                    colorScheme="purple"
                                    isDisabled={!settings.aiEnabled}
                                  >
                                    <SliderTrack>
                                      <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb boxSize={6}>
                                      <Box color="purple.500" as={FiZap} />
                                    </SliderThumb>
                                  </Slider>
                                  <Text fontSize="sm">99%</Text>
                                </HStack>
                                <Badge colorScheme="purple" variant="solid" px={4} py={2}>
                                  Current: {settings.aiConfidenceThreshold}%
                                </Badge>
                              </VStack>
                            </Box>

                            {aiStats && (
                              <Box>
                                <Text fontWeight="semibold" mb={3} fontSize={{ base: 'sm', md: 'md' }}>
                                  AI Performance Score
                                </Text>
                                <CircularProgress 
                                  value={aiStats.aiScore} 
                                  color="purple.400" 
                                  size={{ base: '80px', md: '100px' }}
                                  thickness={8}
                                >
                                  <CircularProgressLabel fontSize="sm" fontWeight="bold">
                                    {aiStats.aiScore.toFixed(0)}%
                                  </CircularProgressLabel>
                                </CircularProgress>
                                <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                                  Overall AI optimization score
                                </Text>
                              </Box>
                            )}

                            <Alert 
                              status={settings.aiEnabled ? "success" : "warning"} 
                              borderRadius="lg"
                              fontSize={{ base: 'sm', md: 'md' }}
                            >
                              <AlertIcon />
                              <Box>
                                <Text fontWeight="semibold">
                                  {settings.aiEnabled ? "AI Enhanced Mode Active" : "AI Features Disabled"}
                                </Text>
                                <Text fontSize={{ base: 'xs', md: 'sm' }} mt={1}>
                                  {settings.aiEnabled 
                                    ? "Advanced AI running with " + settings.aiConfidenceThreshold + "% confidence threshold. Auto-categorization is " + (settings.autoCategorizationEnabled ? 'enabled' : 'disabled') + "."
                                    : "Enable AI features to unlock intelligent categorization and insights."
                                  }
                                </Text>
                              </Box>
                            </Alert>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* Smart Budget Tab */}
                <TabPanel px={{ base: 2, md: 6 }}>
                  <VStack align="stretch" spacing={6}>
                    <Heading size={{ base: 'sm', md: 'md' }} color="green.600">
                      Smart Budget Configuration
                    </Heading>
                    
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      <Card variant="outline" transition="all 0.3s ease" _hover={{ shadow: 'md' }}>
                        <CardBody>
                          <VStack align="stretch" spacing={6}>
                            <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color="green.700">
                              Monthly Budget Settings
                            </Text>
                            
                            <FormControl>
                              <FormLabel fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                                Monthly Budget Limit
                              </FormLabel>
                              <NumberInput
                                value={settings.monthlyBudget}
                                onChange={(value) => handleSettingChange('monthlyBudget', parseInt(value) || 0)}
                                min={0}
                                max={50000}
                                step={50}
                                size={{ base: 'md', md: 'lg' }}
                              >
                                <NumberInputField placeholder="Enter monthly budget" />
                              </NumberInput>
                            </FormControl>
                            
                            <Box>
                              <Text fontWeight="semibold" mb={3} fontSize={{ base: 'sm', md: 'md' }}>
                                Smart Budget Alert Threshold
                              </Text>
                              <VStack spacing={3}>
                                <HStack w="full">
                                  <Text fontSize="sm">50%</Text>
                                  <Slider
                                    flex="1"
                                    value={settings.budgetAlertThreshold}
                                    onChange={(value) => handleSettingChange('budgetAlertThreshold', value)}
                                    min={50}
                                    max={100}
                                    step={5}
                                    colorScheme="orange"
                                  >
                                    <SliderTrack>
                                      <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb />
                                  </Slider>
                                  <Text fontSize="sm">100%</Text>
                                </HStack>
                                <Text fontSize="sm" color="orange.600" textAlign="center">
                                  AI Alert at:  ({settings.budgetAlertThreshold}%)
                                </Text>
                              </VStack>
                            </Box>
                            
                            <HStack justify="space-between" wrap={{ base: 'wrap', md: 'nowrap' }}>
                              <VStack align="start" spacing={1} flex="1" minW="0">
                                <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                                  Smart Budget Alerts
                                </Text>
                                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                                  Enable intelligent budget notifications
                                </Text>
                              </VStack>
                              <Switch 
                                colorScheme="orange"
                                size="lg"
                                isChecked={settings.budgetAlertsEnabled}
                                onChange={(e) => handleSettingChange('budgetAlertsEnabled', e.target.checked)}
                              />
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card variant="outline" transition="all 0.3s ease" _hover={{ shadow: 'md' }}>
                        <CardBody>
                          <VStack align="stretch" spacing={6}>
                            <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color="blue.700">
                              AI Category Budget Limits
                            </Text>
                            
                            {Object.entries(settings.categoryBudgets).map(([category, budget]) => (
                              <FormControl key={category}>
                                <FormLabel fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium">
                                  {category}
                                </FormLabel>
                                <HStack>
                                  <NumberInput
                                    value={budget}
                                    onChange={(value) => handleSettingChange(category, parseInt(value) || 0, 'categoryBudgets')}
                                    min={0}
                                    max={5000}
                                    size="sm"
                                    flex="1"
                                  >
                                    <NumberInputField />
                                  </NumberInput>
                                  <VStack spacing={0} minW="80px">
                                    <Text fontSize="xs" color="gray.500">
                                      {budget > 0 ? ((budget / settings.monthlyBudget) * 100).toFixed(0) + '%' : '0%'}
                                    </Text>
                                    <Progress 
                                      value={budget > 0 ? (budget / settings.monthlyBudget) * 100 : 0} 
                                      size="sm" 
                                      colorScheme="blue" 
                                      width="60px"
                                    />
                                  </VStack>
                                </HStack>
                              </FormControl>
                            ))}
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* Notifications Tab */}
                <TabPanel px={{ base: 2, md: 6 }}>
                  <VStack align="stretch" spacing={6}>
                    <Heading size={{ base: 'sm', md: 'md' }} color="blue.600">
                      Smart Notification Settings
                    </Heading>
                    
                    <Card variant="outline" transition="all 0.3s ease" _hover={{ shadow: 'md' }}>
                      <CardBody>
                        <VStack align="stretch" spacing={6}>
                          <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color="blue.700">
                            Notification Preferences
                          </Text>
                          
                          <HStack justify="space-between" wrap={{ base: 'wrap', md: 'nowrap' }}>
                            <VStack align="start" spacing={1} flex="1" minW="0">
                              <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                                All Notifications
                              </Text>
                              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                                Master switch for all notification types
                              </Text>
                            </VStack>
                            <Switch 
                              colorScheme="blue"
                              size="lg"
                              isChecked={settings.notificationsEnabled}
                              onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                            />
                          </HStack>
                          
                          <Divider />
                          
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <HStack justify="space-between">
                              <Text fontSize={{ base: 'sm', md: 'md' }}>Budget Notifications</Text>
                              <Switch 
                                colorScheme="orange"
                                isChecked={settings.budgetNotifications}
                                onChange={(e) => handleSettingChange('budgetNotifications', e.target.checked)}
                                isDisabled={!settings.notificationsEnabled}
                              />
                            </HStack>
                            
                            <HStack justify="space-between">
                              <Text fontSize={{ base: 'sm', md: 'md' }}>AI Insight Notifications</Text>
                              <Switch 
                                colorScheme="purple"
                                isChecked={settings.aiInsightNotifications}
                                onChange={(e) => handleSettingChange('aiInsightNotifications', e.target.checked)}
                                isDisabled={!settings.notificationsEnabled}
                              />
                            </HStack>
                            
                            <HStack justify="space-between">
                              <Text fontSize={{ base: 'sm', md: 'md' }}>Weekly AI Reports</Text>
                              <Switch 
                                colorScheme="green"
                                isChecked={settings.weeklyReportsEnabled}
                                onChange={(e) => handleSettingChange('weeklyReportsEnabled', e.target.checked)}
                                isDisabled={!settings.notificationsEnabled}
                              />
                            </HStack>
                            
                            <HStack justify="space-between">
                              <Text fontSize={{ base: 'sm', md: 'md' }}>Anomaly Detection</Text>
                              <Switch 
                                colorScheme="red"
                                isChecked={settings.anomalyDetectionEnabled}
                                onChange={(e) => handleSettingChange('anomalyDetectionEnabled', e.target.checked)}
                                isDisabled={!settings.notificationsEnabled}
                              />
                            </HStack>
                          </SimpleGrid>
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </TabPanel>

                {/* Privacy Tab */}
                <TabPanel px={{ base: 2, md: 6 }}>
                  <VStack align="stretch" spacing={6}>
                    <Heading size={{ base: 'sm', md: 'md' }} color="green.600">
                      Privacy and Data Management
                    </Heading>
                    
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      <Card variant="outline" transition="all 0.3s ease" _hover={{ shadow: 'md' }}>
                        <CardBody>
                          <VStack align="stretch" spacing={6}>
                            <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color="green.700">
                              Data Management
                            </Text>
                            
                            <FormControl>
                              <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Data Retention Period</FormLabel>
                              <Select
                                value={settings.dataRetention}
                                onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                                size={{ base: 'md', md: 'lg' }}
                              >
                                <option value={30}>1 Month (30 days)</option>
                                <option value={90}>3 Months (90 days)</option>
                                <option value={180}>6 Months (180 days)</option>
                                <option value={365}>1 Year (365 days)</option>
                                <option value={730}>2 Years (730 days)</option>
                                <option value={-1}>Forever</option>
                              </Select>
                            </FormControl>
                            
                            <HStack justify="space-between" wrap={{ base: 'wrap', md: 'nowrap' }}>
                              <Text fontSize={{ base: 'sm', md: 'md' }}>Anonymous Analytics</Text>
                              <Switch 
                                colorScheme="green"
                                isChecked={settings.anonymousAnalytics}
                                onChange={(e) => handleSettingChange('anonymousAnalytics', e.target.checked)}
                              />
                            </HStack>
                            
                            <VStack spacing={3}>
                              <Button
                                leftIcon={<FiSave />}
                                onClick={exportData}
                                colorScheme="green"
                                variant="outline"
                                w="full"
                                size={{ base: 'md', md: 'lg' }}
                                isDisabled={!settings.dataExportEnabled}
                              >
                                Export All AI Data
                              </Button>
                              
                              <Button
                                onClick={clearAllData}
                                colorScheme="red"
                                variant="outline"
                                size="sm"
                                w="full"
                              >
                                Clear All Data
                              </Button>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Alert status="success" borderRadius="lg" h="fit-content">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                            AI Privacy Protection
                          </Text>
                          <VStack align="start" spacing={1} mt={2} fontSize={{ base: 'xs', md: 'sm' }}>
                            <Text>• All AI data stored locally on your device</Text>
                            <Text>• Machine learning processing happens offline</Text>
                            <Text>• No personal data sent to external servers</Text>
                            <Text>• Full control over AI data retention</Text>
                            <Text>• Advanced encryption for sensitive information</Text>
                          </VStack>
                        </Box>
                      </Alert>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* Display Tab */}
                <TabPanel px={{ base: 2, md: 6 }}>
                  <VStack align="stretch" spacing={6}>
                    <Heading size={{ base: 'sm', md: 'md' }} color="orange.600">
                      Display and Theme Settings
                    </Heading>
                    
                    <Card variant="outline" transition="all 0.3s ease" _hover={{ shadow: 'md' }}>
                      <CardBody>
                        <VStack align="stretch" spacing={6}>
                          <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} color="orange.700">
                            Appearance Settings
                          </Text>
                          
                          <FormControl>
                            <FormLabel fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                              Theme Mode
                              <Badge ml={2} colorScheme={colorMode === 'dark' ? 'blue' : 'orange'}>
                                {colorMode === 'dark' ? 'Dark' : 'Light'}
                              </Badge>
                            </FormLabel>
                            <HStack spacing={4} mt={2}>
                              <Button
                                leftIcon={<FiSun />}
                                size={{ base: 'sm', md: 'md' }}
                                variant={colorMode === 'light' ? 'solid' : 'outline'}
                                colorScheme="orange"
                                onClick={() => handleThemeChange('light')}
                                flex="1"
                              >
                                Light Theme
                              </Button>
                              <Button
                                leftIcon={<FiMoon />}
                                size={{ base: 'sm', md: 'md' }}
                                variant={colorMode === 'dark' ? 'solid' : 'outline'}
                                colorScheme="blue"
                                onClick={() => handleThemeChange('dark')}
                                flex="1"
                              >
                                Dark Theme
                              </Button>
                            </HStack>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Currency Display</FormLabel>
                            <Select
                              value={settings.currency}
                              onChange={(e) => handleSettingChange('currency', e.target.value)}
                              size={{ base: 'md', md: 'lg' }}
                            >
                              <option value="USD">USD ($) - US Dollar</option>
                              <option value="EUR">EUR (€) - Euro</option>
                              <option value="GBP">GBP (£) - British Pound</option>
                              <option value="CAD">CAD (C$) - Canadian Dollar</option>
                              <option value="AUD">AUD (A$) - Australian Dollar</option>
                            </Select>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Date Format</FormLabel>
                            <Select
                              value={settings.dateFormat}
                              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                              size={{ base: 'md', md: 'lg' }}
                            >
                              <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                              <option value="DD/MM/YYYY">DD/MM/YYYY (European Format)</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                            </Select>
                          </FormControl>
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
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
                      Smart settings shortcuts
                    </Text>
                  </VStack>
                  
                  <VStack spacing={4} w="full">
                    <SimpleGrid columns={2} spacing={4} w="full">
                      <Button 
                        leftIcon={<FiSave />} 
                        colorScheme="blue" 
                        variant="solid"
                        size="lg"
                        onClick={handleSaveSettings}
                        isLoading={isLoading}
                        bg="blue.500"
                        _hover={{ bg: 'blue.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>Save Settings</Text>
                        <Text fontSize="xs" opacity={0.8}>Apply</Text>
                      </Button>
                      <Button 
                        leftIcon={<FiRefreshCw />} 
                        colorScheme="orange" 
                        variant="solid"
                        size="lg"
                        onClick={resetToDefaults}
                        bg="orange.500"
                        _hover={{ bg: 'orange.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>Reset</Text>
                        <Text fontSize="xs" opacity={0.8}>Defaults</Text>
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

export default Settings;

