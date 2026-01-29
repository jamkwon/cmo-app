# CMO (Client Meeting Organizer)

A web application for FIGMINTS account managers and strategists to run client meetings following the EOS L10 meeting format, focused on Marketing.

## 🚀 Project Overview

CMO is a full-stack web application designed to streamline client meetings at FIGMINTS agency. It follows the EOS L10 meeting methodology with sections specifically tailored for marketing agencies including scorecard tracking, campaign updates, and action item management.

## 🎨 Design & Branding

- **Design Reference**: [Dribbble Project Management Dashboard](https://dribbble.com/shots/24789148-Project-Management-Dashboard-UI-Design)
- **Brand Colors**: FIGMINTS primary coral/red (#e55d4d)
- **UI Style**: Clean, modern, non-intimidating interface
- **Themes**: Light and dark mode support

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **State Management**: TanStack Query (React Query)
- **Icons**: Heroicons + Lucide React
- **Styling**: TailwindCSS + PostCSS
- **Routing**: React Router Dom v7

## 📁 Project Structure

```
cmo-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   └── styles/        # CSS and styling
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── database.js        # Database setup and schema
│   ├── index.js           # Express server
│   ├── seed.js            # Sample data seeder
│   └── package.json
├── PROJECT_SPEC.md        # Detailed project specification
└── README.md              # This file
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd cmo-app
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the development servers**

   **Backend** (Terminal 1):
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:3000

   **Frontend** (Terminal 2):
   ```bash
   cd client
   npm run dev
   ```
   Client will run on http://localhost:5173

## 📊 Core Features

### Meeting Flow (EOS L10 Format)
1. **Big Wins / Headlines** - Celebrate client wins
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

### Data Management
- **Client Management** - Contact info, account managers, strategists
- **Meeting History** - Track all past meetings and scores
- **Scorecard Tracking** - Custom metrics with goals and trends
- **Todo Management** - Task assignment (agency vs client)
- **Campaign Tracking** - Project phases and progress
- **Timeline Visualization** - Project roadmaps

## 🗄️ Database Schema

The application uses SQLite with the following main entities:
- **Client** - Client information and contacts
- **Meeting** - Meeting records and scores
- **BigWins** - Headlines and wins per meeting
- **ScorecardItem** - Custom metrics per client
- **Todo** - Action items with assignment and status
- **BaselineUpdate** - Standard service updates
- **CampaignUpdate** - Project-specific updates
- **IDSItem** - Issues, discussions, and strategies

## 📱 Views & Access

### Dashboard (Agency View)
- List of all clients
- Upcoming meetings
- Recent activity
- Quick stats

### Client View (Internal)
- Full meeting interface
- All sections visible
- Edit capabilities
- Sensitive information access

### Client View (External/Shared)
- Limited view for clients
- Meeting agenda and notes
- Their action items only
- No passwords or internal notes

## 🔧 Development

### Available Scripts

**Backend**:
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

**Frontend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database Setup

The database is automatically created when the server starts. To seed with sample data:

```bash
cd server
node seed.js
```

This creates sample data for:
- Acme Corp (Tech company)
- Green Leaf (Eco brand)  
- Urban Fitness (Gym chain)

## 🚀 Deployment

- **Initial Hosting**: Mac Mini (localhost)
- **Production**: Cloudflare Tunnel (planned)
- **Database**: SQLite (with future migration path)

## 📈 Development Status

### ✅ Completed (MVP)
- [x] Project setup and structure
- [x] Database schema and models
- [x] Basic Express server with CORS
- [x] React frontend with Vite
- [x] TailwindCSS styling setup
- [x] Basic routing structure

### 🚧 In Progress
- [ ] Client CRUD operations
- [ ] Meeting creation and flow
- [ ] Big Wins section
- [ ] Scorecard with goals and tracking
- [ ] Todo management with assignments
- [ ] IDS (Issues/Discussions/Solutions) section
- [ ] Meeting scoring system
- [ ] Timeline visualization
- [ ] Light/dark mode toggle
- [ ] Responsive design

### 📋 Planned (Phase 2)
- [ ] Basecamp integration
- [ ] File attachments
- [ ] Email notifications
- [ ] PDF export of meeting notes
- [ ] Automatic data import
- [ ] Rich reporting and graphs
- [ ] Newsletter planning section

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Internal FIGMINTS project - All rights reserved

## 📞 Contact

For questions or support, contact the FIGMINTS development team.

---

Built with ❤️ for FIGMINTS by the internal development team.# Fixed deployment author
