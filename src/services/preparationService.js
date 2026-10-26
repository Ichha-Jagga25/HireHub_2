/**
 * HireHub Preparation Service
 * 
 * Provides job-specific preparation resources, interview questions, skill learning paths,
 * and preparation checklists.
 * 
 * DESIGNED FOR FUTURE API / GEMINI INTEGRATION:
 * When connecting to a secure backend or Gemini AI service, replace or augment the
 * local data generators below with backend API calls.
 */

import { readStorage, writeStorage } from './storageService.js';

// Storage key prefix for user preparation data
const PREP_STORAGE_KEY_PREFIX = 'hirehub_preparation_';

/**
 * Storage Helpers
 */
export function getUserPreparationKey(userId) {
  return `${PREP_STORAGE_KEY_PREFIX}${userId || 'guest'}`;
}

export function loadUserPreparationState(userId) {
  const key = getUserPreparationKey(userId);
  const fallback = {
    selectedJobId: null,
    activeTab: 'overview',
    jobs: {},
    skillStatus: {}, // { [skillName]: { status: 'Not Started' | 'In Progress' | 'Completed', progress: number } }
  };
  return readStorage(key, fallback);
}

export function saveUserPreparationState(userId, state) {
  const key = getUserPreparationKey(userId);
  try {
    writeStorage(key, state);
  } catch (error) {
    console.error('Failed to save user preparation state:', error);
  }
}

/**
 * Skill Knowledge Base & Learning Paths
 * Curated learning roadmaps with concrete milestones, practical exercises, and trusted resources.
 */
