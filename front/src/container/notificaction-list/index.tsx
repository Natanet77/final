// import "./index.css";

// import React, { Fragment, useContext, useEffect, useState } from "react";
// import { AuthContext } from "../../App";

// import Notification from "../../component/notification";
// import Grid from "../../component/grid";
// import { serverUrl } from "../../utils/serverUrl";

// const NotificationList: React.FC<{}> = () => {
//   const auth = useContext(AuthContext);
//   const email = auth?.state.user.email;

//   const formatteDate = (date: number) => {
//     const currentDate = new Date().getTime();
//     const result = currentDate - date;

//     const minutesResult = Math.floor(result / 1000 / 60);
//     const hoursResult = Math.floor(minutesResult / 60);
//     const daysResult = Math.floor(hoursResult / 24);
//     const monthsResult = Math.floor(daysResult / 30);

//     if (minutesResult < 60) {
//       return `${String(minutesResult)} min. ago`;
//     } else if (hoursResult < 24) {
//       return `${String(hoursResult)} hours. ago`;
//     } else if (daysResult < 30) {
//       return `${String(daysResult)} days. ago`;
//     } else {
//       return `${String(monthsResult)} month. ago`;
//     }
//   };

//   // const navigate = useNavigate();

//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   useEffect(() => {
//     try {
//       fetch(`${serverUrl}/notifications?email=${email}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//         .then((response) => {
//           if (response.ok) {
//             return response.json();
//           } else {
//           }
//         })
//         .then((data) => {
//           setNotifications(data.notifications);
//         });
//     } catch (error) {
//       console.error("An error occurred:", error);
//     }
//   }, [email]);

//   return (
//     <Grid middle>
//       {notifications?.length > 0 ? (
//         notifications.reverse().map((notification: { [key: string]: any }) => {
//           return (
//             <Fragment key={notification.id}>
//               <Notification
//                 type={notification.type}
//                 message={notification.message}
//                 date={formatteDate(notification.date)}
//               />
//             </Fragment>
//           );
//         })
//       ) : (
//         <div className="transaction__list--empty">
//           There are no notifications
//         </div>
//       )}
//     </Grid>
//   );
// };

// export default NotificationList;

import "./index.css";
import { Page } from "../../component/page";
import { BackButton } from "../../component/back-button";
import React, {
  Suspense,
  Fragment,
  useEffect,
  useCallback,
  useReducer,
  useContext,
} from "react";
import {
  requestReducer,
  requestInitialState,
  REQUEST_ACTION_TYPE,
} from "../../util/request";
import { AuthContext } from "../../App";
import { Alert, Skeleton } from "../../component/load";
import { getDate } from "../../util/getDate";

type Data = {
  list: Array<object>;
};

export default function Container() {
  const authCont = useContext(AuthContext);

  const [state, dispatch] = useReducer(requestReducer, requestInitialState);

  const getData = useCallback(async () => {
    dispatch({ type: REQUEST_ACTION_TYPE.PROGRESS });

    try {
      const res = await fetch(
        `http://localhost:4000/notification?email=${
          authCont ? (authCont.authContextData.user as any).email : ""
        }`
      );
      const data = await res.json();
      console.log("getData", data);

      if (res.ok) {
        console.log("Notification:getData", convertData(data));
        dispatch({
          type: REQUEST_ACTION_TYPE.SUCCESS,
          payload: convertData(data),
        });
      } else {
        dispatch({ type: REQUEST_ACTION_TYPE.ERROR, payload: data.message });
      }
    } catch (e) {
      dispatch({
        type: REQUEST_ACTION_TYPE.ERROR,
        payload: (e as any).message,
      });
    }
  }, []);

  const convertData = (raw: Data): Data | any => {
    const list_data: Array<object> = raw.list.reverse().map((item) => ({
      id: (item as any).id,
      operation: (item as any).operation,
      status: (item as any).status,
      message: (item as any).message,
      date: getDate((item as any).date),
      classname:
        "notification__item-image " +
        ((item as any).status !== "SUCCESS"
          ? "notification__item-image--danger"
          : ""),
    }));

    return {
      list: list_data,
      classItems:
        "notification__items " +
        (list_data.length <= 8 ? "" : "notification__scrollbar"),
    };
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Page>
      <header>
        <BackButton />
      </header>

      <div className="page__section">
        <h1 className="page__title">Notifications</h1>

        {(state.status as any) === REQUEST_ACTION_TYPE.PROGRESS && (
          <Fragment>
            <div className="box">
              <Skeleton />
            </div>
            <div className="box">
              <Skeleton />
            </div>
          </Fragment>
        )}

        {(state.status as any) === REQUEST_ACTION_TYPE.ERROR && (
          <Alert status={state.status as any} message={state.message} />
        )}

        {(state.status as any) === REQUEST_ACTION_TYPE.SUCCESS && (
          //  <Fragment>
          <div className={(state.data as any).classItems}>
            {(state.data as Data).list.length === 0 ? (
              <Alert message="Список пустий" />
            ) : (
              (state.data as Data).list.map((item: object) => (
                <Fragment key={(item as any).id}>
                  <Suspense
                    fallback={
                      <div className="box">
                        <Skeleton />
                      </div>
                    }
                  >
                    <div className="notification__item">
                      <div className={(item as any).classname}></div>
                      <div className="notification__item-info">
                        <h2 className="notification__item-info-title">
                          {(item as any).operation}
                        </h2>
                        <p className="notification__item-info-text">
                          {(item as any).date} - {(item as any).message}
                        </p>
                      </div>
                    </div>
                  </Suspense>
                </Fragment>
              ))
            )}
          </div>
          // </Fragment>
        )}
      </div>
    </Page>
  );
}
