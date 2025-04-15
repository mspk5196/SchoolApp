import React, { createContext, useState, useContext } from 'react';

// Create the context
const ExamContext = createContext();

// Initial exam sessions data
const initialSessions = [
  { date: '2025-03-14', subject: 'Mathematics', time: '10:00 AM - 12:00 PM', frequency: 'Weekly', color: '#3f51b5' },
  { date: '2025-03-17', subject: 'Science', time: '10:00 AM - 1:00 PM', frequency: 'Every Thu', color: '#FFA500' },
  { date: '2025-03-20', subject: 'English', time: '8:00 AM - 11:00 AM', frequency: 'Thu, Sat', color: '#008000' },
  { date: '2025-03-27', subject: 'Science', time: '10:00 AM - 1:00 PM', frequency: 'Every Thu', color: '#FFA500' },
  { date: '2025-03-29', subject: 'English', time: '8:00 AM - 11:00 AM', frequency: 'Thu, Sat', color: '#008000' },
];

// Create the provider component
export const ExamProvider = ({ children }) => {
  const [sessions, setSessions] = useState(initialSessions);
  
  // Function to add a new session
  const addSession = (newSession) => {
    setSessions([...sessions, newSession]);
  };
  
  // Function to update a session
  const updateSession = (index, updatedSession) => {
    const updatedSessions = [...sessions];
    updatedSessions[index] = updatedSession;
    setSessions(updatedSessions);
  };
  
  // Function to delete a session
  const deleteSession = (index) => {
    const updatedSessions = sessions.filter((_, i) => i !== index);
    setSessions(updatedSessions);
  };
  
  return (
    <ExamContext.Provider value={{ 
      sessions, 
      addSession, 
      updateSession, 
      deleteSession 
    }}>
      {children}
    </ExamContext.Provider>
  );
};

// Custom hook to use the exam context
export const useExams = () => useContext(ExamContext);