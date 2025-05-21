import type { SankeyNode, SankeyLink } from 'd3-sankey';

// Define the interfaces for our data structure
export interface CashflowItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  color?: string;
}

export interface SankeyLegendItem {
  name: string;
  color: string;
}

export interface SankeyData {
  nodes: Array<{
    name: string;
    color: string;
    percentage?: number;
  }>;
  links: Array<{
    source: number;
    target: number;
    value: number;
    percentage?: number;
    dollarAmount: number;
  }>;
  legend: SankeyLegendItem[];
  inflowEqualsOutflow: boolean;
  inflow: number;
  outflow: number;
  warning?: string;
}

// Custom colors for different node types
const COLORS = {
  income: '#7CC7E8',                // Light blue for income
  budget: '#5CB8B2',                // Teal for budget
  housing: '#D8BFD8',               // Light purple
  food: '#ADD8E6',                  // Light blue
  transportation: '#FFA07A',        // Light salmon
  taxes: '#F9C6BB',                 // Peach
  shopping: '#F8D568',              // Yellow
  entertainment: '#B39CD0',         // Purple
  healthcare: '#FB9A99',            // Pink
  utilities: '#CAB2D6',             // Light purple blue
  education: '#B2DF8A',             // Light green
  travel: '#A6CEE3',                // Sky blue
  gifts: '#FDBF6F',                 // Orange
  otherExpenses: '#FFFFE0',         // Light yellow
  savings: '#A8E1D0',               // Light mint
};

// Enhanced category mapping for smart grouping with more comprehensive keywords
const CATEGORY_MAPPING: { [key: string]: string[] } = {
  // Income categories (case insensitive matching on any part of the category)
  income: [
    'Income', 'Salary', 'Wages', 'Bonus', 'Interest', 'Dividend', 'Gift Received',
    'Refund', 'Cashback', 'Deposit', 'Payment Received', 'Tax Return', 'Royalty',
    'Reimbursement', 'Commission', 'Pension', 'Social Security', 'Paycheck', 'Revenue'
  ],
  
  // Expense categories
  housing: [
    'Rent', 'Mortgage', 'Housing', 'Utilities', 'Electric', 'Electricity', 'Water', 'Gas',
    'Internet', 'Cable', 'Home', 'Property Tax', 'HOA', 'Maintenance', 'Repairs',
    'Real Estate', 'Furniture', 'Appliance', 'Home Improvement', 'Home Insurance'
  ],
  food: [
    'Food', 'Groceries', 'Dining', 'Restaurant', 'Restaurants', 'Coffee', 'Takeout',
    'Fast Food', 'Cafe', 'Meal', 'Snack', 'Delivery', 'Doordash', 'Uber Eats',
    'Breakfast', 'Lunch', 'Dinner', 'Bar', 'Drinks', 'Beverage'
  ],
  transportation: [
    'Transport', 'Transportation', 'Car', 'Gas', 'Gasoline', 'Fuel', 'Auto', 'Vehicle',
    'Public Transit', 'Uber', 'Lyft', 'Taxi', 'Parking', 'Toll', 'Train', 'Bus',
    'Subway', 'Metro', 'Car Insurance', 'License', 'Registration', 'Maintenance'
  ],
  shopping: [
    'Shopping', 'Clothing', 'Shoes', 'Accessories', 'Electronics', 'Amazon', 'Online Shopping',
    'Retail', 'Department Store', 'Merchandise', 'Purchase', 'Consumer Goods', 'Target',
    'Walmart', 'Costco', 'Best Buy', 'Apple', 'Books', 'Music', 'Hobby', 'Craft'
  ],
  entertainment: [
    'Entertainment', 'Movie', 'Theater', 'Concert', 'Streaming', 'Netflix', 'Hulu',
    'Spotify', 'Disney+', 'HBO', 'Apple TV', 'Amazon Prime', 'Subscription', 'Game',
    'Gaming', 'Hobby', 'Sports', 'Recreation', 'Amusement', 'Event', 'Ticket'
  ],
  healthcare: [
    'Health', 'Healthcare', 'Medical', 'Doctor', 'Dental', 'Vision', 'Pharmacy',
    'Prescription', 'Medicine', 'Insurance', 'Fitness', 'Gym', 'Wellness', 'Therapy',
    'Mental Health', 'Hospital', 'Emergency', 'Ambulance', 'Specialist'
  ],
  travel: [
    'Travel', 'Flight', 'Airline', 'Hotel', 'Lodging', 'Accommodation', 'Vacation',
    'Trip', 'Airbnb', 'Booking', 'Tourism', 'Resort', 'Cruise', 'Car Rental',
    'Sightseeing', 'Excursion', 'Passport', 'Visa', 'Luggage'
  ],
  utilities: [
    'Utility', 'Utilities', 'Phone', 'Mobile', 'Cell Phone', 'Telephone', 'Internet',
    'Cable', 'Streaming', 'Electricity', 'Gas', 'Water', 'Sewer', 'Trash', 'Garbage',
    'Wi-Fi', 'Broadband', 'Service Provider'
  ],
  education: [
    'Education', 'School', 'College', 'University', 'Tuition', 'Books', 'Class',
    'Course', 'Degree', 'Student Loan', 'Training', 'Learning', 'Scholarship',
    'Research', 'Fee', 'Textbook', 'Supplies', 'Tutorial', 'Workshop'
  ],
  taxes: [
    'Tax', 'Taxes', 'Income Tax', 'Property Tax', 'Sales Tax', 'State Tax', 'Federal Tax',
    'Tax Payment', 'Tax Preparation', 'Filing', 'IRS', 'Audit', 'Withholding',
    'Tax Return', 'Tax Refund', 'Self-Employment Tax'
  ],
  gifts: [
    'Gift', 'Gifts', 'Donation', 'Donations', 'Charity', 'Charitable', 'Present',
    'Birthday', 'Wedding', 'Holiday', 'Christmas', 'Thanksgiving', 'Easter',
    'Anniversary', 'Baby Shower', 'Graduation', 'Contribution', 'Fundraiser'
  ],
  savings: [
    'Savings', 'Investment', 'Retirement', '401k', 'IRA', 'Roth', 'Brokerage',
    'Stock', 'Bond', 'Mutual Fund', 'ETF', 'Crypto', 'Bitcoin', 'Ethereum',
    'Certificate of Deposit', 'Emergency Fund', 'Financial Goal', 'Portfolio'
  ],
};

