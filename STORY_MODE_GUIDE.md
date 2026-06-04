# Story Mode - Complete Publishing Guide

## 📖 Step-by-Step: How to Publish a Story and Get URL

### **Step 1: Create/Open Story**
- Click **"Story Mode"** in the left sidebar
- You'll see a blank story with one default text block
- Change the title from "My Global Health Story" to your desired title
- Example: `"Health is Wealth"`

### **Step 2: Add Story Content**
You can add two types of blocks:

#### **Text Block** (for captions and narratives)
1. Click **"Add Text Block"** button
2. Type your content in the textarea
3. Examples:
   - "Malaria is dangerous"
   - "New findings show..."
   - Any health-related narrative

#### **Chart Block** (for data visualization)
1. Click **"Add Chart Block"** button
2. Enter a chart title
3. Placeholder for chart visualization appears
4. *Note: Currently shows placeholder - actual chart integration coming soon*

### **Step 3: Customize Story Design**
In the right panel:
1. **Theme Color**: Select one of 4 colors:
   - Blue (#3b82f6)
   - Green (#10b981) 
   - Amber (#f59e0b)
   - Red (#ef4444)
2. Selected color applies as border to all blocks

### **Step 4: Save as Draft** (Optional)
- Click **"Save Draft"** button at bottom
- Story saves without publishing
- Status shows as **DRAFT**
- Only you can see it

### **Step 5: Reorder Blocks** (Optional)
- Hover over any block
- Click the **grip handle** (≡ icon) on the left
- Drag block up or down to reorder
- Release to place

### **Step 6: Publish Story** ⭐ IMPORTANT
1. Make sure **"Public"** toggle is checked in the right panel
2. Click the blue **"Publish Story"** button at the top-right
3. **Wait for the page to process** (you'll see "Saving..." spinner)
4. Once saved, a **blue URL banner** appears below the title
   - Banner shows: `Public Story URL: http://localhost:5173/story/your-story-slug`

### **Step 7: Copy & Share URL**
1. The URL banner displays your story's public link
2. Click the **copy icon** (📋) on the right side of the banner
3. URL is copied to your clipboard
4. Share it with anyone:
   - Email
   - WhatsApp
   - Twitter
   - Teams
   - Any messaging platform

### **Step 8: View Published Story**
1. Anyone (logged in or not) can visit the URL
2. Story displays in a beautiful read-only format
3. View count increments (visible on public story page)
4. Back button for easy navigation

---

## 🔄 How It Works (Technical Flow)

### **Publishing Workflow**

```
USER CLICKS "PUBLISH STORY"
         ↓
    setStatus('PUBLISHED')
    setIsPublic(true)
         ↓
    handleSave('PUBLISHED', true)
         ↓
    ┌─────────────────────────────┐
    │  Is this a NEW story?       │
    └─────────────────────────────┘
         ↙              ↘
      YES              NO
       ↓               ↓
    POST API      PUT API
    /stories      /stories/:id
       ↓               ↓
    Backend creates   Backend updates
    story with        story with
    unique slug       slug
       ↓               ↓
    Returns:      Returns:
    { _id,         { _id,
      slug,          slug,
      ... }          ... }
       ↓               ↓
    ┌──────────────────────────────┐
    │  setPublicUrl called         │
    │  URL = domain/story/{slug}   │
    └──────────────────────────────┘
         ↓
    BLUE URL BANNER APPEARS
         ↓
    USER CLICKS COPY BUTTON
         ↓
    URL COPIED TO CLIPBOARD
         ↓
    SHARE URL WITH OTHERS
         ↓
    OTHERS VISIT: /story/{slug}
         ↓
    PublicStory.jsx COMPONENT LOADS
         ↓
    API CALLS: GET /stories/{slug}
         ↓
    Returns story data
    viewCount incremented
         ↓
    Story displays beautifully
```

---

## 📊 Data Flow

### **Creating a Story**
```
Frontend (StoryMode.jsx)
├─ Title: "Health is Wealth"
├─ Blocks: [{type: 'text', content: '...'}, ...]
├─ Theme: '#10b981' (green)
├─ Status: 'PUBLISHED'
└─ isPublic: true
         ↓ POST /stories
Backend (storyController.js)
├─ Slug: "health-is-wealth-1717000000000"
├─ userId: authenticated user ID
├─ Saves to MongoDB
└─ Returns full story object
         ↓
Frontend receives:
├─ _id: story database ID
├─ slug: "health-is-wealth-1717000000000"
└─ other fields...
         ↓
URL generated:
"http://localhost:5173/story/health-is-wealth-1717000000000"
```

### **Viewing a Story**
```
User visits: http://localhost:5173/story/health-is-wealth-1717000000000
         ↓
React Router matches: /story/:slug
         ↓
PublicStory.jsx component loads
         ↓
useParams() extracts slug
         ↓
GET /stories/{slug} API call
         ↓
Backend increments viewCount
         ↓
Returns story data
         ↓
Component renders:
├─ Story title
├─ Theme color
├─ All blocks
├─ View count
├─ Creation/update dates
└─ Back button
```

---

## ✅ Complete Workflow Example

### **Scenario: Create & Publish a Story**

**Initial State:**
```
Title: "My Global Health Story" (default)
Blocks: [{ type: 'text', content: 'Global Health Trends: A 2025 Retrospective' }]
Theme: Blue (#3b82f6)
Status: DRAFT
isPublic: false
publicUrl: "" (empty, no URL yet)
```

**User Actions:**

1. **Edit Title**
   ```
   Title → "Malaria Prevention 2026"
   ```

2. **Add Text Block**
   ```
   Block 2: { type: 'text', content: 'Malaria is dangerous' }
   ```

3. **Select Green Theme**
   ```
   Theme: Green (#10b981)
   Blocks now have green borders
   ```

4. **Toggle Public**
   ```
   isPublic: true (checked)
   ```

5. **Click Publish Story Button**
   ```
   ✓ Status → PUBLISHED
   ✓ isPublic → true
   ✓ API POST call sends all data
   ✓ Backend creates story with slug
   ✓ Backend returns story object with slug
   ✓ Frontend sets publicUrl
   ```

**Result:**
```
publicUrl: "http://localhost:5173/story/malaria-prevention-2026-1717000000000"

Blue URL Banner Appears:
┌────────────────────────────────────────────────────────┐
│ PUBLIC STORY URL                                       │
│ http://localhost:5173/story/malaria-prevention-2...   │ 📋
└────────────────────────────────────────────────────────┘
```

6. **User Clicks Copy Button**
   ```
   URL copied to clipboard
   Alert: "Story URL copied to clipboard!"
   ```

7. **User Shares URL**
   ```
   Sends to: friend@email.com
   Message: "Check out my story: 
            http://localhost:5173/story/malaria-prevention-2026-1717000000000"
   ```

8. **Friend Visits URL**
   ```
   Browser: http://localhost:5173/story/malaria-prevention-2026-1717000000000
   ↓
   PublicStory page loads
   ↓
   Shows:
   - Header with title "Malaria Prevention 2026"
   - View count: 1
   - Green theme color
   - Text block 1: "Global Health Trends..."
   - Text block 2: "Malaria is dangerous"
   - Creation date
   - Update date
   ↓
   View count increments to 2
   ```

---

## 🎯 Key Features Working

| Feature | Status | Details |
|---------|--------|---------|
| Create Story | ✅ Works | Default title and block provided |
| Edit Title | ✅ Works | Real-time editing in header |
| Add Text Blocks | ✅ Works | Unlimited text blocks |
| Add Chart Blocks | ✅ Works | Placeholder UI ready for charts |
| Edit Blocks | ✅ Works | Click to edit any block content |
| Delete Blocks | ✅ Works | Hover and click X button |
| Drag Reorder | ✅ Works | Drag handle appears on hover |
| Theme Color | ✅ Works | 4 color options apply to block borders |
| Save Draft | ✅ Works | Status: DRAFT, only visible to user |
| Publish Story | ✅ Works | Status: PUBLISHED, generates URL |
| Public Toggle | ✅ Works | Controls visibility (Public/Private) |
| URL Generation | ✅ Works | Unique slug-based URLs |
| Copy URL | ✅ Works | One-click clipboard copy |
| View Published | ✅ Works | Read-only story display |
| View Counter | ✅ Works | Increments on each visit |

---

## 🔗 URLs Reference

### **Local Development**
```
Story Editor: http://localhost:5173/stories
Published Story: http://localhost:5173/story/{slug}

Example:
http://localhost:5173/story/malaria-prevention-2026-1717000000000
```

### **URL Structure**
```
{domain}/story/{slug}

Where slug = "{title-lowercase-with-dashes}-{timestamp}"

Example breakdown:
Title: "Health is Wealth"
↓
Slug: "health-is-wealth-1717000000000"
↓
Full URL: http://localhost:5173/story/health-is-wealth-1717000000000
```

---

## 🧪 Testing Checklist

Use this checklist to verify everything works:

```
Story Creation
├─ ☑ Title editable in header
├─ ☑ Default first block present
└─ ☑ Can add text blocks

Content Management
├─ ☑ Can edit block content
├─ ☑ Can delete blocks (hover X)
├─ ☑ Can drag blocks to reorder
└─ ☑ Can add chart blocks

Customization
├─ ☑ Theme colors change block borders
├─ ☑ All 4 colors work (Blue, Green, Amber, Red)
└─ ☑ Color selection shows ring around selected

Publishing
├─ ☑ "Save Draft" button works (status: DRAFT)
├─ ☑ Public toggle shows Private/Public icon
├─ ☑ "Publish Story" button generates URL
├─ ☑ Blue URL banner appears after publishing
├─ ☑ Copy button works (copies to clipboard)
└─ ☑ Published button shows when status = PUBLISHED

Sharing
├─ ☑ URL is copyable
├─ ☑ URL can be shared via link
└─ ☑ Anyone can visit the URL

Public Story Page
├─ ☑ Page loads without login
├─ ☑ Story title displays
├─ ☑ All blocks display with theme color
├─ ☑ View count shows
├─ ☑ Creation/update dates show
├─ ☑ Back button works
└─ ☑ View count increments on reload
```

---

## 💡 Pro Tips

1. **Save Before Publish**: Click "Save Draft" first to ensure data is saved
2. **Check Public Toggle**: Make sure "Public" is checked before publishing
3. **Theme Color**: Choose a color that matches your health topic theme
4. **Long Titles**: Slugs are based on title, so clear titles make better URLs
5. **Share Immediately**: Copy URL right after publishing for easy sharing
6. **Check Stats**: Visit your published story to verify view count increases

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| URL not appearing | Make sure "Public" toggle is checked, then click "Publish Story" |
| URL not working | Check browser console for errors, verify story was saved |
| Wrong data on public page | Refresh the page, check network tab for API response |
| View count not increasing | Reload published page in different browser/incognito |
| Theme color not showing | Make sure color is selected in theme panel |
| Blocks not reordering | Refresh page and try again |

---

## 📱 Mobile Responsiveness

The Story Mode works on mobile devices:
- Touch-friendly buttons
- Responsive grid layout
- Settings panel stacks vertically on small screens
- URL banner adapts to screen size
- Touch-friendly drag handles

---

## 🚀 What's Next

Future enhancements planned:
- [ ] Actual chart rendering (Chart.js/Recharts)
- [ ] Story templates
- [ ] Collaboration features
- [ ] Comments on stories
- [ ] Social sharing (Twitter, LinkedIn, etc.)
- [ ] PDF export
- [ ] Story analytics
- [ ] Search and discovery

---

**Your Story Mode is ready to use! Start creating and sharing health data narratives today! 🎉**
