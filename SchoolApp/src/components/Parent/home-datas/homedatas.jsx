import { useState } from 'react';

// Export all the initial data to be used in the home component
export const useHomeData = () => {
  // Profile data
  const [profileData, setProfileData] = useState({
    name: 'Ram Kumar',
    phone: '7376232206',
    attendance: 70,
    completedDays: 7,
    totalDays: 8,
    profileImage: 'https://via.placeholder.com/60'
  });
  
  // Surveys data
  const [surveys, setSurveys] = useState([
    { id: 1, name: 'Ram Kumar', phone: '7376232206', feedbackTime: '45 mins', image: 'https://via.placeholder.com/40' },
    { id: 2, name: 'Ram Kumar', phone: '7376232206', feedbackTime: '30 mins', image: 'https://via.placeholder.com/40' },
    { id: 3, name: 'Ram Kumar', phone: '7376232206', feedbackTime: '15 mins', image: 'https://via.placeholder.com/40' }
  ]);
  
  // Subjects list
  const subjects = ['Monthly', 'Overall', 'Tamil', 'English', 'Math', 'Science', 'Social', 'Computer'];
  
  // Performance data by subject
  const [performanceData, setPerformanceData] = useState({
    Tamil: [
      { day: 1, score: 53, target: 20 },
      { day: 2, score: 55, target: 20 },
      { day: 3, score: 48, target: 20 },
      { day: 4, score: 60, target: 20 },
      { day: 5, score: 65, target: 20 },
      { day: 6, score: 58, target: 20 },
      { day: 7, score: 67, target: 20 },
      { day: 8, score: 53, target: 20 },
      { day: 9, score: 50, target: 20 },
      { day: 10, score: 55, target: 20 },
      { day: 11, score: 50, target: 20, isToday: true }
    ],
    English: [
      { day: 1, score: 45, target: 20 },
      { day: 2, score: 48, target: 20 },
      { day: 3, score: 52, target: 20 },
      { day: 4, score: 55, target: 20 },
      { day: 5, score: 60, target: 20 },
      { day: 6, score: 58, target: 20 },
      { day: 7, score: 62, target: 20 },
      { day: 8, score: 65, target: 20 },
      { day: 9, score: 60, target: 20 },
      { day: 10, score: 58, target: 20 },
      { day: 11, score: 63, target: 20, isToday: true }
    ],
    Math: [
      { day: 1, score: 60, target: 20 },
      { day: 2, score: 65, target: 20 },
      { day: 3, score: 62, target: 20 },
      { day: 4, score: 58, target: 20 },
      { day: 5, score: 55, target: 20 },
      { day: 6, score: 70, target: 20 },
      { day: 7, score: 75, target: 20 },
      { day: 8, score: 68, target: 20 },
      { day: 9, score: 63, target: 20 },
      { day: 10, score: 65, target: 20 },
      { day: 11, score: 72, target: 20, isToday: true }
    ],
    Science: [
      { day: 1, score: 58, target: 20 },
      { day: 2, score: 62, target: 20 },
      { day: 3, score: 65, target: 20 },
      { day: 4, score: 70, target: 20 },
      { day: 5, score: 68, target: 20 },
      { day: 6, score: 63, target: 20 },
      { day: 7, score: 60, target: 20 },
      { day: 8, score: 72, target: 20 },
      { day: 9, score: 75, target: 20 },
      { day: 10, score: 70, target: 20 },
      { day: 11, score: 68, target: 20, isToday: true }
    ],
    Social: [
      { day: 1, score: 50, target: 20 },
      { day: 2, score: 55, target: 20 },
      { day: 3, score: 60, target: 20 },
      { day: 4, score: 65, target: 20 },
      { day: 5, score: 63, target: 20 },
      { day: 6, score: 60, target: 20 },
      { day: 7, score: 58, target: 20 },
      { day: 8, score: 62, target: 20 },
      { day: 9, score: 68, target: 20 },
      { day: 10, score: 70, target: 20 },
      { day: 11, score: 65, target: 20, isToday: true }
    ],
    Computer: [
      { day: 1, score: 70, target: 20 },
      { day: 2, score: 75, target: 20 },
      { day: 3, score: 73, target: 20 },
      { day: 4, score: 68, target: 20 },
      { day: 5, score: 65, target: 20 },
      { day: 6, score: 72, target: 20 },
      { day: 7, score: 76, target: 20 },
      { day: 8, score: 78, target: 20 },
      { day: 9, score: 75, target: 20 },
      { day: 10, score: 72, target: 20 },
      { day: 11, score: 80, target: 20, isToday: true }
    ],
    Monthly: [
      { day: 'Week 1', score: 65, target: 20 },
      { day: 'Week 2', score: 68, target: 20 },
      { day: 'Week 3', score: 72, target: 20 },
      { day: 'Week 4', score: 75, target: 20 },
      { day: 'This Week', score: 70, target: 20, isToday: true }
    ],
    Overall: [
      { day: 'Jan', score: 60, target: 20 },
      { day: 'Feb', score: 65, target: 20 },
      { day: 'Mar', score: 70, target: 20 },
      { day: 'Apr', score: 68, target: 20 },
      { day: 'May', score: 72, target: 20 },
      { day: 'Jun', score: 75, target: 20 },
      { day: 'Jul', score: 78, target: 20 },
      { day: 'Aug', score: 74, target: 20 },
      { day: 'Sep', score: 70, target: 20 },
      { day: 'Oct', score: 76, target: 20 },
      { day: 'Nov', score: 73, target: 20, isToday: true }
    ]
  });
  
  // Homework data
  const [homeworkData, setHomeworkData] = useState({
    Academic: [
      { id: 1, subject: 'Science', date: '22/02/25', level: 'Level 2', time: '45 mins' },
      { id: 2, subject: 'Social', date: '23/02/25', level: 'Level 2', time: '45 mins' },
      { id: 3, subject: 'Math', date: '24/02/25', level: 'Level 3', time: '60 mins' }
    ],
    Personal: [
      { id: 1, subject: 'Reading', date: '22/02/25', level: 'Level 1', time: '30 mins' },
      { id: 2, subject: 'Project', date: '25/02/25', level: 'Level 2', time: '90 mins' }
    ]
  });

  // Helper function to calculate future days for charts
  const getFutureDays = (currentData) => {
    const lastDay = currentData[currentData.length - 1].day;
    const futureDays = [];
    
    if (typeof lastDay === 'number') {
      for (let i = lastDay + 1; i <= lastDay + 5; i++) {
        futureDays.push({ day: i });
      }
    }
    
    return futureDays;
  };
  
  // Return all data and state setters
  return {
    profileData,
    setProfileData,
    surveys,
    setSurveys,
    subjects,
    performanceData,
    setPerformanceData,
    homeworkData,
    setHomeworkData,
    getFutureDays
  };
};