// Standard high-level category names for normalization
const HIGH_LEVEL_CATEGORIES = [
  'Income', 'Housing', 'Food', 'Transportation', 'Shopping', 
  'Entertainment', 'Healthcare', 'Travel', 'Utilities', 
  'Education', 'Taxes', 'Gifts', 'Savings', 'Other'
];

// Helper function to determine category group with fuzzy matching
export function getCategoryGroup(category: string, isIncome: boolean): string {
  // Handle empty categories
  if (!category) return isIncome ? 'Other Income' : 'Other Expenses';
  
  const lowerCategory = category.toLowerCase();
  
  // First check if it exactly matches any of our high-level categories
  for (const highLevelCat of HIGH_LEVEL_CATEGORIES) {
    if (category === highLevelCat || 
        lowerCategory === highLevelCat.toLowerCase()) {
      return highLevelCat;
    }
  }
  
  // Handle income categories
  if (isIncome) {
    if (lowerCategory.includes('income')) return 'Income';
    
    // Check if the transaction category matches any income keywords
    for (const keyword of CATEGORY_MAPPING.income) {
      if (lowerCategory.includes(keyword.toLowerCase())) {
        return 'Income';
      }
    }
    
    // If not recognized but is income, use original category or default
    return category || 'Other Income';
  }
  
  // For expenses - check for common category names & aliases
  // These exact matches preserve the original category name with proper capitalization
  if (/^(food|food & dining|dining|groceries|restaurants|eating out)$/i.test(lowerCategory)) return 'Food';
  if (/^(home|housing|rent|mortgage)$/i.test(lowerCategory)) return 'Housing';
  if (/^(transport|transportation|car|auto|gas|fuel)$/i.test(lowerCategory)) return 'Transportation';
  if (/^(shop|shopping|clothes|clothing|merchandise)$/i.test(lowerCategory)) return 'Shopping';
  if (/^(fun|entertainment|recreation)$/i.test(lowerCategory)) return 'Entertainment';
  if (/^(health|healthcare|medical|doctor)$/i.test(lowerCategory)) return 'Healthcare';
  if (/^(trip|travel|vacation|flights|hotels)$/i.test(lowerCategory)) return 'Travel';
  if (/^(utilities|bills|services)$/i.test(lowerCategory)) return 'Utilities';
  if (/^(school|education|learning|tuition)$/i.test(lowerCategory)) return 'Education';
  if (/^(tax|taxes|taxation)$/i.test(lowerCategory)) return 'Taxes';
  if (/^(gift|gifts|donation|donate|charity)$/i.test(lowerCategory)) return 'Gifts';
  if (/^(save|savings|invest|investment)$/i.test(lowerCategory)) return 'Savings';
  
  // Next, try to match with our detailed keywords in category mapping
  for (const [group, keywords] of Object.entries(CATEGORY_MAPPING)) {
    if (group === 'income') continue; // Skip income mapping for expenses
    
    for (const keyword of keywords) {
      if (lowerCategory.includes(keyword.toLowerCase())) {
        // Format the group name with first letter capitalized
        return group.charAt(0).toUpperCase() + group.slice(1);
      }
    }
  }
  
  // If we got this far, check if the category description has any partial matches
  // with common words to improve categorization
  if (lowerCategory.includes('food') || lowerCategory.includes('grocery') || 
      lowerCategory.includes('restaurant') || lowerCategory.includes('eat')) {
    return 'Food';
  }
  
  if (lowerCategory.includes('car') || lowerCategory.includes('gas') || 
      lowerCategory.includes('uber') || lowerCategory.includes('transport')) {
    return 'Transportation';
  }
  
  if (lowerCategory.includes('amazon') || lowerCategory.includes('walmart') || 
      lowerCategory.includes('target') || lowerCategory.includes('shop')) {
    return 'Shopping';
  }
  
  if (lowerCategory.includes('netflix') || lowerCategory.includes('movie') || 
      lowerCategory.includes('entertainment')) {
    return 'Entertainment';
  }
  
  // If no matches in our mapping, use the original category
  // This preserves custom categories from the CSV
  return category;
}

