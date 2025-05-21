import { test, expect } from '@playwright/test';

test.describe('Sankey Chart', () => {
  test('should render budget on left, expenses on right, and show percentage and dollar amount on each flow', async ({ page }) => {
    // Get current date for filtering
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`;

    // Go to the dashboard
    await page.goto('http://localhost:3000/dashboard');

    // Wait for a dashboard element to ensure TransactionProvider is mounted
    await page.waitForSelector('h1', { timeout: 10000 }); // Wait for the dashboard title

    // Inject transactions using the test utility
    await page.evaluate((today) => {
      // @ts-ignore
      window.setTestTransactions([
        { id: '1', amount: 3000, category: 'Salary', date: today, description: 'June Salary', account: 'Checking' },
        { id: '2', amount: -1200, category: 'Housing', date: today, description: 'Rent', account: 'Checking' },
        { id: '3', amount: -400, category: 'Food', date: today, description: 'Groceries', account: 'Credit Card' },
        { id: '4', amount: -200, category: 'Transportation', date: today, description: 'Gas', account: 'Credit Card' },
        { id: '5', amount: -100, category: 'Entertainment', date: today, description: 'Movies', account: 'Credit Card' },
        { id: '6', amount: -300, category: 'Savings', date: today, description: 'Transfer to Savings', account: 'Checking' }
      ]);
    }, today);

    // Wait for Sankey chart SVG to appear, or log DOM if not found
    let sankeySvg;
    try {
      sankeySvg = await page.waitForSelector('svg.sankey', { timeout: 20000 });
    } catch (e) {
      // Log the DOM for debugging
      const body = await page.content();
      console.log('DOM snapshot:', body);
      throw e;
    }
    expect(sankeySvg).toBeTruthy();

    // Check for the Budget node label on the left
    const budgetLabel = await page.locator('text').filter({ hasText: 'Budget' }).first();
    expect(await budgetLabel.isVisible()).toBeTruthy();
    const budgetX = await budgetLabel.evaluate(el => el.getAttribute('x'));

    // Find at least one expense node label on the right
    const expenseLabels = await page.locator('text').filter({ hasText: /%/ }).all();
    expect(expenseLabels.length).toBeGreaterThan(1);
    const expenseX = await expenseLabels[expenseLabels.length - 1].evaluate(el => el.getAttribute('x'));

    // Budget node should be left of expenses
    expect(Number(budgetX)).toBeLessThan(Number(expenseX));

    // Check for at least one link label with $ and %
    const linkLabels = await page.locator('text').filter({ hasText: '$' }).all();
    const linkTexts = await Promise.all(linkLabels.map(async l => l.textContent()));
    const match = linkTexts.some(text => /\$[\d,]+ \([<\d]+%\)/.test(text || ''));
    if (!match) {
      console.log('All link label texts:', linkTexts);
    }
    expect(match).toBeTruthy();

    // Take a screenshot for visual confirmation
    await page.screenshot({ path: 'sankey-chart-visual.png', fullPage: false });
  });
}); 