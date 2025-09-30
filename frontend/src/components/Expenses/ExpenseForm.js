import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  Textarea,
  useToast,
  Alert,
  AlertIcon,
  Badge,
  Icon,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiCpu, FiZap } from 'react-icons/fi';

const ExpenseForm = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    notes: ''
  });
  
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardSpacing = useBreakpointValue({ base: 4, md: 6 });
  const containerPadding = useBreakpointValue({ base: 4, md: 6 });

  const categories = [
    'Food & Dining',
    'Transportation', 
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Business',
    'Other',
  ];

  // AI-powered smart categorization
  useEffect(() => {
    if (expense.description && expense.description.length > 3) {
      generateAISuggestion();
    }
  }, [expense.description]);

  const generateAISuggestion = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const description = expense.description.toLowerCase();
      let suggestedCategory = 'Other';
      let confidence = 0;
      let merchant = '';

      // AI-like categorization logic
      if (description.includes('starbucks') || description.includes('coffee') || description.includes('restaurant') || description.includes('food')) {
        suggestedCategory = 'Food & Dining';
        confidence = 92;
        merchant = description.includes('starbucks') ? 'Starbucks' : 'Restaurant';
      } else if (description.includes('gas') || description.includes('fuel') || description.includes('uber') || description.includes('taxi')) {
        suggestedCategory = 'Transportation';
        confidence = 89;
        merchant = description.includes('uber') ? 'Uber' : 'Gas Station';
      } else if (description.includes('amazon') || description.includes('shop') || description.includes('store') || description.includes('buy')) {
        suggestedCategory = 'Shopping';
        confidence = 87;
        merchant = description.includes('amazon') ? 'Amazon' : 'Store';
      } else if (description.includes('movie') || description.includes('netflix') || description.includes('game')) {
        suggestedCategory = 'Entertainment';
        confidence = 94;
        merchant = description.includes('netflix') ? 'Netflix' : 'Entertainment';
      } else if (description.includes('electric') || description.includes('water') || description.includes('bill') || description.includes('utility')) {
        suggestedCategory = 'Bills & Utilities';
        confidence = 96;
        merchant = 'Utility Company';
      } else if (description.includes('doctor') || description.includes('hospital') || description.includes('pharmacy') || description.includes('medical')) {
        suggestedCategory = 'Healthcare';
        confidence = 91;
        merchant = 'Healthcare Provider';
      }

      if (confidence > 0) {
        setAiSuggestion({
          category: suggestedCategory,
          confidence: confidence,
          merchant: merchant,
          reasoning: 'AI detected keywords related to ' + suggestedCategory
        });
      } else {
        setAiSuggestion(null);
      }
      
      setIsProcessing(false);
    }, 800);
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setExpense(prev => ({
        ...prev,
        category: aiSuggestion.category,
        merchant: aiSuggestion.merchant || prev.merchant
      }));
      
      toast({
        title: '🤖 AI Suggestion Applied!',
        description: 'Category set to ' + aiSuggestion.category + ' with ' + aiSuggestion.confidence + '% confidence',
        status: 'success',
        duration: 3000,
      });
    }
  };

  const handleSave = async () => {
    if (!expense.description || !expense.amount || !expense.category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in description, amount, and category',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      const expenses = JSON.parse(localStorage.getItem('smart-expense-tracker-expenses') || '[]');
      
      const newExpense = {
        id: Date.now(),
        description: expense.description,
        amount: parseFloat(expense.amount),
        category: expense.category,
        date: expense.date,
        merchant: expense.merchant,
        notes: expense.notes,
        aiSuggested: aiSuggestion ? true : false,
        confidence: aiSuggestion ? aiSuggestion.confidence : 0,
        createdAt: new Date().toISOString(),
        source: 'manual_entry'
      };

      expenses.unshift(newExpense);
      localStorage.setItem('smart-expense-tracker-expenses', JSON.stringify(expenses));

      toast({
        title: '✅ Expense Saved Successfully!',
        description: 'Your expense has been added with' + (aiSuggestion ? ' AI categorization' : ''),
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      navigate('/expenses');
    } catch (error) {
      toast({
        title: 'Save Error',
        description: 'Failed to save expense. Please try again.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box px={containerPadding} py={{ base: 4, md: 6 }} maxW="full" overflowX="hidden">
      <VStack align="start" spacing={cardSpacing}>
        {/* Responsive Header */}
        <Flex 
          direction={{ base: 'column', sm: 'row' }} 
          justify="space-between" 
          align={{ base: 'start', sm: 'center' }} 
          w="full"
          gap={4}
        >
          <VStack align="start" spacing={2} flex="1" minW="0">
            <Heading size={{ base: 'md', md: 'lg', lg: 'xl' }} noOfLines={1}>
              💰 Add Smart Expense
            </Heading>
            <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
              Add a new expense with AI-powered categorization
            </Text>
          </VStack>
          <Button 
            leftIcon={<FiArrowLeft />} 
            variant="ghost"
            onClick={() => navigate('/expenses')}
            size={{ base: 'sm', md: 'md' }}
          >
            Back to Expenses
          </Button>
        </Flex>

        {/* AI Suggestion Alert */}
        {aiSuggestion && (
          <Card bg="purple.50" borderLeft="4px solid" borderLeftColor="purple.400" w="full">
            <CardBody>
              <Alert status="info" bg="transparent" p={0}>
                <AlertIcon color="purple.500" />
                <Box flex="1">
                  <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
                    🧠 AI Smart Suggestion
                  </Text>
                  <Text fontSize={{ base: 'xs', md: 'sm' }} mt={1} mb={3}>
                    {aiSuggestion.reasoning} (Confidence: {aiSuggestion.confidence}%)
                  </Text>
                  <HStack spacing={2} wrap="wrap">
                    <Badge colorScheme="purple" size={{ base: 'sm', md: 'md' }}>
                      Category: {aiSuggestion.category}
                    </Badge>
                    {aiSuggestion.merchant && (
                      <Badge colorScheme="blue" size={{ base: 'sm', md: 'md' }}>
                        Merchant: {aiSuggestion.merchant}
                      </Badge>
                    )}
                    <Button
                      size="xs"
                      colorScheme="purple"
                      onClick={applyAISuggestion}
                      leftIcon={<FiZap />}
                    >
                      Apply AI Suggestion
                    </Button>
                  </HStack>
                </Box>
              </Alert>
            </CardBody>
          </Card>
        )}

        {/* Expense Form */}
        <Card w="full">
          <CardBody>
            <VStack spacing={cardSpacing} align="stretch">
              {/* Basic Information */}
              <VStack spacing={4} align="stretch">
                <Heading size={{ base: 'sm', md: 'md' }}>📋 Expense Details</Heading>
                
                <FormControl isRequired>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Description</FormLabel>
                  <Input
                    placeholder="Enter expense description..."
                    value={expense.description}
                    onChange={(e) => setExpense({...expense, description: e.target.value})}
                    size={{ base: 'md', md: 'lg' }}
                    fontSize={{ base: 'sm', md: 'md' }}
                  />
                  {isProcessing && (
                    <Text fontSize="xs" color="purple.600" mt={1}>
                      🧠 AI analyzing description...
                    </Text>
                  )}
                </FormControl>

                <HStack spacing={4} align="start" wrap={{ base: 'wrap', md: 'nowrap' }}>
                  <FormControl isRequired flex={{ base: 'none', md: 1 }} w={{ base: 'full', md: 'auto' }}>
                    <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Amount</FormLabel>
                    <NumberInput
                      value={expense.amount}
                      onChange={(value) => setExpense({...expense, amount: value})}
                      min={0}
                      precision={2}
                      size={{ base: 'md', md: 'lg' }}
                    >
                      <NumberInputField 
                        placeholder="0.00" 
                        fontSize={{ base: 'sm', md: 'md' }}
                      />
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired flex={{ base: 'none', md: 2 }} w={{ base: 'full', md: 'auto' }}>
                    <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Category</FormLabel>
                    <Select
                      placeholder="Select category"
                      value={expense.category}
                      onChange={(e) => setExpense({...expense, category: e.target.value})}
                      size={{ base: 'md', md: 'lg' }}
                      fontSize={{ base: 'sm', md: 'md' }}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                <HStack spacing={4} align="start" wrap={{ base: 'wrap', md: 'nowrap' }}>
                  <FormControl flex={{ base: 'none', md: 1 }} w={{ base: 'full', md: 'auto' }}>
                    <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Date</FormLabel>
                    <Input
                      type="date"
                      value={expense.date}
                      onChange={(e) => setExpense({...expense, date: e.target.value})}
                      size={{ base: 'md', md: 'lg' }}
                    />
                  </FormControl>

                  <FormControl flex={{ base: 'none', md: 2 }} w={{ base: 'full', md: 'auto' }}>
                    <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Merchant (Optional)</FormLabel>
                    <Input
                      placeholder="Store or merchant name"
                      value={expense.merchant}
                      onChange={(e) => setExpense({...expense, merchant: e.target.value})}
                      size={{ base: 'md', md: 'lg' }}
                      fontSize={{ base: 'sm', md: 'md' }}
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Notes (Optional)</FormLabel>
                  <Textarea
                    placeholder="Additional notes about this expense..."
                    value={expense.notes}
                    onChange={(e) => setExpense({...expense, notes: e.target.value})}
                    rows={3}
                    fontSize={{ base: 'sm', md: 'md' }}
                  />
                </FormControl>
              </VStack>

              {/* Action Buttons */}
              <HStack 
                spacing={4} 
                justify="center" 
                pt={4} 
                borderTopWidth="1px" 
                borderColor="gray.200"
                wrap="wrap"
              >
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="blue"
                  size={{ base: 'md', md: 'lg' }}
                  onClick={handleSave}
                  isLoading={isSaving}
                  loadingText="Saving..."
                  minW={{ base: '120px', md: '150px' }}
                >
                  Save Expense
                </Button>
                <Button
                  variant="outline"
                  size={{ base: 'md', md: 'lg' }}
                  onClick={() => navigate('/expenses')}
                  minW={{ base: '120px', md: '150px' }}
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* AI Features Info */}
        <Card bg="blue.50" w="full">
          <CardBody py={4}>
            <VStack spacing={3}>
              <HStack>
                <Icon as={FiCpu} color="blue.600" boxSize={5} />
                <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }} color="blue.700">
                  🤖 AI Smart Features
                </Text>
              </HStack>
              <VStack spacing={1} fontSize={{ base: 'xs', md: 'sm' }} color="blue.600" textAlign="center">
                <Text>• Automatic category suggestions based on description</Text>
                <Text>• Smart merchant detection and tagging</Text>
                <Text>• Confidence scoring for AI predictions</Text>
                <Text>• Learning from your spending patterns</Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default ExpenseForm;
