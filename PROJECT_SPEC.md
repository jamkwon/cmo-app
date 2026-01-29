# CMO (Client Meeting Organizer) - Project Specification

## Overview
A web application for FIGMINTS account managers and strategists to run client meetings following the EOS L10 meeting format, focused on Marketing.

## Design Reference
- Dribbble: https://dribbble.com/shots/24789148-Project-Management-Dashboard-UI-Design
- Light and dark mode
- FIGMINTS brand colors (primary: #e55d4d coral/red)
- Clean, modern, non-intimidating UI

## Tech Stack
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Database: SQLite (with future migration path)
- Hosting: Mac Mini (localhost initially, then Cloudflare Tunnel)

## Core Data Model

### Client
- id, name, url, address
- client_name, client_contact, preferred_contact
- account_manager, am_email
- strategist, strat_email
- regular_meeting_date
- passwords_access (JSON - email, social, CRM, etc.)
- important_links (JSON array)
- created_at, updated_at

### Meeting
- id, client_id, meeting_date
- meeting_score_avg (calculated)
- status (draft, in_progress, completed)
- notes

### BigWins (Headlines)
- id, meeting_id, title, description

### ScorecardItem
- id, client_id, name, goal_min, goal_max
- current_value, previous_value
- trend (up, down, flat)

### ScorecardEntry
- id, scorecard_item_id, meeting_id
- value, notes

### Todo
- id, client_id, meeting_id
- title, description, assigned_to (us/client)
- status (pending, in_progress, complete, carried_over)
- due_date, notes, attachments (JSON)
- created_at, completed_at

### BaselineUpdate
- id, meeting_id, category (newsletter, seo, paid_ads, etc.)
- status, notes, link

### CampaignUpdate
- id, client_id, name
- phase, progress_percent, notes

### IDSItem
- id, meeting_id
- type (issue, discussion, strategy, project)
- title, description, owner
- status (identified, discussed, solved)

### MeetingScore
- id, meeting_id, scorer_name, score (1-10)

### BigIdea
- id, client_id, title, description
- priority, status

### TimelineItem
- id, client_id, month, year
- project_name, phase, color
- spans_months (boolean)

### Newsletter
- id, client_id, month, year
- subject, status, notes

## Views

### 1. Dashboard (Agency View)
- List of all clients
- Upcoming meetings
- Recent activity
- Quick stats

### 2. Client View (Internal)
- Full meeting interface
- All sections visible
- Edit capabilities

### 3. Client View (External/Shared)
- Limited view for clients
- Meeting agenda and notes
- Their action items only
- No sensitive info (passwords, internal notes)

## Meeting Flow (Sections in Order)

1. **Big Wins / Headlines** - Celebrate wins
2. **Scorecard Review** - Track metrics vs goals
3. **Previous Todos** - Review carryover tasks
4. **Baseline Updates** - Newsletter, SEO, Paid Ads status
5. **Campaign Updates** - Quarterly campaign progress
6. **IDS** - Identify, Discuss, Solve issues
7. **FIGMINTS Headlines** - Agency updates
8. **New Todos** - Assign tasks from meeting
9. **Carried Todos** - Incomplete tasks rolling forward
10. **Meeting Score** - Rate the meeting (1-10)
11. **Big Ideas Backlog** - Park ideas for later
12. **Important Info** - Links, contacts, passwords (internal only)
13. **Timeline** - Visual project timeline
14. **Annual Plan** - High-level yearly goals

## Key Features

### MVP (Tonight)
- [ ] Client CRUD
- [ ] Meeting creation and flow
- [ ] Big Wins section
- [ ] Scorecard with goals and tracking
- [ ] Todos with assignments
- [ ] IDS section
- [ ] Meeting score
- [ ] Basic timeline view
- [ ] Light/dark mode toggle
- [ ] Responsive design

### Phase 2
- [ ] Basecamp integration
- [ ] File attachments
- [ ] Email notifications
- [ ] PDF export of meeting notes
- [ ] Automatic data import
- [ ] Rich reporting and graphs
- [ ] Newsletter planning section

## API Endpoints

### Clients
- GET /api/clients
- POST /api/clients
- GET /api/clients/:id
- PUT /api/clients/:id
- DELETE /api/clients/:id

### Meetings
- GET /api/clients/:id/meetings
- POST /api/clients/:id/meetings
- GET /api/meetings/:id
- PUT /api/meetings/:id

### Meeting Sections
- GET/POST/PUT /api/meetings/:id/wins
- GET/POST/PUT /api/meetings/:id/scorecard
- GET/POST/PUT /api/meetings/:id/todos
- GET/POST/PUT /api/meetings/:id/baseline
- GET/POST/PUT /api/meetings/:id/campaigns
- GET/POST/PUT /api/meetings/:id/ids
- GET/POST/PUT /api/meetings/:id/scores

### Client Data
- GET/PUT /api/clients/:id/scorecard-items
- GET/PUT /api/clients/:id/timeline
- GET/PUT /api/clients/:id/big-ideas
- GET/PUT /api/clients/:id/info

## File Structure
```
cmo-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── meeting/
│   │   │   ├── dashboard/
│   │   │   └── shared/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── styles/
│   └── package.json
├── server/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── index.js
└── README.md
```

## Sample Data
Include dummy data for 2-3 clients to demonstrate the system:
1. "Acme Corp" - Tech company
2. "Green Leaf" - Eco brand
3. "Urban Fitness" - Gym chain

Each with realistic:
- Scorecard metrics
- Recent meetings
- Todos in various states
- Campaign timelines
- Big ideas backlog
