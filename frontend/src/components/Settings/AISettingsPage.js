// AI-POWERED SETTINGS PAGE
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
  Input,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiSave, 
  FiRefreshCw,
  FiCpu,
  FiZap,
  FiBell,
  FiShield,
  FiSettings,
  FiTarget
} from 'react-icons/fi';

const AISettingsPage = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();
  
  const [settings, setSettings] = useState({
    // AI Preferences
    aiEnabled: true,
    autoCategorizationEnabled: true,
    aiConfidenceThreshold: 85,
    smartSuggestionsEnabled: true,
    
    // Budget Settings
    monthlyBudget: 2000,
    categoryBudgets: {
      'Food & Dining': 500,
      'Transportation': 300,
      'Shopping': 400,
      'Entertainment': 200,
      'Bills & Utilities': 400
    },
    budgetAlertsEnabled: true,
    budgetAlertThreshold: 80,
    
    // Notification Settings
    notificationsEnabled: true,
    budgetNotifications: true,
    aiInsightNotifications: true,
    weeklyReportsEnabled: true,
    anomalyDetectionEnabled: true,
    
    // AI Learning Settings
    aiLearningEnabled: true,
    personalizedInsights: true,
    behaviorAnalysis: true,
    predictiveAnalytics: true,
    
    // Data & Privacy
    dataRetention: 365, // days
    anonymousAnalytics: true,
    dataExportEnabled: true,
    
    // Display Settings
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
    compactView: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiStats, setAiStats] = useState(null);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('smart-expense-tracker-settings');
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
      
      // Load AI statistics
      loadAIStatistics();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  const loadAIStatistics = () => {
    try {
      const expenses = JSON.parse(localStorage.getItem('smart-expense-tracker-expenses') || '[]');
      const aiExpenses = expenses.filter(e => e.aiSuggested);
      const totalConfidence = aiExpenses.reduce((sum, e) => sum + (e.confidence || 0), 0);
      
      setAiStats({
        totalExpenses: expenses.length,
        aiProcessed: aiExpenses.length,
        aiAccuracy: aiExpenses.length > 0 ? (totalConfidence / aiExpenses.length).toFixed(1) : 0,
        categoriesLearned: [...new Set(aiExpenses.map(e => e.category))].length,
        merchantsRecognized: [...new Set(aiExpenses.map(e => e.merchant).filter(Boolean))].length
      });
    } catch (error) {
      console.error('Error loading AI stats:', error);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: typeof prev[category] === 'object' ? 
        { ...prev[category], [setting]: value } :
        value
    }));
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    try {
      localStorage.setItem('smart-expense-tracker-settings', JSON.stringify(settings));
      
      setTimeout(() => {
        setIsLoading(false);
        toast({
          title: '🤖 AI Settings Saved',
          description: 'Your preferences have been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to default values?')) {
      setSettings({
        aiEnabled: true,
        autoCategorizationEnabled: true,
        aiConfidenceThreshold: 85,
        smartSuggestionsEnabled: true,
        monthlyBudget: 2000,
        categoryBudgets: {
          'Food & Dining': 500,
          'Transportation': 300,
          'Shopping': 400,
          'Entertainment': 200,
          'Bills & Utilities': 400
        },
        budgetAlertsEnabled: true,
        budgetAlertThreshold: 80,
        notificationsEnabled: true,
        budgetNotifications: true,
        aiInsightNotifications: true,
        weeklyReportsEnabled: true,
        anomalyDetectionEnabled: true,
        aiLearningEnabled: true,
        personalizedInsights: true,
        behaviorAnalysis: true,
        predictiveAnalytics: true,
        dataRetention: 365,
        anonymousAnalytics: true,
        dataExportEnabled: true,
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        theme: 'light',
        compactView: false
      });
      
      toast({
        title: 'Settings Reset',
        description: 'All settings have been reset to defaults',
        status: 'info',
        duration: 3000,
      });
    }
  };

  return (
    <Box>
      <VStack align="start" spacing={8}>
        {/* Header */}
        <HStack justify="space-between" w="full">
          <VStack align="start" spacing={2}>
            <Heading size="xl">⚙️ AI Smart Settings</Heading>
            <Text color="gray.600">Configure your AI-powered expense tracker preferences</Text>
          </VStack>
          <HStack spacing={3}>
            <Button leftIcon={<FiRefreshCw />} onClick={resetToDefaults} variant="outline">
              Reset Defaults
            </Button>
            <Button 
              leftIcon={<FiSave />} 
              onClick={handleSaveSettings}
              colorScheme="blue"
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Save Settings
            </Button>
          </HStack>
        </HStack>

        {/* AI Statistics */}
        {aiStats && (
          <Card bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white" w="full">
            <CardBody>
              <HStack spacing={4} mb={4}>
                <Icon as={FiCpu} boxSize={8} />
                <VStack align="start" spacing={1}>
                  <Heading size="lg">🧠 AI Performance Statistics</Heading>
                  <Text opacity={0.9}>Your AI assistant learning progress</Text>
                </VStack>
              </HStack>
              
              <SimpleGrid columns={{ base: 2, md: 5 }} spacing={6}>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold">{aiStats.totalExpenses}</Text>
                  <Text fontSize="sm" textAlign="center">Total Expenses Processed</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold">{aiStats.aiProcessed}</Text>
                  <Text fontSize="sm" textAlign="center">AI Categorized</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold">{aiStats.aiAccuracy}%</Text>
                  <Text fontSize="sm" textAlign="center">AI Accuracy Score</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold">{aiStats.categoriesLearned}</Text>
                  <Text fontSize="sm" textAlign="center">Categories Learned</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold">{aiStats.merchantsRecognized}</Text>
                  <Text fontSize="sm" textAlign="center">Merchants Recognized</Text>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Settings Tabs */}
        <Card bg={cardBg} w="full">
          <CardBody>
            <Tabs variant="soft-rounded" colorScheme="purple">
              <TabList mb={6}>
                <Tab><Icon as={FiCpu} mr={2} />AI Settings</Tab>
                <Tab><Icon as={FiTarget} mr={2} />Budget</Tab>
                <Tab><Icon as={FiBell} mr={2} />Notifications</Tab>
                <Tab><Icon as={FiShield} mr={2} />Privacy</Tab>
                <Tab><Icon as={FiSettings} mr={2} />General</Tab>
              </TabList>
              
              <TabPanels>
                {/* AI Settings */}
                <TabPanel>
                  <VStack align="stretch" spacing={6}>
                    <Heading size="md">🧠 AI Intelligence Configuration</Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Card variant="outline">
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="semibold">AI Assistant Enabled</Text>
                                <Text fontSize="sm" color="gray.600">Enable AI-powered expense categorization</Text>
                              </VStack>
                              <Switch 
                                colorScheme="purple"
                                isChecked={settings.aiEnabled}
                                onChange={(e) => handleSettingChange('aiEnabled', null, e.target.checked)}
                              />
                            </HStack>
                            
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="semibold">Auto-Categorization</Text>
                                <Text fontSize="sm" color="gray.600">Automatically apply high-confidence AI suggestions</Text>
                              </VStack>
                              <Switch 
                                colorScheme="purple"
                                isChecked={settings.autoCategorizationEnabled}
                                onChange={(e) => handleSettingChange('autoCategorizationEnabled', null, e.target.checked)}
                              />
                            </HStack>
                            
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="semibold">Smart Suggestions</Text>
                                <Text fontSize="sm" color="gray.600">Show AI-powered spending insights</Text>
                              </VStack>
                              <Switch 
                                colorScheme="purple"
                                isChecked={settings.smartSuggestionsEnabled}
                                onChange={(e) => handleSettingChange('smartSuggestionsEnabled', null, e.target.checked)}
                              />
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card variant="outline">
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <Text fontWeight="semibold">AI Confidence Threshold</Text>
                            <Text fontSize="sm" color="gray.600" mb={2}>
                              Minimum confidence level for auto-applying AI suggestions
                            </Text>
                            <HStack>
                              <Text fontSize="sm">60%</Text>
                              <Slider
                                flex="1"
                                value={settings.aiConfidenceThreshold}
                                onChange={(value) => handleSettingChange('aiConfidenceThreshold', null, value)}
                                min={60}
                                max={99}
                                colorScheme="purple"
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
                            <Text fontSize="sm" color="purple.600" textAlign="center">
                              Current: {settings.aiConfidenceThreshold}%
                            </Text>
                            
                            <Divider />
                            
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between">
                                <Text fontSize="sm">AI Learning Enabled</Text>
                                <Switch 
                                  size="sm"
                                  colorScheme="purple"
                                  isChecked={settings.aiLearningEnabled}
                                  onChange={(e) => handleSettingChange('aiLearningEnabled', null, e.target.checked)}
                                />
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Personalized Insights</Text>
                                <Switch 
                                  size="sm"
                                  colorScheme="purple"
                                  isChecked={settings.personalizedInsights}
                                  onChange={(e) => handleSettingChange('personalizedInsights', null, e.target.checked)}
                                />
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Behavior Analysis</Text>
                                <Switch 
                                  size="sm"
                                  colorScheme="purple"
                                  isChecked={settings.behaviorAnalysis}
                                  onChange={(e) => handleSettingChange('behaviorAnalysis', null, e.target.checked)}
                                />
                              </HStack>
                              <HStack justify="space-between">
                                <Text fontSize="sm">Predictive Analytics</Text>
                                <Switch 
                                  size="sm"
                                  colorScheme="purple"
                                  isChecked={settings.predictiveAnalytics}
                                  onChange={(e) => handleSettingChange('predictiveAnalytics', null, e.target.checked)}
                                />
                              </HStack>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>

                    <Alert status="info" borderRadius="lg">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="semibold">🤖 AI Enhancement Tip</Text>
                        <Text fontSize="sm" mt={1}>
                          Higher confidence thresholds provide more accuracy but fewer automatic categorizations. 
                          We recommend 85% for optimal balance between automation and precision.
                        </Text>
                      </Box>
                    </Alert>
                  </VStack>
                </TabPanel>

                {/* Budget Settings */}
                <TabPanel>
                  <VStack align="stretch" spacing={6}>
                    <Heading size="md">🎯 Smart Budget Configuration</Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Card variant="outline">
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <FormControl>
                              <FormLabel>Monthly Budget</FormLabel>
                              <NumberInput
                                value={settings.monthlyBudget}
                                onChange={(value) => handleSettingChange('monthlyBudget', null, parseInt(value))}
                                min={100}
                                max={50000}
                              >
                                <NumberInputField placeholder="Enter monthly budget" />
                              </NumberInput>
                            </FormControl>
                            
                            <FormControl>
                              <FormLabel>Budget Alert Threshold</FormLabel>
                              <HStack>
                                <Text fontSize="sm">50%</Text>
                                <Slider
                                  flex="1"
                                  value={settings.budgetAlertThreshold}
                                  onChange={(value) => handleSettingChange('budgetAlertThreshold', null, value)}
                                  min={50}
                                  max={100}
                                  colorScheme="orange"
                                >
                                  <SliderTrack>
                                    <SliderFilledTrack />
                                  </SliderTrack>
                                  <SliderThumb />
                                </Slider>
                                <Text fontSize="sm">100%</Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.600" mt={1}>
                                Get alerts when spending reaches {settings.budgetAlertThreshold}% of budget
                              </Text>
                            </FormControl>
                            
                            <HStack justify="space-between">
                              <Text>Budget Alerts</Text>
                              <Switch 
                                colorScheme="orange"
                                isChecked={settings.budgetAlertsEnabled}
                                onChange={(e) => handleSettingChange('budgetAlertsEnabled', null, e.target.checked)}
                              />
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card variant="outline">
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <Text fontWeight="semibold" mb={2}>Category Budgets</Text>
                            {Object.entries(settings.categoryBudgets).map(([category, budget]) => (
                              <FormControl key={category}>
                                <FormLabel fontSize="sm">{category}</FormLabel>
                                <NumberInput
                                  value={budget}
                                  onChange={(value) => handleSettingChange('categoryBudgets', category, parseInt(value))}
                                  min={0}
                                  max={2000}
                                  size="sm"
                                >
                                  <NumberInputField />
                                </NumberInput>
                              </FormControl>
                            ))}
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* Notifications */}
                <TabPanel>
                  <VStack align="stretch" spacing={6}>
                    <Heading size="md">🔔 Smart Notifications</Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">All Notifications</Text>
                            <Text fontSize="sm" color="gray.600">Master switch for all notifications</Text>
                          </VStack>
                          <Switch 
                            colorScheme="blue"
                            isChecked={settings.notificationsEnabled}
                            onChange={(e) => handleSettingChange('notificationsEnabled', null, e.target.checked)}
                          />
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text>Budget Notifications</Text>
                          <Switch 
                            colorScheme="orange"
                            isChecked={settings.budgetNotifications}
                            onChange={(e) => handleSettingChange('budgetNotifications', null, e.target.checked)}
                          />
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text>AI Insight Notifications</Text>
                          <Switch 
                            colorScheme="purple"
                            isChecked={settings.aiInsightNotifications}
                            onChange={(e) => handleSettingChange('aiInsightNotifications', null, e.target.checked)}
                          />
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text>Weekly AI Reports</Text>
                          <Switch 
                            colorScheme="green"
                            isChecked={settings.weeklyReportsEnabled}
                            onChange={(e) => handleSettingChange('weeklyReportsEnabled', null, e.target.checked)}
                          />
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text>Anomaly Detection Alerts</Text>
                          <Switch 
                            colorScheme="red"
                            isChecked={settings.anomalyDetectionEnabled}
                            onChange={(e) => handleSettingChange('anomalyDetectionEnabled', null, e.target.checked)}
                          />
                        </HStack>
                      </VStack>

                      <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="semibold">🧠 Smart Notification Features</Text>
                          <VStack align="start" spacing={1} mt={2} fontSize="sm">
                            <Text>• Budget alerts when approaching limits</Text>
                            <Text>• AI insights for spending optimization</Text>
                            <Text>• Weekly intelligent spending reports</Text>
                            <Text>• Automatic anomaly detection</Text>
                            <Text>• Personalized recommendations</Text>
                          </VStack>
                        </Box>
                      </Alert>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* Privacy & Data */}
                <TabPanel>
                  <VStack align="stretch" spacing={6}>
                    <Heading size="md">🛡️ Privacy & Data Settings</Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Card variant="outline">
                        <CardBody>
                          <VStack align="stretch" spacing={4}>
                            <FormControl>
                              <FormLabel>Data Retention Period</FormLabel>
                              <Select
                                value={settings.dataRetention}
                                onChange={(e) => handleSettingChange('dataRetention', null, parseInt(e.target.value))}
                              >
                                <option value={30}>1 Month</option>
                                <option value={90}>3 Months</option>
                                <option value={180}>6 Months</option>
                                <option value={365}>1 Year</option>
                                <option value={730}>2 Years</option>
                                <option value={-1}>Forever</option>
                              </Select>
                              <Text fontSize="sm" color="gray.600" mt={1}>
                                How long to keep your expense data
                              </Text>
                            </FormControl>
                            
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="semibold">Anonymous Analytics</Text>
                                <Text fontSize="sm" color="gray.600">Help improve AI with anonymous usage data</Text>
                              </VStack>
                              <Switch 
                                colorScheme="green"
                                isChecked={settings.anonymousAnalytics}
                                onChange={(e) => handleSettingChange('anonymousAnalytics', null, e.target.checked)}
                              />
                            </HStack>
                            
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="semibold">Data Export Enabled</Text>
                                <Text fontSize="sm" color="gray.600">Allow exporting your expense data</Text>
                              </VStack>
                              <Switch 
                                colorScheme="blue"
                                isChecked={settings.dataExportEnabled}
                                onChange={(e) => handleSettingChange('dataExportEnabled', null, e.target.checked)}
                              />
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Alert status="success" borderRadius="lg">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="semibold">🔒 Privacy Protection</Text>
                          <VStack align="start" spacing={1} mt={2} fontSize="sm">
                            <Text>• All data stored locally on your device</Text>
                            <Text>• AI processing happens offline</Text>
                            <Text>• No personal data sent to servers</Text>
                            <Text>• Full control over data retention</Text>
                            <Text>• Anonymous analytics are optional</Text>
                          </VStack>
                        </Box>
                      </Alert>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                {/* General Settings */}
                <TabPanel>
                  <VStack align="stretch" spacing={6}>
                    <Heading size="md">⚙️ General Preferences</Heading>
                    
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <VStack align="stretch" spacing={4}>
                        <FormControl>
                          <FormLabel>Currency</FormLabel>
                          <Select
                            value={settings.currency}
                            onChange={(e) => handleSettingChange('currency', null, e.target.value)}
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="CAD">CAD (C$)</option>
                            <option value="AUD">AUD (A$)</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Date Format</FormLabel>
                          <Select
                            value={settings.dateFormat}
                            onChange={(e) => handleSettingChange('dateFormat', null, e.target.value)}
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Theme</FormLabel>
                          <Select
                            value={settings.theme}
                            onChange={(e) => handleSettingChange('theme', null, e.target.value)}
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </Select>
                        </FormControl>
                        
                        <HStack justify="space-between">
                          <Text>Compact View</Text>
                          <Switch 
                            colorScheme="gray"
                            isChecked={settings.compactView}
                            onChange={(e) => handleSettingChange('compactView', null, e.target.checked)}
                          />
                        </HStack>
                      </VStack>

                      <Card bg="blue.50" variant="outline">
                        <CardBody>
                          <VStack align="start" spacing={3}>
                            <Text fontWeight="semibold" color="blue.700">🚀 App Information</Text>
                            <VStack align="start" spacing={1} fontSize="sm">
                              <HStack>
                                <Text fontWeight="semibold">Version:</Text>
                                <Badge colorScheme="blue">v4.0.0 AI Enhanced</Badge>
                              </HStack>
                              <HStack>
                                <Text fontWeight="semibold">AI Engine:</Text>
                                <Badge colorScheme="purple">Smart ML v2.1</Badge>
                              </HStack>
                              <HStack>
                                <Text fontWeight="semibold">Last Updated:</Text>
                                <Text>September 29, 2025</Text>
                              </HStack>
                              <HStack>
                                <Text fontWeight="semibold">Storage Used:</Text>
                                <Text>{JSON.stringify(settings).length < 5000 ? 'Light' : 'Moderate'}</Text>
                              </HStack>
                            </VStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default AISettingsPage;