// Function to get color for a category
export const getCategoryColor = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  // Direct category name matching
  if (lowerName.includes('income')) return COLORS.income;
  if (lowerName.includes('housing')) return COLORS.housing;
  if (lowerName.includes('food')) return COLORS.food;
  if (lowerName.includes('transport')) return COLORS.transportation;
  if (lowerName.includes('tax')) return COLORS.taxes;
  if (lowerName.includes('shop')) return COLORS.shopping;
  if (lowerName.includes('entertain')) return COLORS.entertainment;
  if (lowerName.includes('health')) return COLORS.healthcare;
  if (lowerName.includes('util')) return COLORS.utilities;
  if (lowerName.includes('edu')) return COLORS.education;
  if (lowerName.includes('travel')) return COLORS.travel;
  if (lowerName.includes('gift') || lowerName.includes('donat')) return COLORS.gifts;
  if (lowerName.includes('savings') || lowerName.includes('invest')) return COLORS.savings;
  
  return COLORS.otherExpenses;
};

// Process data for Sankey diagram
export const processSankeyData = (
  incomes: CashflowItem[],
  expenses: CashflowItem[],
  options?: { maxIncomeCats?: number; maxExpenseCats?: number; includeCategories?: string[] }
): SankeyData => {
  try {
    if (!incomes.length && !expenses.length) {
      return { nodes: [], links: [], legend: [], inflowEqualsOutflow: true, inflow: 0, outflow: 0 };
    }

    // Group incomes by category
    const incomeByCategory = new Map<string, number>();
    let totalIncome = 0;
    incomes.forEach(income => {
      const category = getCategoryGroup(income.category || 'Other', true);
      const current = incomeByCategory.get(category) || 0;
      incomeByCategory.set(category, current + income.amount);
      totalIncome += income.amount;
    });

    // Group expenses by category
    const expenseByCategory = new Map<string, number>();
    let totalExpense = 0;
    expenses.forEach(expense => {
      const category = getCategoryGroup(expense.category || 'Other', false);
      const current = expenseByCategory.get(category) || 0;
      expenseByCategory.set(category, current + Math.abs(expense.amount));
      totalExpense += Math.abs(expense.amount);
    });

    // Sort and limit categories
    const maxIncomeCats = options?.maxIncomeCats ?? 5;
    const maxExpenseCats = options?.maxExpenseCats ?? 5;
    const sortedIncome = Array.from(incomeByCategory.entries()).sort((a, b) => b[1] - a[1]);
    const sortedExpense = Array.from(expenseByCategory.entries()).sort((a, b) => b[1] - a[1]);
    const topIncome = sortedIncome.slice(0, maxIncomeCats);
    const otherIncomeSum = sortedIncome.slice(maxIncomeCats).reduce((sum, [, v]) => sum + v, 0);
    const topExpense = sortedExpense.slice(0, maxExpenseCats);
    const otherExpenseSum = sortedExpense.slice(maxExpenseCats).reduce((sum, [, v]) => sum + v, 0);

    // Optionally filter categories
    const includeCategories = options?.includeCategories;

    // Create nodes
    const nodes: SankeyData['nodes'] = [];
    const legend: SankeyLegendItem[] = [];
    const incomeNodes: string[] = [];
    const expenseNodes: string[] = [];

    // Add income nodes
    topIncome.forEach(([category, amount]) => {
      if (amount > 0 && (!includeCategories || includeCategories.includes(category))) {
        const percentage = (amount / totalIncome) * 100;
        const color = getCategoryColor(category);
        nodes.push({ name: category, color, percentage });
        legend.push({ name: category, color });
        incomeNodes.push(category);
      }
    });
    if (otherIncomeSum > 0) {
      nodes.push({ name: 'Other Income', color: COLORS.income, percentage: (otherIncomeSum / totalIncome) * 100 });
      legend.push({ name: 'Other Income', color: COLORS.income });
      incomeNodes.push('Other Income');
      incomeByCategory.set('Other Income', otherIncomeSum);
    }

    // Add budget node
    const budgetIndex = nodes.length;
    nodes.push({ name: 'Budget', color: COLORS.budget });
    legend.push({ name: 'Budget', color: COLORS.budget });

    // Add expense nodes
    topExpense.forEach(([category, amount]) => {
      if (amount > 0 && (!includeCategories || includeCategories.includes(category))) {
        const percentage = (amount / totalExpense) * 100;
        const color = getCategoryColor(category);
        nodes.push({ name: category, color, percentage });
        legend.push({ name: category, color });
        expenseNodes.push(category);
      }
    });
    if (otherExpenseSum > 0) {
      nodes.push({ name: 'Other Expenses', color: COLORS.otherExpenses, percentage: (otherExpenseSum / totalExpense) * 100 });
      legend.push({ name: 'Other Expenses', color: COLORS.otherExpenses });
      expenseNodes.push('Other Expenses');
      expenseByCategory.set('Other Expenses', otherExpenseSum);
    }

    // Create links
    const links: SankeyData['links'] = [];
    // Links from income to budget
    incomeNodes.forEach((category, i) => {
      const amount = incomeByCategory.get(category) || 0;
      if (amount > 0) {
        const percent = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
        links.push({
          source: i,
          target: budgetIndex,
          value: amount,
          percentage: percent,
          dollarAmount: amount
        });
      }
    });
    // Links from budget to expense categories
    expenseNodes.forEach((category, i) => {
      const amount = expenseByCategory.get(category) || 0;
      if (amount > 0) {
        const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        links.push({
          source: budgetIndex,
          target: budgetIndex + 1 + i, // offset by budget node
          value: amount,
          percentage: percent,
          dollarAmount: amount
        });
      }
    });

    // Inflow/outflow check
    const inflowEqualsOutflow = Math.abs(totalIncome - totalExpense) < 0.01;
    const warning = !inflowEqualsOutflow ? `Total inflow ($${totalIncome.toLocaleString()}) does not match total outflow ($${totalExpense.toLocaleString()})` : undefined;

    return { nodes, links, legend, inflowEqualsOutflow, inflow: totalIncome, outflow: totalExpense, warning };
  } catch (error) {
    console.error('Error processing Sankey data:', error);
    return { nodes: [], links: [], legend: [], inflowEqualsOutflow: true, inflow: 0, outflow: 0 };
  }
};