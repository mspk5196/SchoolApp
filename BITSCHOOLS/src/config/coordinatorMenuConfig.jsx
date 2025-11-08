import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const coordinatorMenuConfig = {
  roleName: 'Coordinator',
  menuItems: [
    [
      {
        title: 'Mentor',
        icon: <Icon name="account-tie" size={50} color="#1E293B" />,
        screen: 'CoordinatorMentor',
      },
      {
        title: 'Student',
        icon: <Icon name="school" size={50} color="#1E293B" />,
        screen: 'CoordinatorStudent',
      },
    ],
    [
      {
        title: 'Materials',
        icon: <Icon name="book-open-variant" size={50} color="#1E293B" />,
        screen: 'CoordinatorMaterialHome',
      },
      {
        title: 'Logs',
        icon: <Icon name="file-document-outline" size={50} color="#1E293B" />,
        screen: 'CoordinatorLogs',
      },
    ],
    [
      {
        title: 'Schedule',
        icon: <Icon name="clock-outline" size={50} color="#1E293B" />,
        screen: 'CoordinatorScheduleHome',
      },
      {
        title: 'Events',
        icon: <Icon name="calendar-star" size={50} color="#1E293B" />,
        screen: 'CoordinatorEvent',
      },
    ],
    [
      {
        title: 'Calendar',
        icon: <Icon name="calendar-month" size={50} color="#1E293B" />,
        screen: 'CoordinatorCalendar',
      },
      {
        title: 'Request',
        icon: <Icon name="file-document-edit-outline" size={50} color="#1E293B" />,
        screen: 'CoordinatorRequest',
      },
    ],
    [
      {
        title: 'Enrollment',
        icon: <Icon name="account-plus-outline" size={50} color="#1E293B" />,
        screen: 'CoordinatorEnrollmentHome',
      },
      {
        title: 'Messages',
        icon: <Icon name="message-text-outline" size={50} color="#1E293B" />,
        screen: 'CoordinatorMessageHome',
      },
    ],
  ],
};
