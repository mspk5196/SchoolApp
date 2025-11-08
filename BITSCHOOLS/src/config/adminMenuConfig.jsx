import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const adminMenuConfig = {
  roleName: 'Admin',
  menuItems: [
    [
      {
        title: 'Faculty',
        icon: <Icon name="account-tie" size={50} color="#1E293B" />,
        screen: 'AdminFaculty',
      },
      {
        title: 'Student',
        icon: <Icon name="school" size={50} color="#1E293B" />,
        screen: 'AdminStudent',
      },
    ],
    [
      {
        title: 'Materials',
        icon: <Icon name="book-open-variant" size={50} color="#1E293B" />,
        screen: 'AdminMaterials',
      },
      {
        title: 'Logs',
        icon: <Icon name="file-document-outline" size={50} color="#1E293B" />,
        screen: 'AdminLogs',
      },
    ],
    [
      {
        title: 'Schedule',
        icon: <Icon name="clock-outline" size={50} color="#1E293B" />,
        screen: 'AdminSchedule',
      },
      {
        title: 'Events',
        icon: <Icon name="calendar-star" size={50} color="#1E293B" />,
        screen: 'AdminEvents',
      },
    ],
    [
      {
        title: 'Calendar',
        icon: <Icon name="calendar-month" size={50} color="#1E293B" />,
        screen: 'AdminCalendar',
      },
      {
        title: 'Request',
        icon: <Icon name="file-document-edit-outline" size={50} color="#1E293B" />,
        screen: 'AdminRequest',
      },
    ],
    [
      {
        title: 'Enrollment',
        icon: <Icon name="account-plus-outline" size={50} color="#1E293B" />,
        screen: 'AdminEnrollmentHome',
      },
      {
        title: 'Messages',
        icon: <Icon name="message-text-outline" size={50} color="#1E293B" />,
        screen: 'AdminMessages',
      },
    ],
  ],
};
