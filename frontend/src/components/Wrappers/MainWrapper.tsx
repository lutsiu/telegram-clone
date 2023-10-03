import { Outlet, useLoaderData, useLocation} from "react-router-dom";
import LeftSide from "../LeftSide";
import { createPortal } from "react-dom";
import DesktopMenu from "../Widgets/Menus/DesktopMenu";
import CreateGroupStep1 from "../Widgets/Group/CreateGroup/Step1";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../../interfaces/redux";
import CreateGroupStep2 from "../Widgets/Group/CreateGroup/Step2";
import ContactsPopup from "../Widgets/Contacts/ContactsPopup";
import CreateContact from "../Widgets/Contacts/CreateContact";
import MainSettings from "../Widgets/Settings/MainSettings";
import AccountSettings from "../Widgets/Settings/AccountSettings";
import useResponsive from "../../hooks/useResponsive";
import DeviceMenu from "../Widgets/Menus/DeviceMenu";
import ResponsiveCreateGroupStep1 from "../Widgets/Group/CreateGroupResponsive/Step1";
import ResponsiveCreateGroupStep2 from "../Widgets/Group/CreateGroupResponsive/Step2";
import ContactsResponsive from "../Widgets/Contacts/ContactsResponsive";
import ResponsiveSettings from "../Widgets/Settings/ResponsiveSettings";
import PersonalResponsiveSettings from "../Widgets/Settings/ResponsiveSettings/PersonalResponsiveSettings";
import {IMessage, UserModel} from "../../interfaces/models"
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import {setBio} from '../../state/user'
export default function MainWrapper() {
  const { ui } = useSelector((state: ReduxState) => state);
  const dispatch = useDispatch();
  const socket = useSocket();
  const width = useResponsive();

  const location = useLocation();
  const loaderData = useLoaderData() as {chatId: string, chatHistory: IMessage[], interlocutor: UserModel}; 

  useEffect(() => {
    socket.on('change-bio', (bio: string) => {
      dispatch(setBio(bio));
    })
  }, [socket, dispatch]);

  return (
    <>
      <main className="flex h-full ">
        <div className="md:flex-[2.5] md:max-w-[25%] flex-1">
          <LeftSide />
        </div>
        {width > 768 && (
          <div className="flex-1">
            <Outlet context={location.pathname == '/home' ? '' : loaderData}/>
          </div>
        )}
      </main>
      {/* for desktops and big tablets */}
      {width >= 768 && (
        <>
          {createPortal(
            <DesktopMenu />,
            document.getElementById("overlay") as HTMLElement
          )}
          {createPortal(
            <CreateGroupStep1 />,
            document.getElementById("overlay") as HTMLElement
          )}
          {ui.showCreateGroupStep2 &&
            createPortal(
              <CreateGroupStep2 />,
              document.getElementById("overlay") as HTMLElement
            )}
          {createPortal(
            <ContactsPopup />,
            document.getElementById("overlay") as HTMLElement
          )}
          {ui.showCreateContact &&
            createPortal(
              <CreateContact />,
              document.getElementById("overlay") as HTMLElement
            )}
          {createPortal(
            <MainSettings />,
            document.getElementById("overlay") as HTMLElement
          )}
          {ui.showMyAccountSettings &&
            createPortal(
              <AccountSettings />,
              document.getElementById("overlay") as HTMLElement
            )}
        </>
      )}

      {/* for tablets and mobile phones */}
      {width < 768 && (
        <>
          {createPortal(
            <DeviceMenu />,
            document.getElementById("overlay") as HTMLElement
          )}
          {createPortal(
            <ResponsiveCreateGroupStep1 />,
            document.getElementById("overlay") as HTMLElement
          )}
          {createPortal(
            <ResponsiveCreateGroupStep2 />,
            document.getElementById("overlay") as HTMLElement
          )}
          {createPortal(
            <ContactsResponsive/>,
            document.getElementById("overlay") as HTMLElement
          )}
          {createPortal(
            <ResponsiveSettings/>,
            document.getElementById("overlay") as HTMLElement
          )}
          {createPortal(
            <PersonalResponsiveSettings/>,
            document.getElementById("overlay") as HTMLElement
          )}
          
        </>
      )}

    </>
  );
}
