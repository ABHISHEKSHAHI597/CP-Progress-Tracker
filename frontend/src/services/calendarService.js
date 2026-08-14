import API from "./api";

export const getCalendar = async () => {
  const { data } = await API.get("/calendar");

  return data;
};