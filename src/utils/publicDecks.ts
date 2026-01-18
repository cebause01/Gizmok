import { FlashcardDeck, Quiz, QuizQuestion } from './storage'

// Generate public decks and quizzes for 20 subjects
export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'History', 'Geography', 'Literature', 'Philosophy', 'Psychology',
  'Economics', 'Business', 'Art', 'Music', 'Languages',
  'Medicine', 'Engineering', 'Law', 'Education', 'Sociology'
]

const generateMathDecks = (): FlashcardDeck[] => {
  const decks: FlashcardDeck[] = []
  for (let i = 1; i <= 10; i++) {
    decks.push({
      id: `math-deck-${i}`,
      name: `Mathematics Quiz ${i}`,
      description: `Quiz covering algebra, calculus, geometry, and statistics concepts - Set ${i}`,
      cards: [
        { id: '1', front: 'What is the derivative of x²?', back: '2x', difficulty: 'medium' },
        { id: '2', front: 'What is the integral of 1/x?', back: 'ln|x| + C', difficulty: 'medium' },
        { id: '3', front: 'What is the Pythagorean theorem?', back: 'a² + b² = c²', difficulty: 'easy' },
        { id: '4', front: 'What is the value of π (pi)?', back: 'Approximately 3.14159', difficulty: 'easy' },
        { id: '5', front: 'What is a quadratic formula?', back: 'x = (-b ± √(b²-4ac)) / 2a', difficulty: 'hard' },
      ],
      userId: 'public',
      isPublic: true,
      subject: 'Mathematics',
      createdAt: Date.now() - (10 - i) * 86400000,
      updatedAt: Date.now() - (10 - i) * 86400000,
    })
  }
  return decks
}

const generatePhysicsDecks = (): FlashcardDeck[] => {
  const decks: FlashcardDeck[] = []
  for (let i = 1; i <= 10; i++) {
    decks.push({
      id: `physics-deck-${i}`,
      name: `Physics Quiz ${i}`,
      description: `Quiz covering mechanics, thermodynamics, electromagnetism - Set ${i}`,
      cards: [
        { id: '1', front: 'What is Newton\'s first law?', back: 'An object at rest stays at rest, an object in motion stays in motion', difficulty: 'easy' },
        { id: '2', front: 'What is the speed of light?', back: '299,792,458 m/s', difficulty: 'medium' },
        { id: '3', front: 'What is E=mc²?', back: 'Einstein\'s mass-energy equivalence formula', difficulty: 'medium' },
        { id: '4', front: 'What is the unit of force?', back: 'Newton (N)', difficulty: 'easy' },
        { id: '5', front: 'What is the law of conservation of energy?', back: 'Energy cannot be created or destroyed, only transformed', difficulty: 'hard' },
      ],
      userId: 'public',
      isPublic: true,
      subject: 'Physics',
      createdAt: Date.now() - (10 - i) * 86400000,
      updatedAt: Date.now() - (10 - i) * 86400000,
    })
  }
  return decks
}

const generateChemistryDecks = (): FlashcardDeck[] => {
  const decks: FlashcardDeck[] = []
  for (let i = 1; i <= 10; i++) {
    decks.push({
      id: `chemistry-deck-${i}`,
      name: `Chemistry Quiz ${i}`,
      description: `Quiz covering organic, inorganic, and physical chemistry - Set ${i}`,
      cards: [
        { id: '1', front: 'What is the atomic number of carbon?', back: '6', difficulty: 'easy' },
        { id: '2', front: 'What is H2O?', back: 'Water', difficulty: 'easy' },
        { id: '3', front: 'What is the pH of pure water?', back: '7 (neutral)', difficulty: 'medium' },
        { id: '4', front: 'What is Avogadro\'s number?', back: '6.022 × 10²³', difficulty: 'hard' },
        { id: '5', front: 'What is an acid?', back: 'A substance that donates protons (H+)', difficulty: 'medium' },
      ],
      userId: 'public',
      isPublic: true,
      subject: 'Chemistry',
      createdAt: Date.now() - (10 - i) * 86400000,
      updatedAt: Date.now() - (10 - i) * 86400000,
    })
  }
  return decks
}

