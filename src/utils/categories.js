// Default categories for the Issue Tracker

// Main categories
export const mainCategories = [
  { id: 'facilities', label: 'Facilities' },
  { id: 'technology', label: 'Technology' },
  { id: 'academic', label: 'Academic' },
  { id: 'administrative', label: 'Administrative' },
  { id: 'housing', label: 'Housing' },
  { id: 'other', label: 'Other' }
];

// Sub-categories mapped to main categories
export const subCategories = {
  facilities: [
    { id: 'cleaning', label: 'Cleaning & Maintenance' },
    { id: 'repairs', label: 'Repairs' },
    { id: 'ac_heating', label: 'AC & Heating' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'furniture', label: 'Furniture' }
  ],
  technology: [
    { id: 'wifi', label: 'WiFi & Network' },
    { id: 'lab_computers', label: 'Lab Computers' },
    { id: 'classroom_tech', label: 'Classroom Technology' },
    { id: 'software', label: 'Software Issues' },
    { id: 'account_access', label: 'Account Access' }
  ],
  academic: [
    { id: 'courses', label: 'Course Related' },
    { id: 'registration', label: 'Registration' },
    { id: 'grades', label: 'Grades' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'resources', label: 'Learning Resources' }
  ],
  administrative: [
    { id: 'fees', label: 'Fees & Payments' },
    { id: 'documents', label: 'Documents & Certificates' },
    { id: 'id_cards', label: 'ID Cards' },
    { id: 'policies', label: 'Policies & Procedures' }
  ],
  housing: [
    { id: 'allocation', label: 'Room Allocation' },
    { id: 'maintenance', label: 'Room Maintenance' },
    { id: 'roommates', label: 'Roommate Issues' },
    { id: 'facilities', label: 'Housing Facilities' }
  ],
  other: [
    { id: 'feedback', label: 'General Feedback' },
    { id: 'events', label: 'Events & Activities' },
    { id: 'security', label: 'Security Concerns' },
    { id: 'suggestions', label: 'Suggestions' }
  ]
};