const SKILL_LEARNING_PATHS = {
  React: {
    skill: 'React',
    category: 'Technical',
    overview: 'Modern component-based user interface development with hooks, state management, and component lifecycles.',
    estimatedHours: 24,
    milestones: [
      { id: 'react-m1', title: 'Component Architecture & Props', desc: 'Break UI into reusable functional components; pass and validate data with props.' },
      { id: 'react-m2', title: 'State & Event Handling (useState)', desc: 'Manage interactive UI state, controlled form inputs, and state lifting.' },
      { id: 'react-m3', title: 'Side Effects & Data Fetching (useEffect)', desc: 'Synchronize components with external APIs and cleanup timers/subscriptions.' },
      { id: 'react-m4', title: 'Context API & Custom Hooks', desc: 'Share global authentication/theme state and extract reusable custom hook logic.' },
    ],
    practiceProject: 'Build a task tracker or job application organizer with filtering, localStorage persistence, and responsive tabs.',
    recommendedTopics: ['Component lifecycles', 'State vs Props', 'Keys in lists', 'Virtual DOM & reconciliation', 'Custom hooks'],
  },
  JavaScript: {
    skill: 'JavaScript',
    category: 'Technical',
    overview: 'Core language fundamentals, asynchronous programming, DOM manipulation, and modern ES6+ features.',
    estimatedHours: 28,
    milestones: [
      { id: 'js-m1', title: 'ES6+ Fundamentals', desc: 'Master destructuring, arrow functions, template literals, and spread/rest operators.' },
      { id: 'js-m2', title: 'Scopes, Closures & Context (this)', desc: 'Understand execution context, lexical scoping, closures, and variable shadowing.' },
      { id: 'js-m3', title: 'Asynchronous JS (Promises, Async/Await)', desc: 'Handle asynchronous network calls, microtasks vs macrotasks, and error boundaries.' },
      { id: 'js-m4', title: 'Array Methods & Data Manipulation', desc: 'Proficiently use map, filter, reduce, find, some, and every for complex transformations.' },
    ],
    practiceProject: 'Build a dynamic searchable directory fetching public REST API data with debounced search and pagination.',
    recommendedTopics: ['Event loop & microtasks', 'Closures & lexical scope', 'Promises & async/await', 'Prototypes & inheritance', 'Array reduce techniques'],
  },
  Python: {
    skill: 'Python',
    category: 'Technical',
    overview: 'Versatile programming language for web services, data analysis, automation, and backend engineering.',
    estimatedHours: 25,
    milestones: [
      { id: 'py-m1', title: 'Python Syntax & Data Structures', desc: 'Lists, dictionaries, sets, tuples, list comprehensions, and control flow.' },
      { id: 'py-m2', title: 'Functions, Modules & File I/O', desc: 'Writing clean modular code, handling exceptions, and reading/writing JSON/CSV files.' },
      { id: 'py-m3', title: 'Object-Oriented Programming (OOP)', desc: 'Classes, inheritance, encapsulation, and magic methods like __repr__ and __init__.' },
      { id: 'py-m4', title: 'Libraries & Real-World Scripting', desc: 'Working with requests, pandas, or standard automation libraries.' },
    ],
    practiceProject: 'Build a command-line expense tracker that exports monthly summaries and visual analytics to a CSV/JSON report.',
    recommendedTopics: ['List comprehensions', 'Dictionary operations', 'Exception handling (try/except/finally)', 'Decorators', 'Virtual environments'],
  },
  SQL: {
    skill: 'SQL',
    category: 'Technical',
    overview: 'Relational database querying, aggregations, schema design, and analytical data retrieval.',
    estimatedHours: 18,
    milestones: [
      { id: 'sql-m1', title: 'Basic Queries & Filtering', desc: 'SELECT, WHERE, ORDER BY, DISTINCT, and boolean filtering operations.' },
      { id: 'sql-m2', title: 'Aggregations & Grouping', desc: 'COUNT, SUM, AVG, MIN, MAX combined with GROUP BY and HAVING filters.' },
      { id: 'sql-m3', title: 'Table Joins', desc: 'INNER JOIN, LEFT JOIN, RIGHT JOIN, and understanding foreign keys.' },
      { id: 'sql-m4', title: 'Subqueries & Window Functions', desc: 'Correlated subqueries, Common Table Expressions (WITH), and ROW_NUMBER / RANK.' },
    ],
    practiceProject: 'Write a set of analytical SQL queries analyzing e-commerce customer cohorts, monthly sales retention, and churn rates.',
    recommendedTopics: ['JOIN variations', 'GROUP BY vs HAVING', 'Window functions', 'Indexes & query plans', 'Subqueries vs CTEs'],
  },
  Excel: {
    skill: 'Excel',
    category: 'Non-Technical',
    overview: 'Spreadsheet modeling, lookup formulas, pivot tables, and executive data presentation.',
    estimatedHours: 14,
    milestones: [
      { id: 'xl-m1', title: 'Formulas & Lookups', desc: 'Master XLOOKUP, VLOOKUP, INDEX/MATCH, and conditional statements (IF, IFS).' },
      { id: 'xl-m2', title: 'Data Summarization (Pivot Tables)', desc: 'Build multi-dimensional pivot tables, calculated fields, and slicers.' },
      { id: 'xl-m3', title: 'Data Cleaning & Validation', desc: 'Text-to-columns, deduplication, conditional formatting, and input validation rules.' },
      { id: 'xl-m4', title: 'Executive Dashboards & Charts', desc: 'Create clean KPI summary cards, dynamic charts, and professional report formatting.' },
    ],
    practiceProject: 'Create an automated sales and KPI performance dashboard featuring dynamic monthly lookups and clean charts.',
    recommendedTopics: ['XLOOKUP & INDEX/MATCH', 'Pivot table calculation', 'Conditional formatting', 'Data validation dropdowns', 'Keyboard shortcuts'],
  },
  Git: {
    skill: 'Git',
    category: 'Technical',
    overview: 'Distributed version control, collaborative branch workflows, pull requests, and commit hygiene.',
    estimatedHours: 10,
    milestones: [
      { id: 'git-m1', title: 'Local Repository Basics', desc: 'Initializing repos, staging (git add), committing with conventional messages, and git status/log.' },
      { id: 'git-m2', title: 'Branching & Merging', desc: 'Creating feature branches, merging into main, and resolving merge conflicts.' },
      { id: 'git-m3', title: 'Remote Collaboration', desc: 'Pushing, pulling, setting up remotes on GitHub, and opening pull requests.' },
      { id: 'git-m4', title: 'Undoing Changes & Rebasing', desc: 'Using git stash, git reset, git checkout, and understanding interactive rebase.' },
    ],
    practiceProject: 'Publish a multi-branch repository to GitHub containing PR templates, commit history, and a detailed README.',
    recommendedTopics: ['Branch workflows (git-flow)', 'Merge conflict resolution', 'Stashing changes', 'Rebase vs Merge', 'Conventional commits'],
  },
  Communication: {
    skill: 'Communication',
    category: 'Non-Technical',
    overview: 'Clear, structured verbal and written communication for cross-functional teams and interview scenarios.',
    estimatedHours: 12,
    milestones: [
      { id: 'comm-m1', title: 'The STAR Method for Interviews', desc: 'Structuring answers using Situation, Task, Action, and Result framework.' },
      { id: 'comm-m2', title: 'Technical Explanations to Non-Tech Audiences', desc: 'Translating complex engineering concepts into business impact and user benefits.' },
      { id: 'comm-m3', title: 'Professional Written Communication', desc: 'Writing concise emails, clear bug reports, design specifications, and PR descriptions.' },
      { id: 'comm-m4', title: 'Active Listening & Conflict Resolution', desc: 'Handling feedback constructively, asking clarifying questions, and negotiating deadlines.' },
    ],
    practiceProject: 'Prepare a 5-story behavioral repository written using STAR framework covering your top projects, challenges, and successes.',
    recommendedTopics: ['STAR storytelling method', 'Executive summary writing', 'Active listening techniques', 'Constructive feedback delivery', 'Presentation structure'],
  },
  Research: {
    skill: 'Research',
    category: 'Non-Technical',
    overview: 'Structured inquiry, qualitative and quantitative data gathering, competitor analysis, and evidence synthesis.',
    estimatedHours: 15,
    milestones: [
      { id: 'res-m1', title: 'Problem Framing & Research Questions', desc: 'Defining clear hypotheses, target demographics, and objective success metrics.' },
      { id: 'res-m2', title: 'Secondary & Competitive Research', desc: 'Gathering industry benchmarks, market reports, and competitor feature breakdowns.' },
      { id: 'res-m3', title: 'Data Synthesis & Thematic Analysis', desc: 'Organizing findings into affinity diagrams, key insights, and actionable recommendations.' },
      { id: 'res-m4', title: 'Insight Communication', desc: 'Presenting findings to stakeholders with executive slide summaries and supporting citations.' },
    ],
    practiceProject: 'Conduct a competitive market research teardown of 3 competing Indian SaaS products and present a 1-page strategic brief.',
    recommendedTopics: ['Hypothesis formation', 'Competitor benchmarking', 'Thematic synthesis', 'Qualitative interviewing', 'Citation & source verification'],
  },
  Testing: {
    skill: 'Testing',
    category: 'Technical',
    overview: 'Software quality assurance, unit testing, test case design, and defect reporting.',
    estimatedHours: 16,
    milestones: [
      { id: 'test-m1', title: 'Test Case Design & Bug Reporting', desc: 'Writing clear test steps, expected vs actual results, and severity/priority categorization.' },
      { id: 'test-m2', title: 'Boundary Value & Equivalence Partitioning', desc: 'Identifying edge cases, invalid inputs, and boundary conditions.' },
      { id: 'test-m3', title: 'Automated Testing Fundamentals', desc: 'Understanding unit tests vs integration tests vs end-to-end (E2E) testing.' },
      { id: 'test-m4', title: 'API & Regression Testing', desc: 'Testing REST endpoints using tools like Postman, validating status codes and payloads.' },
    ],
    practiceProject: 'Write a comprehensive 15-case test suite document for an e-commerce checkout flow covering edge cases and validation rules.',
    recommendedTopics: ['Test case design', 'Boundary value analysis', 'Bug report lifecycle', 'API testing with Postman', 'Regression testing suites'],
  },
  'Node.js': {
    skill: 'Node.js',
    category: 'Technical',
    overview: 'Server-side JavaScript runtime for building scalable REST APIs, microservices, and backend tooling.',
    estimatedHours: 24,
    milestones: [
      { id: 'node-m1', title: 'Node Runtime & Modules', desc: 'Understanding CommonJS vs ES Modules, file system (fs), and path utilities.' },
      { id: 'node-m2', title: 'REST APIs with Express', desc: 'Building modular routes, request/response cycle, and custom middleware.' },
      { id: 'node-m3', title: 'Database Integration & CRUD', desc: 'Connecting Node backends to MongoDB or PostgreSQL; sanitizing user inputs.' },
      { id: 'node-m4', title: 'Authentication & Error Handling', desc: 'JWT token signing, password hashing (bcrypt), and centralized error middleware.' },
    ],
    practiceProject: 'Build a secure RESTful API with user registration, authentication middleware, and CRUD endpoints for managing bookmarks.',
    recommendedTopics: ['Event-driven non-blocking I/O', 'Express middleware chaining', 'JWT authentication flow', 'Environment variables (.env)', 'Status code conventions'],
  },
};

