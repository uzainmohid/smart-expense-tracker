import React from 'react';
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ColorModeProvider } from './contexts/ColorModeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ExpenseList from './components/Expenses/ExpenseList';
import ExpenseForm from './components/Expenses/ExpenseForm';
import ReceiptUpload from './components/Expenses/ReceiptUpload';
import Analytics from './components/Analytics/Analytics';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  breakpoints: {
    base: '0px',
    sm: '480px',
    md: '768px',
    lg: '992px',
    xl: '1280px',
    '2xl': '1536px',
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        transition: 'all 0.2s ease-in-out',
        overflowX: 'hidden',
      },
      '*': {
        boxSizing: 'border-box',
      },
      'html': {
        scrollBehavior: 'smooth',
      }
    }),
  },
  components: {
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          shadow: props.colorMode === 'dark' ? 'dark-lg' : 'md',
          transition: 'all 0.2s ease-in-out',
          borderRadius: 'lg',
        },
      }),
    },
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      baseStyle: {
        transition: 'all 0.2s ease-in-out',
        _focus: {
          boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
        },
      },
    },
  },
});

function App() {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <ColorModeProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/expenses" element={<ExpenseList />} />
                <Route path="/expenses/new" element={<ExpenseForm />} />
                <Route path="/expenses/upload" element={<ReceiptUpload />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Router>
        </ColorModeProvider>
      </ChakraProvider>
    </>
  );
}

export default App;
