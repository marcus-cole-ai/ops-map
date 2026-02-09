// Industry templates for OpsMap
// Each template provides a starting point for a specific business type

export interface Template {
  id: string
  name: string
  description: string
  industry: string
  icon: string
  data: TemplateData
}

export interface TemplateData {
  companyName: string
  functions: {
    name: string
    description: string
    color: string
    subFunctions: {
      name: string
      activities: string[]
    }[]
  }[]
  workflows: {
    name: string
    description: string
    phases: {
      name: string
      steps: string[]
    }[]
  }[]
  roles: { name: string; description: string }[]
}

export const TEMPLATES: Template[] = [
  {
    id: 'residential-remodeler',
    name: 'Residential Remodeler',
    description: 'Kitchen & bath remodels, additions, whole-home renovations',
    industry: 'Construction',
    icon: '🏠',
    data: {
      companyName: 'My Remodeling Company',
      functions: [
        {
          name: 'Marketing',
          description: 'Generate leads and build brand awareness',
          color: '#3B82F6',
          subFunctions: [
            { name: 'Digital Marketing', activities: ['Manage social media', 'Run paid ads', 'Update website', 'Send email campaigns'] },
            { name: 'Referral Program', activities: ['Request reviews', 'Follow up with past clients', 'Send referral gifts'] },
            { name: 'Local Marketing', activities: ['Attend home shows', 'Network with realtors', 'Place yard signs'] },
          ],
        },
        {
          name: 'Sales',
          description: 'Convert leads into signed contracts',
          color: '#10B981',
          subFunctions: [
            { name: 'Lead Management', activities: ['Respond to inquiries', 'Qualify leads', 'Schedule consultations'] },
            { name: 'Design Consultation', activities: ['Conduct site visit', 'Discuss vision', 'Take measurements', 'Review budget'] },
            { name: 'Proposal', activities: ['Build estimate', 'Create proposal', 'Present to client', 'Handle objections'] },
            { name: 'Contract', activities: ['Review contract terms', 'Collect signatures', 'Process deposit'] },
          ],
        },
        {
          name: 'Design',
          description: 'Create project plans and specifications',
          color: '#F59E0B',
          subFunctions: [
            { name: 'Concept Design', activities: ['Create mood boards', 'Draft initial layouts', 'Present concepts'] },
            { name: 'Design Development', activities: ['Refine designs', 'Select materials', 'Create 3D renderings'] },
            { name: 'Construction Docs', activities: ['Finalize plans', 'Create specifications', 'Coordinate with engineers'] },
          ],
        },
        {
          name: 'Pre-Construction',
          description: 'Prepare for project execution',
          color: '#EF4444',
          subFunctions: [
            { name: 'Permitting', activities: ['Submit permit applications', 'Schedule inspections', 'Address corrections'] },
            { name: 'Procurement', activities: ['Order materials', 'Confirm lead times', 'Schedule deliveries'] },
            { name: 'Scheduling', activities: ['Create project schedule', 'Book subcontractors', 'Coordinate with client'] },
          ],
        },
        {
          name: 'Production',
          description: 'Execute the construction work',
          color: '#8B5CF6',
          subFunctions: [
            { name: 'Demo & Rough-In', activities: ['Perform demolition', 'Frame changes', 'Run electrical/plumbing', 'Install HVAC'] },
            { name: 'Finishes', activities: ['Install drywall', 'Paint', 'Install flooring', 'Set cabinets', 'Install fixtures'] },
            { name: 'Quality Control', activities: ['Inspect work', 'Address deficiencies', 'Document progress'] },
          ],
        },
        {
          name: 'Project Closeout',
          description: 'Complete and hand off the project',
          color: '#EC4899',
          subFunctions: [
            { name: 'Punch List', activities: ['Create punch list', 'Complete items', 'Final cleaning'] },
            { name: 'Final Walkthrough', activities: ['Schedule walkthrough', 'Review with client', 'Get sign-off'] },
            { name: 'Handoff', activities: ['Provide warranties', 'Review maintenance', 'Collect final payment'] },
          ],
        },
        {
          name: 'Finance',
          description: 'Manage money and accounting',
          color: '#06B6D4',
          subFunctions: [
            { name: 'Billing', activities: ['Create invoices', 'Send payment reminders', 'Process payments'] },
            { name: 'Job Costing', activities: ['Track expenses', 'Compare to budget', 'Report variances'] },
            { name: 'Payroll', activities: ['Process timesheets', 'Run payroll', 'File taxes'] },
          ],
        },
      ],
      workflows: [
        {
          name: 'Client Journey',
          description: 'End-to-end experience from lead to project completion',
          phases: [
            { name: 'Lead', steps: ['Receive inquiry', 'Initial response', 'Qualify lead'] },
            { name: 'Consultation', steps: ['Schedule visit', 'Site assessment', 'Discuss vision'] },
            { name: 'Design', steps: ['Create concepts', 'Refine design', 'Finalize plans'] },
            { name: 'Proposal', steps: ['Build estimate', 'Present proposal', 'Negotiate terms'] },
            { name: 'Contract', steps: ['Review contract', 'Sign agreement', 'Collect deposit'] },
            { name: 'Pre-Con', steps: ['Pull permits', 'Order materials', 'Schedule work'] },
            { name: 'Production', steps: ['Execute work', 'Quality checks', 'Client updates'] },
            { name: 'Closeout', steps: ['Punch list', 'Final walk', 'Collect payment'] },
          ],
        },
      ],
      roles: [
        { name: 'Owner', description: 'Business owner and primary decision maker' },
        { name: 'Project Manager', description: 'Manages project execution and client communication' },
        { name: 'Designer', description: 'Creates designs and selects materials' },
        { name: 'Estimator', description: 'Builds estimates and proposals' },
        { name: 'Lead Carpenter', description: 'Leads on-site construction work' },
        { name: 'Office Manager', description: 'Handles admin, scheduling, and billing' },
      ],
    },
  },
  {
    id: 'general-contractor',
    name: 'General Contractor',
    description: 'New construction, commercial projects, large-scale builds',
    industry: 'Construction',
    icon: '🏗️',
    data: {
      companyName: 'My General Contracting Co.',
      functions: [
        {
          name: 'Business Development',
          description: 'Find and win new projects',
          color: '#3B82F6',
          subFunctions: [
            { name: 'Lead Generation', activities: ['Monitor bid boards', 'Network with architects', 'Respond to RFPs'] },
            { name: 'Pre-Qualification', activities: ['Complete pre-qual forms', 'Provide references', 'Submit financials'] },
            { name: 'Bid Preparation', activities: ['Review plans', 'Request sub bids', 'Build estimate', 'Submit proposal'] },
          ],
        },
        {
          name: 'Preconstruction',
          description: 'Plan and prepare for project execution',
          color: '#10B981',
          subFunctions: [
            { name: 'Value Engineering', activities: ['Review design', 'Identify savings', 'Propose alternatives'] },
            { name: 'Scheduling', activities: ['Build master schedule', 'Coordinate milestones', 'Identify constraints'] },
            { name: 'Procurement', activities: ['Buy out subcontracts', 'Order long-lead items', 'Negotiate terms'] },
          ],
        },
        {
          name: 'Project Management',
          description: 'Execute and deliver projects',
          color: '#F59E0B',
          subFunctions: [
            { name: 'Field Operations', activities: ['Coordinate subs', 'Manage site safety', 'Quality inspections'] },
            { name: 'Schedule Management', activities: ['Update schedule', 'Track progress', 'Mitigate delays'] },
            { name: 'Client Communication', activities: ['Weekly meetings', 'Progress reports', 'Change order processing'] },
          ],
        },
        {
          name: 'Finance & Admin',
          description: 'Manage project finances and administration',
          color: '#8B5CF6',
          subFunctions: [
            { name: 'Cost Control', activities: ['Track costs', 'Forecast completion', 'Report variances'] },
            { name: 'Billing', activities: ['Prepare pay apps', 'Process invoices', 'Manage retainage'] },
            { name: 'Contract Admin', activities: ['Process submittals', 'Manage RFIs', 'Track changes'] },
          ],
        },
        {
          name: 'Closeout',
          description: 'Complete and hand over projects',
          color: '#EC4899',
          subFunctions: [
            { name: 'Punch List', activities: ['Generate punch list', 'Track completion', 'Final inspections'] },
            { name: 'Turnover', activities: ['Compile O&M manuals', 'Train owner', 'Obtain occupancy'] },
            { name: 'Warranty', activities: ['Track warranty items', 'Coordinate repairs', 'Close out project'] },
          ],
        },
      ],
      workflows: [
        {
          name: 'Project Lifecycle',
          description: 'From bid to closeout',
          phases: [
            { name: 'Pursuit', steps: ['Identify opportunity', 'Pre-qualify', 'Decide to bid'] },
            { name: 'Bid', steps: ['Review documents', 'Build estimate', 'Submit bid'] },
            { name: 'Award', steps: ['Negotiate contract', 'Execute agreement', 'Mobilize'] },
            { name: 'Preconstruction', steps: ['Buyout', 'Schedule', 'Submittals'] },
            { name: 'Construction', steps: ['Execute work', 'Manage changes', 'Quality control'] },
            { name: 'Closeout', steps: ['Punch list', 'Turnover', 'Final billing'] },
          ],
        },
      ],
      roles: [
        { name: 'Principal', description: 'Company leadership and major decisions' },
        { name: 'Project Executive', description: 'Oversees multiple projects' },
        { name: 'Project Manager', description: 'Manages individual project execution' },
        { name: 'Superintendent', description: 'Runs day-to-day field operations' },
        { name: 'Estimator', description: 'Prepares bids and estimates' },
        { name: 'Project Engineer', description: 'Handles submittals, RFIs, and documentation' },
      ],
    },
  },
  {
    id: 'specialty-contractor',
    name: 'Specialty Contractor',
    description: 'Electrical, plumbing, HVAC, or other trade-specific work',
    industry: 'Construction',
    icon: '⚡',
    data: {
      companyName: 'My Specialty Trade Co.',
      functions: [
        {
          name: 'Sales',
          description: 'Win work from GCs and direct clients',
          color: '#3B82F6',
          subFunctions: [
            { name: 'Bidding', activities: ['Review invitations', 'Build takeoffs', 'Price labor', 'Submit bids'] },
            { name: 'Direct Sales', activities: ['Service calls', 'Site visits', 'Provide quotes'] },
            { name: 'Relationship Management', activities: ['Follow up with GCs', 'Attend meetings', 'Get on bid lists'] },
          ],
        },
        {
          name: 'Operations',
          description: 'Plan and execute work',
          color: '#10B981',
          subFunctions: [
            { name: 'Scheduling', activities: ['Assign crews', 'Coordinate with GC', 'Manage backlog'] },
            { name: 'Field Work', activities: ['Rough-in', 'Trim out', 'Inspections', 'Commissioning'] },
            { name: 'Service', activities: ['Respond to calls', 'Diagnose issues', 'Complete repairs'] },
          ],
        },
        {
          name: 'Purchasing',
          description: 'Procure materials and equipment',
          color: '#F59E0B',
          subFunctions: [
            { name: 'Material Ordering', activities: ['Create material lists', 'Get quotes', 'Place orders'] },
            { name: 'Inventory', activities: ['Track stock', 'Reorder supplies', 'Manage warehouse'] },
            { name: 'Equipment', activities: ['Maintain tools', 'Rent equipment', 'Track assets'] },
          ],
        },
        {
          name: 'Admin & Finance',
          description: 'Handle business operations',
          color: '#8B5CF6',
          subFunctions: [
            { name: 'Billing', activities: ['Create invoices', 'Process payments', 'Collections'] },
            { name: 'Payroll', activities: ['Track time', 'Process payroll', 'Manage benefits'] },
            { name: 'Compliance', activities: ['Maintain licenses', 'Safety training', 'Insurance'] },
          ],
        },
      ],
      workflows: [
        {
          name: 'Job Flow',
          description: 'From bid to completion',
          phases: [
            { name: 'Bid', steps: ['Receive invitation', 'Build estimate', 'Submit bid'] },
            { name: 'Award', steps: ['Review contract', 'Sign agreement', 'Schedule work'] },
            { name: 'Execution', steps: ['Mobilize', 'Rough-in', 'Inspection', 'Trim'] },
            { name: 'Close', steps: ['Final inspection', 'Punch list', 'Invoice'] },
          ],
        },
      ],
      roles: [
        { name: 'Owner', description: 'Business owner' },
        { name: 'Operations Manager', description: 'Manages crews and scheduling' },
        { name: 'Estimator', description: 'Prepares bids' },
        { name: 'Foreman', description: 'Leads field crews' },
        { name: 'Journeyman', description: 'Licensed trade worker' },
        { name: 'Apprentice', description: 'Trade worker in training' },
      ],
    },
  },
]

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id)
}
