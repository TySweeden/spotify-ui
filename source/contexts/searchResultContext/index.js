import React from 'react';
const SearchResultContext = React.createContext({loading: false, search: null, artists: {loading: false, data: null}, albums: {loading: false, data: null}, tracks: {loading: false, data: null}});

export default SearchResultContext;