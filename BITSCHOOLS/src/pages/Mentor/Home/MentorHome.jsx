import React from 'react';
import RoleHomePage from '../../../components/HomePage/RoleHomePage';
import { mentorMenuConfig } from '../../../config/mentorMenuConfig';

const MentorHome = ({ navigation }) => {
  return <RoleHomePage navigation={navigation} roleConfig={mentorMenuConfig} />;
};

export default MentorHome;
