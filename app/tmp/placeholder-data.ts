const users = [
    {
        user_id: 'ghost',
        unhashed_password: 'who12345',
    },
    {
        user_id: '0o0o0',
        unhashed_password: '1ceUponATime',
    },
    {
        user_id: '101010',
        unhashed_password: '1AndZero',
    },
    {
        user_id: 'hellohellohellohellohellohe',
        unhashed_password: 'helloWorld5',
    },
    {
        user_id: 'ima',
        unhashed_password: 'who12345',
    },
];

const pages = [
    {
        user_id: '0o0o0',
        title: 'My First Post',
        content: 'This is my very first post! I am excited to start sharing my ideas and thoughts here.',
        preview: ''
    },
    {
        user_id: '0o0o0',
        title: 'Learning to Code',
        content: 'Today I started learning JavaScript. The journey begins with basic syntax and variables.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Photography Tips',
        content: 'Here are some basic tips for better photography: good lighting, rule of thirds, and proper focus.',
        preview: 'Master the basics of photography with these essential tips for capturing stunning images.'
    },
    {
        user_id: 'ima',
        title: 'Travel Diary: Seoul',
        content: 'Visited Seoul for the first time. The street food was amazing and the people were so friendly!',
        preview: 'Follow my adventures in Seoul as I explore the city\'s vibrant culture, cuisine, and hidden gems.'
    },
    {
        user_id: 'hellohellohellohellohellohe',
        title: 'Book Review: 1984',
        content: 'Just finished reading 1984 by George Orwell. Here are my thoughts on this dystopian masterpiece.',
        preview: 'Dive deep into Orwell\'s dystopian masterpiece with this comprehensive review and analysis.'
    },
    {
        user_id: '0o0o0',
        title: 'Weekend Project',
        content: 'Built my first web application this weekend. It was challenging but rewarding!',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Cooking Adventures',
        content: 'Tried making kimchi for the first time. The process was easier than I expected.',
        preview: 'Join me in the kitchen as I attempt to make traditional kimchi for the first time.'
    },
    {
        user_id: '0o0o0',
        title: 'Learning React',
        content: 'Started diving into React today. Components and props are really interesting concepts.',
        preview: ''
    },
    {
        user_id: 'ima',
        title: 'My Favorite Movies',
        content: 'Here\'s a list of my top 5 favorite movies of all time and why I love them.',
        preview: 'Explore my personal top 5 movie picks and the stories behind why they mean so much to me.'
    },
    {
        user_id: '0o0o0',
        title: 'Tech Review',
        content: 'Got my hands on the latest smartphone. Here are my initial impressions after one week of use.',
        preview: ''
    },
    {
        user_id: 'hellohellohellohellohellohe',
        title: 'Gardening Tips',
        content: 'Spring is here! Time to share my best tips for starting your own vegetable garden.',
        preview: 'Get ready for spring gardening with these essential tips for growing your own vegetables.'
    },
    {
        user_id: '101010',
        title: 'Music Production',
        content: 'Finally set up my home studio. Here\'s what I learned about basic audio equipment.',
        preview: 'Learn the basics of setting up your own home music studio on a budget.'
    },
    {
        user_id: '0o0o0',
        title: 'Fitness Journey',
        content: 'Month one of my fitness journey complete. Here are the changes I\'ve noticed so far.',
        preview: ''
    },
    {
        user_id: 'ima',
        title: 'Coffee Guide',
        content: 'A beginner\'s guide to different coffee brewing methods and bean types.',
        preview: 'Explore the art of coffee brewing and learn how to make the perfect cup with these expert tips.'
    },
    {
        user_id: '0o0o0',
        title: 'Gaming Review',
        content: 'Just finished this amazing new game. No spoilers, but here\'s what I thought about it.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Home Office Setup',
        content: 'How I organized my home office for maximum productivity and comfort.',
        preview: 'Transform your workspace into a productivity haven with these practical organization tips.'
    },
    {
        user_id: 'hellohellohellohellohellohe',
        title: 'Plant Care',
        content: 'Tips for keeping your indoor plants alive and thriving during winter months.',
        preview: 'Keep your indoor plants healthy and thriving through winter with these essential care tips.'
    },
    {
        user_id: '0o0o0',
        title: 'Learning Path',
        content: 'My roadmap for becoming a full-stack developer in 2025.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'DIY Projects',
        content: 'Three simple DIY projects you can complete in a weekend.',
        preview: 'Get creative with these three beginner-friendly DIY projects perfect for weekend crafting.'
    },
    {
        user_id: '0o0o0',
        title: 'Code Review',
        content: 'What I learned from my first code review experience.',
        preview: ''
    },
    {
        user_id: 'ima',
        title: 'Recipe Share',
        content: 'My grandmother\'s secret recipe for the perfect kimchi jjigae.',
        preview: 'Discover the secret to making authentic kimchi jjigae with this family recipe.'
    },
    {
        user_id: '0o0o0',
        title: 'Tech Trends',
        content: 'Exploring the latest trends in web development and what they mean for developers.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Travel Tips',
        content: 'Essential items to pack for your first international trip.',
        preview: 'Make your first international trip a success with this comprehensive packing guide.'
    },
    {
        user_id: '0o0o0',
        title: 'Study Methods',
        content: 'Effective study techniques I use for learning programming concepts.',
        preview: ''
    },
    {
        user_id: 'hellohellohellohellohellohe',
        title: 'Book Club',
        content: 'Starting a virtual book club! Here are the books we\'ll be reading this month.',
        preview: 'Join our virtual book club and explore this month\'s exciting reading selections.'
    },
    {
        user_id: '0o0o0',
        title: 'Project Update',
        content: 'Progress report on my personal portfolio website development.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Photography Basics',
        content: 'Understanding aperture, shutter speed, and ISO in photography.',
        preview: 'Master the exposure triangle and take your photography skills to the next level.'
    },
    {
        user_id: '0o0o0',
        title: 'Coding Challenge',
        content: 'Solved my first leetcode problem today! Here\'s my approach and solution.',
        preview: ''
    },
    {
        user_id: 'ima',
        title: 'Food Adventures',
        content: 'Exploring the best street food spots in my neighborhood.',
        preview: 'Discover hidden culinary gems and the best street food spots in our local area.'
    },
    {
        user_id: '0o0o0',
        title: 'Tech Setup',
        content: 'My current development environment and tools I use daily.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Weekend Hobby',
        content: 'Started learning watercolor painting. Here\'s my first attempt!',
        preview: 'Join me as I begin my watercolor painting journey and share my first creation.'
    },
    {
        user_id: '0o0o0',
        title: 'Learning Update',
        content: 'Three months into learning web development - what I\'ve learned so far.',
        preview: ''
    },
    {
        user_id: 'hellohellohellohellohellohe',
        title: 'Reading List',
        content: 'My recommended reading list for aspiring writers and book lovers.',
        preview: 'Find your next favorite book with these carefully curated recommendations.'
    },
    {
        user_id: '0o0o0',
        title: 'Code Patterns',
        content: 'Understanding design patterns in JavaScript and when to use them.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Art Projects',
        content: 'Sharing my latest digital art creations and the process behind them.',
        preview: 'Take a peek behind the scenes of my latest digital art projects and creative process.'
    },
    {
        user_id: '0o0o0',
        title: 'Debug Story',
        content: 'How I solved a tricky bug in my React application.',
        preview: ''
    },
    {
        user_id: 'ima',
        title: 'Restaurant Review',
        content: 'Found this amazing hidden gem restaurant in the city center.',
        preview: 'Discover an incredible hidden dining spot in the heart of the city.'
    },
    {
        user_id: '0o0o0',
        title: 'API Design',
        content: 'Best practices I\'ve learned about designing RESTful APIs.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Creative Writing',
        content: 'Short story I wrote during this weekend\'s writing workshop.',
        preview: 'Read my latest short story created during an inspiring weekend writing workshop.'
    },
    {
        user_id: '0o0o0',
        title: 'Database Choice',
        content: 'Why I chose MongoDB for my latest project.',
        preview: ''
    },
    {
        user_id: 'hellohellohellohellohellohe',
        title: 'Book Thoughts',
        content: 'My thoughts on the latest bestseller everyone\'s talking about.',
        preview: 'Get my honest take on the book that\'s currently taking the literary world by storm.'
    },
    {
        user_id: '0o0o0',
        title: 'Code Review 2',
        content: 'Lessons learned from conducting my first code review.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Studio Setup',
        content: 'How I organized my home recording studio on a budget.',
        preview: 'Create a professional home recording studio without breaking the bank.'
    },
    {
        user_id: '0o0o0',
        title: 'Testing Strategy',
        content: 'My approach to writing unit tests for JavaScript applications.',
        preview: ''
    },
    {
        user_id: 'ima',
        title: 'Cafe Review',
        content: 'Visited this new cafe with amazing atmosphere and coffee.',
        preview: 'Experience the charm of our city\'s newest and most atmospheric coffee spot.'
    },
    {
        user_id: '0o0o0',
        title: 'Git Workflow',
        content: 'How I organize my Git branches and manage pull requests.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Photo Essay',
        content: 'A day in the life of our city through my camera lens.',
        preview: 'Experience our city\'s daily life through a series of captivating photographs.'
    },
    {
        user_id: '0o0o0',
        title: 'CSS Grid',
        content: 'Finally understanding CSS Grid and how to use it effectively.',
        preview: ''
    },
    {
        user_id: 'hellohellohellohellohellohe',
        title: 'Reading Corner',
        content: 'My cozy reading nook setup and book organization system.',
        preview: 'Create your perfect reading sanctuary with these cozy decoration ideas.'
    },
    {
        user_id: '0o0o0',
        title: 'Final Project',
        content: 'Completed my portfolio website! Here\'s what I learned along the way.',
        preview: ''
    },
    {
        user_id: '101010',
        title: 'Music Review',
        content: 'My thoughts on the latest album from my favorite artist.',
        preview: 'An in-depth review of the newest release from a beloved musical artist.'
    }
];

export { users, pages };