/**
 * Fallback generic learning path generator for any other skill in HireHub jobs.
 */
export function getSkillLearningPath(skillName) {
  if (!skillName) return null;
  const normalized = Object.keys(SKILL_LEARNING_PATHS).find(
    (key) => key.toLowerCase() === skillName.toLowerCase()
  );
  if (normalized) {
    return SKILL_LEARNING_PATHS[normalized];
  }
  return {
    skill: skillName,
    category: 'General',
    overview: `Key concepts, recommended practices, and practical project exercises for mastering ${skillName}.`,
    estimatedHours: 15,
    milestones: [
      { id: `${skillName}-m1`, title: `${skillName} Core Concepts`, desc: `Understand fundamental definitions, standards, and practical applications of ${skillName}.` },
      { id: `${skillName}-m2`, title: 'Hands-on Implementation', desc: `Apply ${skillName} in a targeted mini-project to build practical competence.` },
      { id: `${skillName}-m3`, title: 'Best Practices & Optimization', desc: `Learn industry workflows, error handling, and efficiency guidelines for ${skillName}.` },
      { id: `${skillName}-m4`, title: 'Portfolio & Interview Integration', desc: `Incorporate ${skillName} into a tangible portfolio piece and practice explaining your approach.` },
    ],
    practiceProject: `Build a small portfolio project demonstrating how you apply ${skillName} to solve a realistic problem.`,
    recommendedTopics: [`${skillName} fundamentals`, 'Common industry use cases', 'Debugging and troubleshooting', 'Project structure'],
  };
}

