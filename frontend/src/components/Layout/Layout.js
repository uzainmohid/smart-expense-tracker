import React, { useState, useCallback } from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Link,
  Text,
  useColorModeValue,
  Container,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiMenu, FiHome, FiDollarSign, FiBarChart, FiFileText, FiSettings, FiUpload, FiX } from 'react-icons/fi';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Responsive values for better performance
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const containerMaxW = useBreakpointValue({ base: 'full', md: '7xl' });

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome, color: 'blue' },
    { name: 'Expenses', path: '/expenses', icon: FiDollarSign, color: 'green' },
    { name: 'Analytics', path: '/analytics', icon: FiBarChart, color: 'purple' },
    { name: 'Reports', path: '/reports', icon: FiFileText, color: 'orange' },
    { name: 'Settings', path: '/settings', icon: FiSettings, color: 'gray' },
    { name: 'Upload', path: '/expenses/upload', icon: FiUpload, color: 'teal' }
  ];

  const NavLink = useCallback(({ item, isMobile = false, onClick }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        as={RouterLink}
        to={item.path}
        display="flex"
        alignItems="center"
        px={isMobile ? 4 : 3}
        py={isMobile ? 3 : 2}
        rounded="lg"
        fontSize={isMobile ? 'md' : 'sm'}
        fontWeight={isActive ? 'bold' : 'medium'}
        color={isActive ? item.color + '.600' : 'gray.600'}
        bg={isActive ? item.color + '.50' : 'transparent'}
        _hover={{
          textDecoration: 'none',
          bg: isActive ? item.color + '.100' : 'gray.100',
          color: isActive ? item.color + '.700' : 'gray.800',
          transform: 'translateY(-1px)',
        }}
        _dark={{
          color: isActive ? item.color + '.300' : 'gray.300',
          bg: isActive ? item.color + '.900' : 'transparent',
          _hover: {
            bg: isActive ? item.color + '.800' : 'gray.700',
            color: isActive ? item.color + '.200' : 'white'
          }
        }}
        transition="all 0.15s ease-out"
        onClick={onClick}
        w={isMobile ? 'full' : 'auto'}
        minH="44px"
      >
        <Box as={item.icon} size="18px" mr={2} />
        <Text>{item.name}</Text>
        {isActive && (
          <Badge ml="auto" colorScheme={item.color} size="sm" opacity={0.8}>
            •
          </Badge>
        )}
      </Link>
    );
  }, [location.pathname]);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Optimized Header */}
      <Box 
        bg={bg} 
        shadow="sm" 
        borderBottomWidth="1px" 
        borderColor={borderColor}
        position="sticky"
        top="0"
        zIndex="sticky"
        backdropFilter="blur(8px)"
        h={{ base: '60px', md: '64px' }}
      >
        <Container maxW={containerMaxW} h="full" px={{ base: 4, md: 6 }}>
          <Flex h="full" alignItems="center" justifyContent="space-between">
            {/* Logo - Responsive */}
            <HStack spacing={{ base: 2, md: 4 }} alignItems="center" flex="1" minW="0">
              <Text 
                fontSize={{ base: 'md', md: 'xl' }} 
                fontWeight="bold" 
                bgGradient="linear(to-r, blue.400, purple.500)"
                bgClip="text"
                noOfLines={1}
              >
                🧠 AI Smart Tracker
              </Text>
              <Badge 
                colorScheme="purple" 
                variant="subtle" 
                display={{ base: 'none', sm: 'flex' }}
                fontSize="xs"
              >
                v4.0
              </Badge>
            </HStack>

            {/* Desktop Navigation */}
            <HStack 
              as="nav" 
              spacing={1} 
              display={{ base: 'none', lg: 'flex' }}
              flex="2"
              justify="center"
            >
              {navItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </HStack>

            {/* User Menu & Mobile Toggle */}
            <HStack spacing={2} flex="1" justify="end">
              {/* User Menu - Desktop Only */}
              <Menu>
                <MenuButton 
                  as={IconButton}
                  variant="ghost"
                  display={{ base: 'none', md: 'flex' }}
                  size="sm"
                >
                  <Avatar size="sm" bg="purple.500" />
                </MenuButton>
                <MenuList fontSize="sm">
                  <MenuItem>👤 Profile</MenuItem>
                  <MenuItem>📊 Analytics</MenuItem>
                  <MenuItem>🔒 Privacy</MenuItem>
                  <MenuItem>❓ Help</MenuItem>
                </MenuList>
              </Menu>

              {/* Mobile Menu Button */}
              <IconButton
                display={{ base: 'flex', lg: 'none' }}
                onClick={onOpen}
                variant="ghost"
                aria-label="Open menu"
                icon={<FiMenu />}
                size="lg"
                _active={{ transform: 'scale(0.95)' }}
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Optimized Mobile Drawer */}
      <Drawer 
        isOpen={isOpen} 
        placement="right" 
        onClose={onClose} 
        size="xs"
        motionPreset="slideInRight"
      >
        <DrawerOverlay bg="blackAlpha.300" backdropFilter="blur(4px)" />
        <DrawerContent maxW="280px">
          <DrawerCloseButton 
            size="lg" 
            _focus={{ boxShadow: 'none' }}
            top={3}
            right={3}
          />
          <DrawerHeader borderBottomWidth="1px" pb={4}>
            <VStack spacing={2} align="start">
              <Text 
                bgGradient="linear(to-r, blue.400, purple.500)"
                bgClip="text"
                fontWeight="bold"
                fontSize="lg"
              >
                🧠 AI Smart Tracker
              </Text>
              <Badge colorScheme="purple" variant="solid" fontSize="xs">
                Mobile Menu
              </Badge>
            </VStack>
          </DrawerHeader>
          
          <DrawerBody p={0}>
            <VStack spacing={1} align="stretch" py={4}>
              {navItems.map((item) => (
                <NavLink 
                  key={item.path} 
                  item={item} 
                  isMobile={true} 
                  onClick={onClose}
                />
              ))}
            </VStack>
            
            {/* Mobile Menu Footer */}
            <Box p={4} borderTopWidth="1px" mt={4}>
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                  🤖 AI Features
                </Text>
                <VStack spacing={1} align="start" fontSize="xs" color="gray.500">
                  <Text>• Smart Categorization</Text>
                  <Text>• Predictive Analytics</Text>
                  <Text>• Receipt OCR</Text>
                  <Text>• Behavioral Analysis</Text>
                  <Text>• Budget Optimization</Text>
                </VStack>
              </VStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Optimized Main Content - FIXED */}
      <Box
        minH="calc(100vh - 64px)"
        w="full"
      >
        <Container 
          maxW={containerMaxW} 
          py={{ base: 4, md: 6 }} 
          px={{ base: 4, md: 6 }}
          mx="auto"
        >
          {children}
        </Container>
      </Box>

      {/* Optimized Mobile Bottom Navigation */}
      {isMobile && (
        <Box 
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          bg={bg}
          borderTopWidth="1px"
          borderColor={borderColor}
          py={2}
          px={2}
          zIndex="sticky"
          shadow="lg"
          backdropFilter="blur(8px)"
        >
          <HStack justify="space-around" spacing={1}>
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  as={RouterLink}
                  to={item.path}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  py={2}
                  px={1}
                  rounded="md"
                  color={isActive ? item.color + '.600' : 'gray.500'}
                  _hover={{ textDecoration: 'none' }}
                  _active={{ transform: 'scale(0.95)' }}
                  minW="0"
                  flex="1"
                  transition="all 0.15s ease-out"
                >
                  <Box as={item.icon} size="20px" />
                  <Text fontSize="xs" mt={1} isTruncated maxW="full" lineHeight="1.2">
                    {item.name}
                  </Text>
                  {isActive && (
                    <Box w="4px" h="4px" bg={item.color + '.600'} rounded="full" mt={1} />
                  )}
                </Link>
              );
            })}
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default Layout;
