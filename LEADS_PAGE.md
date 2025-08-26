# Leads Page Documentation

## Overview

The Leads page is a comprehensive lead management system that displays all customer chat details from the conversation system in a table format.

## Features

### Core Functionality

- **Data Source**: Fetches all user chat details from the conversation system
- **Table Display**: Shows leads in a responsive table format
- **Navigation**: Direct navigation to conversation chatrooms

### Table Columns

- **ID**: Customer ID (truncated for display)
- **Name**: Customer name with user icon
- **Email**: Customer email with mail icon
- **Phone**: Customer phone number with phone icon (optional, only shown if available)
- **Created**: Date and time when the chat room was created
- **Last Message**: Most recent message content and date
- **Actions**: View button to navigate to conversation

### Advanced Features

#### Search & Filtering

- **Search Bar**: Search by name, email, or phone number
- **Domain Selector**: Filter leads by specific domain
- **Real-time Filtering**: Results update as you type

#### Sorting

- **Name Sorting**: Click column header to sort by customer name
- **Date Sorting**: Click column header to sort by creation date
- **Visual Indicators**: Arrow icons show sort direction

#### Pagination

- **Configurable Items Per Page**: Currently set to 10 items per page
- **Page Navigation**: Previous/Next buttons and page numbers
- **Results Counter**: Shows current range and total count

#### Responsive Design

- **Desktop**: Full table view with all columns
- **Tablet**: Optimized layout with horizontal scrolling
- **Mobile**: Responsive design with proper spacing

## Technical Implementation

### File Structure

```
app/(dashboard)/leads/
├── page.tsx                    # Main page component
components/leads/
├── LeadsLayout.tsx            # Main layout component
└── index.ts                   # Export file
```

### Key Components

#### LeadsLayout.tsx

- **State Management**: Handles leads data, filtering, sorting, and pagination
- **Data Fetching**: Uses `onGetDomainChatRooms` action
- **Navigation**: Integrates with Next.js router for conversation navigation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Integration Points

#### Conversation System

- **URL Parameters**: Supports `?room=chatRoomId` for direct navigation
- **Auto-selection**: Automatically selects conversation when navigating from leads
- **Data Consistency**: Uses same data source as conversation page

#### Dashboard Layout

- **Sidebar Integration**: Added to main navigation menu
- **Consistent Styling**: Matches existing dashboard theme
- **Layout Compatibility**: Works with existing dashboard structure

## Usage

### Accessing the Page

1. Navigate to the dashboard
2. Click "Leads" in the sidebar navigation
3. The page will load with all leads from the selected domain

### Managing Leads

1. **Search**: Use the search bar to find specific leads
2. **Filter**: Select a different domain to view leads from that domain
3. **Sort**: Click column headers to sort the data
4. **Navigate**: Click "View" button to open the conversation

### Navigation Flow

1. Click "View" button on any lead
2. Automatically navigates to `/conversation?room=chatRoomId`
3. Conversation page loads with the selected chat room pre-selected
4. User can immediately see the conversation history

## Styling & Theme

### Design System

- **Colors**: Uses website's existing color palette
- **Typography**: Consistent with dashboard typography
- **Icons**: Lucide React icons for consistency
- **Components**: Built with shadcn/ui components

### Responsive Breakpoints

- **Mobile**: < 640px - Stacked layout, horizontal scroll for table
- **Tablet**: 640px - 1024px - Optimized spacing and layout
- **Desktop**: > 1024px - Full table view with all features

## Future Enhancements

### Potential Features

- **Export Functionality**: Export leads to CSV/Excel
- **Bulk Actions**: Select multiple leads for actions
- **Lead Status**: Add status tracking (new, contacted, converted)
- **Analytics**: Lead conversion metrics and charts
- **Email Integration**: Direct email composition from leads page
- **Advanced Filtering**: Filter by date ranges, message count, etc.

### Performance Optimizations

- **Virtual Scrolling**: For large datasets
- **Caching**: Implement data caching for faster loading
- **Lazy Loading**: Load more leads as needed
- **Search Debouncing**: Optimize search performance
