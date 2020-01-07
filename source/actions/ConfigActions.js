import fetch from 'isomorphic-fetch';

export const LoadConfig = () => {
  return fetch("/static/config.json",{
    method: 'GET'
  })
  .then((response) => {
    return response.json().then((config) => {
      return config;
    })
  });

};
