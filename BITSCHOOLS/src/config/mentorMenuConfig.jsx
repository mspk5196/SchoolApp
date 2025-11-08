import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const mentorMenuConfig = {
  roleName: 'Mentor',
  menuItems: [
    [
      {
        title: 'Dashboard',
        icon: <Icon name="view-dashboard" size={50} color="#1E293B" />,
        screen: 'MentorDashboard',
      },
      {
        title: 'Student',
        icon: <Icon name="school" size={50} color="#1E293B" />,
        screen: 'MentorStudent',
      },
    ],
    [
      {
        title: 'Materials',
        icon: <Icon name="book-open-variant" size={50} color="#1E293B" />,
        screen: 'MentorMaterials',
      },
      {
        title: 'Logs',
        icon: <Icon name="file-document-outline" size={50} color="#1E293B" />,
        screen: 'MentorLogs',
      },
    ],
    [
      {
        title: 'Schedule',
        icon: <Icon name="clock-outline" size={50} color="#1E293B" />,
        screen: 'MentorSchedule',
      },
      {
        title: 'Events',
        icon: <Icon name="calendar-star" size={50} color="#1E293B" />,
        screen: 'MentorEvents',
      },
    ],
    [
      {
        title: 'Calendar',
        icon: <Icon name="calendar-month" size={50} color="#1E293B" />,
        screen: 'MentorCalendar',
      },
      {
        title: 'Request',
        icon: <Icon name="file-document-edit-outline" size={50} color="#1E293B" />,
        screen: 'MentorRequest',
      },
    ],
    [
      {
        title: 'Messages',
        icon: <Icon name="message-text-outline" size={50} color="#1E293B" />,
        screen: 'MentorMessages',
      },
    ],
  ],
};
