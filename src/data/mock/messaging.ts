import { ChatParticipant, Conversation, Message, MessageStatus } from "@/types/messaging";
import { ChevronDown, GroupIcon, Home, MessagesSquare, User } from "lucide-react";

// Mock current user
export const currentUser: ChatParticipant = {
  id: "current-user",
  name: "You",
  avatar: "/avatars/person-1.png",
  role: "Project Owner",
  isOnline: true
};

// Mock team members
export const teamMembers: ChatParticipant[] = [
  {
    id: "user-1",
    name: "James Wilson",
    avatar: "/avatars/person-2.png",
    role: "Architect",
    isOnline: true,
    lastSeen: new Date().toISOString()
  },
  {
    id: "user-2",
    name: "Sarah Parker",
    avatar: "/avatars/person-3.png",
    role: "Contractor",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
  },
  {
    id: "user-3",
    name: "Michael Johnson",
    avatar: "/avatars/person-4.png",
    role: "Electrician",
    isOnline: true,
    lastSeen: new Date().toISOString()
  },
  {
    id: "user-4",
    name: "Emily Rodriguez",
    avatar: "/avatars/person-5.png",
    role: "Interior Designer",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
  },
  {
    id: "user-5",
    name: "Daniel Smith",
    avatar: "/avatars/person-6.png",
    role: "Plumber",
    isOnline: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
  }
];

// Helper function to create a message
const createMessage = (
  id: string,
  conversationId: string,
  senderId: string,
  content: string,
  timestamp: string,
  status: MessageStatus,
  isSystemMessage = false
): Message => ({
  id,
  conversationId,
  senderId,
  content,
  timestamp,
  status,
  isSystemMessage
});

// Mock conversations
export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    type: "group",
    name: "Main Project Team",
    participants: [currentUser, teamMembers[0], teamMembers[1], teamMembers[2]],
    lastMessage: {
      content: "I've updated the schedule for next week.",
      senderId: teamMembers[0].id,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      status: "read"
    },
    unreadCount: 0,
    projectId: "project-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    icon: "group"
  },
  {
    id: "conv-2",
    type: "individual",
    participants: [currentUser, teamMembers[0]],
    lastMessage: {
      content: "Can we review the foundation plans?",
      senderId: "current-user",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      status: "delivered"
    },
    unreadCount: 0,
    projectId: "project-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    icon: "user"
  },
  {
    id: "conv-3",
    type: "individual",
    participants: [currentUser, teamMembers[1]],
    lastMessage: {
      content: "The materials will be delivered on Thursday.",
      senderId: teamMembers[1].id,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      status: "read"
    },
    unreadCount: 0,
    projectId: "project-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    icon: "user"
  },
  {
    id: "conv-4",
    type: "project",
    name: "Modern Villa Project",
    participants: [currentUser, ...teamMembers],
    lastMessage: {
      content: "Phase 1 is now complete. Moving to Phase 2 next week.",
      senderId: teamMembers[2].id,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      status: "read"
    },
    unreadCount: 0,
    projectId: "project-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    icon: "home"
  },
  {
    id: "conv-5",
    type: "group",
    name: "Electrical Team",
    participants: [currentUser, teamMembers[2], teamMembers[4]],
    lastMessage: {
      content: "Let's finalize the electrical layout tomorrow.",
      senderId: teamMembers[4].id,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      status: "read"
    },
    unreadCount: 0,
    projectId: "project-1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    icon: "group"
  }
];