const generateBiologyDecks = (): FlashcardDeck[] => {
  const decks: FlashcardDeck[] = []
  for (let i = 1; i <= 10; i++) {
    decks.push({
      id: `biology-deck-${i}`,
      name: `Biology Quiz ${i}`,
      description: `Quiz covering cell biology, genetics, and ecology - Set ${i}`,
      cards: [
        { id: '1', front: 'What is the powerhouse of the cell?', back: 'Mitochondria', difficulty: 'easy' },
        { id: '2', front: 'What is DNA?', back: 'Deoxyribonucleic acid - genetic material', difficulty: 'medium' },
        { id: '3', front: 'How many chromosomes do humans have?', back: '46 (23 pairs)', difficulty: 'medium' },
        { id: '4', front: 'What is photosynthesis?', back: 'Process by which plants convert light energy to chemical energy', difficulty: 'easy' },
        { id: '5', front: 'What is the smallest unit of life?', back: 'Cell', difficulty: 'easy' },
      ],
      userId: 'public',
      isPublic: true,
      subject: 'Biology',
      createdAt: Date.now() - (10 - i) * 86400000,
      updatedAt: Date.now() - (10 - i) * 86400000,
    })
  }
  return decks
}

const generateComputerScienceDecks = (): FlashcardDeck[] => {
  const decks: FlashcardDeck[] = []
  
  // Quiz 1: Programming Fundamentals
  decks.push({
    id: `cs-deck-1`,
    name: `Programming Fundamentals`,
    description: `Learn the basics of programming: variables, functions, and control structures`,
    cards: [
      { id: '1', front: 'What is a variable?', back: 'A storage location with a name that holds a value that can change during program execution', difficulty: 'easy' },
      { id: '2', front: 'What is a function?', back: 'A reusable block of code that performs a specific task and can return a value', difficulty: 'easy' },
      { id: '3', front: 'What is the difference between == and === in JavaScript?', back: '== compares values with type coercion, while === compares both value and type (strict equality)', difficulty: 'medium' },
      { id: '4', front: 'What is a loop?', back: 'A control structure that repeats a block of code until a condition is met', difficulty: 'easy' },
      { id: '5', front: 'What are the three types of loops?', back: 'For loop, while loop, and do-while loop', difficulty: 'medium' },
    ],
    userId: 'public',
    isPublic: true,
    subject: 'Computer Science',
    createdAt: Date.now() - 9 * 86400000,
    updatedAt: Date.now() - 9 * 86400000,
  })

  // Quiz 2: Data Structures
  decks.push({
    id: `cs-deck-2`,
    name: `Data Structures Essentials`,
    description: `Understanding arrays, linked lists, stacks, queues, and trees`,
    cards: [
      { id: '1', front: 'What is a stack?', back: 'A LIFO (Last In First Out) data structure where elements are added and removed from the same end', difficulty: 'medium' },
      { id: '2', front: 'What is a queue?', back: 'A FIFO (First In First Out) data structure where elements are added at one end and removed from the other', difficulty: 'medium' },
      { id: '3', front: 'What is a linked list?', back: 'A linear data structure where elements are stored in nodes, each containing data and a reference to the next node', difficulty: 'medium' },
      { id: '4', front: 'What is a binary tree?', back: 'A tree data structure where each node has at most two children, referred to as left and right', difficulty: 'hard' },
      { id: '5', front: 'What is the time complexity of accessing an element in an array?', back: 'O(1) - constant time, because arrays use index-based access', difficulty: 'medium' },
    ],
    userId: 'public',
    isPublic: true,
    subject: 'Computer Science',
    createdAt: Date.now() - 8 * 86400000,
    updatedAt: Date.now() - 8 * 86400000,
  })

  // Quiz 3: Algorithms & Complexity
  decks.push({
    id: `cs-deck-3`,
    name: `Algorithms & Time Complexity`,
    description: `Master algorithm analysis, Big O notation, and common algorithm patterns`,
    cards: [
      { id: '1', front: 'What is an algorithm?', back: 'A step-by-step procedure or set of rules for solving a problem in a finite number of steps', difficulty: 'easy' },
      { id: '2', front: 'What does Big O notation represent?', back: 'The worst-case time or space complexity of an algorithm, describing how runtime grows with input size', difficulty: 'medium' },
      { id: '3', front: 'What is the time complexity of binary search?', back: 'O(log n) - logarithmic time complexity', difficulty: 'hard' },
      { id: '4', front: 'What is the time complexity of bubble sort?', back: 'O(n²) - quadratic time complexity in the worst case', difficulty: 'medium' },
      { id: '5', front: 'What is the difference between time and space complexity?', back: 'Time complexity measures how runtime grows, while space complexity measures how memory usage grows with input size', difficulty: 'medium' },
    ],
    userId: 'public',
    isPublic: true,
    subject: 'Computer Science',
    createdAt: Date.now() - 7 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
  })

  // Quiz 4: Object-Oriented Programming
  decks.push({
    id: `cs-deck-4`,
    name: `Object-Oriented Programming (OOP)`,
    description: `Concepts of classes, objects, inheritance, polymorphism, and encapsulation`,
    cards: [
      { id: '1', front: 'What is OOP?', back: 'Object-Oriented Programming - a programming paradigm based on objects and classes', difficulty: 'easy' },
      { id: '2', front: 'What are the four pillars of OOP?', back: 'Encapsulation, Inheritance, Polymorphism, and Abstraction', difficulty: 'medium' },
      { id: '3', front: 'What is inheritance?', back: 'A mechanism where a new class inherits properties and methods from an existing class', difficulty: 'medium' },
      { id: '4', front: 'What is polymorphism?', back: 'The ability of objects of different types to be accessed through the same interface', difficulty: 'hard' },
      { id: '5', front: 'What is encapsulation?', back: 'The bundling of data and methods that operate on that data within a single unit (class)', difficulty: 'medium' },
    ],
    userId: 'public',
    isPublic: true,
    subject: 'Computer Science',
    createdAt: Date.now() - 6 * 86400000,
    updatedAt: Date.now() - 6 * 86400000,
  })

  // Quiz 5: Database Systems
  decks.push({
    id: `cs-deck-5`,
    name: `Database Systems & SQL`,
    description: `Understanding relational databases, SQL queries, and database design`,
    cards: [
      { id: '1', front: 'What is a primary key?', back: 'A unique identifier for each record in a database table', difficulty: 'easy' },
      { id: '2', front: 'What is SQL?', back: 'Structured Query Language - a language used to manage and manipulate relational databases', difficulty: 'easy' },
      { id: '3', front: 'What is a foreign key?', back: 'A field in one table that references the primary key in another table, establishing a relationship', difficulty: 'medium' },
      { id: '4', front: 'What is normalization?', back: 'The process of organizing data in a database to reduce redundancy and improve data integrity', difficulty: 'hard' },
      { id: '5', front: 'What is ACID in database transactions?', back: 'Atomicity, Consistency, Isolation, Durability - properties that guarantee reliable database transactions', difficulty: 'hard' },
    ],
    userId: 'public',
    isPublic: true,
    subject: 'Computer Science',
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  })

  // Quiz 6: Web Development
  decks.push({
    id: `cs-deck-6`,
    name: `Web Development Basics`,
    description: `HTML, CSS, JavaScript, and fundamental web technologies`,
    cards: [
      { id: '1', front: 'What does HTML stand for?', back: 'HyperText Markup Language - the standard markup language for web pages', difficulty: 'easy' },
      { id: '2', front: 'What does CSS stand for?', back: 'Cascading Style Sheets - used to style and layout web pages', difficulty: 'easy' },
      { id: '3', front: 'What is the Document Object Model (DOM)?', back: 'A programming interface for HTML documents that represents the structure as a tree of objects', difficulty: 'medium' },
      { id: '4', front: 'What is an API?', back: 'Application Programming Interface - a set of protocols and tools for building software applications', difficulty: 'medium' },
      { id: '5', front: 'What is the difference between GET and POST HTTP methods?', back: 'GET retrieves data from a server, while POST submits data to be processed', difficulty: 'medium' },
    ],
    userId: 'public',
    isPublic: true,
    subject: 'Computer Science',
    createdAt: Date.now() - 4 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
  })

  // Quiz 7: Recursion & Dynamic Programming
  decks.push({
    id: `cs-deck-7`,
    name: `Recursion & Dynamic Programming`,
    description: `Master recursive functions, memoization, and dynamic programming techniques`,
    cards: [
      { id: '1', front: 'What is recursion?', back: 'A programming technique where a function calls itself to solve smaller instances of the same problem', difficulty: 'medium' },
      { id: '2', front: 'What are the two essential parts of a recursive function?', back: 'Base case (stopping condition) and recursive case (function calls itself)', difficulty: 'medium' },
      { id: '3', front: 'What is dynamic programming?', back: 'A method for solving complex problems by breaking them into simpler subproblems and storing results to avoid redundant calculations', difficulty: 'hard' },
      { id: '4', front: 'What is memoization?', back: 'An optimization technique that stores the results of expensive function calls and returns cached results when same inputs occur', difficulty: 'hard' },
      { id: '5', front: 'What is the Fibonacci sequence?', back: 'A sequence where each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8...', difficulty: 'easy' },
    ],
    userId: 'public',
    isPublic: true,
    subject: 'Computer Science',
    createdAt: Date.now() - 3 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
  })

  // Quiz 8: Software Engineering
  decks.push({
    id: `cs-deck-8`,
    name: `Software Engineering Principles`,
    description: `Design patterns, testing, version control, and software development lifecycle`,
    cards: [
      { id: '1', front: 'What is version control?', back: 'A system that tracks changes to files over time, allowing multiple developers to collaborate', difficulty: 'easy' },
      { id: '2', front: 'What is Git?', back: 'A distributed version control system used for tracking changes in source code during software development', difficulty: 'medium' },
      { id: '3', front: 'What is unit testing?', back: 'Testing individual components or functions of a program in isolation to ensure they work correctly', difficulty: 'medium' },
      { id: '4', front: 'What is the Agile methodology?', back: 'An iterative approach to software development that emphasizes collaboration, flexibility, and customer feedback', difficulty: 'medium' },
      { id: '5', front: 'What is a design pattern?', back: 'A reusable solution to a commonly occurring problem in software design', difficulty: 'hard' },
    ],
    userId: 'public',
    isPublic: true,
    subject: 'Computer Science',
    createdAt: Date.now() - 2 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  })

  // Quiz 9: Computer Networks
  decks.push({
    id: `cs-deck-9`,
    name: `Computer Networks & Internet`,
    description: `Understanding networking protocols, TCP/IP, HTTP, and network architecture`,
    cards: [
      { id: '1', front: 'What is TCP/IP?', back: 'Transmission Control Protocol/Internet Protocol - the fundamental communication protocol of the internet', difficulty: 'medium' },
      { id: '2', front: 'What is the difference between TCP and UDP?', back: 'TCP is connection-oriented and reliable, while UDP is connectionless and faster but less reliable', difficulty: 'medium' },
      { id: '3', front: 'What is an IP address?', back: 'Internet Protocol address - a unique identifier assigned to each device on a network', difficulty: 'easy' },
      { id: '4', front: 'What is DNS?', back: 'Domain Name System - translates domain names to IP addresses', difficulty: 'medium' },
      { id: '5', front: 'What is HTTP vs HTTPS?', back: 'HTTP is unencrypted, while HTTPS uses SSL/TLS encryption for secure communication', difficulty: 'easy' },
    ],
    userId: 'public',
    isPublic: true,
    subject: 'Computer Science',
    createdAt: Date.now() - 1 * 86400000,
    updatedAt: Date.now() - 1 * 86400000,
  })

  // Quiz 10: Operating Systems
  decks.push({
    id: `cs-deck-10`,
    name: `Operating Systems Fundamentals`,
    description: `Processes, threads, memory management, and OS concepts`,
    cards: [
      { id: '1', front: 'What is an operating system?', back: 'System software that manages computer hardware, software resources, and provides services for computer programs', difficulty: 'easy' },
      { id: '2', front: 'What is the difference between a process and a thread?', back: 'A process is an independent program in execution, while a thread is a lightweight process within a program', difficulty: 'medium' },
      { id: '3', front: 'What is virtual memory?', back: 'A memory management technique that gives programs the illusion of having more physical memory than is actually available', difficulty: 'hard' },
      { id: '4', front: 'What is a deadlock?', back: 'A situation where two or more processes are waiting indefinitely for each other to release resources', difficulty: 'hard' },
      { id: '5', front: 'What is scheduling in an operating system?', back: 'The process by which the OS decides which process should run on the CPU at any given time', difficulty: 'medium' },
    ],
    userId: 'public',
    isPublic: true,
    subject: 'Computer Science',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  return decks
}

// Generate generic decks for remaining subjects
const generateGenericDecks = (subject: string, baseId: string): FlashcardDeck[] => {
  const decks: FlashcardDeck[] = []
  for (let i = 1; i <= 10; i++) {
    decks.push({
      id: `${baseId}-deck-${i}`,
      name: `${subject} Quiz ${i}`,
      description: `Comprehensive quiz covering key ${subject.toLowerCase()} concepts - Set ${i}`,
      cards: [
        { id: '1', front: `What is a key concept in ${subject}?`, back: `A fundamental principle in ${subject}`, difficulty: 'easy' },
        { id: '2', front: `Name a notable figure in ${subject}`, back: `An influential person in ${subject}`, difficulty: 'medium' },
        { id: '3', front: `What is the main focus of ${subject}?`, back: `The primary area of study in ${subject}`, difficulty: 'medium' },
        { id: '4', front: `What method is used in ${subject}?`, back: `Analytical methods specific to ${subject}`, difficulty: 'hard' },
        { id: '5', front: `What theory is important in ${subject}?`, back: `A foundational theory in ${subject}`, difficulty: 'medium' },
      ],
      userId: 'public',
      isPublic: true,
      subject,
      createdAt: Date.now() - (10 - i) * 86400000,
      updatedAt: Date.now() - (10 - i) * 86400000,
    })
  }
  return decks
}

export const generatePublicDecks = (): FlashcardDeck[] => {
  const allDecks: FlashcardDeck[] = []
  
  allDecks.push(...generateMathDecks())
  allDecks.push(...generatePhysicsDecks())
  allDecks.push(...generateChemistryDecks())
  allDecks.push(...generateBiologyDecks())
  allDecks.push(...generateComputerScienceDecks())
  
  const remainingSubjects = SUBJECTS.slice(5)
  remainingSubjects.forEach((subject) => {
    const baseId = subject.toLowerCase().replace(/\s+/g, '-')
    allDecks.push(...generateGenericDecks(subject, baseId))
  })
  
  return allDecks
}

// Generate quizzes for public decks
export const generatePublicQuizzes = (decks: FlashcardDeck[]): Quiz[] => {
  const quizzes: Quiz[] = []
  
  decks.forEach((deck) => {
    const questions: QuizQuestion[] = deck.cards.slice(0, 5).map((card, idx) => {
      const options = [
        card.back,
        `Alternative answer ${idx + 1}`,
        `Incorrect option ${idx + 1}`,
        `Wrong answer ${idx + 1}`
      ].sort(() => Math.random() - 0.5)
      
      const correctIndex = options.indexOf(card.back)
      
      return {
        id: `q-${deck.id}-${idx}`,
        question: card.front,
        options,
        correctAnswer: correctIndex,
        points: 10,
      }
    })
    
    quizzes.push({
      id: `quiz-${deck.id}`,
      deckId: deck.id,
      questions,
      userId: 'public',
      createdAt: deck.createdAt,
    })
  })
  
  return quizzes
}