/**
 * Curated Question Bank for Job Interview Practice
 * Tailored dynamically by job category, role type, and required skills.
 */
const QUESTION_BANK = {
  technical: {
    React: [
      {
        id: 'q-react-1',
        category: 'Technical Questions',
        topic: 'React',
        difficulty: 'Medium',
        question: 'What is the Virtual DOM in React, and how does the reconciliation algorithm update the real DOM efficiently?',
        suggestedAnswer: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM in memory. When state changes, React creates a new Virtual DOM tree and compares it with the previous tree using the diffing algorithm (reconciliation). It calculates the minimal set of changes required and batches those updates to the real DOM, avoiding expensive layout reflows and repaints.',
        keyPoints: ['In-memory JS representation of real DOM', 'Diffing algorithm compares old vs new VDOM', 'Batched, minimal DOM mutations', 'Minimizes browser reflow and repaint'],
      },
      {
        id: 'q-react-2',
        category: 'Technical Questions',
        topic: 'React',
        difficulty: 'Medium',
        question: 'Explain the rules of React Hooks and why useEffect requires a dependency array.',
        suggestedAnswer: 'Hooks must only be called at the top level (never inside loops, conditions, or nested functions) and only from React function components or custom hooks. This ensures React can rely on consistent call order between renders. The useEffect dependency array tells React when to re-run the effect: an empty array [] runs once on mount, omitting it runs after every render, and specifying dependencies only re-runs the effect when one of those values changes.',
        keyPoints: ['Call hooks only at the top level', 'Call hooks only from React functions', 'Dependency array controls effect lifecycle', 'Omitting dependencies causes infinite loops with state updates'],
      },
    ],
    JavaScript: [
      {
        id: 'q-js-1',
        category: 'Technical Questions',
        topic: 'JavaScript',
        difficulty: 'Medium',
        question: 'What is a closure in JavaScript, and what is a practical real-world example of using one?',
        suggestedAnswer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. A function retains access to variables declared in its outer scope even after the outer function has finished executing. Real-world uses include data privacy (private variables/functions), function factories, and event handlers or debounce/throttle implementations that maintain internal state.',
        keyPoints: ['Function bundled with its lexical environment', 'Maintains access to outer scope variables after execution', 'Common in data privacy, currying, and debouncing'],
      },
      {
        id: 'q-js-2',
        category: 'Technical Questions',
        topic: 'JavaScript',
        difficulty: 'Hard',
        question: 'Explain the difference between microtasks and macrotasks in the JavaScript Event Loop.',
        suggestedAnswer: 'The call stack executes synchronous code first. When asynchronous operations complete, their callbacks enter task queues: microtasks (Promise callbacks, process.nextTick, queueMicrotask) have higher priority than macrotasks (setTimeout, setInterval, I/O, UI events). After each task completes on the call stack, the runtime empties the entire microtask queue before taking the next macrotask.',
        keyPoints: ['Synchronous call stack takes first priority', 'Microtasks (Promises) execute before next macrotask', 'Macrotasks include setTimeout, setInterval, I/O', 'Entire microtask queue is drained between tasks'],
      },
    ],
    SQL: [
      {
        id: 'q-sql-1',
        category: 'Technical Questions',
        topic: 'SQL',
        difficulty: 'Medium',
        question: 'What is the difference between WHERE and HAVING in SQL aggregations?',
        suggestedAnswer: 'WHERE filters individual rows before any grouping or aggregation takes place. HAVING filters groups of rows after GROUP BY has aggregated the data. For example, WHERE department = "Sales" filters candidates before grouping, whereas HAVING COUNT(*) > 5 filters aggregated departments having more than 5 members.',
        keyPoints: ['WHERE filters rows before grouping', 'HAVING filters grouped results after aggregation', 'HAVING can use aggregate functions (COUNT, SUM, AVG)', 'WHERE cannot directly filter aggregate results'],
      },
      {
        id: 'q-sql-2',
        category: 'Technical Questions',
        topic: 'SQL',
        difficulty: 'Medium',
        question: 'Explain the difference between an INNER JOIN and a LEFT OUTER JOIN.',
        suggestedAnswer: 'An INNER JOIN returns only records where there is a matching key in both tables. A LEFT OUTER JOIN returns all records from the left table, along with matching rows from the right table; if no match exists on the right side, the result contains NULL for those right-side columns.',
        keyPoints: ['INNER JOIN returns only matching pairs', 'LEFT JOIN preserves all rows from left table', 'Missing right table values show as NULL', 'Use LEFT JOIN when secondary data is optional'],
      },
    ],
    Python: [
      {
        id: 'q-py-1',
        category: 'Technical Questions',
        topic: 'Python',
        difficulty: 'Easy',
        question: 'What is the difference between a list and a tuple in Python, and when would you choose a tuple?',
        suggestedAnswer: 'Lists are mutable (their items, size, and ordering can be modified in-place using methods like append or pop) and defined with square brackets []. Tuples are immutable (cannot be altered after creation) and defined with parentheses (). You choose a tuple when data should be read-only (ensuring data integrity), for hashable dictionary keys, or for returning fixed multiple values from functions.',
        keyPoints: ['Lists are mutable; tuples are immutable', 'Tuples can be used as dictionary keys if items are hashable', 'Tuples have lower memory overhead and are slightly faster', 'Tuples communicate intention that data will not change'],
      },
    ],
  },
  coding: [
    {
      id: 'q-code-1',
      category: 'Coding Questions',
      topic: 'Algorithms & Arrays',
      difficulty: 'Easy',
      question: 'Two Sum Problem: Given an array of integers and a target sum, return the indices of the two numbers that add up to target.',
      problemStatement: 'Input: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1] because nums[0] + nums[1] == 9.\nConstraint: Exactly one solution exists. You cannot use the same element twice.',
      suggestedAnswer: `function twoSum(nums, target) {
  const map = new Map(); // stores value -> index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
// Time Complexity: O(n) using single pass hash map. Space Complexity: O(n).`,
      keyPoints: ['Use a hash map to look up complements in O(1)', 'Avoid O(n^2) nested loop', 'Store seen numbers as key and index as value'],
    },
    {
      id: 'q-code-2',
      category: 'Coding Questions',
      topic: 'String Manipulation',
      difficulty: 'Easy',
      question: 'Valid Palindrome: Write a function that checks if a string is a palindrome, considering only alphanumeric characters and ignoring cases.',
      problemStatement: 'Input: s = "A man, a plan, a canal: Panama"\nOutput: true\nInput: s = "race a car"\nOutput: false',
      suggestedAnswer: `function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = cleaned.length - 1;
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) return false;
    left++;
    right--;
  }
  return true;
}
// Time Complexity: O(n). Space Complexity: O(1) if using pointers directly on original string.`,
      keyPoints: ['Clean non-alphanumeric characters or skip them via pointers', 'Two-pointer technique moving inward', 'Case insensitivity check'],
    },
  ],
  hr: [
    {
      id: 'q-hr-1',
      category: 'HR Questions',
      topic: 'Behavioral & Alignment',
      difficulty: 'General',
      question: 'Tell me about a challenging project or technical problem you worked on, and how you overcame obstacles.',
      suggestedAnswer: 'Structure your answer using the STAR method (Situation, Task, Action, Result). State the context clearly, your specific responsibility, the concrete technical actions and collaboration you took, and conclude with the measurable outcome, lessons learned, or user impact.',
      keyPoints: ['Use the STAR framework (Situation, Task, Action, Result)', 'Focus on your personal contribution ("I" instead of only "we")', 'Mention specific technical decisions and problem-solving steps', 'End with a clear, positive outcome or learning experience'],
    },
    {
      id: 'q-hr-2',
      category: 'HR Questions',
      topic: 'Culture & Fit',
      difficulty: 'General',
      question: 'Why are you interested in joining this company, and how does this role fit your career goals?',
      suggestedAnswer: 'Demonstrate that you researched the company products, mission, or engineering challenges. Connect your current skills and learning goals with the role expectations. Emphasize your eagerness to contribute, learn from senior mentors, and make a tangible impact on their users.',
      keyPoints: ['Mention specific company products or initiatives', 'Connect your skills directly to the role responsibilities', 'Express enthusiasm for learning and team collaboration', 'Articulate clear 1-2 year growth ambitions'],
    },
    {
      id: 'q-hr-3',
      category: 'HR Questions',
      topic: 'Teamwork',
      difficulty: 'General',
      question: 'How do you handle receiving critical feedback on your code or deliverables?',
      suggestedAnswer: 'Explain that you view feedback as an essential learning opportunity rather than personal criticism. Describe asking clarifying questions to understand the reviewer perspective, actively testing alternative solutions, and thanking the reviewer for improving code quality and team standards.',
      keyPoints: ['Separate ego from the deliverable', 'Ask clarifying questions to understand rationale', 'Demonstrate positive attitude towards growth and code quality', 'Share a brief example of applying feedback effectively'],
    },
  ],
};

