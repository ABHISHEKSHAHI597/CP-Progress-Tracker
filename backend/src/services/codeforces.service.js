import axios from "axios";

export const getUserInfo = async (
  handle
) => {
  const response =
    await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );

  return response.data.result[0];
};

export const getUserStatus =
  async (handle) => {
    const response =
      await axios.get(
        `https://codeforces.com/api/user.status?handle=${handle}`
      );

    return response.data.result;
  };

export const getUserRatingHistory =
  async (handle) => {
    const response =
      await axios.get(
        `https://codeforces.com/api/user.rating?handle=${handle}`
      );

    return response.data.result;
  };