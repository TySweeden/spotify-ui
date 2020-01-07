import React from 'react';

import {
  Row, Col,
  Layout,
  Menu,
  Icon
} from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

import Link from 'next/link';
//import '../static/css/style.css';
//import bgImage from "../resources/icons/great-scott-transparent.png";

class index extends React.Component
{
  state = {
    collapsed : false,
  }

  onCollapse = collapsed => {
    this.setState({ collapsed });
  }

  render() {
    
    return (
      <div>
        HOME PAGE
        {/*<div>
          <img  src={bgImage} alt="bg" style={{width:"55%", position:"absolute", bottom:0, left:0}}/>
          <div style={{position:"absolute", bottom:140, right:26, fontWeight:700, fontSize:32, letterSpacing:1.5}}>Great Scott!</div>
          <div style={{position:"absolute", bottom:126, right:10, fontWeight:500, fontSize:15, letterSpacing:1.2}}>You can search for any song!</div>
        </div>*/}
      </div>
    );
  }
}

export default index;