/**
 * Retrieve tailored interview questions for a selected job based on its skills and category.
 */
export function getJobInterviewQuestions(job) {
  if (!job) return [];
  const questions = [];

  // 1. Gather technical questions matching the job's skills
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
  const techCategories = QUESTION_BANK.technical;

  Object.keys(techCategories).forEach((skillKey) => {
    if (jobSkills.some((s) => s.includes(skillKey.toLowerCase()) || skillKey.toLowerCase().includes(s))) {
      questions.push(...techCategories[skillKey]);
    }
  });

  // If no specific technical questions matched or job is non-technical, provide general technical or analytical questions
  if (questions.length === 0) {
    if (job.category === 'Technical') {
      questions.push(...(techCategories.JavaScript || []));
    } else {
      questions.push({
        id: 'q-role-general-1',
        category: 'Role Competency Questions',
        topic: job.category || 'General',
        difficulty: 'Medium',
        question: `How would you approach organizing requirements and deliverables for a role like ${job.title} at ${job.company}?`,
        suggestedAnswer: 'Begin by clarifying core stakeholder objectives and defining verifiable success metrics. Map out milestones, identify dependencies and potential blockers early, and maintain transparent, regular status updates with the team.',
        keyPoints: ['Define success metrics and deliverables early', 'Identify dependencies and risks', 'Maintain consistent stakeholder communication'],
      });
    }
  }

  // 2. Add coding questions for technical development roles
  if (job.category === 'Technical' && /developer|engineer|software|frontend|backend|full stack/i.test(job.title)) {
    questions.push(...QUESTION_BANK.coding);
  }

  // 3. Add standard HR / Behavioral questions
  questions.push(...QUESTION_BANK.hr);

  return questions;
}

