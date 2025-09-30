import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  SimpleGrid,
  useColorModeValue,
  Alert,
  AlertIcon,
  Icon,
  Flex,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  useToast,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useBreakpointValue,
  Collapse,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiUpload, 
  FiSearch,
  FiFilter,
  FiTrash2,
  FiEdit,
  FiDollarSign,
  FiCalendar,
  FiTag,
  FiCpu,
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
  FiBarChart,
  FiFileText,
  FiZap,
  FiTrendingUp,
  FiTarget,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ExpenseList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // FIXED: Move all useColorModeValue calls to top level
  const searchBg = useColorModeValue('gray.50', 'gray.600');
  const searchFocusBg = useColorModeValue('white', 'gray.500');
  const selectBg = useColorModeValue('gray.50', 'gray.600');
  const selectFocusBg = useColorModeValue('white', 'gray.500');
  
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedExpense, setExpandedExpense] = useState(null);

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const statsColumns = useBreakpointValue({ base: 2, md: 4 });
  const cardSpacing = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const containerPadding = useBreakpointValue({ base: 4, md: 6, lg: 8 });

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

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, categoryFilter]);

  const loadExpenses = () => {
    setTimeout(() => {
      try {
        const savedExpenses = JSON.parse(localStorage.getItem('smart-expense-tracker-expenses') || '[]');
        setExpenses(savedExpenses);
      } catch (error) {
        console.error('Error loading expenses:', error);
        toast({
          title: 'Error Loading Expenses',
          description: 'Failed to load expenses from storage',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }, isMobile ? 300 : 500);
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.merchant && expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    setFilteredExpenses(filtered);
  };

  const deleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      setExpenses(updatedExpenses);
      localStorage.setItem('smart-expense-tracker-expenses', JSON.stringify(updatedExpenses));
      
      toast({
        title: 'AI Smart Delete',
        description: 'Expense removed and AI patterns updated',
        status: 'success',
        duration: 3000,
      });
    }
  };

  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const aiEnhanced = filteredExpenses.filter(e => e.aiSuggested || e.aiEnhanced).length;
    const avgAmount = total / (filteredExpenses.length || 1);
    const monthlyProjection = avgAmount * 30;
    
    return {
      total,
      count: filteredExpenses.length,
      aiEnhanced,
      avgAmount,
      monthlyProjection,
      aiPercentage: filteredExpenses.length > 0 ? (aiEnhanced / filteredExpenses.length) * 100 : 0,
      topCategory: filteredExpenses.length > 0 ? 
        Object.entries(filteredExpenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {})).sort(([,a], [,b]) => b - a)[0] : ['N/A', 0]
    };
  }, [filteredExpenses]);

  if (isLoading) {
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
            AI Loading Smart Expenses...
          </Text>
          <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600" textAlign="center">
            Analyzing expense patterns with artificial intelligence
          </Text>
          <HStack spacing={2}>
            <Badge colorScheme="blue" variant="subtle">AI Processing</Badge>
            <Badge colorScheme="purple" variant="subtle">Smart Analysis</Badge>
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
                bgGradient="linear(to-r, green.400, blue.600)"
                bgClip="text"
                noOfLines={1}
              >
                AI Smart Expenses
              </Heading>
              <HStack wrap="wrap" spacing={{ base: 2, md: 3 }} w="full">
                <Badge 
                  colorScheme="green" 
                  variant="solid" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                >
                  {stats.count} Transactions
                </Badge>
                <Badge 
                  colorScheme="purple" 
                  variant="outline" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                >
                  {stats.aiEnhanced} AI Enhanced
                </Badge>
                <Badge 
                  colorScheme="blue" 
                  variant="outline" 
                  fontSize={{ base: 'xs', md: 'sm' }}
                  px={3}
                  py={1}
                  display={{ base: 'none', sm: 'flex' }}
                >
                  {stats.aiPercentage.toFixed(0)}% Smart
                </Badge>
              </HStack>
            </VStack>
            
            <VStack spacing={3} w={{ base: 'full', lg: 'auto' }} align={{ base: 'stretch', lg: 'end' }}>
              <HStack spacing={3} w="full" justify={{ base: 'stretch', lg: 'end' }}>
                <Button 
                  leftIcon={<FiUpload />} 
                  colorScheme="green" 
                  variant="outline"
                  onClick={() => navigate('/expenses/upload')}
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  minW={{ base: '100px', md: '120px' }}
                >
                  AI Upload
                </Button>
                <Button 
                  leftIcon={<FiPlus />} 
                  colorScheme="blue"
                  onClick={() => navigate('/expenses/new')}
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: 1, lg: 'none' }}
                  minW={{ base: '100px', md: '120px' }}
                >
                  Add Expense
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* AI POWERED STATS */}
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
                  <Icon as={FiDollarSign} mr={1} />
                  {stats.count} smart transactions
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
                  AI Enhanced
                </StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                  {stats.aiEnhanced}
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  <Icon as={FiCpu} mr={1} />
                  {stats.aiPercentage.toFixed(0)}% intelligent
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
                  Smart Average
                </StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                  
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  Per transaction
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
                  Monthly Forecast
                </StatLabel>
                <StatNumber fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}>
                  
                </StatNumber>
                <StatHelpText color="whiteAlpha.800" fontSize={{ base: 'xs', md: 'sm' }}>
                  AI prediction
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* AI SEARCH & FILTER */}
        <Card bg={cardBg} w="full" transition="all 0.3s ease" _hover={{ shadow: 'lg' }}>
          <CardBody>
            <VStack spacing={4}>
              <Heading size={{ base: 'sm', md: 'md' }} color="purple.600" alignSelf="start">
                AI Smart Search & Filter
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="AI-powered search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size={{ base: 'md', md: 'lg' }}
                    fontSize={{ base: 'sm', md: 'md' }}
                    bg={searchBg}
                    border="2px solid transparent"
                    _focus={{ border: '2px solid', borderColor: 'purple.400', bg: searchFocusBg }}
                  />
                </InputGroup>
                
                <Select
                  placeholder="Filter by smart category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  size={{ base: 'md', md: 'lg' }}
                  fontSize={{ base: 'sm', md: 'md' }}
                  bg={selectBg}
                  border="2px solid transparent"
                  _focus={{ border: '2px solid', borderColor: 'blue.400', bg: selectFocusBg }}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </SimpleGrid>
              
              {(searchTerm || categoryFilter) && (
                <HStack w="full" justify="space-between" wrap="wrap">
                  <Text fontSize="sm" color="gray.600">
                    AI found {filteredExpenses.length} of {expenses.length} expenses
                  </Text>
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    colorScheme="purple"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                    }}
                  >
                    Clear AI filters
                  </Button>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* RESPONSIVE EXPENSES LIST */}
        {filteredExpenses.length === 0 ? (
          <Card bg={cardBg} w="full">
            <CardBody textAlign="center" py={{ base: 8, md: 12 }}>
              <VStack spacing={4}>
                <Icon as={FiDollarSign} boxSize={{ base: 12, md: 16 }} color="gray.300" />
                <Heading size={{ base: 'md', md: 'lg' }} color="gray.500">
                  {expenses.length === 0 ? 'No AI expenses yet' : 'No expenses match AI filters'}
                </Heading>
                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }} textAlign="center">
                  {expenses.length === 0 
                    ? 'Start your AI-powered expense journey today'
                    : 'Try adjusting your intelligent search criteria'
                  }
                </Text>
                {expenses.length === 0 && (
                  <VStack spacing={3} mt={4} w="full" maxW="sm">
                    <Button 
                      leftIcon={<FiPlus />} 
                      colorScheme="blue"
                      onClick={() => navigate('/expenses/new')}
                      size={{ base: 'md', md: 'lg' }}
                      w="full"
                    >
                      Add First AI Expense
                    </Button>
                    <Button 
                      leftIcon={<FiUpload />} 
                      colorScheme="green" 
                      variant="outline"
                      onClick={() => navigate('/expenses/upload')}
                      size={{ base: 'md', md: 'lg' }}
                      w="full"
                    >
                      Upload AI Receipt
                    </Button>
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={{ base: 3, md: 4 }} w="full">
            {filteredExpenses.map((expense) => (
              <Card 
                key={expense.id} 
                bg={cardBg} 
                w="full" 
                _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }} 
                transition="all 0.3s ease"
                cursor={isMobile ? "pointer" : "default"}
                onClick={isMobile ? () => setExpandedExpense(expandedExpense === expense.id ? null : expense.id) : undefined}
                borderLeft="4px solid"
                borderLeftColor={expense.aiSuggested ? "purple.400" : "blue.400"}
              >
                <CardBody py={{ base: 4, md: 6 }}>
                  <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                    {/* Main Expense Info */}
                    <Flex 
                      direction={{ base: 'column', md: 'row' }} 
                      justify="space-between" 
                      align={{ base: 'start', md: 'center' }}
                      gap={3}
                    >
                      {/* Left Side - Expense Details */}
                      <VStack align="start" spacing={2} flex={1} minW="0">
                        <Flex wrap="wrap" align="center" gap={2} w="full">
                          <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }} noOfLines={{ base: 2, md: 1 }} flex="1">
                            {expense.description}
                          </Text>
                          {expense.aiSuggested && (
                            <Badge colorScheme="purple" size={{ base: 'sm', md: 'md' }}>
                              AI Enhanced {expense.confidence || 95}%
                            </Badge>
                          )}
                          {expense.ocrProcessed && (
                            <Badge colorScheme="green" size={{ base: 'sm', md: 'md' }}>
                              Smart OCR
                            </Badge>
                          )}
                          {isMobile && (
                            <IconButton
                              icon={expandedExpense === expense.id ? <FiChevronUp /> : <FiChevronDown />}
                              size="sm"
                              variant="ghost"
                              aria-label="Toggle details"
                            />
                          )}
                        </Flex>
                        
                        <HStack spacing={4} wrap="wrap">
                          <HStack spacing={1}>
                            <Icon as={FiCalendar} color="gray.500" boxSize={4} />
                            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
                              {expense.date}
                            </Text>
                          </HStack>
                          
                          <Badge colorScheme="blue" size={{ base: 'sm', md: 'md' }}>
                            {expense.category}
                          </Badge>
                          
                          {expense.merchant && (
                            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" noOfLines={1}>
                              @ {expense.merchant}
                            </Text>
                          )}
                        </HStack>
                      </VStack>

                      {/* Right Side - Amount and Actions */}
                      <VStack align={{ base: 'start', md: 'end' }} spacing={3} w={{ base: 'full', md: 'auto' }}>
                        <Text 
                          fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} 
                          fontWeight="bold" 
                          color="red.500"
                        >
                          -
                        </Text>
                        
                        {!isMobile && (
                          <HStack spacing={2}>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem 
                                  icon={<FiEdit />}
                                  onClick={() => navigate('/expenses/edit/' + expense.id)}
                                >
                                  Edit Expense
                                </MenuItem>
                                <MenuItem 
                                  icon={<FiTrash2 />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteExpense(expense.id);
                                  }}
                                  color="red.500"
                                >
                                  Delete Expense
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        )}
                      </VStack>
                    </Flex>

                    {/* Mobile Expandable Details */}
                    {isMobile && (
                      <Collapse in={expandedExpense === expense.id}>
                        <VStack spacing={3} align="stretch" pt={3} borderTopWidth="1px" borderColor="gray.200">
                          {expense.notes && (
                            <Box>
                              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>NOTES</Text>
                              <Text fontSize="sm" color="gray.600">
                                {expense.notes}
                              </Text>
                            </Box>
                          )}
                          
                          <HStack spacing={2} justify="stretch">
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              leftIcon={<FiEdit />}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/expenses/edit/' + expense.id);
                              }}
                              flex="1"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              leftIcon={<FiTrash2 />}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteExpense(expense.id);
                              }}
                              flex="1"
                            >
                              Delete
                            </Button>
                          </HStack>
                        </VStack>
                      </Collapse>
                    )}

                    {/* Desktop Notes */}
                    {!isMobile && expense.notes && (
                      <Text fontSize="sm" color="gray.500" noOfLines={2} mt={2}>
                        {expense.notes}
                      </Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}

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
                      Smart expense shortcuts
                    </Text>
                  </VStack>
                  
                  <VStack spacing={4} w="full">
                    <SimpleGrid columns={2} spacing={4} w="full">
                      <Button 
                        leftIcon={<FiPlus />} 
                        colorScheme="blue" 
                        variant="solid"
                        size="lg"
                        onClick={() => navigate('/expenses/new')}
                        bg="blue.500"
                        _hover={{ bg: 'blue.600' }}
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
                        colorScheme="green" 
                        variant="solid"
                        size="lg"
                        onClick={() => navigate('/expenses/upload')}
                        bg="green.500"
                        _hover={{ bg: 'green.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>AI Upload</Text>
                        <Text fontSize="xs" opacity={0.8}>Receipt</Text>
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
                        leftIcon={<FiFileText />} 
                        colorScheme="orange" 
                        variant="solid"
                        size="lg"
                        onClick={() => navigate('/reports')}
                        bg="orange.500"
                        _hover={{ bg: 'orange.600' }}
                        w="full"
                        height="60px"
                        flexDirection="column"
                        fontSize="sm"
                      >
                        <Text>AI Reports</Text>
                        <Text fontSize="xs" opacity={0.8}>Generate</Text>
                      </Button>
                    </SimpleGrid>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        )}

        {/* AI INSIGHTS PANEL */}
        {filteredExpenses.length > 0 && (
          <Card bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" color="white" w="full">
            <CardBody py={cardSpacing}>
              <VStack spacing={4}>
                <HStack spacing={3} w="full">
                  <Icon as={FiTarget} boxSize={{ base: 6, md: 8 }} />
                  <VStack align="start" spacing={1} flex="1">
                    <Heading size={{ base: 'md', md: 'lg' }}>AI Expense Intelligence</Heading>
                    <Text opacity={0.9} fontSize={{ base: 'sm', md: 'md' }}>
                      Smart insights from your spending patterns
                    </Text>
                  </VStack>
                </HStack>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
                  <VStack>
                    <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                      {stats.topCategory[0]}
                    </Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }} textAlign="center" opacity={0.9}>
                      Top AI Category
                    </Text>
                  </VStack>
                  
                  <VStack>
                    <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                      
                    </Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }} textAlign="center" opacity={0.9}>
                      Category Total
                    </Text>
                  </VStack>
                  
                  <VStack>
                    <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold">
                      {((stats.topCategory[1] / stats.total) * 100).toFixed(0)}%
                    </Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }} textAlign="center" opacity={0.9}>
                      Of Total Spending
                    </Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        )}

      </VStack>
    </Box>
  );
};

export default ExpenseList;

