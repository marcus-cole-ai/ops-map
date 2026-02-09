// Demo data for a construction company
export const DEMO_DATA = {
  company: {
    name: 'Summit Construction Co.',
  },
  functions: [
    { name: 'Marketing', description: 'Lead generation and brand awareness', color: '#3B82F6' },
    { name: 'Sales', description: 'Converting leads to clients', color: '#10B981' },
    { name: 'Design', description: 'Project design and planning', color: '#F59E0B' },
    { name: 'Estimating', description: 'Pricing and proposals', color: '#EF4444' },
    { name: 'Production', description: 'Project execution and delivery', color: '#8B5CF6' },
    { name: 'Finance', description: 'Accounting and cash flow', color: '#EC4899' },
    { name: 'Administration', description: 'Operations and support', color: '#06B6D4' },
  ],
  subFunctions: {
    'Marketing': ['Brand Awareness', 'Lead Generation', 'Content Marketing', 'Referral Program'],
    'Sales': ['Lead Qualification', 'Discovery', 'Proposal Delivery', 'Contract Signing'],
    'Design': ['Initial Concepts', 'Design Development', 'Selections', 'Final Plans'],
    'Estimating': ['Material Takeoff', 'Labor Estimation', 'Vendor Quotes', 'Proposal Building'],
    'Production': ['Pre-Construction', 'Rough-In', 'Finishes', 'Punch List'],
    'Finance': ['Invoicing', 'Collections', 'Payroll', 'Job Costing'],
    'Administration': ['Scheduling', 'Permits', 'Insurance', 'HR'],
  },
  activities: {
    'Lead Generation': ['Run social media ads', 'Post to Houzz', 'Send email newsletter', 'Host open house'],
    'Discovery': ['Schedule discovery call', 'Conduct site visit', 'Document client requirements', 'Review budget expectations'],
    'Proposal Delivery': ['Present proposal in person', 'Walk through scope', 'Answer questions', 'Handle objections'],
    'Pre-Construction': ['Order materials', 'Schedule subcontractors', 'Create project schedule', 'Hold pre-con meeting'],
    'Punch List': ['Create punch list', 'Complete punch items', 'Schedule final walk', 'Obtain sign-off'],
  },
  workflows: [
    {
      name: 'Client Journey',
      description: 'End-to-end client experience from lead to completion',
      phases: [
        { name: 'Lead', steps: ['Capture lead info', 'Send intro email', 'Qualify lead'] },
        { name: 'Discovery', steps: ['Schedule call', 'Conduct site visit', 'Document needs'] },
        { name: 'Proposal', steps: ['Build estimate', 'Create proposal', 'Present to client'] },
        { name: 'Contract', steps: ['Send contract', 'Collect deposit', 'Schedule kickoff'] },
        { name: 'Production', steps: ['Pre-construction', 'Execute work', 'Quality checks'] },
        { name: 'Completion', steps: ['Final walk', 'Collect final payment', 'Request review'] },
      ],
    },
    {
      name: 'Sales Process',
      description: 'Converting leads to signed contracts',
      phases: [
        { name: 'Qualify', steps: ['Review lead source', 'Check budget fit', 'Assess project scope'] },
        { name: 'Discover', steps: ['Schedule discovery', 'Site visit', 'Document requirements'] },
        { name: 'Propose', steps: ['Build estimate', 'Package proposal', 'Present'] },
        { name: 'Close', steps: ['Handle objections', 'Negotiate terms', 'Sign contract'] },
      ],
    },
  ],
  people: [
    { name: 'Mike Johnson', email: 'mike@summit.com', role: 'Owner' },
    { name: 'Sarah Chen', email: 'sarah@summit.com', role: 'Project Manager' },
    { name: 'Tom Williams', email: 'tom@summit.com', role: 'Sales Rep' },
    { name: 'Lisa Garcia', email: 'lisa@summit.com', role: 'Designer' },
    { name: 'James Brown', email: 'james@summit.com', role: 'Estimator' },
  ],
  roles: [
    { name: 'Owner', description: 'Business owner and final decision maker' },
    { name: 'Project Manager', description: 'Oversees project execution' },
    { name: 'Sales Rep', description: 'Handles client acquisition' },
    { name: 'Designer', description: 'Creates project designs' },
    { name: 'Estimator', description: 'Builds estimates and proposals' },
    { name: 'Admin', description: 'Handles administrative tasks' },
  ],
  software: [
    { name: 'HubSpot', url: 'https://hubspot.com' },
    { name: 'BuilderTrend', url: 'https://buildertrend.com' },
    { name: 'QuickBooks', url: 'https://quickbooks.com' },
    { name: 'Chief Architect', url: 'https://chiefarchitect.com' },
    { name: 'Google Workspace', url: 'https://workspace.google.com' },
  ],
}
