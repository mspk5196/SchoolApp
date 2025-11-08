import React from 'react';
import RoleHomePage from '../../../components/HomePage/RoleHomePage';
import { coordinatorMenuConfig } from '../../../config/coordinatorMenuConfig';

const CoordinatorHome = ({ navigation }) => {
  return <RoleHomePage navigation={navigation} roleConfig={coordinatorMenuConfig} />;
};

export default CoordinatorHome;
