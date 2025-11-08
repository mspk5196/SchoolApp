import React from 'react';
import RoleHomePage from '../../../components/HomePage/RoleHomePage';
import { adminMenuConfig } from '../../../config/adminMenuConfig';

const AdminHome = ({ navigation }) => {
  return <RoleHomePage navigation={navigation} roleConfig={adminMenuConfig} />;
};

export default AdminHome;
