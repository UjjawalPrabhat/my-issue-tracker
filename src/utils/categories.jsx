export const mainCategories = [
  { id: 'campus', label: 'Campus' },
  { id: 'hostel', label: 'Hostel' }
];

export const subCategories = {
  campus: [
    { id: 'classroom', label: 'Classroom' },
    { id: 'network', label: 'Network/Internet' },
    { id: 'washroom', label: 'Washroom/Toiletries' },
    { id: 'library', label: 'Library' },
    { id: 'lab', label: 'Laboratory' },
    { id: 'sports', label: 'Sports Facilities' },
    { id: 'cafeteria', label: 'Cafeteria' },
    { id: 'other_campus', label: 'Other Campus Issue' }
  ],
  hostel: [
    { id: 'food', label: 'Food Services' },
    { id: 'electricity', label: 'Electricity/Power' },
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'furniture', label: 'Furniture/Room Fixtures' },
    { id: 'cleanliness', label: 'Cleanliness' },
    { id: 'security', label: 'Security' },
    { id: 'maintenance', label: 'General Maintenance' },
    { id: 'other_hostel', label: 'Other Hostel Issue' }
  ]
};

// Get the category icon based on subcategory id
export const getCategoryIcon = (categoryId) => {
  const iconMap = {
    // Campus icons
    classroom: (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
    network: (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    washroom: (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    library: (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    
    // Hostel icons
    food: (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.325 3.05l-1.4 1.55-1.4-1.55A2.53 2.53 0 007.5 3C5.75 3 4 4.75 4 7.5c0 2.12.94 3.25 2 4.5 1.06 1.25 2 2 2 3.5V18a2 2 0 004 0v-2.5c0-1.5.94-2.25 2-3.5 1.06-1.25 2-2.38 2-4.5 0-2.75-1.75-4.5-3.5-4.5-1 0-1.79.37-2.18 1.05z" />
      </svg>
    ),
    electricity: (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    plumbing: (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm-4-8v2m0 16v-2m-8-8h2m16 0h-2" />
      </svg>
    ),
    
    // Default icon for other categories
    default: (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };
  
  return iconMap[categoryId] || iconMap.default;
};