import React from "react";

import { Input } from 'antd';
const { Search } = Input;

function SearchInput (props) {
    return <Search size="large" placeholder="Search Artists, Albums, and Tracks" className="search-input" style={{ display: "block", maxWidth: 370, margin: "8px auto", padding: "0 8px" }} {...props}/>
}

export default SearchInput;