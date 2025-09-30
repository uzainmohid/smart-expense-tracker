// Smart Expense Tracker - Sidebar Component
import React from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiDollarSign,
  FiUpload,
  FiPieChart,
  FiTrendingUp,
  FiSettings,
} from 'react-icons/fi';

const NavItem = ({ icon, children, to, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box
      as={NavLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      {...rest}
    >
      <Flex
        align="center"
        p={3}
        mx={2}
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : 'gray.600'}
        fontWeight={isActive ? 'semibold' : 'normal'}
        _hover={{
          bg: isActive ? activeBg : hoverBg,
          color: isActive ? activeColor : 'gray.900',
        }}
        transition="all 0.2s"
      >
        {icon && (
          <Icon
            mr={3}
            fontSize="16"
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  );
};

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { name: 'Expenses', icon: FiDollarSign, path: '/expenses' },
    { name: 'Upload Receipt', icon: FiUpload, path: '/expenses/upload' },
    { name: 'Analytics', icon: FiPieChart, path: '/analytics' },
    { name: 'Reports', icon: FiTrendingUp, path: '/reports' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ];

  return (
    <Box h="100vh" bg="white" borderRight="1px" borderColor="gray.200">
      {/* Logo Section */}
      <Flex h="20" align="center" mx={4} justify="center">
        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
          💰 Tracker
        </Text>
      </Flex>

      {/* Navigation */}
      <VStack spacing={1} align="stretch" mt={6}>
        {navItems.map((item) => (
          <NavItem key={item.name} icon={item.icon} to={item.path}>
            {item.name}
          </NavItem>
        ))}
      </VStack>

      {/* Bottom Section */}
      <Box position="absolute" bottom={4} left={4} right={4}>
        <Box
          p={4}
          bg="brand.50"
          borderRadius="lg"
          textAlign="center"
        >
          <Text fontSize="sm" fontWeight="semibold" color="brand.600">
            AI-Powered Insights
          </Text>
          <Text fontSize="xs" color="brand.500" mt={1}>
            Upload receipts for automatic categorization
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;