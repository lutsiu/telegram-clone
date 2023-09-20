import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import Header from "./Header";
import { useSocket } from "../../../../context/SocketContext";
import { IMessage } from "../../../../interfaces/models";
import months from "../../../../utils/months";
interface Props {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  chatId: string;
  debouncedQuery: string;
  setDebouncedQuery: React.Dispatch<React.SetStateAction<string>>;
}
interface Message {
  message: IMessage;
  user: { _id: string; fullName: string; profilePicture: string };
}
export default function SearchOverlay(props: Props) {
  const {
    showSearch,
    setShowSearch,
    query,
    setQuery,
    debouncedQuery,
    setDebouncedQuery,
  } = props;
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timer, setTimer] = useState<NodeJS.Timer | null>(null);
  const socket = useSocket();
  const { chatId } = props;
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  useEffect(() => {
    // Function to emit the query after a delay
    const emitQuery = () => {
      if (query.length > 0) {
        socket.emit("find-message", { chatId, message: debouncedQuery });
      }
    };

    if (query !== debouncedQuery) {
      if (timer) {
        clearTimeout(timer);
      }

      const newTimer = setTimeout(emitQuery, 300);
      setTimer(newTimer);
    }

    setDebouncedQuery(query);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [query, debouncedQuery, socket, chatId, timer, setDebouncedQuery]);

  useEffect(() => {
    socket.on(
      "find-message",
      (
        data: {
          message: IMessage;
          user: { _id: string; profilePicture: string; fullName: string };
        }[]
      ) => {
        if (data) {
          setMessages(data);
        }
      }
    );
  }, [socket]);

  return (
    <motion.div
      className="md:w-[60%] xl:w-[40%] h-full overflow-y-scroll bg-slate-800 absolute top-0 right-0 z-10"
      initial={{ x: 1000 }}
      animate={{ x: showSearch ? 0 : 1000 }}
      transition={{ duration: 0.25 }}
    >
      <Header
        query={query}
        setQuery={setQuery}
        setShowSearch={setShowSearch}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <div className="pt-[2rem]">
        {query && (
          <h3 className="text-xl text-gray-300 font-medium  pl-[3rem]">{`${messages.length} messages found`}</h3>
        )}
        <ul className="w-full px-[1rem] mt-[1.5rem] ">
          {query &&
            messages.map((msg, i) => {
              const messageDate = new Date(msg.message.timeStamp);
              const day = messageDate.getDate();
              const month = months.at(messageDate.getMonth());
              const year = messageDate.getFullYear();
              const showYear = currentYear !== year;
              let dateToShow = `${month} ${day}`;
              if (messageDate.toDateString() === currentDate.toDateString()) {
                dateToShow = `today`;
              }
                if (showYear) {
                  dateToShow = `${day}/${month}/${year}`;
                }
              return (
                <li
                  key={i}
                  className="hover:bg-gray-700 duration-300 rounded-xl py-[0.6rem] pl-[0.6rem] pr-[1.3rem] flex gap-[1rem] w-full cursor-pointer  "
                >
                  <div className="w-[5rem] h-[5rem] rounded-full overflow-hidden">
                    <img
                      src={`http://localhost:3000/${msg.user.profilePicture}`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-[0.2rem] flex-1">
                    <div className="flex justify-between">
                      <h5 className="text-2xl font-semibold">
                        {msg.user.fullName}
                      </h5>
                      <span className="text-md ">{dateToShow}</span>
                    </div>
                    <p className="text-xl font-normal">{msg.message.message}</p>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </motion.div>
  );
}
