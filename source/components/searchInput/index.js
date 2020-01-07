import React from "react";

import { Input } from 'antd';
const { Search } = Input;

function SearchInput (props) {
    return <Search size="large" placeholder="Search Artists, Albums, and Tracks" style={{ display: "block", maxWidth: 370, margin: "8px auto" }} {...props}/>
}

export default SearchInput;