// Mock messages for the first conversation
export const mockMessages: Record<string, Message[]> = {
  "conv-1": [
    createMessage(
      "msg-1-1",
      "conv-1",
      "system",
      "Conversation started",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
      "delivered",
      true
    ),
    createMessage(
      "msg-1-2",
      "conv-1",
      currentUser.id,
      "Hello team! Welcome to our project communication channel. Let's use this space to coordinate our efforts and keep everyone updated.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60).toISOString(), // 7 days ago + 1 min
      "read"
    ),
    createMessage(
      "msg-1-3",
      "conv-1",
      teamMembers[0].id,
      "Thanks for setting this up! I'll share the latest architectural plans here.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 10).toISOString(), // 7 days ago + 10 mins
      "read"
    ),
    createMessage(
      "msg-1-4",
      "conv-1",
      teamMembers[1].id,
      "Great idea! This will make coordination much easier.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 15).toISOString(), // 7 days ago + 15 mins
      "read"
    ),
    createMessage(
      "msg-1-5",
      "conv-1",
      teamMembers[0].id,
      "I've prepared a tentative schedule for the first phase. I'll share it in our next meeting.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      "read"
    ),
    createMessage(
      "msg-1-6",
      "conv-1",
      currentUser.id,
      "Looking forward to it. Can everyone make it to the meeting tomorrow at 10 AM?",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 5).toISOString(), // 5 days ago + 5 mins
      "read"
    ),
    createMessage(
      "msg-1-7",
      "conv-1",
      teamMembers[1].id,
      "I'll be there.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 10).toISOString(), // 5 days ago + 10 mins
      "read"
    ),
    createMessage(
      "msg-1-8",
      "conv-1",
      teamMembers[2].id,
      "Count me in.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 15).toISOString(), // 5 days ago + 15 mins
      "read"
    ),
    createMessage(
      "msg-1-9",
      "conv-1",
      teamMembers[0].id,
      "Meeting went well today. I'm sharing the agreed schedule in the project documents.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
      "read"
    ),
    createMessage(
      "msg-1-10",
      "conv-1",
      currentUser.id,
      "Thank you all for your input. Let's make sure we stay on track.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 5).toISOString(), // 4 days ago + 5 mins
      "read"
    ),
    createMessage(
      "msg-1-11",
      "conv-1",
      teamMembers[0].id,
      "I've updated the schedule for next week.",
      new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      "read"
    )
  ],
  
  // Mock messages for second conversation
  "conv-2": [
    createMessage(
      "msg-2-1",
      "conv-2",
      "system",
      "Conversation started",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      "delivered",
      true
    ),
    createMessage(
      "msg-2-2",
      "conv-2",
      currentUser.id,
      "Hi James, I wanted to discuss some details about the architectural plans.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60).toISOString(), // 5 days ago + 1 min
      "read"
    ),
    createMessage(
      "msg-2-3",
      "conv-2",
      teamMembers[0].id,
      "Sure, what would you like to know?",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 10).toISOString(), // 5 days ago + 10 mins
      "read"
    ),
    createMessage(
      "msg-2-4",
      "conv-2",
      currentUser.id,
      "I was thinking about modifying the living room layout to have more natural light. Is that feasible at this stage?",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 15).toISOString(), // 5 days ago + 15 mins
      "read"
    ),
    createMessage(
      "msg-2-5",
      "conv-2",
      teamMembers[0].id,
      "Yes, we can definitely look into that. I'll prepare a couple of options for you to review.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 20).toISOString(), // 5 days ago + 20 mins
      "read"
    ),
    createMessage(
      "msg-2-6",
      "conv-2",
      currentUser.id,
      "That would be great, thank you!",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 25).toISOString(), // 5 days ago + 25 mins
      "read"
    ),
    createMessage(
      "msg-2-7",
      "conv-2",
      teamMembers[0].id,
      "I've uploaded two options to the project documents. Option A has larger windows on the south side, while Option B includes a small skylight.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      "read"
    ),
    createMessage(
      "msg-2-8",
      "conv-2",
      currentUser.id,
      "Just reviewed them. I think Option A works better for our needs. Let's go with that one.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 2).toISOString(), // 3 days ago + 2 hours
      "read"
    ),
    createMessage(
      "msg-2-9",
      "conv-2",
      teamMembers[0].id,
      "Perfect, I'll update the main plans accordingly.",
      new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 2 + 1000 * 60 * 5).toISOString(), // 3 days ago + 2 hours + 5 mins
      "read"
    ),
    createMessage(
      "msg-2-10",
      "conv-2",
      currentUser.id,
      "Can we review the foundation plans?",
      new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
      "delivered"
    )
  ]
}; 