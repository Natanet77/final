import React from "react";

import "../../normalize.css";
import "./index.css";

import NotificationList from "..container/notification-list";
import DashboardPage from "../../component/dashboard";

const NotificationsPage: React.FC = () => {
  return (
    <DashboardPage title="Notifications">
      <NotificationList />
    </DashboardPage>
  );
};

export default NotificationsPage;
