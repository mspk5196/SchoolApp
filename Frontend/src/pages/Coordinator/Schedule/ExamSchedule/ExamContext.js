import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from "../../../../utils/env.js";

// Create the context
const ExamContext = createContext();

// Create the provider component
export const ExamProvider = ({ children, gradeId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true); 

  const convertTo24HourFormat = (time12h) => {
    const [time, modifier] = time12h.split(' '); 
    let [hours, minutes] = time.split(':');
  
    if (hours === '12') {
      hours = '00';
    }
   
    if (modifier.toUpperCase() === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
  
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const convertTo12HourFormat = (time24h) => {
    const [hoursStr, minutes] = time24h.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12 || 12; // convert 0 to 12
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Fetch exam schedules when gradeId changes
  useEffect(() => {
    const fetchExamSchedules = async () => {
      try {
        const response = await fetch(`${API_URL}/api/coordinator/getExamSchedule?grade_id=${gradeId}`);
        const data = await response.json();
        if (data.success) {
          // Transform backend data to match frontend format
          const formattedSessions = data.schedules.map(schedule => ({
            id: schedule.id,
            date: schedule.exam_date,
            subject: schedule.subject_name || 'Subject',
            time: `${convertTo12HourFormat(schedule.start_time)} - ${convertTo12HourFormat(schedule.end_time)}`,
            frequency: schedule.recurrence || 'One Time',
            color: getSubjectColor(schedule.subject_name),
            subject_id: schedule.subject_id,
            grade_id: schedule.grade_id
          }));
          setSessions(formattedSessions);
        }
      } catch (error) {
        console.error('Error fetching exam schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamSchedules();
  }, [gradeId]);

  // Get subject color
  const getSubjectColor = subject => {
    if (!subject) return '#3f51b5';
    const colors = {
      'Tamil': '#3f51b5',
      'English': '#008000',
      'Maths': '#FFA500',
      'Science': '#9C27B0',
      'Social science': '#D81B60',
      'Physics': '#00BCD4',
      'Chemistry': '#4CAF50',
      'Biology': '#795548',
      'Computer science': '#607D8B',
      'PET': '#009688'
    };
    return colors[subject] || '#3f51b5';
  };
  
  // Function to add a new session
  const addSession = async (newSession) => {
    try {
      // Convert frontend format to backend format
      const [startTime, endTime] = newSession.time.split(' - ');
      
      const response = await fetch(`${API_URL}/api/coordinator/createExamSchedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade_id: gradeId,
          subject_id: newSession.subject_id,
          exam_date: newSession.date,
          start_time: convertTo24HourFormat(startTime),
          end_time: convertTo24HourFormat(endTime),
          recurrence: newSession.frequency === 'One Time' ? 'Only Once' : newSession.frequency
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSessions(prev => [...prev, { 
          ...newSession,
          id: data.id,
          color: getSubjectColor(newSession.subject)
        }]);
        return true;
      } else {
        console.error('Error adding session:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error adding session:', error);
      return false;
    }
  };
  
  // Function to update a session
  const updateSession = async (id, updatedSession) => {
    try {
      const [startTime, endTime] = updatedSession.time.split(' - ');
      
      const response = await fetch(`${API_URL}/api/coordinator/updateExamSchedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          grade_id: gradeId,
          subject_id: updatedSession.subject_id,
          exam_date: updatedSession.date,
          start_time: convertTo24HourFormat(startTime),
          end_time: convertTo24HourFormat(endTime),
          recurrence: updatedSession.frequency === 'One Time' ? 'Only Once' : updatedSession.frequency
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSessions(prev => prev.map(session => 
          session.id === id ? { ...updatedSession, id } : session
        ));
        return true;
      } else {
        console.error('Error updating session:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  };
  
  // Function to delete a session
  const deleteSession = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/coordinator/deleteExamSchedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSessions(prev => prev.filter(session => session.id !== id));
        return true;
      } else {
        console.error('Error deleting session:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  };
  
  return (
    <ExamContext.Provider value={{ 
      sessions,
      loading,
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