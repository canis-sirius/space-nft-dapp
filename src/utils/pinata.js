import axios from "axios";

const TOKEN = process.env.REACT_APP_PINATA_TOKEN;

export const pinJSONToIPFS = async (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  return axios
    .post(url, JSONBody, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    })
    .then(response => {
      return {
        success: true,
        pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
      }
    })
    .catch(err => {
      console.log(err);
      return {
        success: false,
        message: err.message,
      }
    });
};