/**
 * Generate standard preparation checklist tailored to the job
 */
export function getJobPreparationChecklist(job, profile) {
  if (!job) return [];
  const profileSkills = (profile?.skills || []).map((s) => s.toLowerCase());
  const missingSkills = (job.skills || []).filter((s) => !profileSkills.includes(s.toLowerCase()));

  const checklist = [
    {
      id: 'check-review-desc',
      title: 'Analyze Job Description & Responsibilities',
      category: 'Research',
      desc: `Carefully review ${job.company}'s expectations for the ${job.title} role.`,
    },
    {
      id: 'check-company-research',
      title: `Research ${job.company}'s Products & Culture`,
      category: 'Research',
      desc: 'Understand their target audience, recent announcements, and core products.',
    },
  ];

  if (missingSkills.length > 0) {
    checklist.push({
      id: 'check-bridge-skills',
      title: `Practice Identified Skill Gaps (${missingSkills.slice(0, 2).join(', ')})`,
      category: 'Skill Building',
      desc: 'Complete small practice exercises to gain conversational and practical confidence.',
    });
  }

  checklist.push(
    {
      id: 'check-practice-star',
      title: 'Draft 3 STAR Behavioral Stories',
      category: 'Interview Prep',
      desc: 'Prepare stories demonstrating teamwork, handling ambiguity, and overcoming challenges.',
    },
    {
      id: 'check-tailor-resume',
      title: 'Align Resume & Portfolio Highlights',
      category: 'Application Prep',
      desc: `Ensure your listed projects showcase relevant skills matching ${job.title}.`,
    },
    {
      id: 'check-questions-interviewer',
      title: 'Prepare 3 Thoughtful Questions for Interviewers',
      category: 'Interview Prep',
      desc: 'Ask about team engineering workflows, day-to-day challenges, and mentorship opportunities.',
    }
  );

  return checklist;
}
