// Smart Expense Tracker - Header Component
import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  HStack,
  Text,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { FiBell, FiSettings } from 'react-icons/fi';

const Header = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bg}
      px={6}
      py={4}
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex align="center" justify="space-between">
        {/* Logo/Title */}
        <Heading size="lg" color="brand.500">
          💰 Smart Expense Tracker
        </Heading>

        {/* User Section */}
        <HStack spacing={4}>
          {/* Notifications */}
          <IconButton
            icon={<FiBell />}
            variant="ghost"
            size="sm"
            aria-label="Notifications"
          />

          {/* Settings */}
          <IconButton
            icon={<FiSettings />}
            variant="ghost"
            size="sm"
            aria-label="Settings"
          />

          {/* User Info */}
          <Box textAlign="left">
            <Text fontSize="sm" fontWeight="semibold">
              Demo User
            </Text>
            <Text fontSize="xs" color="gray.500">
              demo@expensetracker.com
            </Text>
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
